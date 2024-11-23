import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from '../../../api.services/api.service';
import { FieldMetaData, RequestDataCreateField, TableRecordData } from '../../../models/models.datastore';
import { hasString } from '../../../core/utils';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { AddFieldOverlayComponent } from '../../../pages/bases/view-data/ui/add-field-overlay/add-field-overlay.component';
import { CoreModule } from '../../../modules/core.module';
import { FieldContextMenuOverlayComponent } from '../../../pages/bases/view-data/ui/field-context-menu-overlay/field-context-menu-overlay.component';

@Component({
	selector: 'ui-viewtable',
	standalone: true,
	imports: [
		CoreModule,
		AddFieldOverlayComponent,
		FieldContextMenuOverlayComponent
	],
	templateUrl: './viewtable.component.html',
	styleUrl: './viewtable.component.scss'
})
export class ViewTableComponent implements OnInit {
	activeContextMenu = "";
	tableRecordData?: TableRecordData;

	@Input() baseGUID?: string;

	@Input()
	get selectedTableGUID(): string | undefined {
		return this.tableGUID;
	}
	set selectedTableGUID(value: string) {
		console.log("[ViewTableComponent] selectedTableGUID:", value)
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
		private route: ActivatedRoute,
		private overlay: Overlay,

	) { }

	ngOnInit(): void {
		// const routeParams = this.route.snapshot.paramMap;
		// const baseGUID = routeParams.get("baseGUID");
		// console.log("[].ngOnInit baseGUID:", baseGUID)

		// if (this.tableGUID == null) {
		// 	// TODO: Navigate to error if tableGUID is null
		// 	return
		// }

		// console.log("[ViewTableComponent] tableGUID:", this.tableGUID);
		// this.apiService.apiRequests.getTableByGUID(this.tableGUID).subscribe({
		// 	next: (data) => {
		// 		console.log("[ViewTableComponent] data: ", data);
		// 		this.tableRecordData = data;
		// 	},
		// 	error: (err) => {
		// 		console.log("[ViewTableComponent] err: ", err);
		// 	}
		// })
	}

	private loadTableData() {
		if (!hasString(this.baseGUID) || !hasString(this.tableGUID)) {
			// TODO: Navigate to error if tableGUID is null
			return
		}

		console.log("[loadTableData] tableGUID:", this.tableGUID);
		this.apiService.apiRequests.getTableByGUID(this.baseGUID!, this.tableGUID!).subscribe({
			next: (data) => {
				console.log("[ViewTableComponent] data: ", data);
				this.tableRecordData = data;
			},
			error: (err) => {
				console.log("[ViewTableComponent] err: ", err);
			}
		})
	}

	columnValues(field: FieldMetaData) {
		return this.tableRecordData!.ColumnValues[field.FieldGUID]
	}

	onNavigateToTable() {
		this.router.navigate(['/']);
	}

	isFieldContextMenuOpen(conextID: string) {
		return this.activeContextMenu == conextID;
	}

	// @conextID either the fieldID or the value '__add-field-action'
	onOpenFieldContextMenu(conextID: string) {
		console.log("did click on Add Field")
		this.activeContextMenu = conextID;
	}

	onAddFieldOverlayDetached() {
		this.activeContextMenu = "";
	}

	onCreateField(data: RequestDataCreateField) {
		this.onAddFieldOverlayDetached();
		console.log("[onCreateField] data:", data);

		this.apiService.apiRequests.createTableField(data).subscribe({
			next: (data) => {
				console.log("[onCreateField] data: ", data);
				this.updateTableRecord(data);
			},
			error: (err) => {
				console.log("[onCreateField] err: ", err);
			}
		});
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

	onEditField(e: FieldMetaData) {
		console.log("[onEditField] event:", e)
	}
	onDeleteField(e: FieldMetaData) {
		console.log("[onDeleteField] event:", e)
	}
}
