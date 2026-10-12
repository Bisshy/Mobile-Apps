import {
  Component,
  ViewChild
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule,
  NgForm
} from '@angular/forms';

import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  ToastController
} from '@ionic/angular';

import {
  addIcons
} from 'ionicons';

import {
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';

import {
  Router
} from '@angular/router';

import { SupabaseAuthService } from '../../../core/services/supabase-auth';


@Component({
  selector: 'app-security',
  templateUrl: './security.page.html',
  styleUrls: ['./security.page.scss'],
  imports: [
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    CommonModule,
    FormsModule
  ]
})
export class SecurityPage {

  currentPassword = '';

  newPassword = '';

  confirmPassword = '';

  showCurrentPassword = false;

  showNewPassword = false;

  showConfirmPassword = false;

  @ViewChild('securityForm')
  securityForm!: NgForm;


  constructor(
    private router: Router,

    private supabaseAuthService:
      SupabaseAuthService,

    private toastController:
      ToastController
  ) {

    addIcons({
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline
    });

  }


  passwordMatch(): boolean {

    return (
      this.newPassword ===
      this.confirmPassword
    );

  }


  async savePassword(): Promise<void> {

    if (
      this.securityForm.invalid ||
      !this.passwordMatch()
    ) {

      return;

    }


    const user =
      await this.supabaseAuthService
        .getCurrentUser();


    if (!user || !user.email) {

      await this.showToast(
        'No authenticated user found.',
        'danger'
      );

      return;

    }


    try {

      /*
       * Re-authenticate the user
       * using their current password.
       */
      const {
        error: signInError
      } =
        await this.supabaseAuthService
          .login(
            user.email,
            this.currentPassword
          );


      if (signInError) {

        const message =
          this.getPasswordErrorMessage(
            signInError
          );

        await this.showToast(
          message,
          'danger'
        );

        return;

      }


      /*
       * Update the password after
       * successful re-authentication.
       */
      const {
        error: updateError
      } =
        await this.supabaseAuthService
          .updatePassword(
            this.newPassword
          );


      if (updateError) {

        const message =
          this.getPasswordErrorMessage(
            updateError
          );

        await this.showToast(
          message,
          'danger'
        );

        return;

      }


      await this.showToast(
        'Password updated successfully.',
        'success'
      );


      this.securityForm.resetForm();

      this.showCurrentPassword =
        false;

      this.showNewPassword =
        false;

      this.showConfirmPassword =
        false;

    } catch (error) {

      console.error(
        'Error updating password:',
        error
      );

      await this.showToast(
        'Unable to update your password.',
        'danger'
      );

    }

  }


  private getPasswordErrorMessage(
    error: any
  ): string {

    const message =
      error?.message?.toLowerCase() || '';


    if (
      message.includes(
        'invalid login credentials'
      )
    ) {

      return 'Current password is incorrect.';

    }


    if (
      message.includes(
        'password should be at least'
      )
    ) {

      return 'New password is too weak.';

    }


    if (
      message.includes(
        'same password'
      )
    ) {

      return 'New password must be different from your current password.';

    }


    return (
      error?.message ||
      'Unable to update your password.'
    );

  }


  cancel(): void {

    this.router.navigate([
      '/settings'
    ]);

  }


  toggleCurrentPasswordVisibility(): void {

    this.showCurrentPassword =
      !this.showCurrentPassword;

  }


  toggleNewPasswordVisibility(): void {

    this.showNewPassword =
      !this.showNewPassword;

  }


  toggleConfirmPasswordVisibility(): void {

    this.showConfirmPassword =
      !this.showConfirmPassword;

  }


  private async showToast(
    message: string,
    color: 'success' | 'danger'
  ): Promise<void> {

    const toast =
      await this.toastController.create({

        message,

        duration: 3000,

        position: 'top',

        color

      });


    await toast.present();

  }

}