import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { APIService } from '../../../../../../api.services/api.service';
import { hasString } from '../../../../../../core/utils';
import { BaseTableInfo, FieldMetaData, FieldParamLinkedFieldInfo, FieldParamOptionInfo, FieldParamRelationship, TableFieldInfo, TableInfo } from '../../../../../../models/models.datastore';
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
	@Input() parentTableGUID?: string;
	@Input() existingField?: FieldMetaData;

	@Output() hasValidSaveState = new EventEmitter<boolean>();

	@Output() relationshipInfo = new EventEmitter<FieldParamLinkedFieldInfo>();

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
				console.log("[loadTableList] data: ", { data });
				this.baseTableInfo = data;
				if (this.existingField) {
					this.initExistingLinkedTable();
				}
			},
			error: (err) => {
				console.log("[loadTableList] err: ", err);
			}
		})
	}

	/** cachedInfoIDMap ensures that we can retain InfoId if use toggle back
	 * and forth between a existing linked fieldName and a different field.
	 * */
	cachedInfoIDMap: Record<string, string> = {} /** LinkedFieldGUID -> InfoId*/

	initExistingLinkedTable() {
		console.log("[initExistingLinkedTable] existingField", {
			existingField: this.existingField,
			baseTableInfo: this.baseTableInfo
		});

		const params: FieldParamRelationship = this.existingField?.FieldParams;
		const linkedFieldInfo: FieldParamLinkedFieldInfo = params.ParamValues;

		this._allowMultipleItems = linkedFieldInfo.AllowMultipleValues;
		this._allowDuplicates = linkedFieldInfo.AllowDuplicates;
		this.selectedTableGUID = linkedFieldInfo.PullOperation.DataFromTableGUID;//.LinkedChildTableGUID;

		if (this.baseTableInfo) {
			for (let item of this.baseTableInfo.TableInfoArray) {
				console.log("[initExistingLinkedTable] ", { item, result: (item.GUID == linkedFieldInfo.PullOperation.DataFromTableGUID) });

				if (item.GUID == linkedFieldInfo.PullOperation.DataFromTableGUID) {
					this.loadTableByGUID(linkedFieldInfo.PullOperation.DataFromTableGUID, () => {
						// Cache the current InfoId
						this.cachedInfoIDMap[linkedFieldInfo.PullOperation.DataFromFieldGUID] = linkedFieldInfo.InfoId;
						this.selectedInfoId = linkedFieldInfo.InfoId;
						this.loadTableFieldByGUID(linkedFieldInfo.PullOperation.DataFromFieldGUID);
					})
					break;
				}
			}
		}
	}

	selectedTableGUID: string = "";
	selectedTableFieldGUID: string = "";
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
		this.hasValidSaveState.emit(false);

		this.loadTableByGUID(event.value);
	}

	private loadTableByGUID(linkedTableGUID: string, onSuccessfulCallback?: () => void) {
		this.tableFieldInfo = undefined;

		this.dirtyTableValue = linkedTableGUID;
		this.selectedTableGUID = linkedTableGUID;

		console.log("[loadTableByGUID] ", { baseGUID: this.baseGUID, linkedTableGUID, })

		this.apiService.apiRequests.getTableFieldInfoByGUID(this.baseGUID!, this.selectedTableGUID).subscribe({
			next: (data) => {
				this.tableFieldInfo = data;
				this.dirtyFieldValue = "";
				console.log("[loadTableByGUID] getTableFieldInfoByGUID(...):", { data })

				if (onSuccessfulCallback) {
					onSuccessfulCallback();
				}
			},
			error: (err) => {
				console.log("[loadTableByGUID] getTableFieldInfoByGUID err:", err);
			}
		});
	}

	private selectedInfoId?: string;
	onChangedTableField(event: MatSelectChange) {
		const linkedTableFieldGUID = event.value
		const infoId = this.cachedInfoIDMap[linkedTableFieldGUID]

		this.selectedInfoId = infoId;
		this.loadTableFieldByGUID(event.value);
	}

	private loadTableFieldByGUID(linkedTableFieldGUID: string) {
		// console.log("loadTableFieldByGUID ", { linkedTableFieldGUID, infoId:this.selectedInfoI });

		this.dirtyFieldValue = linkedTableFieldGUID;
		this.selectedTableFieldGUID = linkedTableFieldGUID
		this.hasValidSaveState.emit(true);

		this.raiseRelationshipInfo();
	}

	private raiseRelationshipInfo() {
		const relationshipInfo: FieldParamLinkedFieldInfo = {
			InfoId: this.selectedInfoId ?? "",
			// ParentTableGUID: this.parentTableGUID!,
			// LinkedChildTableGUID: this.selectedTableGUID,
			// LinkedFieldGUID: this.selectedTableFieldGUID,
			AllowMultipleValues: this._allowMultipleItems,
			AllowDuplicates: this._allowDuplicates,
			HasPairedDependentField: true, // TODO: Add UI to toggle this?

			PullOperation: {
				DataFromTableGUID: this.selectedTableGUID, // Which table are we getting the data
				DataFromFieldGUID: this.selectedTableFieldGUID, // Which field in the ChildTable are we going to pull data
				// DataFromCellGUID: "", // Which cell has the data
				// DataFromRecordGUID: "", // Which record (ie. line)

				DataToTableGUID: this.parentTableGUID!,
				// This will be the new field that is being created
				// Which field in the parent table are we going to put the linked child data
				DataToFieldGUID: "",
				// DataToRecordGUID: "",
				// DataToCellGUID: "",
			},
			PushOperation: {
				DataFromTableGUID: "",
				DataFromFieldGUID: "",
				// DataFromRecordGUID: "",
				// DataFromCellGUID: "",
				// DataFromRecID: "", // From which Record did we get the data

				DataToTableGUID: "",
				DataToFieldGUID: "",
				// DataToRecordGUID: "",
				// DataToCellGUID: "",
			}
		}

		console.log("[raiseRelationshipInfo] emitting info:", relationshipInfo);
		this.relationshipInfo.emit(relationshipInfo)
	}

	_allowMultipleItems = false

	get allowMultipleItems() {
		return this._allowMultipleItems
	}
	set allowMultipleItems(val: boolean) {
		this._allowMultipleItems = val;
		if (!this._allowMultipleItems) {
			this.allowDuplicates = false;
		}
		// console.log("[allowMultipleItems] ",
		// 	{
		// 		allowMultipleItems: this._allowMultipleItems,
		// 		allowDuplicates: this.allowDuplicates
		// 	})
		this.raiseRelationshipInfo();
	}

	_allowDuplicates = false;
	get allowDuplicates() {
		return this._allowDuplicates;
	}
	set allowDuplicates(val: boolean) {
		this._allowDuplicates = val;
		// console.log("[allowDuplicates] ",
		// 	{
		// 		allowMultipleItems: this._allowMultipleItems,
		// 		allowDuplicates: this._allowDuplicates
		// 	})
		this.raiseRelationshipInfo();
	}
}