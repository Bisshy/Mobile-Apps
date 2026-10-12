import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  IonButton,
  IonPopover,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/angular';

@Component({
  selector: 'app-more-menu',
  templateUrl: './more-menu.component.html',
  styleUrls: ['./more-menu.component.scss'],
  imports: [
    IonButton,
    IonPopover,
    IonList,
    IonItem,
    IonLabel
  ],
})
export class MoreMenuComponent implements OnInit {

  isMenuOpen = false;
  menuEvent: Event | undefined;

  constructor(private router: Router) {}

  ngOnInit() {}

  openMenu(event: Event): void {
    this.menuEvent = event;
    this.isMenuOpen = true;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.menuEvent = undefined;
  }

  openProfile(): void {
    this.closeMenu();
    this.router.navigate(['/profile']);
  }

  openSettings(): void {
    this.closeMenu();
    this.router.navigate(['/settings']);
  }

  openAbout(): void {
    this.closeMenu();
    this.router.navigate(['/about']);
  }
}