import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { ProjectService } from '../../services/project.service';
import { Task } from '../../models/Task';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-assign-users',
  templateUrl: './assign-users.component.html',
  styleUrl: './assign-users.component.scss'
})
export class AssignUsersComponent implements OnInit{
  @ViewChild('plus') plus: ElementRef | undefined;
  @ViewChild('list1') list1: ElementRef | undefined;
  @ViewChild('list2') list2: ElementRef | undefined;
  @ViewChild('list3') list3: ElementRef | undefined;
  @Input() type!: string;
  @Input() projectId!: number;
  @Input() taskId!: number;
  @Input() projectLeaderID!: number;
  @Input() images!: number;
  userIDs: number[] = [];
  imageUserIDs: number[] = [];
  userIDs2: number[] = [];
  @Input() taskLeadID: number[] = [];
  // @Input() userIdsToAdd: number[] = [];
  // @Input() userIdsToRemove: number[] = [];
  @Output() userIdsToAddChanged = new EventEmitter<number[]>();
  @Output() userIDsChanged = new EventEmitter<number[]>();
  @Output() userIdsToRemoveChanged = new EventEmitter<number[]>();
  @Output() userIDsMatrixChanged = new EventEmitter<number[][]>();
  users: User[]=[];
  users2Ids: number[]=[];
  display: boolean = false;
  //checkedUserIDs: number[] = this.userIDs;
  display2: boolean = false;
  displayrb: boolean = false;
  displayrb2: boolean = false;
  difference: number[]=[];
  difference2: number[]=[];
  flag: boolean = true;
  firstTime: boolean = true;
  tempTaskLeadID: number = 0;

  selectedLanguage : string = "en";
  users2 = [
    {
      firstName: "",
      id: 0,
      lastName: "",
      pictureURL: "",
      username: ""
    }
  ];

  searchTerm: string = '';
  filteredUsers: User[]=[];
  filteredUsers2 = [
    {
      firstName: "",
      id: 0,
      lastName: "",
      pictureURL: "",
      username: ""
    }
  ];
  tempCount: number = 0;
  tempMessage: string = '';

  constructor(private userService:UserService, private projectService: ProjectService, private renderer: Renderer2, private router : Router,private translateService:TranslateService){}
  ngOnInit(): void {
    //this.checkType();
    console.log("lider",this.projectLeaderID);
    this.tempTaskLeadID=Number(this.taskLeadID[0]);
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    const isDarkMode = localStorage.getItem('darkMode');
      
    if (isDarkMode) {
      const htmlElement = document.querySelector('.container');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }
    setTimeout(() => {this.load();}, 200);
  }

  ngAfterViewInit() {
    this.renderer.listen('window', 'click', (e: Event) => {
      if (this.plus && this.list1) {
        if (
          e.target !== this.plus.nativeElement &&
          e.target !== this.list1.nativeElement &&
          !this.list1.nativeElement.contains(e.target)
        ) {
          console.log("zatvori1")
          this.close();
        }
      }
      if (this.plus && this.list2) {
        if (
          e.target !== this.plus.nativeElement &&
          e.target !== this.list2.nativeElement &&
          !this.list2.nativeElement.contains(e.target)
        ) {
          console.log("zatvori2")
          this.close();
        }
      }
      if (this.plus && this.list3) {
        if (
          e.target !== this.plus.nativeElement &&
          e.target !== this.list3.nativeElement &&
          !this.list3.nativeElement.contains(e.target)
        ) {
          console.log("zatvori3")
          this.close();
        }
      }
    });
  }

