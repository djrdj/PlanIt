import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-add-column-dialog',
  templateUrl: './add-column-dialog.component.html',
  styleUrl: './add-column-dialog.component.scss'
})
export class AddColumnDialogComponent {

  @ViewChild('inputField') inputField!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<AddColumnDialogComponent>,private translateService:TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: { columnName: string },
  ) {}

  selectedLanguage : string = "en";
  
  ngOnInit(): void{
    const isDarkMode = localStorage.getItem('darkMode');
    this.selectedLanguage = localStorage.getItem('lang') || 'en'; 
    this.translateService.use(this.selectedLanguage);
    if (isDarkMode) {
      const htmlElement = document.querySelector('.overlay');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }
  }

  ngAfterViewInit(): void {
    if (this.inputField) {
      setTimeout(() => {
        this.inputField.nativeElement.focus();
      }, 0);
    }

    // Onemogući preuzimanje fokusa od drugih elemenata
    window.addEventListener('focusin', (event) => {
      if (!this.inputField.nativeElement.contains(event.target)) {
        // Ako fokus nije unutar input polja, vrati fokus natrag na njega
        this.inputField.nativeElement.focus();
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  confirmAdding(): void {
    this.dialogRef.close(this.data.columnName); // Zatvara dialog i proslijeđuje uneseno ime kolone
  }


}
