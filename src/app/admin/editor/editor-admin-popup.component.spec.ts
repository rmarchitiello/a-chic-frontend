import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorAdminPopUpComponent } from './editor-admin-popup.component';

describe('CaroselloEditComponent', () => {
  let component: EditorAdminPopUpComponent;
  let fixture: ComponentFixture<EditorAdminPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorAdminPopUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorAdminPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
