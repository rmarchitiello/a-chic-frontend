import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMetadata } from './view-metadata.component';

describe('ViewMetadata', () => {
  let component: ViewMetadata;
  let fixture: ComponentFixture<ViewMetadata>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMetadata]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMetadata);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
