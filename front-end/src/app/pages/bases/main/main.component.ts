import { Component, OnInit } from '@angular/core';
import { APIService } from '../../../api.services/api.service';
import { Router } from '@angular/router';
import { BaseInfo } from '../../../models/models.datastore';

@Component({
	selector: 'app-main',
	standalone: true,
	imports: [],
	templateUrl: './main.component.html',
	styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
	bases: BaseInfo[] = [];


	constructor(
		private apiService: APIService,
		public router: Router,
	) { }


	ngOnInit(): void {
		this.apiService.apiRequests.getBases().subscribe({
			next: (data) => {
				console.log("[MainComponent] data: ", data);
				this.bases = data;
			},
			error: (err) => {
				console.log("[MainComponent] err: ", err);
			}
		})
	}

	didSelectItem(baseGUID: string) {
		this.router.navigate(['base', baseGUID]);
	}
}
