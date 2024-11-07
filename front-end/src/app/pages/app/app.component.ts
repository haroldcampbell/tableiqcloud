import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { APIService } from '../../services/api.service';
import { provideHttpClient } from '@angular/common/http';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [CommonModule, RouterOutlet],

	templateUrl: './app.component.html',
	styleUrl: './app.component.sass'
})
export class AppComponent implements OnInit {
	title = 'front-end';

	constructor(
		private apiService: APIService
	) {

	}

	ngOnInit(): void {
		this.apiService.apiRequests.getList().subscribe({
			next: (data) => {
				console.log("[AppComponent] data: ", data);
			},
			error: (err) => {
				console.log("[AppComponent] err: ", err);
			}
		})
	}
}
