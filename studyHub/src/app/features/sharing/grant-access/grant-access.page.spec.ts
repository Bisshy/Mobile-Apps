import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GrantAccessPage } from './grant-access.page';

describe('GrantAccessPage', () => {
  let component: GrantAccessPage;
  let fixture: ComponentFixture<GrantAccessPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GrantAccessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
