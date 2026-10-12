import { Component } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  ToastController,
} from "@ionic/angular";

import { addIcons } from "ionicons";

import { eyeOffOutline, eyeOutline } from "ionicons/icons";

import { SupabaseAuthService } from "../../../core/services/supabase-auth";

import {
  UserProfile,
  UserProfileService,
} from "../../../core/services/user-profile";

import { AppAvatarComponent } from "../../../shared/components/app-avatar/app-avatar.component";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
  imports: [
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    CommonModule,
    FormsModule,
    RouterLink,
    AppAvatarComponent,
  ],
})
export class LoginPage {
  email = "";

  password = "";

  showPassword = false;

  loginProfile: UserProfile | null = null;

  currentStep:
    | "email"
    | "password"
    | "not-found" = "email";

  constructor(
    private router: Router,
    private supabaseAuthService: SupabaseAuthService,
    private userProfileService: UserProfileService,
    private toastController: ToastController,
  ) {
    addIcons({
      "eye-outline": eyeOutline,
      "eye-off-outline": eyeOffOutline,
    });
  }

  /**
   * Reset the login form every time the Login page
   * becomes active.
   *
   * This ensures that after logging out, the previous
   * user's email, password, profile and password step
   * are not still displayed.
   */
  ionViewWillEnter(): void {
    this.resetLoginForm();
  }

  private resetLoginForm(): void {
    this.email = "";
    this.password = "";
    this.loginProfile = null;
    this.showPassword = false;
    this.currentStep = "email";
  }

  async continueToPassword(
    loginForm: any,
  ): Promise<void> {
    if (
      loginForm.invalid ||
      !this.email.trim()
    ) {
      return;
    }

    try {
      console.log(
        "LOGIN: checking email profile",
      );

      const profile = await this.userProfileService.getProfileByEmail(
        this.email,
      );

      if (!profile) {
        console.log(
          "LOGIN: account not found",
        );

        this.currentStep = "not-found";

        return;
      }

      console.log(
        "LOGIN: profile found:",
        profile,
      );

      this.loginProfile = profile;

      // Only show password step after
      // the profile has been loaded.
      this.currentStep = "password";
    } catch (error) {
      console.error(
        "LOGIN: failed to load profile:",
        error,
      );

      const toast = await this.toastController.create({
        message: "Unable to check your account. Please try again.",
        duration: 3000,
        position: "bottom",
      });

      await toast.present();
    }
  }

  tryAnotherEmail(): void {
    this.resetLoginForm();
  }

  async login(): Promise<void> {
    if (!this.password.trim()) {
      return;
    }

    try {
      console.log(
        "LOGIN: starting",
      );

      const {
        data,
        error,
      } = await this.supabaseAuthService.login(
        this.email,
        this.password,
      );

      console.log(
        "LOGIN DATA:",
        data,
      );

      console.log(
        "LOGIN ERROR:",
        error,
      );

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error(
          "Unable to sign in.",
        );
      }

      console.log(
        "LOGIN: authentication successful",
      );

      console.log(
        "LOGIN: about to show toast",
      );

      const toast = await this.toastController.create({
        message: "Login successful!",
        duration: 2000,
        position: "bottom",
      });

      await toast.present();

      console.log(
        "LOGIN: about to navigate to dashboard",
      );

      const navigationResult = await this.router.navigate([
        "/dashboard",
      ]);

      console.log(
        "LOGIN: navigation result:",
        navigationResult,
      );
    } catch (error: any) {
      console.error(
        "Login error:",
        error,
      );

      let message = "Unable to sign in. Please try again.";

      switch (error?.code) {
        case "invalid_credentials":
          message = "Incorrect email or password.";
          break;

        case "email_not_confirmed":
          message = "Please verify your email before signing in.";
          break;

        case "user_not_found":
          message = "No account was found with this email.";
          break;

        case "invalid_email":
          message = "Please enter a valid email address.";
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

  createAccount(): void {
    // Registration navigation
    // is handled by routerLink.
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
