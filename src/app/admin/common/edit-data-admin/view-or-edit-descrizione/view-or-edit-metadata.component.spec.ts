import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOrEditMetadataComponent } from './view-or-edit-metadata.component';

describe('ViewOrEditMetadataComponent', () => {
  let component: ViewOrEditMetadataComponent;
  let fixture: ComponentFixture<ViewOrEditMetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewOrEditMetadataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewOrEditMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
