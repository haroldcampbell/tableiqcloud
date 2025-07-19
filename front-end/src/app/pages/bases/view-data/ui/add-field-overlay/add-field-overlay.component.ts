import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CoreModule } from '../../../../../modules/core.module';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { CreateFieldOptionAsSelect, FieldOptionsType, OptionInfo, RequestDataCreateField, StringifiedFieldType } from '../../../../../models/models.datastore';
import { Subject } from 'rxjs';
import { auditTime } from 'rxjs/operators';


interface OptionInfoElem {
	OptionInfo: OptionInfo;
	_inputElm?: HTMLInputElement; // Optional reference to the input element for focus management
}

@Component({
	selector: 'app-add-field-overlay',
	standalone: true,
	imports: [
		CoreModule
	],
	templateUrl: './add-field-overlay.component.html',
	styleUrl: './add-field-overlay.component.scss'
})
export class AddFieldOverlayComponent implements OnInit, AfterViewInit, OnDestroy {
	fieldName = "";
	selectedFieldType = StringifiedFieldType.FieldTypeString;
	disSelectedField = false; // Has an initial field been selected?

	optionInfoElm: OptionInfoElem[] = []; // For Option field type, holds the value of options

	private addOption$ = new Subject<OptionInfoElem>();

	@Input() baseGUID!: string;
	@Input() tableGUID!: string;

	@Output() didClickCreate = new EventEmitter<RequestDataCreateField>();
	@Output() closePanel = new EventEmitter();

	get FieldType() {
		return StringifiedFieldType;
	}

	ngOnInit(): void {
	}

	ngAfterViewInit() {
		// Debounced focusing logic
		this.addOption$
			.pipe(auditTime(50))  // Waits 50ms after last emit before running
			.subscribe((item: OptionInfoElem) => {
				const input = document.getElementById(`option-value-${item.OptionInfo.OptionId}`) as HTMLInputElement;
				if (input) {
					input.focus();
					item._inputElm = input; // Store the input element reference for later use
				}
			});
	}

	ngOnDestroy(): void {
		// this.addOption$.next();     // Emits to all takeUntil()
		this.addOption$.complete(); // Cleanup
	}

	onCancel() {
		this.closePanel.emit("");
	}

	onApplyChanges() {
		let options: FieldOptionsType = {}
		if (this.selectedFieldType == StringifiedFieldType.FieldTypeOption) {
			// Convert optionNames to a format suitable for FieldOptionsType
			options = CreateFieldOptionAsSelect(this.optionInfoElm.map(opt => opt.OptionInfo))
		}

		console.log("[onApplyChanges] Creating field with options:", options);

		this.didClickCreate.emit({
			BaseGUID: this.baseGUID,
			TableGUID: this.tableGUID,
			FieldName: this.fieldName,
			FieldType: this.selectedFieldType,
			FieldOptions: options // Pass the options if applicable
		});
	}

	onSelectFieldType(selected: StringifiedFieldType) {
		this.selectedFieldType = selected;
		this.disSelectedField = true;
	}

	onFieldTypeChanged(matSelect: MatSelect, $event: MatSelectChange) {
		this.selectedFieldType = $event.value
	}

	get isEmptyOptionList(): boolean {
		return this.optionInfoElm.length == 0;
	}
	isOptionFieldTypeDisabled(): boolean {
		return this.selectedFieldType === StringifiedFieldType.FieldTypeOption;
	}
	onAddOption() {
		// Logic to add an option for the Option field type
		console.log("Add option clicked");

		let itemElem: OptionInfoElem = {
			OptionInfo: {
				OptionId: this.optionInfoElm.length + "-" + Date.now(), // Use current timestamp as a unique ID
				OptionIndex: this.optionInfoElm.length,
				OptionName: "",
			},
			_inputElm: undefined // Initialize input element reference as null
		}

		this.optionInfoElm.push(itemElem); // Placeholder for new option
		this.addOption$.next(itemElem);
	}
	onRemoveOption(item: OptionInfoElem) {
		this.optionInfoElm = this.optionInfoElm.filter(opt => opt.OptionInfo.OptionIndex !== item.OptionInfo.OptionIndex);
	}
	onOptionInputFocus($event: FocusEvent, item: OptionInfoElem) {
		console.log("Option input focused for index:", item.OptionInfo.OptionIndex);
	}
	onOptionValueBlur($event: FocusEvent, item: OptionInfoElem) {
		if (item._inputElm) {
			item._inputElm.blur(); // Remove focus from the input element
			item.OptionInfo.OptionName = item._inputElm.value.trim(); // Update the option name with trimmed value
		}
	}
	onOptionValueChange($event: KeyboardEvent, item: OptionInfoElem) {

	}
}