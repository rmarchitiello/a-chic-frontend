import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsUploadComponent } from './cms-upload.component';

describe('CmsUploadComponent', () => {
  let component: CmsUploadComponent;
  let fixture: ComponentFixture<CmsUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CmsUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CmsUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
