import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'color-picker',
	standalone: true,
	imports: [],
	templateUrl: './color-picker.component.html',
	styleUrl: './color-picker.component.scss'
})
export class ColorPickerComponent implements OnInit {
	@Input() colors: string[] = [];
	@Input() selectedColor: string | null = null;
	@Output() colorSelected = new EventEmitter<string | undefined>();

	ngOnInit(): void {
		this.colors = [
			"#D6D5E8", "#c7e4f5", "#CBEEEF", "#c5c89a",
			"#b4b3c6", "#abc6d6", "#a3c7c9", "#b2b682",
			"#AA85C7", '#ffcdcd', '#e9e9e9', '#FFFFFF',
		];

	}

	selectColor(color: string) {
		console.log("[ColorPickerComponent.selectColor] ", { color: color });
		this.colorSelected.emit(color);
	}

	dismissDialog() {
		console.log("[ColorPickerComponent.dismissDialog] ");
		this.colorSelected.emit(undefined);
	}
}
