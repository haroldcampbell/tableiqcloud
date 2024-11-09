import { Component, OnInit } from '@angular/core';
import { APIService } from '../../../api.services/api.service';
import { TableInfo } from '../../../models/models.datastore';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'app-tables',
	standalone: true,
	imports: [],
	templateUrl: './tables.component.html',
	styleUrl: './tables.component.sass'
})
export class ListTablesComponent implements OnInit {
	tables: TableInfo[] = [];

	constructor(
		private apiService: APIService,
		public router: Router,
		private route: ActivatedRoute,
	) {}

	ngOnInit(): void {
		this.apiService.apiRequests.getTables().subscribe({
			next: (data) => {
				console.log("[AppComponent] data: ", data);
				this.tables = data;
			},
			error: (err) => {
				console.log("[AppComponent] err: ", err);
			}
		})
	}

	didSelectTable(tableGUID: string) {
		// const url = this.router.createUrlTree(['board', this.dataContext.Board?.ID, 'card', card.ID]);
		// this.location.go(url.toString());

		console.log("[didSelectTable] tableGUID:", tableGUID)
		this.router.navigate(['table', tableGUID]);

	}
}
