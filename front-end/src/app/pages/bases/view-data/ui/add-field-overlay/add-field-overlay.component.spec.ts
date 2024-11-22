import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFieldOverlayComponent } from './add-field-overlay.component';

describe('AddFieldOverlayComponent', () => {
  let component: AddFieldOverlayComponent;
  let fixture: ComponentFixture<AddFieldOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFieldOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFieldOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
