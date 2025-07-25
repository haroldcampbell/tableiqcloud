import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from '../../../../api.services/api.service';
import { FieldMetaData, RequestDataCreateField, ReqestDataDeleteField, TableFieldType, TableRecordData, FieldData, RequestDataUpdateField, RequestDataCreateRecord, RecordCell, TableFieldArray, RequestDataDeleteRecord, RequestDataUpdateFieldDataValue, GetFieldOptionAsSelect, FieldParamOptionInfo } from '../../../../models/models.datastore';
import { hasString } from '../../../../core/utils';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { AddFieldOverlayComponent } from '../ui/add-field-overlay/add-field-overlay.component';
import { CoreModule } from '../../../../modules/core.module';
import { FieldContextMenuOverlayComponent } from '../ui/field-context-menu-overlay/field-context-menu-overlay.component';
import { EditFieldContextMenuOverlayComponent } from '../ui/edit-field-context-menu-overlay/edit-field-context-menu-overlay.component';
import { TableCellContextMenuComponent } from '../ui/table-cell-context-menu/table-cell-context-menu.component';
import { MatSelectChange } from '@angular/material/select';

interface KeyboardData {
	event: KeyboardEvent
	field: FieldMetaData;
	selectedCell: FieldData;
	colIndex: number;
	rowIndex: number;
}

enum CellEditMode {
	CellEditModeNone,
	CellEditModeSelected,
	CellEditModeEditing
}

type FieldGuid = string;
type OptionID = string;
type ParamOptionIDMap = Map<OptionID, FieldParamOptionInfo>;

@Component({
	selector: 'ui-viewtable',
	standalone: true,
	imports: [
		CoreModule,
		AddFieldOverlayComponent,
		EditFieldContextMenuOverlayComponent,
		FieldContextMenuOverlayComponent,
		TableCellContextMenuComponent,
	],
	templateUrl: './viewtable.component.html',
	styleUrl: './viewtable.component.scss'
})
export class ViewTableComponent implements OnInit {
	activeContextMenu = "";
	activeTableCellContextMenu = "";
	showEditFieldOverlay = false;

	tableRecordData?: TableRecordData;
	private fieldTypeImgMap!: Map<TableFieldType, string>;

	@ViewChild('gridInputElement') gridInputElementRef!: ElementRef;

	@Input() baseGUID?: string;

	@Input()
	get selectedTableGUID(): string | undefined {
		return this.tableGUID;
	}
	set selectedTableGUID(value: string) {
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
	) { }

	ngOnInit(): void {
		this.fieldTypeImgMap = new Map<TableFieldType, string>([
			[TableFieldType.FieldTypeString, "ico-field-string"],
			[TableFieldType.FieldTypeNumber, "ico-field-number"],
			[TableFieldType.FieldTypeDate, "ico-field-date"],
			[TableFieldType.FieldTypeText, "ico-field-text"],
			[TableFieldType.FieldTypeRelationship, "ico-field-relationship"],
			[TableFieldType.FieldTypeOption, "ico-field-select"],
		]);

	}

	ngAfterViewChecked() {
		// if (this.activeCellGUID != "" && this.gridInputElementRef) {
		// 	let inputElm = this.gridInputElementRef.nativeElement as HTMLInputElement;
		// 	let wrapperElm = this.gridWrapperElementRef.nativeElement as HTMLElement;

		// 	if (this.cellEditMode == CellEditMode.CellEditModeNone) {
		// 		wrapperElm.addEventListener("keyup", this.keyupListener)
		// 		this.cellEditMode = CellEditMode.CellEditModeSelected;
		// 		wrapperElm.focus();
		// 	}

		// 	// wrapperElm.onkeyup = this.onSelectedCellKeyUp
		// 	// inputElm.focus();
		// 	console.log('Element has been added to the DOM', this.activeCellGUID, wrapperElm, inputElm.value);
		// }
	}

	private loadTableData() {
		if (!hasString(this.baseGUID) || !hasString(this.tableGUID)) {
			// TODO: Navigate to error if tableGUID is null
			return
		}

		// console.log("[loadTableData] tableGUID:", this.tableGUID);
		this.apiService.apiRequests.getTableByGUID(this.baseGUID!, this.tableGUID!).subscribe({
			next: (data) => {
				// console.log("[ViewTableComponent] data: ", data);
				this.tableRecordData = data;
				this.initParamValuesMap()
			},
			error: (err) => {
				console.log("[ViewTableComponent] err: ", err);
			}
		})
	}

