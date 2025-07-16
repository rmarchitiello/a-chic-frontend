import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaroselloEditComponent } from './carosello-edit.component';

describe('CaroselloEditComponent', () => {
  let component: CaroselloEditComponent;
  let fixture: ComponentFixture<CaroselloEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaroselloEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaroselloEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
