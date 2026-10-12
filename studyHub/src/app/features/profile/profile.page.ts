import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";

import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";

import { IonButton, IonContent } from "@ionic/angular";

import { AppHeaderComponent } from "../../shared/components/app-header/app-header.component";

import { SupabaseAuthService } from "../../core/services/supabase-auth";

import {
  UserProfile,
  UserProfileService,
} from "../../core/services/user-profile";

import { AppAvatarComponent } from "../../shared/components/app-avatar/app-avatar.component";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
  imports: [
    IonContent,
    IonButton,
    CommonModule,
    AppHeaderComponent,
    AppAvatarComponent,
  ],
})
export class ProfilePage implements OnInit, OnDestroy {
  username = "Student";

  handle = "@student";

  email = "student@example.com";

  userProfile: UserProfile | null = null;

  private authSubscription:
    | ReturnType<
      SupabaseAuthService["onAuthStateChange"]
    >
    | null = null;

  constructor(
    private router: Router,
    private supabaseAuthService: SupabaseAuthService,
    private userProfileService: UserProfileService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.supabaseAuthService.onAuthStateChange(
      async (session) => {
        const user = session?.user;

        if (!user) {
          console.log(
            "No authenticated user found.",
          );

          return;
        }

        console.log(
          "Authenticated user:",
          user.id,
        );

        console.log(
          "Getting user profile from Supabase...",
        );

        try {
          this.userProfile = await this.userProfileService.getProfile(
            user.id,
          );

          console.log(
            "Current user profile:",
            this.userProfile,
          );

          if (this.userProfile) {
            this.username = this.userProfile.username;

            this.handle = `@${this.userProfile.handle}`;

            this.email = this.userProfile.email;

            this.changeDetectorRef.detectChanges();
          }
        } catch (error) {
          console.error(
            "Error loading user profile:",
            error,
          );
        }
      },
    );
  }

  ngOnDestroy(): void {
    this.authSubscription
      ?.data
      .subscription
      .unsubscribe();
  }

  editProfile(): void {
    this.router.navigate([
      "/edit-profile",
    ]);
  }
}
