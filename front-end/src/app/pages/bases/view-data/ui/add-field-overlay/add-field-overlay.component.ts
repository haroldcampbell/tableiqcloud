import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreModule } from '../../../../../modules/core.module';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { RequestDataCreateField, StringifiedFieldType } from '../../../../../models/models.datastore';

@Component({
	selector: 'app-add-field-overlay',
	standalone: true,
	imports: [
		CoreModule
	],
	templateUrl: './add-field-overlay.component.html',
	styleUrl: './add-field-overlay.component.scss'
})
export class AddFieldOverlayComponent implements OnInit {
	fieldName = "";
	selectedFieldType = StringifiedFieldType.FieldTypeString;
	disSelectedField = false; // Has an initial field been selected?

	@Input() baseGUID!: string;
	@Input() tableGUID!: string;

	@Output() didClickCreate = new EventEmitter<RequestDataCreateField>();
	@Output() closePanel = new EventEmitter();

	get FieldType() {
		return StringifiedFieldType;
	}

	ngOnInit(): void {
		// this.dialogRef.backdropClick()
		//     .subscribe(_ => {
		//         this.dialogRef.close();
		//     });
	}

	onCancel() {
		this.closePanel.emit("");
	}

	onApplyChanges() {
		this.didClickCreate.emit({
			BaseGUID: this.baseGUID,
			TableGUID: this.tableGUID,
			FieldName: this.fieldName,
			FieldType: this.selectedFieldType,
		});
	}

	onSelectFieldType(selected: StringifiedFieldType) {
		this.selectedFieldType = selected;
		this.disSelectedField = true;
	}

	onFieldTypeChanged(matSelect: MatSelect, $event: MatSelectChange) {
		this.selectedFieldType = $event.value
	}
}
