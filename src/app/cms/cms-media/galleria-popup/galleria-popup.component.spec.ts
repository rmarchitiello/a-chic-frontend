import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleriaPopupComponent } from './galleria-popup.component';

describe('GalleriaPopupComponent', () => {
  let component: GalleriaPopupComponent;
  let fixture: ComponentFixture<GalleriaPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleriaPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GalleriaPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