  checkType(){

    if (this.type=='AddProject'){
      console.log("Uzeti svi")
      this.getAllUsers();
      this.display=true;
    }
    else if (this.type=='UpdateProject'){
      console.log("Uzeti svi")
      this.getAllUsers();
      
      console.log("Uzeto po projektu")
      this.getUsersByProjectID(this.projectId);
      this.display=true;
    }
    else if (this.type=='AddTask'){
      if (this.taskLeadID.length){
        console.log("Task Lead")
        this.getUsersByProjectID(this.projectId);
        this.displayrb=true;
        return
      }
      if(this.projectId){
        console.log("Uzeto po projektu")
        this.getUsersByProjectID(this.projectId);
        this.display2=true;
      }
      
    }
    else if (this.type=='UpdateTask'){
      if (this.taskLeadID.length){
        console.log("Task Lead")
        this.getUsersByProjectID(this.projectId);
        this.displayrb=true;
        return
      }
      if(this.projectId){
        console.log("Uzeto po projektu")
        this.getUsersByProjectID(this.projectId);
        //this.getAssignmentWithComments(this.taskId);
        //this.display2=true;
      }
    }

    // if (this.projectId){
    //   console.log("Uzeto po projektu")
    //   this.getUsersByProjectID(this.projectId);
    //   this.display2=true;
    // }
    // if (!this.projectId){
    //   console.log("Uzeti svi")
    //   this.getAllUsers();
    //   this.display=true;
    // }
    // if (this.taskLeadID==0){
    //   console.log("Task Lead")
    //   this.getAllUsers();
    //   this.displayrb=true;
    // }
  }

  load(){
    
    if (this.type=='AddProject'){
      console.log("Uzeti svi")
      this.getAllUsers();
      this.imageUserIDs.push(Number(this.projectLeaderID));
      //this.display=true;
    }
    else if (this.type=='UpdateProject'){
      console.log("Uzeti svi")
      this.getAllUsers();
      
      console.log("Uzeto po projektu")
      this.getUsersByProjectID(this.projectId);
      //this.display=true;
    }
    else if (this.type=='AddTask'){
      if (this.taskLeadID.length){
        console.log("Task Lead")
        this.getUsersByProjectID(this.projectId);
       // this.displayrb=true;
        return
      }
      if(this.projectId){
        console.log("Uzeto po projektu")
        this.getUsersByProjectID(this.projectId);
       // this.display2=true;
      }
      
    }
    else if (this.type=='UpdateTask'){
      if (this.taskLeadID.length){
        console.log("Task Lead")
        this.getUsersByProjectID(this.projectId);
       // this.displayrb=true;
        return
      }
      if(this.projectId){
        console.log("Uzeto po projektu")
        this.getUsersByProjectID(this.projectId);
      }
    }
  }

  getAllUsers(){
    this.userService.getAllUsers().subscribe({
      next:(result:User[])=>
        {
          console.log("all users",result);
          this.users = result.filter(user => user.userRoleID !== 1);
          this.filteredUsers = this.users;
        },

        error:(err:any)=>
        {
          console.log(err);
        }
    })
  }

  getUsersByProjectID(id: number){
    this.userService.getUsersByProjectID(id).subscribe({
      next:(result)=>
        {
          console.log("users by project id", result);
          this.users2=result;
          this.filteredUsers2=result;
          //this.users2Ids = this.users2.map(user => user.id);
          if (!this.userIDs.length && !(this.type=='AddTask') && this.firstTime){
            this.users2Ids = this.users2.map(user => user.id);
            if (!this.userIDs2.length){
              this.userIDs = this.userIDs.concat(this.users2Ids);
              this.imageUserIDs = this.userIDs.concat(this.users2Ids);
            }
          }
          if (this.type=='UpdateTask')
            this.getAssignmentWithComments(this.taskId);
          //this.userIDs = this.userIDs.concat(this.users2Ids);
          //const userIdsSet = new Set(this.userIDs);

          // Dodajemo unique vrijednosti iz users2Ids u userIdsSet
          //this.users2Ids.forEach(id => userIdsSet.add(id));

          // Pretvaramo userIdsSet natrag u niz i dodajemo ga u userIds
          //this.userIDs = [...userIdsSet];
        },

        error:(err:any)=>
        {
          console.log(err);
        }
    })
  }

  close(){

    this.display=false;
    this.display2=false;
    this.displayrb=false;
    this.displayrb2=false;
    this.searchTerm='';
  }

