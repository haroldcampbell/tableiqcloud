import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FieldData, FieldMetaData, FieldParamRelationship } from '../../../../../models/models.datastore';
import { debounceTime, Subject } from 'rxjs';
import { APIService } from '../../../../../api.services/api.service';

@Component({
	selector: 'add-linked-table-overlay',
	standalone: true,
	imports: [],
	templateUrl: './add-linked-table-overlay.component.html',
	styleUrl: './add-linked-table-overlay.component.scss'
})
export class AddLinkedTableOverlayComponent implements OnInit, AfterViewInit {

	private search$ = new Subject<string>();

	@ViewChild('searchInputElm', { static: false })
	searchInputElm!: ElementRef<HTMLInputElement>;

	@Input() baseGUID!: string;
	@Input() tableGUID!: string;
	@Input() field!: FieldMetaData;
	@Input() existingFieldValues?: Array<FieldData>;

	@Output() selectColumnValue = new EventEmitter<FieldData>();
	@Output() closePanel = new EventEmitter();


	items: FieldData[] = [];
	filteredItems: FieldData[] = this.items;
	searchInput: string = "";

	constructor(
		private apiService: APIService,
	) { }

	ngOnInit(): void {
		this.search$
			.pipe(debounceTime(300)) // wait 300 ms after the last keyup
			.subscribe(value => {
				this.searchInput = value;
				this.applySearchFilter();
			});

		// Load initial data
		this.loadInitialData();
	}

	ngAfterViewInit() {
		this.searchInputElm?.nativeElement.focus();
	}

	private existingFieldValuesMap: Record<string, FieldData> = {}

	loadInitialData() {
		console.log("[loadInitialData]", { field: this.field, existingFieldValues: this.existingFieldValues });

		// Create a dictionary of the existing values
		this.existingFieldValues?.forEach(fieldData => {
			this.existingFieldValuesMap[fieldData.CellGUID] = fieldData;
		});

		this.apiService.apiRequests.getLikedTableDataOptions(this.baseGUID, this.tableGUID, this.field.FieldGUID)
			.subscribe({
				next: (data) => {
					this.items = data;
					this.applySearchFilter();
					console.log("[loadInitialData] data: ", data);
				},
				error: (err) => {
					console.log("[loadInitialData] err: ", err);
				}
			})
		// Placeholder for loading data from an API or service
		// For now, we use the hardcoded items
		// this.filteredItems = [...this.items];
	}

	isExistingitem(item: FieldData) {
		return this.existingFieldValuesMap[item.CellGUID] !== undefined;
	}

	onSearchInputKeyUp(event: KeyboardEvent) {
		// console.log("[onSelectRowItemKeyUp]");
		// console.log("[onSelectRowItemKeyUp] event:", event);
		event.preventDefault();

		switch (event.key) {
			case "Escape": {
				this.closePanel.emit();
				break;
			}

			case "Enter": {
				// force immediate search on Enter
				this.searchInput = this.searchInputElm.nativeElement.value || "";
				this.applySearchFilter();
				console.log("[onSearchInputKeyUp] filteredItems:", this.filteredItems);

				break;
			}

			default: {
				// enqueue for debounced filtering
				const current = this.searchInputElm.nativeElement.value || '';
				this.search$.next(current);
				break;
			}
		}
	}

	private normalize(value: string): string {
		return value
			.toLowerCase()
			.normalize('NFD')                // split accents from letters
			.replace(/[\u0300-\u036f]/g, '') // strip diacritics
			.trim();
	}

	applySearchFilter() {
		if (!this.items || this.items.length === 0) {
			console.log("[applySearchFilter] no items");
			this.filteredItems = [];
			return;
		}

		const term = this.normalize(this.searchInput ?? '');

		if (!term) {
			this.filteredItems = this.items;
			console.log("[applySearchFilter] no term ", { filteredItems: this.filteredItems });
			return;
		}

		this.filteredItems = this.items.filter(item =>
			this.normalize(item.DataValue).includes(term)
		)
	}
}
