import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from '../../../api.services/api.service';
import { FieldMetaData, RequestDataCreateField, TableRecordData } from '../../../models/models.datastore';
import { hasString } from '../../../core/utils';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { AddFieldOverlayComponent } from '../../../pages/bases/view-data/ui/add-field-overlay/add-field-overlay.component';
import { CoreModule } from '../../../modules/core.module';

@Component({
	selector: 'ui-viewtable',
	standalone: true,
	imports: [
		CoreModule,
		AddFieldOverlayComponent
	],
	templateUrl: './viewtable.component.html',
	styleUrl: './viewtable.component.scss'
})
export class ViewTableComponent implements OnInit {
	tableRecordData?: TableRecordData;
	isOpen = false;
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

	onAddField() {
		console.log("did click on Add Field")
		this.isOpen = true;//!this.isOpen
	}

	onAddFieldOverlayDetached() {
		this.isOpen = false;
	}

	onCreateField(data: RequestDataCreateField) {
		this.isOpen = false;
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
}
