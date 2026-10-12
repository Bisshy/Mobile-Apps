import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";

import { CommonModule } from "@angular/common";

import { FormsModule } from "@angular/forms";

import { Router } from "@angular/router";

import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonToggle,
} from "@ionic/angular";

import { AppHeaderComponent } from "../../shared/components/app-header/app-header.component";

import { ThemeMode, ThemeService } from "../../core/services/theme";

import { SupabaseAuthService } from "../../core/services/supabase-auth";

import { SearchBarComponent } from "../../shared/components/app-search-bar/app-search-bar.component";

import {
  UserProfileService,
  UserSettings,
} from "../../core/services/user-profile";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.page.html",
  styleUrls: ["./settings.page.scss"],
  imports: [
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IonToggle,
    IonSelect,
    FormsModule,
    IonSelectOption,
    CommonModule,
    AppHeaderComponent,
    SearchBarComponent,
  ],
})
export class SettingsPage implements OnInit, OnDestroy {
  notificationsEnabled = true;

  messageNotificationsEnabled = true;

  notificationFrequency = "immediately";

  taskReminderMinutes = 10;

  theme: ThemeMode = "system";

  searchTerm = "";

  private authSubscription:
    | ReturnType<
      SupabaseAuthService["onAuthStateChange"]
    >
    | null = null;

  private currentUser:
    | Awaited<
      ReturnType<
        SupabaseAuthService["getCurrentUser"]
      >
    >
    | null = null;

  constructor(
    private router: Router,
    private themeService: ThemeService,
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

        this.currentUser = user;

        console.log(
          "Loading user settings for:",
          user.id,
        );

        try {
          const profile = await this.userProfileService.getProfile(
            user.id,
          );

          if (profile) {
            const data = profile;

            if (
              data.notificationsEnabled !== undefined
            ) {
              this.notificationsEnabled = data.notificationsEnabled;
            }

            if (
              data.messageNotificationsEnabled !== undefined
            ) {
              this.messageNotificationsEnabled =
                data.messageNotificationsEnabled;
            }

            if (
              data.notificationFrequency !== undefined
            ) {
              this.notificationFrequency = data.notificationFrequency;
            }

            if (
              data.taskReminderMinutes !== undefined
            ) {
              this.taskReminderMinutes = data.taskReminderMinutes;
            }

            if (
              data.theme !== undefined
            ) {
              this.theme = data.theme;

              this.themeService.setTheme(
                this.theme,
              );
            }

            this.changeDetectorRef.detectChanges();
          }
        } catch (error) {
          console.error(
            "Error loading settings:",
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

  // -------------------------
  // Existing navigation
  // -------------------------

  security(): void {
    this.router.navigate([
      "/security",
    ]);
  }

  appearance(): void {
    console.log(
      "Appearance selected",
    );
  }

  about(): void {
    this.router.navigate([
      "/about",
    ]);
  }

  privacyPolicy(): void {
    this.router.navigate([
      "/privacy-policy",
    ]);
  }

  termsOfService(): void {
    this.router.navigate([
      "/terms-of-service",
    ]);
  }

  // -------------------------
  // Theme
  // -------------------------

  changeTheme(
    theme: ThemeMode,
  ): void {
    this.theme = theme;

    this.themeService.setTheme(
      theme,
    );

    this.saveSettings();
  }

  // -------------------------
  // Notifications
  // -------------------------

  onNotificationsChanged(): void {
    this.saveSettings();
  }

  onMessageNotificationsChanged(): void {
    this.saveSettings();
  }

  onNotificationFrequencyChanged(): void {
    this.saveSettings();
  }

  onTaskReminderChanged(): void {
    this.saveSettings();
  }

  // -------------------------
  // Save settings
  // -------------------------

  async saveSettings(): Promise<void> {
    if (!this.currentUser) {
      console.error(
        "No authenticated user found.",
      );

      return;
    }

    const settings: UserSettings = {
      notificationsEnabled: this.notificationsEnabled,

      messageNotificationsEnabled: this.messageNotificationsEnabled,

      notificationFrequency: this.notificationFrequency,

      taskReminderMinutes: this.taskReminderMinutes,

      theme: this.theme,
    };

    try {
      await this.userProfileService.updateSettings(
        this.currentUser.id,
        settings,
      );

      console.log(
        "Settings saved successfully.",
      );
    } catch (error) {
      console.error(
        "Error saving settings:",
        error,
      );
    }
  }

  showSetting(
    setting: string,
  ): boolean {
    const searchTerm = this.searchTerm.trim().toLowerCase();

    if (!searchTerm) {
      return true;
    }

    const settingSearchText: Record<
      string,
      string
    > = {
      security: "account security password sign in sign-in options",

      appearance:
        "personalize appearance theme light dark system study hub looks",

      notifications:
        "notifications enable notifications alerts messages message notifications frequency immediately every 15 minutes hourly daily task reminders reminder task 5 10 15 30 60 minutes hour",

      about:
        "study hub about privacy policy terms of service information handled terms",
    };

    return (
      settingSearchText[setting]
        ?.toLowerCase()
        .includes(searchTerm) ?? false
    );
  }
}
