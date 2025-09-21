import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreModule } from '../../../../../modules/core.module';
import { CreateFieldOptionAsSelect, CreateFieldRelationshipAsSelect, FieldMetaData, FieldOptionsType, FieldParamLinkedFieldInfo, FieldParamOption, FieldTypeToStringifiedFieldType, RequestDataCreateField, RequestDataUpdateField, StringifiedFieldType, StringifiedFieldTypeToType } from '../../../../../models/models.datastore';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { MenuElementOptionComponent, OptionInfoElem } from '../menu-elements/menu-element-option/menu-element-option.component';
import { MenuElementRelationshipComponent } from '../menu-elements/menu-element-relationship/menu-element-relationship.component';

@Component({
	selector: 'edit-field-context-menu-overlay',
	standalone: true,
	imports: [
		CoreModule,
		MenuElementOptionComponent,
		MenuElementRelationshipComponent
	],
	templateUrl: './edit-field-context-menu-overlay.component.html',
	styleUrl: './edit-field-context-menu-overlay.component.scss'
})
export class EditFieldContextMenuOverlayComponent implements OnInit {
	private _optionInfoList: OptionInfoElem[] = [];
	private _relationshipInfo?: FieldParamLinkedFieldInfo;

	disSelectedField = true; // Has an initial field been selected?

	@Input() field!: FieldMetaData;
	@Input() baseGUID!: string;
	@Input() tableGUID!: string;

	@Output() didClickSave = new EventEmitter<RequestDataUpdateField>();
	@Output() closePanel = new EventEmitter();

	get FieldType() {
		return StringifiedFieldType;
	}

	// fieldName accessors
	get fieldName() {
		return this._fieldName;
	}
	set fieldName(val: string) {
		this._fieldName = val;
	}
	private _fieldName = "";

	// selectedFieldType accessors
	get selectedFieldType() {
		return this._selectedFieldType;
	}
	set selectedFieldType(val: StringifiedFieldType) {
		this._selectedFieldType = val;
	}
	_selectedFieldType = StringifiedFieldType.FieldTypeString;

	get selectedFieldTypeText() {
		if (this._selectedFieldType == StringifiedFieldType.FieldTypeString) {
			return "Single line text"
		}
		return this._selectedFieldType
	}

	ngOnInit(): void {
		this._fieldName = this.field.FieldName;
		this._selectedFieldType = FieldTypeToStringifiedFieldType(this.field.FieldType);
		this.initOptionInfoList();
	}

	isSelectedListItem(s: StringifiedFieldType) {
		return s == this._selectedFieldType;
	}

	initOptionInfoList() {
		if (this.field === undefined || this.field.FieldParams === undefined) {
			console.warn("Field or FieldParams is undefined, skipping initialization of existing options.");
			return;
		}

		this._optionInfoList = [];
		const optionInforList = (this.field.FieldParams as FieldParamOption)?.ParamValues ?? []
		optionInforList.map(i => {
			const itemElm = {
				OptionInfo: i,
				_inputElm: undefined,
			}
			this._optionInfoList.push(itemElm);
		});
	}

	get optionInfoList() {
		return this._optionInfoList;
	}

	onCancel() {
		this.closePanel.emit("");
	}

	onApplyChanges() {
		let options: FieldOptionsType = {}

		switch (this.selectedFieldType) {
			case StringifiedFieldType.FieldTypeOption:
				// Convert option list to a format suitable for FieldOptionsType
				options = CreateFieldOptionAsSelect(this._optionInfoList.map(opt => opt.OptionInfo))
				break;

			case StringifiedFieldType.FieldTypeRelationship:
				options = CreateFieldRelationshipAsSelect(this._relationshipInfo!);
				break;
		}

		this.didClickSave.emit({
			BaseGUID: this.baseGUID,
			TableGUID: this.tableGUID,
			TableFieldGUID: this.field.FieldGUID,
			FieldName: this.fieldName,
			FieldType: StringifiedFieldTypeToType(this.selectedFieldType),
			FieldOptions: options // Pass the options if applicable
		});
	}

	onSelectFieldType(selected: StringifiedFieldType) {
		this.selectedFieldType = selected;
		this.disSelectedField = true;
	}

	onShowFieldTypeOptions() {
		this.disSelectedField = false;
	}

	// isOptionFieldType(): boolean {
	// 	return this.selectedFieldType === StringifiedFieldType.FieldTypeOption;
	// }

	onOptionInfoListChanged(listItems: OptionInfoElem[]) {
		this._optionInfoList = listItems;
	}


	// Track if the current state of the menu element is valid and can be saved
	isMenuElementValid: boolean = true;

	onMenuElementSaveStateChanged(isValid: boolean) {
		this.isMenuElementValid = isValid;
	}

	onRelationshipInfoChanged(event: FieldParamLinkedFieldInfo) {
		this._relationshipInfo = event;
	}
}
