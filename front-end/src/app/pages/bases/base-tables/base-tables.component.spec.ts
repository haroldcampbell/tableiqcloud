import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseTablesComponent } from './base-tables.component';

describe('TablesComponent', () => {
	let component: BaseTablesComponent;
	let fixture: ComponentFixture<BaseTablesComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [BaseTablesComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(BaseTablesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
