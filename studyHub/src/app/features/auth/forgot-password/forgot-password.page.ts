import { Component } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
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
import {
  arrowBackOutline,
  mailOutline,
} from "ionicons/icons";

import { SupabaseAuthService } from "../../../core/services/supabase-auth";


@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.page.html",
  styleUrls: ["./forgot-password.page.scss"],
  imports: [
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    FormsModule,
    RouterLink,
  ],
})
export class ForgotPasswordPage {
  email = "";

  isLoading = false;

  constructor(
    private supabaseAuthService: SupabaseAuthService,
    private toastController: ToastController,
    private router: Router,
  ) {
    addIcons({
      "arrow-back-outline": arrowBackOutline,
      "mail-outline": mailOutline,
    });
  }

  async sendResetLink(): Promise<void> {
    const email = this.email.trim();

    if (!email) {
      return;
    }

    this.isLoading = true;

    try {
      const {
        error,
      } =
        await this.supabaseAuthService.sendPasswordResetEmail(
          email,
        );

      if (error) {
        throw error;
      }

      const toast =
        await this.toastController.create({
          message:
            "Password reset link sent. Check your email.",
          duration: 4000,
          position: "bottom",
        });

      await toast.present();

      await this.router.navigate([
        "/login",
      ]);
    } catch (error) {
      console.error(
        "PASSWORD RESET ERROR:",
        error,
      );

      const toast =
        await this.toastController.create({
          message:
            "Unable to send the reset link. Please check your email and try again.",
          duration: 4000,
          position: "bottom",
        });

      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }
}