  displayCheckedUserIDs() {
    // Metoda koja prikazuje ID-jeve čekiranih korisnika
    console.log('Čekirani korisnici:', this.userIDs);
    this.imageUserIDs = [...this.userIDs];
    if (this.type=="AddProject")
      this.imageUserIDs.push(Number(this.projectLeaderID));
    // Ovde možete dodati dodatnu logiku za prikaz ID-jeva, npr. u modalno prozoru ili alert-u
    let ids:number[]=[];
    //if samo ako je prazan niz na update
    if (!this.userIDs2.length && this.type=='UpdateTask'){
      this.difference=this.userIDs;
      this.emitValues();
      return;
    }
    if (!this.userIDs2.length)
      ids = this.users2Ids;
    else
      ids = this.userIDs2;
    console.log("ajdijevi",this.userIDs);
    console.log("ajdijevi drugi",ids);
    // Izračunati razliku između nizova brojeva i ID-jeva iz niza objekata
    this.difference = this.userIDs.filter(item => !ids.includes(item));
    console.log(this.difference);
    this.difference2 = ids.filter(item => !this.userIDs.includes(item));
    console.log(this.difference2);
    this.emitValues()
     
  }
  displayTeamLeadID() {

    console.log('Team Lead ID:', this.taskLeadID);
    this.tempTaskLeadID=Number(this.taskLeadID[0]);
  }
  
  onCheckboxChange(userId:number,event: any) {
    // Metoda koja se poziva kada se promijeni stanje checkbox-a
    if (event.target.checked) {
      // Ako je checkbox čekiran, dodaj korisnikov ID u niz
      this.userIDs.push(userId);
      console.log('checkbox is checked')
    } else {
      // Ako je checkbox odčekiran, ukloni korisnikov ID iz niza
      this.userIDs = this.userIDs.filter(id => id !== userId);
      console.log('checkbox is not checked')
    }
  }

  onRadioChange(userId: number,event: any) {
    if (event.target.checked) {
      // Ako je checkbox čekiran, dodaj korisnikov ID u niz
      this.taskLeadID[0]=userId;
      console.log('checkbox is checked')
    }
  }

  emitValues() {
    this.userIDsChanged.emit(this.userIDs);
    this.userIdsToAddChanged.emit(this.difference);
    this.userIdsToRemoveChanged.emit(this.difference2);
    this.userIDsMatrixChanged.emit([this.difference,this.difference2]);
  }

  getAssignmentWithComments(Id: number){
    if (!this.userIDs2.length && this.flag){
      this.projectService.getAssignmentWithComments(Id).subscribe({
        next:(rezultat:Task)=>
        {
          for (const user of rezultat.assignedUsers) {
            // Pronalaženje korisnika iz users2 čije se korisničko ime poklapa sa trenutnim korisničkim imenom
            const foundUser = this.users2.find(u => u.username === user.username);
            // Ako pronađeni korisnik postoji, dodajte njegov ID u niz userIDs2
            if (foundUser) {
              this.userIDs2.push(foundUser.id);
            }
          }
          console.log("Id users assigned to task",this.userIDs2);
          this.userIDs = [...this.userIDs2];
          this.imageUserIDs = [...this.userIDs2];
          console.log("JUZERIIIIIIII",this.userIDs,"iiii", this.userIDs2);
          if (!this.firstTime)
            this.display2=true;
          else
            this.firstTime=false;
          this.flag=false;
        },
  
        error:(err:any)=>
        {
          console.log(err)
        }
  
      })
    }
    else{
      if (!this.firstTime)
        this.display2=true;
      else 
      this.firstTime=false; 
    }
    
  }

  filterUsers1() {
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user.firstName.toLowerCase().includes(searchLower) || 
      user.lastName.toLowerCase().includes(searchLower)
    );
  }

  filterUsers2() {
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredUsers2 = this.users2.filter(user => 
      user.firstName.toLowerCase().includes(searchLower) || 
      user.lastName.toLowerCase().includes(searchLower)
    );
  }

  imageUsers(){
    const array = this.users.filter(user => this.imageUserIDs.includes(user.userID));
    this.tempCount=array.length-3;
    if (this.tempCount > 0) {
      const remainingUsers = array.slice(3);
      this.tempMessage = remainingUsers.map(user => `${user.firstName} ${user.lastName}`).join('\n');
    } else {
      this.tempMessage = '';
    }
    return array;
  }

  imageUsers2(){
    const array = this.users2.filter(user => this.imageUserIDs.includes(user.id));
    this.tempCount=array.length-3;
    if (this.tempCount > 0) {
      const remainingUsers = array.slice(3);
      this.tempMessage = remainingUsers.map(user => `${user.firstName} ${user.lastName}`).join('\n');
    } else {
      this.tempMessage = '';
    }
    return array;
  }
    
  // imageRedirect(userId: number | undefined){
  //   this.router.navigate(['/profile/',userId]);
  // }
  
}