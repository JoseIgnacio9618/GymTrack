import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';


@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
  standalone: true,
  imports: [ CommonModule,
    IonicModule]

})
export class StartComponent  implements OnInit {

  currentDate: Date = new Date();
  currentTime: Date = new Date();
  private timerId: any;

  ngOnInit(): void {
    // Actualiza la fecha y hora cada segundo
    this.timerId = setInterval(() => {
      this.currentDate = new Date();
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    // Limpiar el interval cuando el componente se destruya
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

}
