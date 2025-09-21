import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from '../../../../api.services/api.service';
import { FieldMetaData, RequestDataCreateField, ReqestDataDeleteField, TableFieldType, TableRecordData, FieldData, RequestDataUpdateField, RequestDataCreateRecord, RecordCell, TableFieldArray, RequestDataDeleteRecord, RequestDataUpdateFieldDataValue, GetFieldOptionAsSelect, FieldParamOptionInfo, RequestDataAddLinkedTableCellValue, RequestDataDeleteLinkedTableCellValue } from '../../../../models/models.datastore';
import { hasString } from '../../../../core/utils';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { AddFieldOverlayComponent } from '../ui/add-field-overlay/add-field-overlay.component';
import { CoreModule } from '../../../../modules/core.module';
import { FieldContextMenuOverlayComponent } from '../ui/field-context-menu-overlay/field-context-menu-overlay.component';
import { EditFieldContextMenuOverlayComponent } from '../ui/edit-field-context-menu-overlay/edit-field-context-menu-overlay.component';
import { TableCellContextMenuComponent } from '../ui/table-cell-context-menu/table-cell-context-menu.component';
import { MatSelectChange } from '@angular/material/select';
import { AddLinkedTableOverlayComponent } from '../ui/add-linked-table-overlay/add-linked-table-overlay.component';

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


