import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { APIService } from '../../../../../../api.services/api.service';
import { hasString } from '../../../../../../core/utils';
import { BaseTableInfo, FieldMetaData, TableFieldInfo, TableInfo } from '../../../../../../models/models.datastore';
import { NgForOf } from "../../../../../../../../node_modules/@angular/common/index";
import { CoreModule } from '../../../../../../modules/core.module';
import { MatSelectChange } from '@angular/material/select';

@Component({
	selector: 'menu-element-relationship',
	standalone: true,
	imports: [CoreModule],
	templateUrl: './menu-element-relationship.component.html',
	styleUrl: './menu-element-relationship.component.scss'
})
export class MenuElementRelationshipComponent implements OnInit, AfterViewInit, OnDestroy {
	private baseTableInfo?: BaseTableInfo;

	dirtyTableValue: string = "";
	dirtyFieldValue: string = "";

	@Input() baseGUID?: string;

	@Output() hasValidSaveState = new EventEmitter<boolean>();

	constructor(
		// private elementRef: ElementRef,
		private apiService: APIService,
		// public router: Router,
	) { }

	get tableList(): TableInfo[] {
		if (this.baseTableInfo === undefined) {
			return [];
		}

		return this.baseTableInfo!.TableInfoArray;
	}

	ngOnInit(): void {
		this.hasValidSaveState.emit(false);
		this.loadTableList()
	}

	ngAfterViewInit() {
	}

	ngOnDestroy(): void {
	}

	private loadTableList() {
		this.hasValidSaveState.emit(false);

		if (!hasString(this.baseGUID)) {
			// TODO: Navigate to error if baseGUID is null
			throw new Error("baseGUID is null");
		}

		// console.log("[loadTableData] tableGUID:", this.tableGUID);
		this.apiService.apiRequests.getTables(this.baseGUID!).subscribe({
			next: (data) => {
				console.log("[ViewTableComponent] data: ", { data });
				this.baseTableInfo = data;
			},
			error: (err) => {
				console.log("[ViewTableComponent] err: ", err);
			}
		})
	}

	selectedTableGUID: string = "";
	tableFieldInfo?: TableFieldInfo;

	get didSelectTable(): boolean {
		return hasString(this.selectedTableGUID);
	}

	get seletedTableFields(): FieldMetaData[] | undefined {
		if (this.tableFieldInfo === undefined) {
			return [];
		}
		return this.tableFieldInfo.FieldsMetaData;
	}

	onChangedLinkedTable(event: MatSelectChange) {
		this.dirtyTableValue = event.value;
		this.selectedTableGUID = event.value;
		this.tableFieldInfo = undefined;

		this.hasValidSaveState.emit(false);

		this.apiService.apiRequests.getTableFieldInfoByGUID(this.baseGUID!, this.selectedTableGUID).subscribe({
			next: (data) => {
				// console.log("[onChangedLinkedTable] getTableFieldInfoByGUID data:", data);
				this.tableFieldInfo = data;
				this.dirtyFieldValue = "";
			},
			error: (err) => {
				console.log("[onChangedLinkedTable] getTableFieldInfoByGUID err:", err);
			}
		});
	}

	onChangedTableField(event: MatSelectChange) {
		console.log("[onChangedTableField] event:", event);
		this.dirtyFieldValue = event.value;
		this.hasValidSaveState.emit(true);
	}
}
