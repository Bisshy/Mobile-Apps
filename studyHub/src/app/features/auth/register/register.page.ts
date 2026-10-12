import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";

import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";

import {
  ActionSheetController,
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  ToastController,
} from "@ionic/angular";

import { addIcons } from "ionicons";

import { eyeOffOutline, eyeOutline } from "ionicons/icons";

import { WebCameraComponent } from "../../../shared/components/web-camera/web-camera.component";

import { ProfilePhotoService } from "../../../core/services/profile-photo";
import { SupabaseAuthService } from "../../../core/services/supabase-auth";
import { UserProfileService } from "../../../core/services/user-profile";
import { ProfileStorageService } from "../../../core/services/profile-storage";

@Component({
  selector: "app-register",
  templateUrl: "./register.page.html",
  styleUrls: ["./register.page.scss"],
  imports: [
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    RouterLink,
    CommonModule,
    FormsModule,
    WebCameraComponent,
  ],
})
export class RegisterPage implements OnInit {
  username = "";
  handle = "";
  email = "";
  password = "";
  confirmPassword = "";

  showPassword = false;
  showConfirmPassword = false;

  profileImage: string | undefined;

  isCameraOpen = false;

  @ViewChild("profilePhotoInput")
  profilePhotoInput!: ElementRef<HTMLInputElement>;

  constructor(
    private actionSheetController: ActionSheetController,
    private profilePhotoService: ProfilePhotoService,
    private toastController: ToastController,
    private router: Router,
    private supabaseAuthService: SupabaseAuthService,
    private userProfileService: UserProfileService,
    private profileStorageService: ProfileStorageService,
  ) {
    addIcons({
      "eye-outline": eyeOutline,
      "eye-off-outline": eyeOffOutline,
    });
  }

  ngOnInit(): void {
  }

  async selectProfilePhoto(): Promise<void> {
    const isNative = this.profilePhotoService.isNative();

    const actionSheet = await this.actionSheetController.create({
      header: "Profile Photo",
      cssClass: "profile-photo-action-sheet",
      buttons: [
        {
          text: "Take Photo",
          handler: () => {
            setTimeout(() => {
              if (isNative) {
                void this.takeNativePhoto();
              } else {
                this.openWebCamera();
              }
            }, 150);
          },
        },
        {
          text: isNative ? "Choose from Gallery" : "Choose from Computer",
          handler: () => {
            setTimeout(() => {
              if (isNative) {
                void this.chooseNativePhoto();
              } else {
                this.profilePhotoInput.nativeElement.click();
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
    }
  }

  private async chooseNativePhoto(): Promise<void> {
    const photo = await this.profilePhotoService.chooseFromGallery();

    if (photo) {
      this.profileImage = photo;
    }
  }

  openWebCamera(): void {
    this.isCameraOpen = true;
  }

  onWebPhotoCaptured(photo: string): void {
    this.profileImage = photo;

    this.isCameraOpen = false;
  }

  closeWebCamera(): void {
    this.isCameraOpen = false;
  }

  onProfilePhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith("image/")) {
      return;
    }

    this.profileImage = URL.createObjectURL(file);
  }

  async createAccount(registerForm: any): Promise<void> {
    if (
      registerForm.invalid ||
      !this.passwordMatch()
    ) {
      return;
    }

    try {
      /*
       * Step 1:
       * Create the Supabase Authentication account.
       *
       * Supabase Authentication is responsible for:
       * - Email
       * - Password
       */
      const {
        data,
        error,
      } = await this.supabaseAuthService.register(
        this.email,
        this.password,
      );

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error(
          "Unable to create the account.",
        );
      }

      /*
       * Step 2:
       * Get the UID Supabase created for this user.
       */
      const uid = data.user.id;

      /*
       * Supabase email confirmation is currently enabled.
       *
       * When confirmation is required, Supabase may create
       * the user without creating an active session.
       *
       * We therefore only create the profile and upload the
       * photo when an authenticated session exists.
       */
      if (data.session) {
        /*
         * Step 3:
         * Upload the profile photo to Supabase Storage
         * if the user selected one.
         */
        let photoURL: string | undefined;

        if (this.profileImage) {
          photoURL = await this.profileStorageService.uploadProfilePhoto(
            uid,
            this.profileImage,
          );
        }

        /*
         * Step 4:
         * Create the user's profile in Supabase Database.
         */
        await this.userProfileService.createProfile(
          uid,
          this.username,
          this.handle,
          this.email,
          photoURL,
        );

        const toast = await this.toastController.create({
          message: "Account created successfully!",

          duration: 2500,

          position: "bottom",
        });

        await toast.present();
      } else {
        /*
         * Email confirmation is required before the user
         * receives an authenticated session.
         *
         * The profile will be completed after the user
         * confirms their email and signs in.
         */
        localStorage.setItem(
          "pending_profile",
          JSON.stringify({
            username: this.username,
            handle: this.handle,
            email: this.email,
          }),
        );

        const toast = await this.toastController.create({
          message:
            "Account created. Please check your email to verify your account, then sign in.",

          duration: 4000,

          position: "bottom",
        });

        await toast.present();
      }

      /*
       * Reset the registration form.
       */
      registerForm.resetForm();

      this.profileImage = undefined;

      this.showPassword = false;

      this.showConfirmPassword = false;

      /*
       * Return the user to the login page.
       */
      await this.router.navigate(["/login"]);
    } catch (error: any) {
      console.error(
        "Registration error:",
        error,
      );

      let message = "Unable to create your account. Please try again.";

      /*
       * Supabase Authentication errors.
       */
      switch (error?.code) {
        case "user_already_exists":
        case "email_exists":
          message = "An account with this email already exists.";

          break;

        case "invalid_credentials":
        case "invalid_email":
          message = "Please enter a valid email address.";

          break;

        case "weak_password":
          message = "Your password is too weak.";

          break;

        case "over_email_send_rate_limit":
          message = "Too many email requests. Please wait and try again.";

          break;

        default:
          if (
            error?.message
              ?.toLowerCase()
              .includes("network")
          ) {
            message = "Network error. Please check your internet connection.";
          }

          break;
      }

      const toast = await this.toastController.create({
        message,

        duration: 3000,

        position: "bottom",
      });

      await toast.present();
    }
  }

  passwordMatch(): boolean {
    return this.password ===
      this.confirmPassword;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
