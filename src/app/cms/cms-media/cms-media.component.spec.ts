import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsMediaComponent } from './cms-media.component';

describe('CmsMediaComponent', () => {
  let component: CmsMediaComponent;
  let fixture: ComponentFixture<CmsMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CmsMediaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CmsMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
