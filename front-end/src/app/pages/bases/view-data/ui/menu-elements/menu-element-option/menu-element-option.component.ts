import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { auditTime, debounceTime, delay, map, merge, mergeMap, Subject } from 'rxjs';
import { FieldMetaData, FieldParamOption, OptionInfo } from '../../../../../../models/models.datastore';

export interface OptionInfoElem {
	OptionInfo: OptionInfo;
	_inputElm?: HTMLInputElement; // Optional reference to the input element for focus management
}

@Component({
	selector: 'app-menu-element-option',
	standalone: true,
	imports: [],
	templateUrl: './menu-element-option.component.html',
	styleUrl: './menu-element-option.component.scss'
})
export class MenuElementOptionComponent implements OnInit, AfterViewInit, OnDestroy {
	optionInfoElm: OptionInfoElem[] = []; // For Option field type, holds the value of options
	private addOption$ = new Subject<OptionInfoElem>();
	private createOption$ = new Subject<OptionInfoElem>();
	private removeOption$ = new Subject<OptionInfoElem>();

	@Input() field!: FieldMetaData;

	@Output() optionInfoList = new EventEmitter<OptionInfoElem[]>();

	ngOnInit(): void {
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

	initExistingOptions() {
		if (this.field === undefined || this.field.FieldParams === undefined) {
			console.warn("Field or FieldParams is undefined, skipping initialization of existing options.");
			return;
		}

		const optionInforList = (this.field.FieldParams as FieldParamOption)?.ParamValues ?? []

		let s = new Subject<OptionInfoElem>();

		s.pipe(delay(50))
			.forEach((item) => {
				// Store the input element reference for later use
				item._inputElm = this.getOptionInputElm(item);
			});

		optionInforList.map(i => {
			const itemElm = {
				OptionInfo: i,
				_inputElm: undefined
			}
			this.optionInfoElm.push(itemElm);
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
			},
			_inputElm: undefined // Initialize input element reference as null
		}

		this.createOption$.next(itemElem);
	}

	onRemoveOption(item: OptionInfoElem) {
		this.removeOption$.next(item);
	}
	private removeOption(item: OptionInfoElem) {
		this.optionInfoElm = this.optionInfoElm.filter(opt => opt.OptionInfo.OptionIndex !== item.OptionInfo.OptionIndex);
		this.optionInfoList.emit(this.optionInfoElm); // Emit the current list of options
	}


	onOptionInputFocus($event: FocusEvent, item: OptionInfoElem) {
		// console.log("Option input focused for index:", item.OptionInfo.OptionIndex);
	}

	onOptionValueBlur($event: FocusEvent, item: OptionInfoElem) {
		if (item._inputElm) {
			item._inputElm.blur(); // Remove focus from the input element
			item.OptionInfo.OptionName = item._inputElm.value.trim(); // Update the option name with trimmed value

			console.log("[onOptionValueBlur] changed: ", item._inputElm.value.trim())
			this.optionInfoList.emit(this.optionInfoElm); // Emit the current list of options
		}
	}

	onOptionValueChange($event: KeyboardEvent, item: OptionInfoElem) {

	}
}
