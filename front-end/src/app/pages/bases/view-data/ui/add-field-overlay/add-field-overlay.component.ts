import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CoreModule } from '../../../../../modules/core.module';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { CreateFieldOptionAsSelect, CreateFieldRelationshipAsSelect, FieldOptionsType, FieldParamLinkedFieldInfo, FieldParamOptionInfo, RequestDataCreateField, StringifiedFieldType } from '../../../../../models/models.datastore';
import { Subject } from 'rxjs';
import { auditTime } from 'rxjs/operators';
import { MenuElementOptionComponent, OptionInfoElem } from '../menu-elements/menu-element-option/menu-element-option.component';
import { MenuElementRelationshipComponent } from "../menu-elements/menu-element-relationship/menu-element-relationship.component";



@Component({
	selector: 'app-add-field-overlay',
	standalone: true,
	imports: [
		CoreModule,
		MenuElementOptionComponent,
		MenuElementRelationshipComponent
	],
	templateUrl: './add-field-overlay.component.html',
	styleUrl: './add-field-overlay.component.scss'
})
export class AddFieldOverlayComponent implements OnInit, AfterViewInit, OnDestroy {
	fieldName = "";
	selectedFieldType = StringifiedFieldType.FieldTypeString;
	disSelectedField = false; // Has an initial field been selected?

	// optionInfoElm: OptionInfoElem[] = []; // For Option field type, holds the value of options
	// private addOption$ = new Subject<OptionInfoElem>();

	private _optionInfoList: OptionInfoElem[] = [];
	private _relationshipInfo?: FieldParamLinkedFieldInfo;

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
		// this.addOption$
		// 	.pipe(auditTime(50))  // Waits 50ms after last emit before running
		// 	.subscribe((item: OptionInfoElem) => {
		// 		const input = document.getElementById(`option-value-${item.OptionInfo.OptionId}`) as HTMLInputElement;
		// 		if (input) {
		// 			input.focus();
		// 			item._inputElm = input; // Store the input element reference for later use
		// 		}
		// 	});
	}

	ngOnDestroy(): void {
		// this.addOption$.next();     // Emits to all takeUntil()
		// this.addOption$.complete(); // Cleanup
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
		this.isMenuElementValid = true;
	}

	// isOptionFieldType(): boolean {
	// 	return this.selectedFieldType === StringifiedFieldType.FieldTypeOption;
	// }

	// isRelationshipFieldType(): boolean {
	// 	return this.selectedFieldType === StringifiedFieldType.FieldTypeRelationship;
	// }

	onOptionInfoListChanged(listItems: OptionInfoElem[]) {
		this._optionInfoList = listItems;
	}

	onHasValidOptionSaveState(isValid: boolean) {
		this.isMenuElementValid = isValid;
		// console.log("[onHasValidOptionSaveState] ", { isValid })
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