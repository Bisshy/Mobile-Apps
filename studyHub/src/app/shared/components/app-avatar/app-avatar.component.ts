import { Component, Input } from "@angular/core";

@Component({
  selector: "app-avatar",
  standalone: true,
  templateUrl: "./app-avatar.component.html",
  styleUrls: ["./app-avatar.component.scss"],
})
export class AppAvatarComponent {
  @Input()
  username: string | null | undefined = "";
  @Input()
  photoUrl: string | null | undefined = null;
  @Input()
  alt = "Profile picture";

  get initial(): string {
    const username = this.username?.trim();
    return username ? username.charAt(0).toUpperCase() : "?";
  }
}
