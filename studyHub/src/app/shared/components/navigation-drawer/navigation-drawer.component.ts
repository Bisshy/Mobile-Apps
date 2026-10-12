import { Component, OnDestroy, OnInit } from "@angular/core";
import { IonMenuButton } from "@ionic/angular";
import { Subscription } from "rxjs";

import { UserProfile } from "../../../core/services/user-profile";
import { UserProfileStateService } from "../../../core/services/user-profile-state";

@Component({
  selector: "app-navigation-drawer",
  templateUrl: "./navigation-drawer.component.html",
  styleUrls: ["./navigation-drawer.component.scss"],
  imports: [IonMenuButton],
})
export class NavigationDrawerComponent implements OnInit, OnDestroy {
  profile: UserProfile | null = null;

  private profileSubscription?: Subscription;

  constructor(
    private userProfileState: UserProfileStateService,
  ) {}

  ngOnInit(): void {
    this.profileSubscription = this.userProfileState.profile$
      .subscribe((profile) => {
        this.profile = profile;
      });
  }

  getInitial(): string {
    const username = this.profile?.username?.trim();

    return username ? username.charAt(0).toUpperCase() : "?";
  }

  ngOnDestroy(): void {
    this.profileSubscription?.unsubscribe();
  }
}
