import { TestBed } from '@angular/core/testing';
import { ProfileStorage } from './profile-storage';

describe('ProfileStorage', () => {
  let service: ProfileStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileStorage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
