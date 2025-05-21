import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-permissions-dialog',
  templateUrl: './edit-permissions-dialog.component.html',
  styleUrl: './edit-permissions-dialog.component.scss'
})
export class EditPermissionsDialogComponent implements OnInit {
  selectedRole: number | null = null;
  previousRole: number | null = null;
  roleChanged: boolean = false;
  roleAlreadyAssigned: boolean = false; 
  username: string = '';
  selectedLanguage : string = "en";
  constructor(
    public dialogRef: MatDialogRef<EditPermissionsDialogComponent>,private translateService:TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedRole = data.role;
    this.previousRole = data.role;
    this.username = data.username;
  }
  ngOnInit(): void {
    const isDarkMode = localStorage.getItem('darkMode');
      
    if (isDarkMode) {
      const htmlElement = document.querySelector('.overlay');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
  }

  toggleRole(role: number): void {
    if (this.selectedRole === role) {
      // Ako korisnik ponovno klikne na trenutno odabrano dugme, poništavamo selekciju
      this.selectedRole = null;
    } else {
      // Inače postavljamo novu selekciju
      this.selectedRole = role;
      this.roleChanged = true;
    }
  }

  confirmSelection(): void {
    if (this.selectedRole === null) {
      // alert('Molimo vas da odaberete ulogu.'); 
      return;
    }
    if (this.roleChanged && (this.previousRole!=this.selectedRole)) {
      this.dialogRef.close(this.selectedRole);
    } else {
      this.roleAlreadyAssigned = true; // Označimo da je uloga već dodijeljena korisniku
    }
  }
}
