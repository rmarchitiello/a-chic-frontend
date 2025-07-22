import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDataAdminComponent } from './edit-data-admin.component';

describe('EditMediaUploadComponent', () => {
  let component: EditDataAdminComponent;
  let fixture: ComponentFixture<EditDataAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDataAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDataAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
