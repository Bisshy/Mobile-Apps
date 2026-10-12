import { Injectable } from "@angular/core";

import { AuthResponse, Session, User } from "@supabase/supabase-js";

import { SupabaseService } from "./supabase";
import { PushNotificationService } from "./push-notification";

@Injectable({
  providedIn: "root",
})
export class SupabaseAuthService {
  constructor(
    private supabaseService: SupabaseService,
    private pushNotificationService: PushNotificationService,
  ) {}

  async register(
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    return this.supabaseService.client.auth.signUp({
      email,
      password,
    });
  }

  async login(
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    const response = await this.supabaseService.client.auth
      .signInWithPassword({
        email,
        password,
      });

    console.log("SUPABASE LOGIN RESPONSE:", response);

    console.log(
      "SUPABASE LOGIN ERROR:",
      response.error?.message,
      response.error?.code,
      response.error?.status,
    );

    return response;
  }

  async sendPasswordResetEmail(
    email: string,
  ) {
    return this.supabaseService.client.auth
      .resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
  }

  async logout(): Promise<void> {
    const {
      error,
    } = await this.supabaseService.client.auth.signOut();

    if (error) {
      throw error;
    }
  }

  async getSession(): Promise<Session | null> {
    const {
      data,
      error,
    } = await this.supabaseService.client.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data,
      error,
    } = await this.supabaseService.client.auth.getUser();

    if (error) {
      return null;
    }

    return data.user;
  }

  async updatePassword(
    password: string,
  ) {
    return this.supabaseService.client.auth
      .updateUser({
        password,
      });
  }

  onAuthStateChange(
    callback: (
      session: Session | null,
    ) => void,
  ) {
    return this.supabaseService.client.auth
      .onAuthStateChange(
        (_event, session) => {
          callback(session);
        },
      );
  }
}