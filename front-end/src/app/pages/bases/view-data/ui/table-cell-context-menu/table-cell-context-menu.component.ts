import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FieldMetaData } from '../../../../../models/models.datastore';

@Component({
	selector: 'app-table-cell-context-menu',
	standalone: true,
	imports: [],
	templateUrl: './table-cell-context-menu.component.html',
	styleUrl: './table-cell-context-menu.component.scss'
})
export class TableCellContextMenuComponent {
	@Input() field!: FieldMetaData;

	// @Output() editField = new EventEmitter<FieldMetaData>();
	@Output() deleteRecord = new EventEmitter<FieldMetaData>();
}
