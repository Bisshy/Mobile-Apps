import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";

import {
  checkboxOutline,
  homeOutline,
  logOutOutline,
  personOutline,
  settingsOutline,
} from "ionicons/icons";

import { addIcons } from "ionicons";

import {
  IonApp,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonRouterOutlet,
} from "@ionic/angular";

import { Router, RouterLink, RouterLinkActive } from "@angular/router";

import { SupabaseAuthService } from "./core/services/supabase-auth";

import { UserProfile, UserProfileService } from "./core/services/user-profile";

import { PushNotificationService } from "./core/services/push-notification";

import { ThemeMode, ThemeService } from "./core/services/theme";

import { AppAvatarComponent } from "./shared/components/app-avatar/app-avatar.component";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  imports: [
    IonApp,
    IonRouterOutlet,
    IonItem,
    IonIcon,
    IonLabel,
    IonList,
    IonMenu,
    RouterLink,
    RouterLinkActive,
    AppAvatarComponent,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild(IonMenu)
  menu!: IonMenu;

  username = "Student";

  handle = "@student";

  profileImage = "assets/images/default-avatar.png";

  userProfile: UserProfile | null = null;

  private authSubscription:
    | ReturnType<
      SupabaseAuthService["onAuthStateChange"]
    >
    | null = null;

  constructor(
    private router: Router,
    private supabaseAuthService: SupabaseAuthService,
    private userProfileService: UserProfileService,
    private pushNotificationService: PushNotificationService,
    private changeDetectorRef: ChangeDetectorRef,
    private themeService: ThemeService,
  ) {
    addIcons({
      "home-outline": homeOutline,
      "checkbox-outline": checkboxOutline,
      "person-outline": personOutline,
      "settings-outline": settingsOutline,
      "log-out-outline": logOutOutline,
    });
  }

  ngOnInit(): void {
    this.authSubscription = this.supabaseAuthService.onAuthStateChange(
      async (session) => {
        const user = session?.user;

        if (!user) {
          this.username = "Student";

          this.handle = "@student";

          this.profileImage = "assets/images/default-avatar.png";

          this.userProfile = null;

          this.changeDetectorRef.detectChanges();

          return;
        }

        this.pushNotificationService
          .initialize()
          .catch((error) => {
            console.error(
              "Push notification initialization failed:",
              error,
            );
          });

        console.log(
          "Drawer authenticated user:",
          user.id,
        );

        try {
          this.userProfile = await this.userProfileService.getProfile(
            user.id,
          );

          console.log(
            "Drawer user profile:",
            this.userProfile,
          );

          if (this.userProfile) {
            const savedTheme = this.userProfile.theme;

            if (
              savedTheme === "light" ||
              savedTheme === "dark" ||
              savedTheme === "system"
            ) {
              this.themeService.setTheme(savedTheme as ThemeMode);
            }

            this.username = this.userProfile.username;

            this.handle = `@${this.userProfile.handle}`;

            this.profileImage = this.userProfile.photoURL ||
              "assets/images/default-avatar.png";

            this.changeDetectorRef.detectChanges();
          }
        } catch (error) {
          console.error(
            "Error loading drawer profile:",
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

  async goToProfile(): Promise<void> {
    await this.menu.close();

    await this.router.navigate([
      "/profile",
    ]);
  }

  async closeMenu(): Promise<void> {
    await this.menu.close();
  }

  async logout(): Promise<void> {
    try {
      await this.menu.close();

      await this.supabaseAuthService.logout();

      await this.router.navigate([
        "/login",
      ]);
    } catch (error) {
      console.error(
        "Logout error:",
        error,
      );
    }
  }
}
