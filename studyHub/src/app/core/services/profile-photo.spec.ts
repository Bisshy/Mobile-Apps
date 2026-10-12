import { TestBed } from '@angular/core/testing';
import { ProfilePhoto } from './profile-photo';

describe('ProfilePhoto', () => {
  let service: ProfilePhoto;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfilePhoto);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
