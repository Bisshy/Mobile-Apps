import { TestBed } from '@angular/core/testing';
import { UserProfileState } from './user-profile-state';

describe('UserProfileState', () => {
  let service: UserProfileState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserProfileState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