	hasColumnValue(columnData: FieldData) {
		return columnData.DataValue != null
			&& columnData.DataValue != undefined
			&& columnData.DataValue != "";
	}
	columnValues(field: FieldMetaData) {
		return this.tableRecordData!.ColumnValues[field.FieldGUID];//.get(field.FieldGUID)
	}

	fieldMap = new Map<FieldGuid, FieldMetaData>();
	fieldParamOptionIDMap = new Map<FieldGuid, ParamOptionIDMap>();

	initParamValuesMap() {
		this.tableRecordData?.FieldsMetaData.forEach(field => {
			this.fieldMap.set(field.FieldGUID, field);

			if (field.FieldType != TableFieldType.FieldTypeOption) {
				return;
			}

			this.buildFieldParamOptionMap(field);
		});
	}

	buildFieldParamOptionMap(field: FieldMetaData) {
		let paramValueMap = new Map<OptionID, FieldParamOptionInfo>();
		field.FieldParams.ParamValues.forEach((param: FieldParamOptionInfo) => {
			paramValueMap.set(param.OptionId, param);
		});

		this.fieldParamOptionIDMap.set(field.FieldGUID, paramValueMap);
	}

	presentColumnDataValue(field: FieldMetaData, columnData: FieldData) {
		if (field.FieldType != TableFieldType.FieldTypeOption) {
			return columnData.DataValue;
		}

		let paramValueMap = this.fieldParamOptionIDMap.get(field.FieldGUID)
		return paramValueMap?.get(columnData.DataValue)?.OptionName ?? "";
	}

	// return the ico name for the field
	fieldTypeToImg(f: FieldMetaData) {
		// console.log("[fieldTypeToImg] f:", f)
		return this.fieldTypeImgMap.get(f.FieldType) ?? ""
	}

	onNavigateToTable() {
		this.router.navigate(['/']);
	}

	isFieldContextMenuOpen(conextID: string) {
		return this.activeContextMenu == conextID;
	}


	isTableCellContextMenuOpen(contextID: string) {
		// console.log("[isTableCellContextMenuOpen]")

		return this.activeTableCellContextMenu == contextID
	}
	// @conextID either the fieldID or the value '__add-field-action'
	onOpenFieldContextMenu(conextID: string) {
		// console.log("did click on Add Field")
		this.activeContextMenu = conextID;
		this.showEditFieldOverlay = false; // Automatically exit edit mode
	}

	onFieldOverlayDetached() {
		this.activeContextMenu = "";
		this.activeTableCellContextMenu = "";
	}

	onCreateField(data: RequestDataCreateField) {
		this.onFieldOverlayDetached();

		this.apiService.apiRequests.createTableField(data).subscribe({
			next: (data) => {
				// console.log("[onCreateField] data: ", data);
				this.updateTableRecord(data);
			},
			error: (err) => {
				console.log("[onCreateField] err: ", err);
			}
		});
	}

	onUpdateField(r: RequestDataUpdateField) {
		this.onFieldOverlayDetached();

		this.apiService.apiRequests.updateTableFieldInfo(r).subscribe({
			next: (data) => {
				console.log("[onUpdateField] data: ", data);
				this.updateTableFieldType(data);
			},
			error: (err) => {
				console.log("[onUpdateField] err: ", err);
			}
		});
	}

	updateTableFieldType(data: FieldMetaData) {
		console.log("[updateTableFieldType] data: ", data);

		const results = this.tableRecordData?.FieldsMetaData.filter(f => f.FieldGUID == data.FieldGUID);
		if (results == undefined) {
			return;
		}

		let field = results[0];
		field.FieldName = data.FieldName;
		field.FieldType = data.FieldType;

		switch (field.FieldType) {
			case TableFieldType.FieldTypeOption: {
				this.updateColumnValuesForOptions(data);
				break;
			}
		}
	}

