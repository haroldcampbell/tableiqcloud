import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from '../../../api.services/api.service';
import { FieldMetaData, TableRecordData } from '../../../models/models.datastore';
import { hasString } from '../../../core/utils';

@Component({
	selector: 'ui-viewtable',
	standalone: true,
	imports: [],
	templateUrl: './viewtable.component.html',
	styleUrl: './viewtable.component.scss'
})
export class ViewTableComponent implements OnInit {
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

	constructor(
		private apiService: APIService,
		public router: Router,
		private route: ActivatedRoute,

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
}
