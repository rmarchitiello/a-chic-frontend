import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggiungiCaroselloComponent } from './aggiungi-carosello.component';

describe('AggiungiCaroselloComponent', () => {
  let component: AggiungiCaroselloComponent;
  let fixture: ComponentFixture<AggiungiCaroselloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AggiungiCaroselloComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AggiungiCaroselloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
