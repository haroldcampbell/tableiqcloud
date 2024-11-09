import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from '../../../api.services/api.service';
import { FieldMetaData, TableRecordData } from '../../../models/models.datastore';

@Component({
	selector: 'app-viewtable',
	standalone: true,
	imports: [],
	templateUrl: './viewtable.component.html',
	styleUrl: './viewtable.component.scss'
})
export class ViewTableComponent implements OnInit {
	private tableGUID?: string | null;
	tableRecordData?: TableRecordData;

	constructor(
		private apiService: APIService,
		public router: Router,
		private route: ActivatedRoute,

	) { }

	ngOnInit(): void {
		const routeParams = this.route.snapshot.paramMap;
		this.tableGUID = routeParams.get("tableGUID");

		if (this.tableGUID == null) {
			// TODO: Navigate to error if tableGUID is null
			return
		}

		console.log("[ViewTableComponent] tableGUID:", this.tableGUID);
		this.apiService.apiRequests.getTableByGUID(this.tableGUID).subscribe({
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
