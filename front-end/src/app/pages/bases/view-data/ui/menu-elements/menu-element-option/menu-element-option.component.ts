import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { auditTime, debounceTime, Subject } from 'rxjs';
import { OptionInfo } from '../../../../../../models/models.datastore';

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
	@Output() optionInfoList = new EventEmitter<OptionInfoElem[]>();

	ngOnInit(): void {
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
			.pipe(debounceTime(50))  // Waits 50ms after last emit before running
			.subscribe((item: OptionInfoElem) => {
				const input = document.getElementById(`option-value-${item.OptionInfo.OptionId}`) as HTMLInputElement;
				if (input) {
					input.focus();
					item._inputElm = input; // Store the input element reference for later use
				}
				this.optionInfoList.emit(this.optionInfoElm); // Emit the current list of options
			});
	}

	ngOnDestroy(): void {
		this.createOption$.complete();
		this.addOption$.complete(); // Cleanup
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
			this.optionInfoList.emit(this.optionInfoElm); // Emit the current list of options
		}
	}

	onOptionValueChange($event: KeyboardEvent, item: OptionInfoElem) {

	}
}
