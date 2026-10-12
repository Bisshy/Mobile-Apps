import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import {
  IonContent,
  IonButton
} from '@ionic/angular';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  imports: [
    IonContent,
    IonButton,
    CommonModule
  ]
})
export class AboutPage implements OnInit {

  appVersion = '1.0.0';

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {}

  goBack(): void {
    this.router.navigate(['/settings']);
  }
}