import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudinaryComponent } from './cloudinary.component';

describe('BorseConchigliaComponent', () => {
  let component: CloudinaryComponent;
  let fixture: ComponentFixture<CloudinaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloudinaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloudinaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
