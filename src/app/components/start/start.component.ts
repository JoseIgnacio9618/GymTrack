import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavController, IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AppTranslateService } from '../../services/translate.service';
import { UserCrudService } from 'src/app/services/cruds/user-crud.service';
import { User } from 'src/app/models/User';


@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
  standalone: true,
  imports: [ IonicModule, CommonModule, TranslateModule]

})
export class StartComponent  implements OnInit {

  user: User | undefined = undefined
  currentDate: Date = new Date();
  currentTime: Date = new Date();
  private timerId: any;
  constructor(
    private navCtrl: NavController,
    private userService: UserCrudService
  ) { }

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();

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

  goTo(page: string): void {
    // Navegar a la página especificadacon el plugin ionic
    this.navCtrl.navigateForward(page);

  }
}
