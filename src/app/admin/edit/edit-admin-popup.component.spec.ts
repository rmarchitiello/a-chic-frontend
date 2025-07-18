import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAdminPopUpComponent } from './edit-admin-popup.component';

describe('CaroselloEditComponent', () => {
  let component: EditAdminPopUpComponent;
  let fixture: ComponentFixture<EditAdminPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAdminPopUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAdminPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
