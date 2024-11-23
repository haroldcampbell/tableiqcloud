import { Component, EventEmitter, ContentChild, TemplateRef, Output, Input } from '@angular/core';
import { FieldMetaData } from '../../../../../models/models.datastore';

@Component({
	selector: 'app-field-context-menu-overlay',
	standalone: true,
	imports: [],
	templateUrl: './field-context-menu-overlay.component.html',
	styleUrl: './field-context-menu-overlay.component.scss'
})
export class FieldContextMenuOverlayComponent {
	@Input() field!: FieldMetaData;

	@Output() editField = new EventEmitter<FieldMetaData>();
	@Output() deleteField = new EventEmitter<FieldMetaData>();
}
