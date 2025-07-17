import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteDataAdminComponent } from './delete-data-admin.component';

describe('DeleteDataAdminComponent', () => {
  let component: DeleteDataAdminComponent;
  let fixture: ComponentFixture<DeleteDataAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteDataAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteDataAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