export enum FieldInputElement {
	Input = "Input",
	Option = "Option",
	LinkedTableRelationship = "LinkedTableRelationship"
}
@Component({
	selector: 'ui-viewtable',
	standalone: true,
	imports: [
		CoreModule,
		AddFieldOverlayComponent,
		EditFieldContextMenuOverlayComponent,
		FieldContextMenuOverlayComponent,
		TableCellContextMenuComponent,
		AddLinkedTableOverlayComponent
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

	get LinkedTableAction() {
		return "__linkedTableOverlay";
	}

	constructor(
		private elementRef: ElementRef,
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
			[TableFieldType.FieldTypeYesNo, "ico-field-yes-no"],
		]);

	}

	ngAfterViewChecked() {

	}



	private loadTableData() {
		if (!hasString(this.baseGUID) || !hasString(this.tableGUID)) {
			// TODO: Navigate to error if tableGUID is null
			return
		}

		// console.log("[loadTableData] tableGUID:", this.tableGUID);
		this.apiService.apiRequests.getTableByGUID(this.baseGUID!, this.tableGUID!).subscribe({
			next: (data) => {
				console.log("[ViewTableComponent] data: ", data);
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

	linkedFieldDataValues(columnData: FieldData): FieldData[] {
		return (columnData.DataValue as FieldData[]) ?? []
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

	/**
	 * Shows the column data value for the field.
	 *
	 * @param field
	 * Used to determin if the field is an option field.
	 *
	   * @param columnData
	 *
	 * @returns {string}
	 * Returns the data value for the field, or the option name if the field is an option field.
	 * If the field is not an option field, it will return the data value directly.
	 */
	presentColumnDataValue(field: FieldMetaData, columnData: FieldData) {
		if (field.FieldType != TableFieldType.FieldTypeOption) {
			return columnData.DataValue;
		}

		let paramValueMap = this.fieldParamOptionIDMap.get(field.FieldGUID)

		console.log("[presentColumnDataValue] field:", field, " paramValueMap:", paramValueMap, columnData.DataValue);

		return paramValueMap?.get(columnData.DataValue)?.OptionName ?? "";
	}

	columnDataValueCellColor(field: FieldMetaData, columnData: FieldData) {
		if (field.FieldType != TableFieldType.FieldTypeOption) {
			return "";
		}

		let paramValueMap = this.fieldParamOptionIDMap.get(field.FieldGUID)

		console.log("[presentColumnDataValue] field:", field, " paramValueMap:", paramValueMap, columnData.DataValue);

		const fieldOption = paramValueMap?.get(columnData.DataValue)

		if (fieldOption == undefined) {
			return "";
		}

		const itemColor = fieldOption.OptionMetaData["itemColor"] || "#ffffff"; // Default to white if not set
		return itemColor
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
			next: (resp) => {
				console.log("[onUpdateField] resp: ", resp);
				this.updateTableFieldType(resp.FieldMetaData, resp.FieldData);
			},
			error: (err) => {
				console.log("[onUpdateField] err: ", err);
			}
		});
	}

	updateTableFieldType(updatedMetaData: FieldMetaData, fieldValues: FieldData[]) {
		console.log("[updateTableFieldType] data: ", updatedMetaData);

		const results = this.tableRecordData?.FieldsMetaData.filter(f => f.FieldGUID == updatedMetaData.FieldGUID);
		if (results == undefined) {
			return;
		}

		let existingFieldMetaData = results[0];
		existingFieldMetaData.FieldName = updatedMetaData.FieldName;
		existingFieldMetaData.FieldType = updatedMetaData.FieldType;

		switch (existingFieldMetaData.FieldType) {
			case TableFieldType.FieldTypeOption: {
				this.updateColumnValuesForOptions(updatedMetaData);
				break;
			}

			case TableFieldType.FieldTypeRelationship: {
				this.updateColumnValuesForTableRelationship(existingFieldMetaData, updatedMetaData, fieldValues);
				console.log("[updateTableFieldType] case:TableFieldType.FieldTypeRelationship ", { field: existingFieldMetaData, fieldValues })
				break;
			}
		}
	}

	updateColumnValuesForOptions(data: FieldMetaData) {
		// Update ColumnValues

		this.tableRecordData?.FieldsMetaData.forEach((f, index) => {
			if (f.FieldGUID != data.FieldGUID) {
				return;
			}
			this.tableRecordData!.FieldsMetaData[index] = data;
		})

		this.buildFieldParamOptionMap(data)
	}

	updateColumnValuesForTableRelationship(existingFieldMetaData: FieldMetaData, updatedMetaData: FieldMetaData, fieldValues: FieldData[]) {
		existingFieldMetaData.FieldParams = updatedMetaData.FieldParams;
		this.tableRecordData!.ColumnValues[existingFieldMetaData.FieldGUID] = fieldValues;
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
		this.activeCell = null;
	}

	hack_ignore_default_action = false;
	hack_cleanup_action?: () => void | undefined = undefined;

	activeCell: { row: number, col: number, selectedElm: HTMLElement } | null = null;
	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent) {
		if (this.hack_ignore_default_action) {
			if (this.hack_cleanup_action)
				this.hack_cleanup_action();
			return
		}
		let isContained = false;

		if (this.activeCell !== null) {
			isContained = this.activeCell.selectedElm.contains(event.target as Node);
		}

		if (!isContained) {
			this.clearCellGUID();
		}
	}


	private rowItemWrapperElm!: HTMLElement;
	/** Fired when the cell is first clicked. This set the outline indicating that it is selected. */
	onSelectRowItem(event: MouseEvent, selectedCell: FieldData, field: FieldMetaData, colIndex: number, rowIndex: number) {
		// console.log("[onSelectRowItem]", { selectedCell, field, event });

		event.stopPropagation();

		if (field.FieldType == TableFieldType.FieldTypeYesNo) {
			// TODO: Handle flipping the yes/no value when the cell is clicked.
			return;
		}

		this.dirtyDataValue = selectedCell.DataValue
		this.activeCellGUID = selectedCell.CellGUID;

		const cellId = `row-item-wrapper-${colIndex}-${rowIndex}`;
		this.rowItemWrapperElm = document.querySelector(`[data-cell-id="${cellId}"]`) as HTMLElement;

		this.activeCell = {
			row: rowIndex,
			col: colIndex,
			selectedElm: this.rowItemWrapperElm,
		};

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

			case TableFieldType.FieldTypeRelationship:
				return FieldInputElement.LinkedTableRelationship;

			default:
				return FieldInputElement.Input
		}
	}

	get FieldInputElement() {
		return FieldInputElement
	}

	get TableFieldType() {
		return TableFieldType;
	}

	isYesNoField(field: FieldMetaData) {
		return field.FieldType == TableFieldType.FieldTypeYesNo ?
			true :
			false;
	}

	isOptionField(field: FieldMetaData) {
		return field.FieldType == TableFieldType.FieldTypeOption ?
			true :
			false;
	}

	GetFieldOptionAsSelect(field: FieldMetaData) {
		return GetFieldOptionAsSelect(field.FieldType, field.FieldParams);
	}

	onChangedSelectedFieldOption(event: MatSelectChange, field: FieldMetaData, selectedCell: FieldData, colIndex: number, rowIndex: number) {

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

		this.onUpdateCellValue(request, (result: FieldData) => {
			selectedCell.DataValue = result.DataValue
			// console.log("[onSelectedFieldOption] result: ", result);
		});
	}

	onClickedYesNoField(event: MouseEvent, field: FieldMetaData, selectedCell: FieldData, colIndex: number, rowIndex: number) {
		event.stopPropagation();

		// Flip the value
		this.dirtyDataValue = selectedCell.DataValue == "1" ? "0" : "1";
		selectedCell.DataValue = this.dirtyDataValue; // Don't wait for server response to update the UI

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

		this.onUpdateCellValue(request, (result: FieldData) => {
			selectedCell.DataValue = result.DataValue
			// console.log("[onClickedYesNoField] result: ", result);
		});
	}

	onSelectedLinkedTableValue(event: FieldData, field: FieldMetaData, selectedCell: FieldData, colIndex: number, rowIndex: number) {

		// event.stopPropagation();

		const request: RequestDataAddLinkedTableCellValue = {
			BaseGUID: this.baseGUID!,
			TableGUID: this.tableGUID!,
			FieldGUID: field.FieldGUID,
			RecordGUID: selectedCell.RecordGUID,
			CellGUID: selectedCell.CellGUID,
			LinkedFielData: event
		};

		this.apiService.apiRequests.addLikedTableDataCellvalue(request)
			.subscribe({
				next: (data) => {
					selectedCell.DataValue = data.DataValue;
					// console.log("[onSelectedLinkedTableValue] data: ", { data, selectedCell });
				},
				error: (err) => {
					console.log("[onSelectedLinkedTableValue] err: ", err);
				}
			})

		/* HACK: I couldn't figure out how to hide the list of names after
		* one was selected without triggering the onDocumentClick(). This hack
		* fixes that problem.
		* when hack_ignore_default_action is true, the onDocumentClick will
		* not full run and it will call the hack_cleanup_action().
		*
		* This allows me to clear activeContextMenu which hides the overlay, but not
		* deselect the active cell
		*/
		this.hack_cleanup_action = () => {
			this.hack_ignore_default_action = false;
		}
		this.hack_ignore_default_action = true
		this.activeContextMenu = "";
	}

	dismissRelationshipOverlay(event: MouseEvent) {
		event.stopPropagation();

		this.activeCellGUID = "";
		this.onFieldOverlayDetached();
	}

	onOpenRelationshipOverlay(event: MouseEvent) {
		event.stopPropagation();
		this.onOpenFieldContextMenu(this.LinkedTableAction)
	}

	onDeleteRelationshipCellValue(event: MouseEvent, field: FieldMetaData, columnData: FieldData, linkedTableSelectedCell: FieldData) {
		event.stopPropagation();

		const request: RequestDataDeleteLinkedTableCellValue = {
			BaseGUID: this.baseGUID!,
			TableGUID: this.tableGUID!,
			FieldGUID: field.FieldGUID,
			CellGUID: columnData.CellGUID,
			LinkedTableRecordGUID: linkedTableSelectedCell.RecordGUID,
			LinkedTableCellGUID: linkedTableSelectedCell.CellGUID,
		};

		console.log("[onDeleteRelationshipCellValue] request:", request);

		this.apiService.apiRequests.deleteLinkedTableDataCellvalue(request)
			.subscribe({
				next: (data) => {
					columnData.DataValue = data.DataValue;
					console.log("[onDeleteRelationshipCellValue] data: ", { data, columnData: columnData });
				},
				error: (err) => {
					console.log("[onDeleteRelationshipCellValue] err: ", err);
				}
			})

	}
}
