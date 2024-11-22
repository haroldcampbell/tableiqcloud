import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCellFieldStringComponent } from './table-cell-field-string.component';

describe('TableCellFieldStringComponent', () => {
  let component: TableCellFieldStringComponent;
  let fixture: ComponentFixture<TableCellFieldStringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCellFieldStringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableCellFieldStringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
