import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, IonContent],
  templateUrl: './not-found.page.html',
  styleUrls: ['./not-found.page.scss'],
})
export class NotFoundPage {}
