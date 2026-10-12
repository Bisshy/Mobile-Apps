import { Component, EventEmitter, Input, Output } from "@angular/core";

import { IonIcon, IonInput } from "@ionic/angular";

import { searchOutline } from "ionicons/icons";

@Component({
  selector: "app-search-bar",
  templateUrl: "./app-search-bar.component.html",
  styleUrls: ["./app-search-bar.component.scss"],
  imports: [
    IonIcon,
    IonInput,
  ],
})
export class SearchBarComponent {
  @Input()
  placeholder = "Search...";

  @Input()
  value = "";

  @Output()
  valueChange = new EventEmitter<string>();

  searchIcon = searchOutline;

  onSearchChange(event: Event): void {
    const value = (event as CustomEvent).detail?.value ?? "";

    this.value = value;

    this.valueChange.emit(value);
  }
}
