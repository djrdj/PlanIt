import { Component, HostListener } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { UserActivationDialogComponent } from '../user-activation-dialog/user-activation-dialog.component';
import { EditPermissionsDialogComponent } from '../edit-permissions-dialog/edit-permissions-dialog.component';
import { Router } from '@angular/router';
import { ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.scss'
})
export class AllUsersComponent {
  openOverlay: boolean = false;
  showFilter: boolean = false;
  showOverlay: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  openOverlayAddUser: boolean = false;
  showActivatedUsers: boolean | null = null;
  searchTerm: string = '';
  selectedUsername: string = '';
  loggedInUsername: string | null = null;
  //editRoleShow: boolean = false;
  //tempId: number = -1;
  selectedLanguage : string = "en";
  administratorChecked: boolean = true;
  managerChecked: boolean = true;
  employeeChecked: boolean = true;

  users!: User[];
  usersTest: any[] = [{
    username: "",
    password: "",
    firstName: "",
    phoneNumber: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    timeRegionID: 0,
    userRoleID: 0
  }];
  constructor(private userService: UserService, private cookie: CookieService,public dialog: MatDialog, private router: Router,private toastr:ToastrService,private translateService:TranslateService) { }


  openConfirmationDialog(action: string, user: User) {
    const dialogRef = this.dialog.open(UserActivationDialogComponent, {
      width: '300px',
      data: { action: action, username: user.username }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        if (action === 'activate') {
          this.activateUser(user);
        } else if (action === 'deactivate') {
          this.deactivateUser(user);
        }
      }
    });
  }

  toggleOverlay(username: string) {
    this.selectedUsername = username;
    this.openOverlay = !this.openOverlay;
  }

  toggleOverlayAddUser(){
    this.openOverlayAddUser = !this.openOverlayAddUser;
  }

  ngOnInit(): void {
    this.getAllUsers();
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.loggedInUsername = storedUsername;
    }

    this.showActivatedUsers = true;
    // DARK THEME
    const isDarkMode = localStorage.getItem('darkMode');
    if (isDarkMode) document.querySelector('.all-users-div')?.classList.toggle('dark', JSON.parse(isDarkMode));


    
  }

  getAllUsers(){
    this.userService.getAllUsers().subscribe({
      next:(result:User[])=>
        {
          console.log(result);
          this.users=result;
        },

        error:(err:any)=>
        {
          console.log(err);
        }
    })
  }
  


  filterUsers() {
    if (this.users && this.users.length > 0) {
      const usersByRole = this.users.filter(user => {
        if (user.userRoleID === 1 && this.administratorChecked) {
          return true;
        }
        if (user.userRoleID === 2 && this.managerChecked) {
          return true;
        }
        if (user.userRoleID === 3 && this.employeeChecked) {
          return true;
        }
        return false;
      });

      if (this.showActivatedUsers === true) {
          return usersByRole.filter(user => user.activated && user.username.toLowerCase().includes(this.searchTerm.toLowerCase()));
      } else if (this.showActivatedUsers === false) {
          return usersByRole.filter(user => !user.activated && user.username.toLowerCase().includes(this.searchTerm.toLowerCase()));
      } else {
          return usersByRole.filter(user => user.username.toLowerCase().includes(this.searchTerm.toLowerCase()));
      }
    } else {
        return [];
    }
}


  deactivateUser(user:User){
    this.userService.deactivateUser(user.userID, user).subscribe({
      next: (result:any) => {
        console.log('User deactivated successfully:', result);
        this.getAllUsers();

        this.translateService.get("User deactivated successfully").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });

      },
      error: (error:any) => {
        console.error('Error deactivating user:', error);

        this.translateService.get("Error deactivating user").subscribe((translatedMessage: string) => {
          this.toastr.error(translatedMessage, 'Error', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      }
    });

  }

  activateUser(user:User){
    this.userService.activateUser(user.userID).subscribe({
      next: (result:any) => {
        console.log('User activated successfully:', result);
        this.getAllUsers();

        this.translateService.get("User activated successfully").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });

        
      },
      error: (error:any) => {
        console.error('Error activating user:', error);

        this.translateService.get("Error activating user").subscribe((translatedMessage: string) => {
          this.toastr.error(translatedMessage, 'Error', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      }
    });
  }


  toggleActivatedUsersFilter(activated: boolean | null) {
    if (activated === null) {
      this.showActivatedUsers = null;
    } else {
      this.showActivatedUsers = activated;
    }
  }



  openEditPermissionsDialog(userId: number, role: number, username: string): void {
    const dialogRef = this.dialog.open(EditPermissionsDialogComponent, {
      width: '300px',
      data: { role: role, username: username }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('result: -> ',result);
        this.updateUserRole(userId, result);
      }
    });
  }
  
  updateUserRole(userId: number, role: number): void {
    this.userService.editUserRole(userId, role).subscribe({
      next: (result:any) => {
        console.log('User role changed successfully:', result);

        this.translateService.get("User role changed successfully").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
        this.getAllUsers();
        //this.editRoleShow=!this.editRoleShow;
      },
      error: (error:any) => {

        this.translateService.get("Error changing user role").subscribe((translatedMessage: string) => {
          this.toastr.error(translatedMessage, 'Error', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
        
        console.error('Error changing user role:', error);
      }
    });

  }
  selectFile(){
    // TO DO
    this.fileInput.nativeElement.click();
  }
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.parseCSV(file);
  }
  parseCSV(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target?.result as string;
      const rows = contents.split('\n').map(row => row.split(','));
      let header: string[] | undefined;
      if (rows.length > 0) {
        header = rows.shift();
      }
      const data = rows.map(row => {
        const obj: any = {};
        if (header) {
          header.forEach((key, index) => {
            const trimmedKey = key.trim();
            let formattedKey = trimmedKey.charAt(0).toLowerCase() + trimmedKey.slice(1);
            let value: any = row[index]?.trim();
  
            if (formattedKey === 'birthday') {
              console.log("TESTTT")
              formattedKey = 'dateOfBirth';
              // Pretvaranje datuma u odgovarajući format ako je potrebno
              //value = "2024-02-03";
            } else if (formattedKey === 'timeRegionID' || formattedKey === 'userRoleID') {
              // Pretvaranje timeRegionID i userRoleID u brojeve
              //console.log("SDADASDSDAA");
              value = parseInt(value, 10);
              obj[formattedKey] = Number(value);
            }
            else if (formattedKey === 'timeRegionID' || formattedKey === 'userRoleID') {
              // Pretvaranje timeRegionID i userRoleID u brojeve
              console.log("sdasdsa");
              value = parseInt(value, 10);
              obj[formattedKey] = Number(value);
            }
            obj[formattedKey] = value;
          });
        }
        return obj;
      });
      this.importUsers(data);
    };
    reader.readAsText(file);
  }
  importUsers(data: any[]) {
    this.usersTest = data;
    console.log("DATA",this.usersTest);
    // this.userService.addUserFromCsv(this.userTest).subscribe({
    //   next : response => {

    //     this.translateService.get("Users have been imported").subscribe((translatedMessage: string) => {
    //       this.toastr.success(translatedMessage, 'Success', {
    //         positionClass: 'toast-top-right',
    //         timeOut: 1500
    //       });
    //     });

    //     console.log('User added :', response);
    //   },
    //   error : error =>{

    //     this.translateService.get("Users was not imported").subscribe((translatedMessage: string) => {
    //       this.toastr.error(translatedMessage, 'Error', {
    //         positionClass: 'toast-top-right',
    //         timeOut: 1500
    //       });
    //     });
    //     console.error('Error adding user :', error);
    //   }
    // });


    console.log('Imported users:', data);

    this.userService.addUserFromCsv(this.usersTest).subscribe({
      next : response => {

        this.translateService.get("Users have been imported").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });

        console.log('User added :', response);
      },
      error : error =>{

        this.translateService.get("Users was not imported").subscribe((translatedMessage: string) => {
          this.toastr.error(translatedMessage, 'Error', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
        console.error('Error adding user :', error);
      }
    });

    // data.forEach(user => {
      
    //   console.log(user);
    //   this.userService.addUserFromCsv(user).subscribe({
    //     next : response => {

    //       this.translateService.get("Users have been imported").subscribe((translatedMessage: string) => {
    //         this.toastr.success(translatedMessage, 'Success', {
    //           positionClass: 'toast-top-right',
    //           timeOut: 1500
    //         });
    //       });

    //       console.log('User added :', response);
    //     },
    //     error : error =>{

    //       this.translateService.get("Users was not imported").subscribe((translatedMessage: string) => {
    //         this.toastr.error(translatedMessage, 'Error', {
    //           positionClass: 'toast-top-right',
    //           timeOut: 1500
    //         });
    //       });
    //       console.error('Error adding user :', error);
    //     }
    //   });

      
    // });
    this.ngOnInit();
  }

  hasUsers(): boolean {
    return this.filterUsers().length > 0;
  }

  exportUsers(){
    console.log(this.users);
    if(this.hasUsers()){
    const plainUsers = this.users.map(user => ({
      UserID: user.userID,
      Username: user.username,
      FirstName: user.firstName,
      LastName: user.lastName,
      PhoneNumber: user.phoneNumber,
      Email: user.email,
      Birthday: user.dateOfBirth,
      TimeRegionID: user.timeRegionID,
      UserRoleID: user.userRoleID,
      PictureURL: user.pictureUrl,
      Activated: user.activated,
      DarkTheme : user.darkTheme,
      Password : user.password,
      Token : user.token
    
    }));

     // Generate CSV content
    const csvContent = this.generateCSVContent(plainUsers);

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv' });
    
    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.setAttribute('download', 'users.csv');

    // Trigger the download
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Clean up
    document.body.removeChild(downloadLink);


    this.translateService.get("Users have been exported").subscribe((translatedMessage: string) => {
      this.toastr.success(translatedMessage, 'Success', {
        positionClass: 'toast-top-right',
        timeOut: 1500
      });
    });
  }
    
  } 
  private generateCSVContent(users: any[]): string {
    const headers = Object.keys(users[0]).join(',');
    const rows = users.map(user => Object.values(user).join(',')).join('\n');
    return `${headers}\n${rows}`;
  }
  imageRedirect(userId: number | undefined){
    this.router.navigate(['/profile/',userId]);
  }

  imageRedirectEdit(userId: number | undefined){
    this.router.navigate(['/edit-profile/',userId]);
  }

  getRoleName(userRoleID: number): string {
    switch (userRoleID) {
      case 1:
        return 'administrator';
      case 2:
        return 'projectManager';
      case 3:
        return 'employee';
      default:
       return '';
    }
}
  
  // openEditRole(userID: number){
  //   this.tempId = userID;
  //   this.editRoleShow=!this.editRoleShow;
  //   console.log("poslao",userID);
  // }

  toggleFilters() {
    this.showFilter = !this.showFilter;
    this.showOverlay = !this.showOverlay;
  }

}
