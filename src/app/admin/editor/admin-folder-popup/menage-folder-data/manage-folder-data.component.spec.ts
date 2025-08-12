import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFolderDataComponent } from './manage-folder-data.component';

describe('MenageFolderDataComponent', () => {
  let component: ManageFolderDataComponent;
  let fixture: ComponentFixture<ManageFolderDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFolderDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFolderDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
