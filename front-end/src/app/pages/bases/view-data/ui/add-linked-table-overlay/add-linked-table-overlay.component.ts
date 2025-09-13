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

	@Output() selectColumnValue = new EventEmitter<FieldData>();
	@Output() closePanel = new EventEmitter();


	items: FieldData[] = [];
	// 	{ CellGUID: "A1B2", RecordGUID: "9F4D3C7A", DataValue: "Hiking Backpack" },
	// 	{ CellGUID: "C3D4", RecordGUID: "2A8F5B1C", DataValue: "Trekking Poles" },
	// 	{ CellGUID: "E5F6", RecordGUID: "7C1B9D3E", DataValue: "Water Filter Bottle" },
	// 	{ CellGUID: "G7H8", RecordGUID: "4E7A2B9F", DataValue: "Lightweight Tent" },
	// 	{ CellGUID: "J9K1", RecordGUID: "B3F8D1C6", DataValue: "Sleeping Bag - 20°F" },
	// 	{ CellGUID: "L2M3", RecordGUID: "5A7C9E2B", DataValue: "Headlamp LED" },
	// 	{ CellGUID: "N4P5", RecordGUID: "D6B1F3A9", DataValue: "Trail Running Shoes" },
	// 	{ CellGUID: "Q6R7", RecordGUID: "1E9C7B4D", DataValue: "Portable Camp Stove" },
	// 	{ CellGUID: "S8T9", RecordGUID: "8B2D5F7C", DataValue: "Rainproof Jacket" },
	// 	{ CellGUID: "U0V1", RecordGUID: "3F6A8C5E", DataValue: "Compact First Aid Kit" }
	// ];

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

	loadInitialData() {
		console.log("[loadInitialData]", { field: this.field });
		// const paramValues = (this.field.FieldParams as FieldParamRelationship).ParamValues;

		// const request: RequestLinkedTableDataValue = {
		// 	BaseGUID: this.baseGUID,
		// 	TableGUID: this.tableGUID,
		// 	FieldGUID: this.field.FieldGUID,
		// 	ParamValues: paramValues
		// }

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
