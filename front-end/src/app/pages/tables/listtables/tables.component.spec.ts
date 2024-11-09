import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTablesComponent } from './tables.component';

describe('TablesComponent', () => {
	let component: ListTablesComponent;
	let fixture: ComponentFixture<ListTablesComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ListTablesComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(ListTablesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
