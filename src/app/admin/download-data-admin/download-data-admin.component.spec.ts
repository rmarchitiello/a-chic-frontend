import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadDataAdminComponent } from './download-data-admin.component';

describe('DownloadDataAdminComponent', () => {
  let component: DownloadDataAdminComponent;
  let fixture: ComponentFixture<DownloadDataAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadDataAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadDataAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
