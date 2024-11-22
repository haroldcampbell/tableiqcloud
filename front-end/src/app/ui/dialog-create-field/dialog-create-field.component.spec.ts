import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreateFieldComponent } from './dialog-create-field.component';

describe('DialogCreateFieldComponent', () => {
  let component: DialogCreateFieldComponent;
  let fixture: ComponentFixture<DialogCreateFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCreateFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCreateFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
