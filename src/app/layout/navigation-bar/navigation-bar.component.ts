import { Component, Injectable, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { CommonService } from '@api/services/common.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})

export class NavigationBarComponent implements OnInit {
  showMenu: boolean;
  styleBackground: string = "#000000FF"; // by default, 100% transparent
  currentLang : string;

  constructor(private router: Router, private commonService: CommonService, private translate: TranslateService) {
    this.showMenu = false;
    router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        this.showMenu = false;
      }
    });

    this.currentLang = localStorage.getItem('language') || 'es';
  }

  ngOnInit() {
    // We will receive notifications of potential theme changes via
    // the commonService.message$ observable
    this.commonService.message$.subscribe(msg => {
      if (msg.theme === 'demo-jiide') {
        // TODO: we can't have the colors for the theme hardcoded here.
        // It is not possible, AFAIK, to read them from the SASS files
        // without some "hacking".
        // Another option would be retrieving them from the API and
        // sharing them in the msg object
        //this.styleBackground = "#ff000099";
      } else if (msg.theme === 'sitmun-base') {
        //this.styleBackground = "#d7992299"; // - ORANGE
        this.styleBackground = "#d79922";
      }
    });
  }

  logoClicked() {
    this.router.navigate(['/']);
  }

  onShowMenu() {
    this.showMenu = !this.showMenu;
  }

  TamanyMenu() {
    if (this.router.url.includes("/auth/login")) {
      return 'nav-bar login';
    }else if (this.router.url.includes("/map/")){
      return 'nav-bar pet';
    }
    else{
      return 'nav-bar';
    }
  }

  useLanguage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.translate.use(target.value);
    localStorage.setItem('language', target.value);
  }
}
