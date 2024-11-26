import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from '../../../../api.services/api.service';
import { FieldMetaData, RequestDataCreateField, ReqestDataDeleteField, TableFieldType, TableRecordData, FieldData, RequestDataUpdateField } from '../../../../models/models.datastore';
import { hasString } from '../../../../core/utils';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { AddFieldOverlayComponent } from '../ui/add-field-overlay/add-field-overlay.component';
import { CoreModule } from '../../../../modules/core.module';
import { FieldContextMenuOverlayComponent } from '../ui/field-context-menu-overlay/field-context-menu-overlay.component';
import { EditFieldContextMenuOverlayComponent } from '../ui/edit-field-context-menu-overlay/edit-field-context-menu-overlay.component';


@Component({
	selector: 'ui-viewtable',
	standalone: true,
	imports: [
		CoreModule,
		AddFieldOverlayComponent,
		EditFieldContextMenuOverlayComponent,
		FieldContextMenuOverlayComponent
	],
	templateUrl: './viewtable.component.html',
	styleUrl: './viewtable.component.scss'
})
export class ViewTableComponent implements OnInit {
	activeContextMenu = "";
	showEditFieldOverlay = false;

	tableRecordData?: TableRecordData;
	private fieldTypeImgMap!: Map<TableFieldType, string>;


	@Input() baseGUID?: string;

	@Input()
	get selectedTableGUID(): string | undefined {
		return this.tableGUID;
	}
	set selectedTableGUID(value: string) {
		this.tableGUID = value;
		this.loadTableData();
	}
	private tableGUID?: string;

	get AddFieldAction() {
		return "__add-field-action";
	}

	constructor(
		private apiService: APIService,
		public router: Router,
	) { }

	ngOnInit(): void {
		this.fieldTypeImgMap = new Map<TableFieldType, string>([
			[TableFieldType.FieldTypeString, "ico-field-string"],
			[TableFieldType.FieldTypeNumber, "ico-field-number"],
			[TableFieldType.FieldTypeDate, "ico-field-date"],
			[TableFieldType.FieldTypeText, "ico-field-text"],
			[TableFieldType.FieldTypeRelationship, "ico-field-relationship"],
		]);
	}

	private loadTableData() {
		if (!hasString(this.baseGUID) || !hasString(this.tableGUID)) {
			// TODO: Navigate to error if tableGUID is null
			return
		}

		// console.log("[loadTableData] tableGUID:", this.tableGUID);
		this.apiService.apiRequests.getTableByGUID(this.baseGUID!, this.tableGUID!).subscribe({
			next: (data) => {
				// console.log("[ViewTableComponent] data: ", data);
				this.tableRecordData = data;
			},
			error: (err) => {
				console.log("[ViewTableComponent] err: ", err);
			}
		})
	}

	columnValues(field: FieldMetaData) {
		return this.tableRecordData!.ColumnValues[field.FieldGUID];//.get(field.FieldGUID)
	}

	// return the ico name for the field
	fieldTypeToImg(f: FieldMetaData) {
		// console.log("[fieldTypeToImg] f:", f)
		return this.fieldTypeImgMap.get(f.FieldType) ?? ""
	}

	onNavigateToTable() {
		this.router.navigate(['/']);
	}

	isFieldContextMenuOpen(conextID: string) {
		return this.activeContextMenu == conextID;
	}

	// @conextID either the fieldID or the value '__add-field-action'
	onOpenFieldContextMenu(conextID: string) {
		// console.log("did click on Add Field")
		this.activeContextMenu = conextID;
		this.showEditFieldOverlay = false; // Automatically exit edit mode
	}

	onFieldOverlayDetached() {
		this.activeContextMenu = "";
	}

	onCreateField(data: RequestDataCreateField) {
		this.onFieldOverlayDetached();

		this.apiService.apiRequests.createTableField(data).subscribe({
			next: (data) => {
				// console.log("[onCreateField] data: ", data);
				this.updateTableRecord(data);
			},
			error: (err) => {
				console.log("[onCreateField] err: ", err);
			}
		});
	}

	onUpdateField(r: RequestDataUpdateField) {
		this.onFieldOverlayDetached();

		this.apiService.apiRequests.updateTableField(r).subscribe({
			next: (data) => {
				// console.log("[onCreateField] data: ", data);
				this.updateTableFieldType(data);
			},
			error: (err) => {
				console.log("[onUpdateField] err: ", err);
			}
		});
	}

	updateTableFieldType(data: FieldMetaData) {
		const results = this.tableRecordData?.FieldsMetaData.filter(f => f.FieldGUID == data.FieldGUID);
		if (results == undefined) {
			return;
		}

		let field = results[0];
		field.FieldName = data.FieldName;
		field.FieldType = data.FieldType;
	}

	updateTableRecord(data: TableRecordData) {
		if (this.tableRecordData?.GUID != data.GUID) {
			// TODO: show data-consistency error
			return;
		}

		const metaData = data.FieldsMetaData[0];
		this.tableRecordData.FieldsMetaData.push(metaData);
		this.tableRecordData.ColumnValues[metaData.FieldGUID] = data.ColumnValues[metaData.FieldGUID];
	}

	deleteTableRecordField(fieldGUID: string) {
		if (this.tableRecordData) {
			this.tableRecordData.FieldsMetaData = this.tableRecordData.FieldsMetaData.filter(f => f.FieldGUID != fieldGUID);
			delete this.tableRecordData.ColumnValues[fieldGUID];
		}
	}

	onEditField(e: FieldMetaData) {
		this.showEditFieldOverlay = true; // Show the edit context
	}

	onDeleteField(e: FieldMetaData) {
		this.onFieldOverlayDetached();

		const data: ReqestDataDeleteField = {
			BaseGUID: this.baseGUID!,
			TableGUID: e.TableGUID,
			TableFieldGUID: e.FieldGUID
		}

		this.apiService.apiRequests.deleteTableField(data).subscribe({
			next: (fieldGUID) => {
				// console.log("[onDeleteField] fieldGUID: ", fieldGUID);
				this.deleteTableRecordField(fieldGUID);
			},
			error: (err) => {
				console.log("[onDeleteField] err: ", err);
			}
		});
	}
}
