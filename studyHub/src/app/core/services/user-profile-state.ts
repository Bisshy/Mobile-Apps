import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserProfile } from './user-profile';


@Injectable({
  providedIn: 'root'
})
export class UserProfileStateService {


  private profileSubject =
    new BehaviorSubject<UserProfile | null>(null);


  profile$ =
    this.profileSubject.asObservable();



  setProfile(
    profile: UserProfile | null
  ): void {

    this.profileSubject.next(profile);

  }



  getProfile(): UserProfile | null {

    return this.profileSubject.value;

  }

  updateProfile(
    profile: UserProfile
    ): void {

    this.profileSubject.next(profile);

 }

  updatePhoto(
    photoURL: string
  ): void {

    const currentProfile =
      this.profileSubject.value;


    if (!currentProfile) {
      return;
    }


    this.profileSubject.next({

      ...currentProfile,

      photoURL

    });

  }

}