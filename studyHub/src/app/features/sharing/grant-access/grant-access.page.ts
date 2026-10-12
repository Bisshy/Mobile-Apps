import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-grant-access',
  templateUrl: './grant-access.page.html',
  styleUrls: ['./grant-access.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GrantAccessPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
