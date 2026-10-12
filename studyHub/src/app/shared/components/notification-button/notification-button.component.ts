import {
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
} from "@angular/core";

import {
    NavigationEnd,
    Router,
} from "@angular/router";

import {
    filter,
    Subscription,
} from "rxjs";

import {
    IonButton,
    IonIcon,
} from "@ionic/angular";

import { addIcons } from "ionicons";

import {
    notificationsOutline,
} from "ionicons/icons";

import { NotificationService } from "../../../core/services/notification";

@Component({
    selector: "app-notification-button",
    templateUrl: "./notification-button.component.html",
    styleUrls: ["./notification-button.component.scss"],
    imports: [
        IonButton,
        IonIcon,
    ],
})
export class NotificationButtonComponent
    implements OnInit, OnDestroy
{
    unreadCount = 0;

    private routerSubscription:
        Subscription | null = null;

    constructor(
        private router: Router,
        private notificationService: NotificationService,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
        addIcons({
            notificationsOutline,
        });
    }

    async ngOnInit(): Promise<void> {
        await this.loadUnreadCount();

        this.routerSubscription =
            this.router.events
                .pipe(
                    filter(
                        (event) =>
                            event instanceof NavigationEnd,
                    ),
                )
                .subscribe(() => {
                    this.loadUnreadCount();
                });
    }

    ngOnDestroy(): void {
        this.routerSubscription?.unsubscribe();
    }

    async loadUnreadCount(): Promise<void> {
        try {
            this.unreadCount =
                await this.notificationService
                    .getUnreadNotificationCount();

            this.changeDetectorRef.detectChanges();
        } catch (error) {
            console.error(
                "Failed to load unread notification count:",
                error,
            );
        }
    }

    openNotifications(): void {
        this.router.navigate([
            "/notifications",
        ]);
    }
}