	updateColumnValuesForOptions(data: FieldMetaData) {
		// Update ColumnValues
		// let columnValues = this.tableRecordData?.ColumnValues[data.FieldGUID] ?? [];
		// let optionIDMap = new Map<string, FieldParamOptionInfo>();
		// data.FieldParams.ParamValues.forEach((option: FieldParamOptionInfo) => {
		// 	optionIDMap.set(option.OptionId, option);
		// })

		// console.log("[updateColumnValuesForOptions] columnValues: ", columnValues);
		// columnValues.forEach((fieldData: FieldData) => {
		// 	if (fieldData.DataValue === null || fieldData.DataValue === undefined) {
		// 		return;
		// 	}

		// 	let option = optionIDMap.get(fieldData.DataValue);
		// 	if (option) {
		// 		fieldData.DataValue = option.OptionName; // Update the value to the OptionName
		// 	} else {
		// 		fieldData.DataValue = ""; // Clear if not found
		// 	}
		// });
		this.tableRecordData?.FieldsMetaData.forEach((f, index) => {
			if (f.FieldGUID != data.FieldGUID) {
				return;
			}
			this.tableRecordData!.FieldsMetaData[index] = data;

			// let records = this.tableRecordData?.ColumnValues[f.FieldGUID];
			// records = records?.filter(r => r.RecordGUID != recordGUID) || [];
			// this.tableRecordData!.ColumnValues![f.FieldGUID]! = records;
		})

		this.buildFieldParamOptionMap(data)
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

	deleteTableRecordField(fieldGUID: string) {
		if (this.tableRecordData) {
			this.tableRecordData.FieldsMetaData = this.tableRecordData.FieldsMetaData.filter(f => f.FieldGUID != fieldGUID);
			delete this.tableRecordData.ColumnValues[fieldGUID];
		}
	}

	onEditField(e: FieldMetaData) {
		this.showEditFieldOverlay = true; // Show the edit context
	}

	onDeleteField(e: FieldMetaData) {
		this.onFieldOverlayDetached();

		const data: ReqestDataDeleteField = {
			BaseGUID: this.baseGUID!,
			TableGUID: e.TableGUID,
			TableFieldGUID: e.FieldGUID
		}

		this.apiService.apiRequests.deleteTableField(data).subscribe({
			next: (fieldGUID) => {
				// console.log("[onDeleteField] fieldGUID: ", fieldGUID);
				this.deleteTableRecordField(fieldGUID);
			},
			error: (err) => {
				console.log("[onDeleteField] err: ", err);
			}
		});
	}

	onAddRow() {
		const data: RequestDataCreateRecord = {
			BaseGUID: this.baseGUID!,
			TableGUID: this.tableGUID!
		}

		this.apiService.apiRequests.createTableRecord(data).subscribe({
			next: (result) => {
				this.appendTableRecord(result.RecordGUID, result.Cells);
			},
			error: (err) => {
				console.log("[onAddRow] err: ", err);
			}
		});
	}

	appendTableRecord(recordGUID: string, cells: RecordCell[]) {
		this.tableRecordData!.RecordGUIDs.push(recordGUID);

		cells.forEach(c => {
			let values = this.tableRecordData!.ColumnValues[c.MetaData.FieldGUID];
			values.push(c.FieldData)
		})
	}

	onShowTableCellContextMenu(contextID: string) {
		// console.log("[onRowClicked] contextID:", contextID);
		this.activeTableCellContextMenu = contextID;
		return false
	}

	onDeleteRecord(e: any, recordGUID: string) {
		this.onFieldOverlayDetached();
		// console.log("[onDeleteRecord] e:", e, " recordGUID:", recordGUID);

		const data: RequestDataDeleteRecord = {
			BaseGUID: this.baseGUID!,
			TableGUID: this.tableGUID!,
			RecordGUID: recordGUID,
		}

		this.apiService.apiRequests.deleteTableRecord(data).subscribe({
			next: (deletedRecordGUID) => {
				// console.log("[onDeleteRecord] deletedRecordGUID:", deletedRecordGUID)
				this.removeTableRecord(deletedRecordGUID);
			},
			error: (err) => {
				console.log("[onDeleteRecord] err: ", err);
			}
		});
	}

	removeTableRecord(recordGUID: string) {
		this.tableRecordData?.FieldsMetaData.forEach(f => {
			let records = this.tableRecordData?.ColumnValues[f.FieldGUID];
			records = records?.filter(r => r.RecordGUID != recordGUID) || [];
			this.tableRecordData!.ColumnValues![f.FieldGUID]! = records;
		})

		this.tableRecordData!.RecordGUIDs = this.tableRecordData!.RecordGUIDs.filter(r => r != recordGUID)
	}

	activeCellGUID: string = ""
	dirtyDataValue: string = "";
	cellEditMode = CellEditMode.CellEditModeNone;

	keyUpListenerSelectedRowItem = (e: KeyboardEvent) => this.onSelectRowItemKeyUp(e);
	blurListenerSelectedRowItem = () => this.onSelectRowItemBlur();

	isActiveCell(selectedCell: FieldData) {
		return this.activeCellGUID == selectedCell.CellGUID;
	}

	clearCellGUID() {
		this.cellEditMode = CellEditMode.CellEditModeNone;
		this.activeCellGUID = "";
	}

	private rowItemWrapperElm!: HTMLElement;
	/** Fired when the cell is first clicked. This set the outline indicating that it is selected. */
	onSelectRowItem(event: MouseEvent, selectedCell: FieldData, colIndex: number, rowIndex: number) {
		// console.log("[onSelectRowItem] selectedCell:", selectedCell, event);
		this.dirtyDataValue = selectedCell.DataValue
		this.activeCellGUID = selectedCell.CellGUID;

		const cellId = `row-item-wrapper-${colIndex}-${rowIndex}`;
		this.rowItemWrapperElm = document.querySelector(`[data-cell-id="${cellId}"]`) as HTMLElement;

		if (this.rowItemWrapperElm == null) {
			return;
		}

		this.rowItemWrapperElm.addEventListener("keyup", this.keyUpListenerSelectedRowItem)
		this.rowItemWrapperElm.addEventListener("blur", this.blurListenerSelectedRowItem)
		this.cellEditMode = CellEditMode.CellEditModeSelected;
	}

	/** Fired when the cell has a KeyUp event, however we haven't gotten to the cell input
	 */
	onSelectRowItemKeyUp(event: KeyboardEvent) {
		// console.log("[onSelectRowItemKeyUp]");
		// console.log("[onSelectRowItemKeyUp] event:", event);
		event.preventDefault();

		switch (event.key) {
			case "Escape": {
				if (this.activeCellGUID != "" && this.cellEditMode == CellEditMode.CellEditModeSelected) {
					this.activeCellGUID = "";
					this.cellEditMode = CellEditMode.CellEditModeNone;
					this.rowItemWrapperElm.blur();
				}

				break;
			}

			case "Enter": {
				/** Handle the case when the user presses enter on a selected cell to enter edit-mode */
				if (this.gridInputElementRef == null) {
					console.warn("[onSelectRowItemKeyUp] gridInputElementRef is null, cannot enter edit mode");
					return
				}

				this.cellEditMode = CellEditMode.CellEditModeEditing;
				let inputElm = this.gridInputElementRef.nativeElement as HTMLInputElement;
				inputElm.focus();

				break;
			}
		}
	}

	private onSelectRowItemBlur() {
		this.rowItemWrapperElm.removeEventListener("keyup", this.keyUpListenerSelectedRowItem);
		this.rowItemWrapperElm.removeEventListener("blur", this.blurListenerSelectedRowItem);
	}

	/** Fired when the input element has focus.
	 * This happens after the select is select, then clicked again to gain focus */
	onCellFocus() {
		// console.log("[onInputCellFocus] selectedCell:", selectedCell);
		this.cellEditMode = CellEditMode.CellEditModeEditing;
	}

	onCellBlur() {
		// console.log("[onInputCellBlur] selectedCell:", selectedCell);
		// TODO: Auto-save
		// this.activeCell = selectedCell;
		// data.event.preventDefault();

		this.clearCellGUID();
	}

	onInputCellKeyup(event: KeyboardEvent, field: FieldMetaData, selectedCell: FieldData, colIndex: number, rowIndex: number) {
		// console.log("[onSelectCellKeyup] event:", event, " selectedCell:", selectedCell);
		event.preventDefault();
		event.stopPropagation

		let cell = this.getCell(colIndex, rowIndex);
		if (cell == null) {
			return;
		}

		let data: KeyboardData = {
			event: event,
			field: field,
			selectedCell: selectedCell,
			colIndex: colIndex,
			rowIndex: rowIndex,
		}

		switch (event.key) {
			case "Escape": {
				this.keyHandlerEscape(data, cell);
				break;
			}

			case "Enter": {
				this.keyHandlerEnter(data, cell);
				break;
			}

			default: {

			}
		}
	}

	private getCell(colIndex: number, rowIndex: number): HTMLElement | null {
		const cellId = `input-${colIndex}-${rowIndex}`;
		const cell = document.querySelector(`[data-cell-id="${cellId}"]`) as HTMLElement;

		return cell
	}

	private keyHandlerEscape(data: KeyboardData, cell: HTMLElement) {
		// console.log("[keyHandlerEscape]");
		data.event.preventDefault();

		this.clearCellGUID();
		cell.blur();
		cell.innerHTML = data.selectedCell.DataValue;
	}

	private keyHandlerEnter(data: KeyboardData, cell: HTMLElement) {
		// console.log("[keyHandlerEnter] data.field:", data.field);

		data.event.preventDefault();
		data.event.stopImmediatePropagation();
		// data.event.stopPropagation();

		this.clearCellGUID();
		cell.blur();
		cell.innerHTML = this.dirtyDataValue;

		const request: RequestDataUpdateFieldDataValue = {
			BaseGUID: this.baseGUID!,
			TableGUID: this.tableGUID!,
			FieldGUID: data.field.FieldGUID,
			FieldData: {
				CellGUID: data.selectedCell.CellGUID,
				RecordGUID: data.selectedCell.RecordGUID,
				DataValue: this.dirtyDataValue,
			}
		}

		this.onUpdateCellValue(request, (result: FieldData) => {
			data.selectedCell.DataValue = result.DataValue
			// console.log("[keyHandlerEnter] result: ", result);
		});

		// console.log("[keyHandlerEnter:updateTableFieldDataValue] selectedCell:", data.selectedCell);
	}

	private keyHandlerDefault(data: KeyboardData, cell: HTMLElement) {
		// console.log("[keyHandlerDefault] set activeCell == null");
	}

	private onUpdateCellValue(request: RequestDataUpdateFieldDataValue, fnc: (result: FieldData) => void) {
		this.apiService.apiRequests.updateTableFieldDataValue(request)
			.subscribe({
				next: (result: FieldData) => {
					fnc(result);
					// data.selectedCell.DataValue = result.DataValue
				},
				error: (err) => {
					console.log("[onUpdateCellValue] err: ", err);
				}
			})
	}

	getFieldInputElement(field: FieldMetaData) {
		switch (field.FieldType) {
			case TableFieldType.FieldTypeOption:
				return FieldInputElement.Option;
			default:
				return FieldInputElement.Input
		}
	}

	get FieldInputElement() {
		return FieldInputElement
	}

	isOptionField(field: FieldMetaData) {
		return field.FieldType == TableFieldType.FieldTypeOption ?
			true :
			false;
	}

	GetFieldOptionAsSelect(field: FieldMetaData) {
		return GetFieldOptionAsSelect(field.FieldType, field.FieldParams);
	}

	onSelectedFieldOption(event$: MatSelectChange, field: FieldMetaData, selectedCell: FieldData, colIndex: number, rowIndex: number) {
		// console.log("[onSelectedFieldOption] $:", event$, " field: ", field)
		const request: RequestDataUpdateFieldDataValue = {
			BaseGUID: this.baseGUID!,
			TableGUID: this.tableGUID!,
			FieldGUID: field.FieldGUID,
			FieldData: {
				CellGUID: selectedCell.CellGUID,
				RecordGUID: selectedCell.RecordGUID,
				DataValue: this.dirtyDataValue,
			}
		}

		// console.log("[onSelectedFieldOption] request:", request)

		this.onUpdateCellValue(request, (result: FieldData) => {
			selectedCell.DataValue = result.DataValue
			// console.log("[onSelectedFieldOption] result: ", result);
		});
	}
}

export enum FieldInputElement {
	Input = "Input",
	Option = "Option"
}