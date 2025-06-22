import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsLoginComponent } from './cms-login.component';

describe('CmsLoginComponent', () => {
  let component: CmsLoginComponent;
  let fixture: ComponentFixture<CmsLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CmsLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CmsLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
