import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelliInEvidenzaPopupComponent } from './modelli-in-evidenza-popup.component';

describe('ModelliInEvidenzaPopupComponent', () => {
  let component: ModelliInEvidenzaPopupComponent;
  let fixture: ComponentFixture<ModelliInEvidenzaPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelliInEvidenzaPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelliInEvidenzaPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
