import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreModule } from '../../../../../modules/core.module';
import { CreateFieldOptionAsSelect, FieldMetaData, FieldOptionsType, FieldTypeToStringifiedFieldType, RequestDataCreateField, RequestDataUpdateField, StringifiedFieldType, StringifiedFieldTypeToType } from '../../../../../models/models.datastore';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { MenuElementOptionComponent, OptionInfoElem } from '../menu-elements/menu-element-option/menu-element-option.component';

@Component({
	selector: 'app-edit-field-context-menu-overlay',
	standalone: true,
	imports: [
		CoreModule,
		MenuElementOptionComponent
	],
	templateUrl: './edit-field-context-menu-overlay.component.html',
	styleUrl: './edit-field-context-menu-overlay.component.scss'
})
export class EditFieldContextMenuOverlayComponent implements OnInit {
	private _optionInfoList: OptionInfoElem[] = [];

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
	}

	isSelectedListItem(s: StringifiedFieldType) {
		return s == this._selectedFieldType;
	}

	onCancel() {
		this.closePanel.emit("");
	}

	onApplyChanges() {
		let options: FieldOptionsType = {}
		if (this.selectedFieldType == StringifiedFieldType.FieldTypeOption) {
			// Convert option list to a format suitable for FieldOptionsType
			options = CreateFieldOptionAsSelect(this._optionInfoList.map(opt => opt.OptionInfo))
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

	isOptionFieldType(): boolean {
		return this.selectedFieldType === StringifiedFieldType.FieldTypeOption;
	}

	onOptionInfoListChanged(listItems: OptionInfoElem[]) {
		this._optionInfoList = listItems;
	}
}
