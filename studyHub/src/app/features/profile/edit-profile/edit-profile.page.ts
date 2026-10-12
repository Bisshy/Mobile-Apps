import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";

import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";

import {
  ActionSheetController,
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonModal,
} from "@ionic/angular";

import { ProfilePhotoService } from "../../../core/services/profile-photo";
import { WebCameraComponent } from "../../../shared/components/web-camera/web-camera.component";

import { SupabaseAuthService } from "../../../core/services/supabase-auth";

import {
  UserProfile,
  UserProfileService,
} from "../../../core/services/user-profile";

import { ProfileStorageService } from "../../../core/services/profile-storage";

import { AppAvatarComponent } from "../../../shared/components/app-avatar/app-avatar.component";

@Component({
  selector: "app-edit-profile",
  templateUrl: "./edit-profile.page.html",
  styleUrls: ["./edit-profile.page.scss"],
  imports: [
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonModal,
    CommonModule,
    FormsModule,
    WebCameraComponent,
    AppAvatarComponent,
  ],
})
export class EditProfilePage implements OnInit, OnDestroy {
  username = "Student";

  handle = "@student";

  email = "student@example.com";

  profileImage = "assets/images/default-avatar.png";

  isCameraOpen = false;

  profilePhotoChanged = false;

  userProfile: UserProfile | null = null;

  private authSubscription:
    | ReturnType<
      SupabaseAuthService["onAuthStateChange"]
    >
    | null = null;

  constructor(
    private profilePhotoService: ProfilePhotoService,
    private actionSheetController: ActionSheetController,
    private router: Router,
    private supabaseAuthService: SupabaseAuthService,
    private userProfileService: UserProfileService,
    private profileStorageService: ProfileStorageService,
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

            this.profileImage = this.userProfile.photoURL ||
              "assets/images/default-avatar.png";

            this.profilePhotoChanged = false;

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

  async changeProfilePhoto(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: "Profile Photo",
      cssClass: "profile-photo-action-sheet",
      buttons: [
        {
          text: "Take Photo",
          handler: () => {
            setTimeout(() => {
              if (this.profilePhotoService.isNative()) {
                void this.takeNativePhoto();
              } else {
                this.openWebCamera();
              }
            }, 150);
          },
        },
        {
          text: this.profilePhotoService.isNative()
            ? "Choose from Gallery"
            : "Choose from Computer",
          handler: () => {
            setTimeout(() => {
              if (this.profilePhotoService.isNative()) {
                void this.chooseNativePhoto();
              } else {
                document
                  .getElementById("profilePhotoInput")
                  ?.click();
              }
            }, 150);
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
    });

    await actionSheet.present();
  }

  private async takeNativePhoto(): Promise<void> {
    const photo = await this.profilePhotoService.takePhoto();

    if (photo) {
      this.profileImage = photo;
      this.profilePhotoChanged = true;
    }
  }

  private async chooseNativePhoto(): Promise<void> {
    const photo = await this.profilePhotoService.chooseFromGallery();

    if (photo) {
      this.profileImage = photo;
      this.profilePhotoChanged = true;
    }
  }

  openWebCamera(): void {
    this.isCameraOpen = true;
  }

  onWebPhotoCaptured(
    photo: string,
  ): void {
    this.profileImage = photo;

    this.profilePhotoChanged = true;

    this.isCameraOpen = false;
  }

  closeWebCamera(): void {
    this.isCameraOpen = false;
  }

  onProfilePhotoSelected(
    event: Event,
  ): void {
    const input = event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {
      return;
    }

    const file = input.files[0];

    if (
      !file.type.startsWith("image/")
    ) {
      return;
    }

    this.profileImage = URL.createObjectURL(file);

    this.profilePhotoChanged = true;
  }

  async saveChanges(): Promise<void> {
    if (!this.userProfile?.uid) {
      console.error(
        "No authenticated user profile found.",
      );

      return;
    }

    try {
      let photoURL = this.userProfile.photoURL;

      console.log(
        "Profile photo changed:",
        this.profilePhotoChanged,
      );

      console.log(
        "Current profile image:",
        this.profileImage,
      );

      if (
        this.profilePhotoChanged &&
        this.profileImage
      ) {
        console.log(
          "Uploading profile photo to Supabase...",
        );

        photoURL = await this.profileStorageService
          .uploadProfilePhoto(
            this.userProfile.uid,
            this.profileImage,
          );

        console.log(
          "Supabase photo URL:",
          photoURL,
        );
      }

      await this.userProfileService.updateProfile(
        this.userProfile.uid,
        this.username.trim(),
        this.handle
          .replace(/^@/, "")
          .trim(),
        this.email.trim(),
        photoURL,
      );

      console.log(
        "Profile updated successfully.",
      );

      await this.router.navigate([
        "/profile",
      ]);
    } catch (error) {
      console.error(
        "Error updating profile:",
        error,
      );
    }
  }

  cancel(): void {
    this.router.navigate([
      "/profile",
    ]);
  }
}
