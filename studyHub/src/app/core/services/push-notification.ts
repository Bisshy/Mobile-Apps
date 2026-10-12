import { Injectable } from "@angular/core";

import { Capacitor } from "@capacitor/core";

import {
  ActionPerformed,
  PushNotifications,
  PushNotificationSchema,
  Token,
} from "@capacitor/push-notifications";

import { SupabaseService } from "./supabase";

@Injectable({
  providedIn: "root",
})
export class PushNotificationService {
  private initialized = false;

  constructor(
    private supabase: SupabaseService,
  ) {}

  async initialize(): Promise<void> {
    // Push Notifications are only supported
    // through Capacitor on native platforms.
    if (!Capacitor.isNativePlatform()) {
      console.log(
        "Push notifications skipped: running on web.",
      );

      return;
    }

    // Prevent duplicate initialization
    if (this.initialized) {
      return;
    }

    const permission = await PushNotifications.requestPermissions();

    if (permission.receive !== "granted") {
      console.log(
        "Push notification permission not granted.",
      );

      return;
    }

    // Registration listener
    await PushNotifications.addListener(
      "registration",
      async (token: Token) => {
        console.log(
          "Push notification token:",
          token.value,
        );

        await this.saveToken(token.value);
      },
    );

    // Registration error listener
    await PushNotifications.addListener(
      "registrationError",
      (error) => {
        console.error(
          "Push notification registration error:",
          error,
        );
      },
    );

    // Notification received listener
    await PushNotifications.addListener(
      "pushNotificationReceived",
      (notification: PushNotificationSchema) => {
        console.log(
          "Push notification received:",
          notification,
        );
      },
    );

    // Notification action listener
    await PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action: ActionPerformed) => {
        console.log(
          "Push notification action:",
          action,
        );
      },
    );

    // Mark initialized before registration
    this.initialized = true;

    // Register the device
    await PushNotifications.register();
  }

  private async saveToken(
    token: string,
  ): Promise<void> {
    const {
      data: { user },
      error: userError,
    } = await this.supabase.client.auth.getUser();

    if (userError) {
      console.error(
        "Unable to get authenticated user:",
        userError,
      );

      return;
    }

    if (!user) {
      console.warn(
        "No authenticated Supabase user found.",
      );

      return;
    }

    const platform = this.getPlatform();

    const { error } = await this.supabase.client
      .from("push_tokens")
      .upsert(
        {
          user_id: user.id,
          token,
          platform,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,token",
        },
      );

    if (error) {
      console.error(
        "Failed to save push token:",
        error,
      );

      return;
    }

    console.log(
      "Push token saved to Supabase successfully.",
    );
  }

  private getPlatform(): string {
    if (
      typeof navigator !== "undefined" &&
      /android/i.test(
        navigator.userAgent,
      )
    ) {
      return "android";
    }

    if (
      typeof navigator !== "undefined" &&
      /iphone|ipad|ipod/i.test(
        navigator.userAgent,
      )
    ) {
      return "ios";
    }

    return "web";
  }
}
