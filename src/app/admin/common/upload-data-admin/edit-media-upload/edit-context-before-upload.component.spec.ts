import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMediaUploadComponent } from './edit-context-before-upload.component';

describe('EditMediaUploadComponent', () => {
  let component: EditMediaUploadComponent;
  let fixture: ComponentFixture<EditMediaUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMediaUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditMediaUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
