import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaroselloEditPopUpComponent } from './carosello-edit-popup.component';

describe('CaroselloEditComponent', () => {
  let component: CaroselloEditPopUpComponent;
  let fixture: ComponentFixture<CaroselloEditPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaroselloEditPopUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaroselloEditPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
