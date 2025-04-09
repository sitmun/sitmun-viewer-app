import { Component, EventEmitter, Output, Input, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonService, ResponseDto } from '@api/services/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-searchbox',
  templateUrl: './dashboard-searchbox.component.html',
  styleUrls: ['./dashboard-searchbox.component.scss']
})
export class DashboardSearchboxComponent {
  @ViewChild('inputForm') inputForm!: ElementRef;
  @ViewChild('suggestionsDiv') suggestionsDiv!: ElementRef;
  @ViewChild('inputSearch') inputSearch! : ElementRef;

  @Input() applications : any;
  @Input() searchWidth : string = "450px";

  @Output() keywords = new EventEmitter<string>();
  @Output() territory = new EventEmitter<any>();
  @Output() application = new EventEmitter<any>();

  input: string;
  territories : any = [];
  showSuggestions: boolean = false;
  filteredSuggestions: string[] = [];
  showDetailedSuggestions : boolean = false;

  constructor(private commonService : CommonService, private sanitizer: DomSanitizer, private translate: TranslateService) {
    this.input = '';
  }

  /**
   * Hide suggestions div when lose focus
   */
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (this.inputForm && this.suggestionsDiv) {
      if (!this.inputForm.nativeElement.contains(target) &&
          !this.suggestionsDiv.nativeElement.contains(target)) {
        this.showSuggestions = false;
      }
    }
  }

  ngOnInit() {
    this.applications.forEach((application: any) => {
      this.commonService.fetchTerritoriesByApplication(application.id).subscribe({
        next: (res : ResponseDto) => {
          res.content.forEach((territory : any) => {
            let object = {
              "id": territory.id,
              "name": territory.name,
              "application": application
            }
            this.territories.push(object);
            application.territories = res.content;
          });
        }
      })
    });
  }

  filterTerritories() {
    return this.territories.filter((item: any) =>
      item.name.toLowerCase().includes(this.input.toLowerCase())
    );
  }

  filterApplications() {
    const filteredApps = this.applications.filter((item: any) =>
      item.title.toLowerCase().includes(this.input.toLowerCase())
    );
    return filteredApps;
  }

  onFocus(): void {
    this.showSuggestions = true;
  }

  loseFocus(event: KeyboardEvent) : void {
    if (event.key === 'Escape') {
      this.showSuggestions = false;
      this.inputSearch.nativeElement.blur();
    }
  }

  navigateToTerritoryPresentation(suggestion: any): void {
    this.territory.emit(suggestion);
  }

  navigateToApplicationPresentation(application : any): void {
    this.showSuggestions = false;
    this.application.emit(application);
  }

  onKeywordsChange() {
    this.showDetailedSuggestions = this.input.length >= 3;
  }

  totalTerritories(): number {
    let counterOfTerritories = 0;

    this.applications.forEach((application: any) => {
      application.territories.forEach((territory : any) => {
        if(territory.name.toLowerCase().includes(this.input.toLowerCase())) {
          counterOfTerritories += 1;
        }
      });
    });

    return counterOfTerritories;
  }

  /**
   * Add highlight where input is in application title
   * @param value application name
   * @returns
   */
  researchHighlight(value: string) {
    if(this.input){
      const regex = new RegExp(`(${this.input})`, 'gi');
      value = value.replace(regex, `<span style='background-color:antiquewhite;'>$1</span>`);
    }
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

  clearSearchText() {
    this.input = "";
  }

  handleSubmit() {
    this.keywords.emit(this.input);
    this.showDetailedSuggestions = false;
  }
}
