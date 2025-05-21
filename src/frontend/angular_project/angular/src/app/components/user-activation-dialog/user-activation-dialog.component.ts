import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core'
@Component({
  selector: 'app-user-activation-dialog',
  templateUrl: './user-activation-dialog.component.html',
  styleUrl: './user-activation-dialog.component.scss'
})
export class UserActivationDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<UserActivationDialogComponent>,private translateService:TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: { action: string, username: string }
  ) {}
  selectedLanguage : string = "en";
  ngOnInit(): void {
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);

    const isDarkMode = localStorage.getItem('darkMode');
      
    if (isDarkMode) {
      const htmlElement = document.querySelector('.overlay');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }
  }
  onCancelClick(): void {
    this.dialogRef.close();
  }

  onConfirmClick(): void {
    this.dialogRef.close('confirm');
  }
}
