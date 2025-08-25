import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfermaDeleteMassivaComponent } from './conferma-delete-massiva.component';

describe('ConfermaDeleteMassivaComponent', () => {
  let component: ConfermaDeleteMassivaComponent;
  let fixture: ComponentFixture<ConfermaDeleteMassivaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfermaDeleteMassivaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfermaDeleteMassivaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
