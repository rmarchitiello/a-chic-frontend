import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFolderPopupComponent } from './admin-folder-popup.component';

describe('AdminFolderPopupComponent', () => {
  let component: AdminFolderPopupComponent;
  let fixture: ComponentFixture<AdminFolderPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFolderPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFolderPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
