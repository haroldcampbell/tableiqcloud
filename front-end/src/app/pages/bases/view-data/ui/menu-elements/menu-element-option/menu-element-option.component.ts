import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewContainerRef } from '@angular/core';
import { auditTime, debounceTime, delay, map, merge, mergeMap, Subject } from 'rxjs';
import { FieldMetaData, FieldParamOption, FieldParamOptionInfo, Key_FieldParamOptionInfo_OptionMetaDataColor } from '../../../../../../models/models.datastore';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { CommonModule } from '@angular/common';
import { Overlay, OverlayModule, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

export interface OptionInfoElem {
	OptionInfo: FieldParamOptionInfo;
	// _itemColor: string;
	_inputElm?: HTMLInputElement; // Optional reference to the input element for focus management
}

@Component({
	selector: 'menu-element-option',
	standalone: true,
	imports: [
		CommonModule,
		OverlayModule,
		ColorPickerComponent,
	],
	templateUrl: './menu-element-option.component.html',
	styleUrl: './menu-element-option.component.scss'
})
export class MenuElementOptionComponent implements OnInit, AfterViewInit, OnDestroy {
	private addOption$ = new Subject<OptionInfoElem>();
	private createOption$ = new Subject<OptionInfoElem>();
	private removeOption$ = new Subject<OptionInfoElem>();
	private overlayRef: OverlayRef | null = null;

	@Input() field!: FieldMetaData;
	@Input() optionInfoElm: OptionInfoElem[] = []; // For Option field type, holds the value of options

	@Output() optionInfoList = new EventEmitter<OptionInfoElem[]>();
	@Output() hasValidSaveState = new EventEmitter<boolean>();

	constructor(
		private overlay: Overlay,
		private positionBuilder: OverlayPositionBuilder,
		private vcr: ViewContainerRef
	) { }

	ngOnInit(): void {
		this.hasValidSaveState.emit(false);
		this.initExistingOptions();
	}

	getOptionInputElm(item: OptionInfoElem) {
		return document.getElementById(`option-value-${item.OptionInfo.OptionId}`) as HTMLInputElement;
	}

	ngAfterViewInit() {
		// Debounced focusing logic
		this.createOption$
			.pipe(debounceTime(50))
			.subscribe((itemElem: OptionInfoElem) => {
				this.optionInfoElm.push(itemElem);
				this.addOption$.next(itemElem);
			});

		this.addOption$
			.pipe(auditTime(50))  // Waits 50ms after last emit before running
			.subscribe((item: OptionInfoElem) => {
				// Store the input element reference for later use
				const input = this.getOptionInputElm(item);
				if (input) {
					input.focus();
					item._inputElm = input;
				}
				this.optionInfoList.emit(this.optionInfoElm); // Emit the current list of options
				this.publishSaveStateValidity();
			});

		this.removeOption$
			.pipe(debounceTime(50))
			.subscribe((item: OptionInfoElem) => {
				this.removeOption(item)
			})
	}

	ngOnDestroy(): void {
		// Subscription Cleanup
		this.createOption$.complete();
		this.addOption$.complete();
		this.removeOption$.complete();
	}

	publishSaveStateValidity() {
		if (this.optionInfoElm.length > 0) {
			this.hasValidSaveState.emit(true);
		} else {
			this.hasValidSaveState.emit(false);
		}
	}

	initExistingOptions() {
		let s = new Subject<OptionInfoElem>();

		s.pipe(delay(50))
			.forEach((item) => {
				// Store the input element reference for later use
				item._inputElm = this.getOptionInputElm(item);
			});


		this.optionInfoElm.forEach(itemElm => {
			s.next(itemElm)
		});

		s.complete();
	}

	get isEmptyOptionList(): boolean {
		return this.optionInfoElm.length == 0;
	}

	onAddOption() {
		// Logic to add an option for the Option field type
		let itemElem: OptionInfoElem = {
			OptionInfo: {
				OptionId: this.optionInfoElm.length + "-" + Date.now(), // Use current timestamp as a unique ID
				OptionIndex: this.optionInfoElm.length,
				OptionName: "",
				OptionMetaData: {
					[Key_FieldParamOptionInfo_OptionMetaDataColor]: "",
				},
			},
			_inputElm: undefined, // Initialize input element reference as null
		}

		this.createOption$.next(itemElem);
	}

	onRemoveOption(item: OptionInfoElem) {
		this.removeOption$.next(item);
	}

	private removeOption(item: OptionInfoElem) {
		this.optionInfoElm = this.optionInfoElm.filter(opt => opt.OptionInfo.OptionIndex !== item.OptionInfo.OptionIndex);
		this.optionInfoList.emit(this.optionInfoElm); // Emit the current list of options
		this.publishSaveStateValidity();
	}

	onOptionInputFocus($event: FocusEvent, item: OptionInfoElem) {
		// console.log("Option input focused for index:", item.OptionInfo.OptionIndex);
	}

	onOptionValueBlur($event: FocusEvent, item: OptionInfoElem) {
		// console.log("[onOptionValueBlur] ", item)
		if (item._inputElm) {
			item._inputElm.blur(); // Remove focus from the input element
			item.OptionInfo.OptionName = item._inputElm.value.trim(); // Update the option name with trimmed value

			// console.log("[onOptionValueBlur] changed: ", item._inputElm.value.trim())
			this.optionInfoList.emit(this.optionInfoElm); // Emit the current list of options
		}
	}

	onOptionValueChange($event: KeyboardEvent, item: OptionInfoElem) {

	}

	selectedColorPickerItem?: OptionInfoElem;

	showColorPickerContextMenu(item: OptionInfoElem) {
		return this.selectedColorPickerItem == item;
	}

	onOpenColorPickerContextMenu(item: OptionInfoElem) {
		// console.log("[MenuElementOptionComponent.onOpenColorPickerContextMenu] ", item);
		this.selectedColorPickerItem = item;
	}

	onColorSelected(color: string | undefined, item: OptionInfoElem) {
		// console.log("[MenuElementOptionComponent.onColorSelected] ", { color: color, item: item })

		if (color !== undefined) {
			if (!item.OptionInfo.OptionMetaData) {
				item.OptionInfo.OptionMetaData = {}
			}
			item.OptionInfo.OptionMetaData[Key_FieldParamOptionInfo_OptionMetaDataColor] = color;
			// item._itemColor = color;
		}
		this.onColorPickerDetached();
		this.optionInfoList.emit(this.optionInfoElm);
	}

	onColorPickerDetached() {
		this.selectedColorPickerItem = undefined;
	}

	getItemColor(item: OptionInfoElem): string {
		if (!item.OptionInfo.OptionMetaData) {
			item.OptionInfo.OptionMetaData = {
				[Key_FieldParamOptionInfo_OptionMetaDataColor]: ""
			}
		}
		return item.OptionInfo.OptionMetaData[Key_FieldParamOptionInfo_OptionMetaDataColor];
	}
}
