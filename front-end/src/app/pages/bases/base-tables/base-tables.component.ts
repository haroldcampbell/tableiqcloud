import { Component, OnInit } from '@angular/core';
import { APIService } from '../../../api.services/api.service';
import { BaseTableInfo, TableInfo } from '../../../models/models.datastore';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewTableComponent } from '../../../ui/tables/viewtable/viewtable.component';
import { hasString } from '../../../core/utils';

export enum NavItems {
	Data,
	Forms,
	Automations,
	Workflows,
	Interfaces,
	Experiments
}
@Component({
	selector: 'base-tables',
	standalone: true,
	imports: [ViewTableComponent],
	templateUrl: './base-tables.component.html',
	styleUrl: './base-tables.component.scss'
})
export class BaseTablesComponent implements OnInit {
	baseGUID?: string;
	baseName: string = "";
	tables: TableInfo[] = [];
	info!: BaseTableInfo;
	selectedTableGUID?: string;
	selectedNavItem: NavItems = NavItems.Data;

	get NavItemsType() {
		return NavItems;
	}

	constructor(
		private apiService: APIService,
		public router: Router,
		private route: ActivatedRoute,
	) { }


	ngOnInit(): void {
		const routeParams = this.route.snapshot.paramMap;
		this.baseGUID = routeParams.get("baseGUID")!;

		this.apiService.apiRequests.getTables(this.baseGUID).subscribe({
			next: (data) => {
				console.log("[BaseTablesComponent] data: ", data);
				this.initTableData(data);
			},
			error: (err) => {
				console.log("[BaseTablesComponent] err: ", err);
			}
		})
	}

	private initTableData(data: BaseTableInfo) {
		this.info = data;
		this.baseName = this.info.Name;
		this.tables = this.info.TableInfoArray;

		const routeParams = this.route.snapshot.paramMap;
		let tableGUID = routeParams.get("tableGUID")!;

		if (hasString(tableGUID)) {
			this.selectedTableGUID = tableGUID;
		}
		else if (this.tables.length > 0) {
			this.selectedTableGUID = this.tables[0].GUID;
		}
	}

	onSelectTable(tableGUID: string) {
		this.selectedTableGUID = tableGUID;
		console.log("[onSelectTable] selectedTableGUID:", tableGUID)
		this.router.navigate(['base', this.baseGUID, tableGUID]);
	}

	isSelectedTabled(tableGUID: string) {
		if (!hasString(this.selectedTableGUID)) {
			return false;
		}

		return this.selectedTableGUID == tableGUID;
	}

	onSelectNavItem(item: NavItems) {
		this.selectedNavItem = item;
		console.log("[onSelectNavItem] selectedNavItemName:", item)
	}

	isSelectedNavItem(item: NavItems) {
		return this.selectedNavItem == item;
	}
}
