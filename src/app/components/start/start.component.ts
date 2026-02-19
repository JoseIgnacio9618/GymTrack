import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavController, IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, TranslateModule],
})
export class StartComponent implements OnInit {
  currentDate: Date = new Date();
  currentTime: Date = new Date();
  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor(private navCtrl: NavController) {}

  ngOnInit(): void {
    this.timerId = setInterval(() => {
      this.currentDate = new Date();
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  goTo(page: string): void {
    this.navCtrl.navigateForward(`/${page}`);
  }
}