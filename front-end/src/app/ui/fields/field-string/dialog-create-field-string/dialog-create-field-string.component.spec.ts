import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreateFieldStringComponent } from './dialog-create-field-string.component';

describe('DialogCreateFieldStringComponent', () => {
  let component: DialogCreateFieldStringComponent;
  let fixture: ComponentFixture<DialogCreateFieldStringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCreateFieldStringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCreateFieldStringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
