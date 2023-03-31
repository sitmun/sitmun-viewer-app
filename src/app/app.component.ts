import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sitmun-viewer-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sitmun-viewer-app';

  constructor(private translate: TranslateService) {
    translate.setDefaultLang('es');
    translate.use('es');
  }
}
