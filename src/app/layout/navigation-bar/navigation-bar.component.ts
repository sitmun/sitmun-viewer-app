import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent {
  constructor(private translate: TranslateService, private router: Router) {}

  useLanguage(lang: string) {
    this.translate.use(lang);
  }

  logoClicked() {
    this.router.navigateByUrl('/');
  }
}
