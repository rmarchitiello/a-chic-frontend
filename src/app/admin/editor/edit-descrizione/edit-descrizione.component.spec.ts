import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDescrizioneComponent } from './edit-descrizione.component';

describe('EditDescrizioneComponent', () => {
  let component: EditDescrizioneComponent;
  let fixture: ComponentFixture<EditDescrizioneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDescrizioneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDescrizioneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
