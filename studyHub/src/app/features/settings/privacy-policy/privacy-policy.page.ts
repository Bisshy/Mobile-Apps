import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import {
  IonContent,
  IonButton,
  IonAccordion,
  IonAccordionGroup,
  IonItem,
  IonLabel
} from '@ionic/angular';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.page.html',
  styleUrls: ['./privacy-policy.page.scss'],
  imports: [
    IonContent,
    IonButton,
    IonAccordion,
    IonAccordionGroup,
    IonItem,
    IonLabel,
    CommonModule
  ]
})
export class PrivacyPolicyPage implements OnInit {

  lastUpdated = 'September 2026';

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {}

  goBack(): void {
    this.router.navigate(['/settings']);
  }
}