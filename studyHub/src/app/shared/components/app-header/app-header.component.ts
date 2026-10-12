import { Component, OnDestroy, OnInit, ChangeDetectorRef } from "@angular/core";

import { Subscription } from "rxjs";

import { IonButtons, IonHeader, IonTitle, IonToolbar } from "@ionic/angular";

import { NavigationDrawerComponent } from "../navigation-drawer/navigation-drawer.component";

import { NotificationButtonComponent } from "../notification-button/notification-button.component";

import { MoreMenuComponent } from "../more-menu/more-menu.component";

import { UserProfile } from "../../../core/services/user-profile";

import { UserProfileStateService } from "../../../core/services/user-profile-state";

@Component({
  selector: "app-app-header",

  templateUrl: "./app-header.component.html",

  styleUrls: ["./app-header.component.scss"],

  imports: [
    IonHeader,

    IonToolbar,

    IonButtons,

    IonTitle,

    NavigationDrawerComponent,

    NotificationButtonComponent,

    MoreMenuComponent,
  ],
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  profile: UserProfile | null = null;

  private profileSubscription?: Subscription;

  constructor(
    private userProfileState: UserProfileStateService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.profileSubscription = this.userProfileState.profile$
      .subscribe((profile) => {
        this.profile = profile;

        console.log(
          "Header profile:",
          this.profile,
        );
      });
  }

  ngOnDestroy(): void {
    this.profileSubscription?.unsubscribe();
  }
}
