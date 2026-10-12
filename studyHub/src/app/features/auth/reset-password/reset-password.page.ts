import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";

import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  ToastController,
} from "@ionic/angular";

import { addIcons } from "ionicons";
import {
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
} from "ionicons/icons";

import { SupabaseAuthService } from "../../../core/services/supabase-auth";

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.page.html",
  styleUrls: ["./reset-password.page.scss"],
  standalone: true,
  imports: [ 
    CommonModule,
    FormsModule,
    RouterLink,
    IonButton,
    IonContent,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
  ],
})
export class ResetPasswordPage {
  password = "";
  confirmPassword = "";

  showPassword = false;
  showConfirmPassword = false;

  isLoading = false;

  constructor(
    private readonly supabaseAuthService: SupabaseAuthService,
    private readonly router: Router,
    private readonly toastController: ToastController,
  ) {
    addIcons({
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
    });
  }

  async resetPassword(): Promise<void> {
    if (this.isLoading) {
      return;
    }

    if (!this.password || !this.confirmPassword) {
      await this.showToast("Please enter and confirm your new password.");
      return;
    }

    if (this.password.length < 6) {
      await this.showToast("Password must be at least 6 characters.");
      return;
    }

    if (this.password !== this.confirmPassword) {
      await this.showToast("Passwords do not match.");
      return;
    }

    this.isLoading = true;

    try {
      const { error } =
        await this.supabaseAuthService.updatePassword(this.password);

      if (error) {
        throw error;
      }

      await this.showToast("Your password has been updated successfully.");

      this.password = "";
      this.confirmPassword = "";

      await this.router.navigateByUrl("/login", {
        replaceUrl: true,
      });
    } catch (error: any) {
      console.error("Password reset error:", error);

      await this.showToast(
        error?.message || "Unable to update your password. Please try again.",
      );
    } finally {
      this.isLoading = false;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: "bottom",
    });

    await toast.present();
  }
}
