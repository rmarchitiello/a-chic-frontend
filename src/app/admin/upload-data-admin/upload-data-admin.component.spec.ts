import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDataAdminComponent } from './upload-data-admin.component';

describe('UploadDataAdminComponent', () => {
  let component: UploadDataAdminComponent;
  let fixture: ComponentFixture<UploadDataAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadDataAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadDataAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
