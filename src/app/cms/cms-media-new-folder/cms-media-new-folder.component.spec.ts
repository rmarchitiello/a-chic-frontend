import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsMediaNewFolderComponent } from './cms-media-new-folder.component';

describe('CmsMediaNewFolderComponent', () => {
  let component: CmsMediaNewFolderComponent;
  let fixture: ComponentFixture<CmsMediaNewFolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CmsMediaNewFolderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CmsMediaNewFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
