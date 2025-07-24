import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOrEditDescrizioneComponent } from './view-or-edit-descrizione.component';

describe('ViewOrEditDescrizioneComponent', () => {
  let component: ViewOrEditDescrizioneComponent;
  let fixture: ComponentFixture<ViewOrEditDescrizioneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewOrEditDescrizioneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewOrEditDescrizioneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
