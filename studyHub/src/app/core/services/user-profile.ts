import { Injectable } from "@angular/core";

import { SupabaseService } from "./supabase";

import { ThemeMode } from "./theme";

import { UserProfileStateService } from "./user-profile-state";

export interface UserProfile {
  uid: string;

  username: string;

  handle: string;

  email: string;

  photoURL?: string;

  createdAt?: unknown;

  notificationsEnabled?: boolean;

  messageNotificationsEnabled?: boolean;

  notificationFrequency?: string;

  taskReminderMinutes?: number;

  theme?: ThemeMode;
}

export interface UserSettings {
  notificationsEnabled: boolean;

  messageNotificationsEnabled: boolean;

  notificationFrequency: string;

  taskReminderMinutes: number;

  theme: ThemeMode;
}

@Injectable({
  providedIn: "root",
})
export class UserProfileService {
  constructor(
    private supabaseService: SupabaseService,
    private userProfileState: UserProfileStateService,
  ) {}

  async createProfile(
    uid: string,
    username: string,
    handle: string,
    email: string,
    photoURL?: string,
  ): Promise<void> {
    const profileData = {
      id: uid,

      username,

      handle,

      email,

      ...(photoURL
        ? {
          photo_url: photoURL,
        }
        : {}),
    };

    const {
      error,
    } = await this.supabaseService.client
      .from("profiles")
      .insert(profileData);

    if (error) {
      throw error;
    }

    // Update app state immediately
    this.userProfileState.setProfile({
      uid,

      username,

      handle,

      email,

      photoURL,
    });
  }

  async getProfile(
    uid: string,
  ): Promise<UserProfile | null> {
    const {
      data,
      error,
    } = await this.supabaseService.client
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      this.userProfileState.setProfile(null);

      return null;
    }

    const profile: UserProfile = {
      uid: data.id,

      username: data.username,

      handle: data.handle,

      email: data.email,

      photoURL: data.photo_url ?? undefined,

      createdAt: data.created_at,

      notificationsEnabled: data.notifications_enabled,

      messageNotificationsEnabled: data.message_notifications_enabled,

      notificationFrequency: data.notification_frequency,

      taskReminderMinutes: data.task_reminder_minutes ?? 10,

      theme: data.theme as ThemeMode,
    };

    // Store profile globally
    this.userProfileState.setProfile(profile);

    return profile;
  }

  async getProfileByEmail(
    email: string,
  ): Promise<UserProfile | null> {
    const {
      data,
      error,
    } = await this.supabaseService.client.rpc(
      "get_login_profile_by_email",
      {
        lookup_email: email.trim().toLowerCase(),
      },
    );

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const profile = data[0];

    return {
      uid: "",
      username: profile.username,
      handle: profile.handle,
      email: profile.email,
      photoURL: profile.photo_url ?? undefined,
    };
  }
  async updateProfile(
    uid: string,
    username: string,
    handle: string,
    email: string,
    photoURL?: string,
  ): Promise<void> {
    const profileData: {
      username: string;
      handle: string;
      email: string;
      photo_url?: string;
    } = {
      username,

      handle,

      email,
    };

    if (photoURL !== undefined) {
      profileData.photo_url = photoURL;
    }

    const {
      error,
    } = await this.supabaseService.client
      .from("profiles")
      .update(profileData)
      .eq("id", uid);

    if (error) {
      throw error;
    }

    // Update live app state
    this.userProfileState.updateProfile({
      uid,

      username,

      handle,

      email,

      photoURL,
    });
  }

  async updateSettings(
    uid: string,
    settings: UserSettings,
  ): Promise<void> {
    const {
      error,
    } = await this.supabaseService.client
      .from("profiles")
      .update({
        notifications_enabled: settings.notificationsEnabled,

        message_notifications_enabled: settings.messageNotificationsEnabled,

        notification_frequency: settings.notificationFrequency,

        task_reminder_minutes: settings.taskReminderMinutes,

        theme: settings.theme,
      })
      .eq("id", uid);

    if (error) {
      throw error;
    }
  }
}
