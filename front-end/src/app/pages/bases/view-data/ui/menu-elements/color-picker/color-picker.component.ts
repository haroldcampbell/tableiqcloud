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
			'#FF0000', '#00FF00', '#ADD8E6', '#FFA500',
			'#FF00FF', '#00FFFF', '#A52A2A', '#FFFFFF',
			// '#FFA500', '#800080', '#808000', '#008080',
			// '#A52A2A', '#808080', '#C0C0C0', '#ADD8E6'
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
