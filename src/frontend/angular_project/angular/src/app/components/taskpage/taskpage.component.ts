import { Component, HostListener, ElementRef, ViewChild ,Renderer2  } from '@angular/core';
import { Router } from '@angular/router';
import { Task } from '../../models/Task';
import { ProjectService } from '../../services/project.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Comment } from '../../models/comment';
import { CommentService } from '../../services/comment.service';
import { Location } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-taskpage',
  templateUrl: './taskpage.component.html',
  styleUrl: './taskpage.component.scss'
})

export class TaskpageComponent {
  @ViewChild('endDateInput') endDateInput!: ElementRef | undefined;
  @ViewChild('TaskNameInput') TaskNameInput!: ElementRef | undefined;
  @ViewChild('endDateInputsend') endDateInputsend!: ElementRef | undefined;
  @ViewChild('TaskNameInputsend') TaskNameInputsend!: ElementRef | undefined;
  @ViewChild('editdescription') editdescription!: ElementRef | undefined;
  @ViewChild('editdescriptionInput') editdescriptionInput!: ElementRef | undefined;
  @ViewChild('startDateInput') startDateInput!: ElementRef | undefined;
  @ViewChild('PriorityEdit') PriorityEdit!: ElementRef | undefined;
  @ViewChild('StatusEdit') StatusEdit!: ElementRef | undefined;
  
  TaskId!: number;
  taskWithComments: Task={
    assignmentID: 0,
    assignmentName: '',
    description: '',
    status: '',
    priority: '',
    assignmentListID: 0,
    assignmentListName: '',
    parentAssignmentID: 0,
    parentAssignmentName: '',
    assignmentLeadURL: '',
    assignmentLeadFirstName: '',
    assignmentLeadLastName: '',
    assignedUsers: [],
   
  };
  selectedLanguage : string = "en";
  userImg!:string;
  tempTask!:Task;
  selectedOption!: string;
  isAuthorized: boolean = true;
  selectedID!: number;
  role!:string;
  differenceInDays!:number;
  openDismissOverlay: boolean = false;
  sendingComment: Comment = {
    commentText: '',
    creationDate: '',
    userID: 0,
    assignmentID: 0
  };
  Task!:Task;
  selectedTask!:Task;
  UpdateOverlay: boolean=false;
  Id!:number;
  type!: string;
  userId!: number;
  showText: boolean=false;
  EditTaskShow: boolean=false;
  EditDescriptionShow: boolean=false;
  userIdsToAdd: number[] = [];
  userIdsToRemove: number[] = [];
  EditDate:boolean=false;
  UserID!:number;
  CommentShow: boolean=false;
  text: any;
  checkUsersChange: boolean = false;
  editor: string = 'width: 90%; margin-top: 5%;';
  showAssignButton: boolean = true;
  EditStartDate: boolean = false;
  EditPriority: boolean = false;
  openResolveOverlay: boolean = false;
  EditStatus: boolean = false;
  constructor(private renderer: Renderer2 ,private sanitizer: DomSanitizer,private router : Router,private projectService: ProjectService,private datePipe: DatePipe,private toastr: ToastrService,private commentService:CommentService,private location: Location,private translateService:TranslateService){}
  ngOnInit(): void {
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    this.role=localStorage.getItem('userRoleName') as string;
    // console.log("My role is ", this.role);
    this.userImg=localStorage.getItem('pictureUrl') as string;
    this.UserID=parseInt(localStorage.getItem('id') as string); 
    //console.log(this.router.url);
    this.TaskId=parseInt(this.getCurrentPageFromUrl(this.router.url.toString()));
    
    //console.log('asdasds');
    
    this.getAssignmentWithComments(this.TaskId);
    this.getAssigmentByAssigmentId(this.TaskId);
    console.log('task sa komentarima : ', this.taskWithComments)

    const isDarkMode = localStorage.getItem('darkMode');
      
    if (isDarkMode) {
      const htmlElement = document.querySelector('#taskpage_html');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }
  }
  ngAfterViewInit() {
    this.renderer.listen('window', 'click', (e: Event) => {
      if (this.endDateInput) {
        const clickedInsideEndDateInput = this.endDateInput.nativeElement.contains(e.target);

        if (!clickedInsideEndDateInput && this.EditDate) {
          this.EditDate = false;
        }
      }
      if(this.startDateInput){
        const clickedInsideStartDateInput = this.startDateInput.nativeElement.contains(e.target);

        if(!clickedInsideStartDateInput && this.EditStartDate)
        {
          this.EditStartDate = false;
        }
      }
      if(this.StatusEdit){
        const clickedInsideStartStatusEdit = this.StatusEdit.nativeElement.contains(e.target);
        if(!clickedInsideStartStatusEdit && this.EditStatus)
        {
          this.EditStatus = false;
        }

      }
      if(this.PriorityEdit){
        const clickedInsideStartPriorityEdit = this.PriorityEdit.nativeElement.contains(e.target);
       
        if(!clickedInsideStartPriorityEdit && this.EditPriority)
        {
          this.EditPriority = false;
          
        }
      }
       if(this.editdescription )
       {
       
        if(e.target !== this.editdescription.nativeElement )
           
          if(this.EditDescriptionShow)
          {
            this.EditDescriptionShow = !this.EditDescriptionShow;
          }
         
           
       } 
     
      if(this.TaskNameInput && this.TaskNameInputsend)
        {

          if(e.target !== this.TaskNameInput.nativeElement && e.target !== this.TaskNameInputsend.nativeElement)
          {
            if(this.EditTaskShow)
            {
              this.EditTaskShow = !this.EditTaskShow;
            }
            
          }
        }
        
        
    });
  }
  ChangePriortyHandler(){
    this.EditPriority = !this.EditPriority;
    console.log("uslo u handler",this.EditPriority);
  }
  ChangeStatusHandler()
  {
    this.EditStatus = !this.EditStatus;
  }
  getCommentHtml(comment: any): SafeHtml {
   // Dinamički HTML string sa stilizovanjem slike
   const commentTextWithImages = comment.commentText.replace(
    /<img /g,
    '<img class="max-w-full h-auto block" '
  );

  // Dinamički HTML string sa stilizovanjem slike
  const htmlString = `
    <div class="max-w-full md:max-w-md border  break-words  xsm:text-xs mdl:text-sm min-h-14 p-4">
      ${commentTextWithImages}
    </div>
  `;

  return this.sanitizer.bypassSecurityTrustHtml(htmlString);
  }
  getTaskDescriptionHtml(task: Task){
  
    const commentTextWithImages = task.assignmentDescription.replace(
      /<img /g,
      '<img class="max-w-full h-auto block" '
    );
  
    // Dinamički HTML string sa stilizovanjem slike
    const htmlString = `
      <div class="max-w-full md:max-w-md border  break-words  xsm:text-xs mdl:text-sm min-h-14 p-4">
      ${task.assignmentDescription}
      </div>
    `;
  
    return this.sanitizer.bypassSecurityTrustHtml(htmlString);
  }
  checkProgress(){
    console.log("progres taska - ",this.Task.progress)
    if (this.Task.progress==100){
      this.sendTask2('Resolve');
      console.log("Za resolve progress",this.openResolveOverlay);
      
    }
    
  }
  getTaskDescriptionHtml2(task: Task): string {
    const description = task.assignmentDescription; // Assume assignmentDescription is a string
  
    // ... (Optional: Basic sanitization)
    const commentTextWithImages = description.replace(
      /<img /g,
      '<img class="max-w-full h-auto block" '
    );
  
    // Dinamički HTML string sa stilizovanjem slike
    const htmlString = `
      <div class="max-w-full md:max-w-md border break-words text-sm min-h-14 p-4">
      ${description}
      </div>
    `;
  
    // Sanitize and return SafeHtml
    const safeHtmlValue = this.sanitizer.bypassSecurityTrustHtml(htmlString);
  
    // Convert SafeHtml to plain text
    const plainTextPlaceholder = new DOMParser().parseFromString(
      safeHtmlValue.toString(), // Convert SafeHtml to string (use with caution)
      'text/html'
    ).documentElement.textContent;
    if(plainTextPlaceholder)
      return plainTextPlaceholder;
    return task.assignmentDescription;    
  }
  onHtmlInputChange(event: any,comment: Comment) {
    const modifiedHtml = this.filterHtml(event.target.textContent);
    // Ažuriraj comment.commentText sa modifikovanim HTML-om
    comment.commentText = modifiedHtml;
  }

  // Funkcija za filtriranje HTML-a da bi se uklonili nepoželjni delovi
  filterHtml(html: string): string {
    // Implementiraj logiku za filtriranje HTML-a ovde
    // Na primer, možeš koristiti DOM manipulaciju ili regularne izraze
    return html; // Za sada samo vraćamo isti HTML
  }
  EditComentShow(comment:Comment){
    this.getCommentHtml(comment);
    this.CommentShow=!this.CommentShow;
  }
  // userIdsToAddHandler(array: number[]){
  //   this.userIdsToAdd=array;
  // }

  // userIdsToRemoveHandler(array: number[]){
  //   this.userIdsToRemove=array;
  // }

  userIDsMatrixChangedHandler(matrix: number[][]){
    this.userIdsToAdd=matrix[0];
    this.userIdsToRemove=matrix[1];
    this.checkUsersChange = true;
    this.changeTaskWithComments();
  }

  goBack() {
    this.location.back();
  }
  onKeyUpHandlerName(){
    this.EditTaskShow=!this.EditTaskChange;
  }
  EditTDescriptionChange(){
    this.EditDescriptionShow=!this.EditDescriptionShow;
  }
  onKeyUpHandlerDescription(){
    this.EditDescriptionShow=!this.EditDescriptionShow;
  }
  EditTaskChange()
  {
    this.EditTaskShow=!this.EditTaskShow;
  }
  EditDateChange()
  {
    this.EditDate=!this.EditDate;
    console.log(this.EditDate);
  }
  ChangeHandeler(){
    this.EditDate=!this.EditDate;
  }
  ChangeHandeler2(){
    this.EditStartDate=!this.EditStartDate;
  }
  exportTasks(){
    console.log(this.Task);

    const plainTask = {
      TaskId: this.Task.assignmentID,
      Taskname: this.Task.assignmentName,
      AssigmentLead: this.taskWithComments.assignmentLeaderUsername,
      StartDate: this.taskWithComments.assignmentCreationDate,
      EndDate: this.Task.deadline,
      Priority: this.Task.priority,
      Status: this.Task.status,
      Description: this.Task.description
    };

     // Generate CSV content
    const csvContent = this.generateCSVContent(plainTask);

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv' });
    
    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.setAttribute('download', 'Task.csv');

    // Trigger the download
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Clean up
    document.body.removeChild(downloadLink);

    this.translateService.get("Task has been exported").subscribe((translatedMessage: string) => {
      this.toastr.success(translatedMessage, 'Success', {
        positionClass: 'toast-top-right',
        timeOut: 1500
      });
    });

  } 
  private generateCSVContent(task: any): string {
    const headers = Object.keys(task).join(',');
    const values = Object.values(task).join(',');
    return `${headers}\n${values}`;
  }
  private getCurrentPageFromUrl(url:string): string{
    const parts = url.split('/');
    //console.log('ovo je to 2 ',parts);
    this.Id=parseInt(parts[2] || 'home');
    return parts[6] || 'home';
  }
  openUpdateTaskOverlay1(task:Task)
  {
    this.selectedTask=task;
    this.UpdateOverlay=!this.UpdateOverlay;
  }
  openUpdateTaskOverlay2()
  {
    this.openUpdateTaskOverlay1(this.Task);
  }
  openUpdateTaskOverlay()
  {
    this.UpdateOverlay=!this.UpdateOverlay;
    this.getAssignmentWithComments(this.TaskId);
    this.getAssigmentByAssigmentId(this.TaskId);
  }
  getAssignmentWithComments(Id: number){
    this.projectService.getAssignmentWithComments(Id).subscribe({
        next:(rezulatat:Task)=>
        {
          console.log(rezulatat);
            this.taskWithComments=rezulatat;
            this.selectedOption = this.taskWithComments.status;
            this.selectedID=this.taskWithComments.assignmentListID;
            // console.log("sleektovan id",this.taskWithComments.assignmentListID);
            // console.log("taskWithComments",this.taskWithComments);
            // console.log("Asignee profile test",this.taskWithComments.assignedUsers);
            if (this.taskWithComments.assignmentLeaderUsername==localStorage.getItem('username') || this.role=="Manager"){
                this.isAuthorized=true;
            }
            else{
                this.isAuthorized=false;
            }
            if (this.taskWithComments.assignmentCreationDate) {
            // Datum kada je zadatak napravljen
            const creationDate = new Date(this.taskWithComments.assignmentCreationDate);

            // Trenutni datum
            const today = new Date();

            // Formatiranje datuma
            const formattedCreationDate = this.datePipe.transform(creationDate, 'yyyy-MM-dd');
            const formattedToday = this.datePipe.transform(today, 'yyyy-MM-dd');

            // Računanje razlike u milisekundama
            const differenceInMilliseconds = today.getTime() - creationDate.getTime();

            // Pretvaranje razlike u dane
             this.differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));

          
            }
      
        },

        error:(err:any)=>
        {
            console.log(err)
        }

     })
}
getAssigmentByAssigmentId(Id:number)
{
  this.projectService.getAssigmentByAssigmentId(Id).subscribe({
    next:(rezulatat:Task)=>
    {
      this.Task=rezulatat;
      this.Task.creationDate=(this.Task.creationDate as string).split('T')[0];
      this.Task.deadline=(this.Task.deadline as string).split('T')[0];
    },
    error:(err:any)=>
    {
        console.log(err)
    }
  })
}
toggleDismissOverlay() {
  this.openDismissOverlay = !this.openDismissOverlay;
  this.getAssignmentWithComments(this.TaskId);
  this.getAssigmentByAssigmentId(this.TaskId);
}
sendTask(task:Task, type: string) {
  this.tempTask=task;
  this.type=type;
  this.openDismissOverlay = !this.openDismissOverlay;
  // console.log()
  
}
sendTask2(type:string) {
  this.sendTask(this.Task,type);
  // console.log("za progres1",this.openDismissOverlay)
  this.openResolveOverlay = !this.openResolveOverlay;
  // console.log("za progres2",this.openDismissOverlay)
}
changeTaskWithCommentsDate(){
  this.projectService.changeTask(this.Task,Number(localStorage.getItem("id") !)).subscribe({
    next:(result:any)=>
      {
            console.log(result);

            this.translateService.get("Changed task status").subscribe((translatedMessage: string) => {
              this.toastr.success(translatedMessage, 'Success', {
                positionClass: 'toast-top-right',
                timeOut: 1500
              });
            });
      },

      error:(err:any)=>
      {
          console.log(err);

          this.translateService.get("Status change failed").subscribe((translatedMessage: string) => {
            this.toastr.error(translatedMessage, 'Error', {
              positionClass: 'toast-top-right',
              timeOut: 1500
            });
          });
      }
  })
}

changeComment(changedcomment: Comment){

  console.log("promenjen komentar: ",changedcomment);
  this.projectService.changeComment(changedcomment).subscribe({
    next:(result:any)=>
      {

        this.translateService.get("Changed comment").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
            this.getAssignmentWithComments(this.TaskId);
      },

      error:(err:any)=>
      {
          console.log(err);

          this.translateService.get("Comment change failed").subscribe((translatedMessage: string) => {
            this.toastr.error(translatedMessage, 'Error', {
              positionClass: 'toast-top-right',
              timeOut: 1500
            });
          });
         
      }
  })
}

   changeTaskWithCommentsStatus(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement?.value || '';
    console.log('Selected value:', selectedValue);
    if (selectedValue=="Dismissed"){
        this.sendTask(this.Task,"Dismiss");
    }
    else if (selectedValue=="Completed"){
        this.sendTask(this.Task,"Resolve");
    }
    else{
        console.log('Real task:',this.Task);
        this.Task.status=selectedValue;
        this.projectService.changeTask(this.Task,Number(localStorage.getItem("id") !)).subscribe({
            next:(result:any)=>
              {
                    console.log(result);
                    this.translateService.get("Changed task status").subscribe((translatedMessage: string) => {
                      this.toastr.success(translatedMessage, 'Success', {
                        positionClass: 'toast-top-right',
                        timeOut: 1500
                      });
                    });
              },
      
              error:(err:any)=>
              {
                  console.log(err);
                  this.translateService.get("Status change failed").subscribe((translatedMessage: string) => {
                    this.toastr.error(translatedMessage, 'Error', {
                      positionClass: 'toast-top-right',
                      timeOut: 1500
                    });
                  });
              }
          })
    }
    
  }      
  changeTaskWithComments() {
   
        if (this.checkUsersChange){
          console.log("za dodavanje",this.userIdsToAdd,"za uklanjanje",this.userIdsToRemove)
          this.Task.employeeIdsToAdd=this.userIdsToAdd;
          this.Task.employeeIdsToRemove=this.userIdsToRemove;
        }
  
        console.log('Real task:',this.Task);
        this.projectService.changeTask(this.Task,Number(localStorage.getItem("id") !)).subscribe({
            next:(result:any)=>
              {
                    console.log(result);
                    if (this.checkUsersChange){
                      this.checkUsersChange = false;
                      //this.ngOnInit();
                      this.getAssignmentWithComments(this.TaskId);
                      this.showAssignButton = false;
                      // if (this.role=='Manager' || this.userId==this.Task.assignmentLeadID)
                        setTimeout(() => this.showAssignButton = true);
                    }
                    this.translateService.get("Changed task status").subscribe((translatedMessage: string) => {
                      this.toastr.success(translatedMessage, 'Success', {
                        positionClass: 'toast-top-right',
                        timeOut: 1500
                      });
                    });
              },
      
              error:(err:any)=>
              {
                  console.log(err);
                  this.translateService.get("Status change failed").subscribe((translatedMessage: string) => {
                    this.toastr.error(translatedMessage, 'Error', {
                      positionClass: 'toast-top-right',
                      timeOut: 1500
                    });
                  });
              }
          })
    
    
  }  
  minDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  createNewComment(){
    if (this.sendingComment.commentText){
        this.sendingComment.assignmentID=this.taskWithComments.assignmentID;
        this.sendingComment.creationDate = new Date();
        console.log(this.sendingComment.creationDate);
        this.sendingComment.userID=Number(localStorage.getItem('id'));
        console.log("novi komentar",this.sendingComment);
        this.commentService.createNewComment(this.sendingComment).subscribe({
            next:(rezulatat:Comment)=>
            {
                console.log("sent comment",rezulatat);
                if(rezulatat.commentID){
                  this.taskWithComments.comments?.push({
                    commentID: rezulatat.commentID,
                    username: '',
                    userPictureURL: this.userImg,
                    commentText: this.sendingComment.commentText,
                    userID:rezulatat.userID
                  });
                }
                
                this.sendingComment.commentText='';
                this.getAssignmentWithComments(this.TaskId);

                this.translateService.get("Message has been send").subscribe((translatedMessage: string) => {
                  this.toastr.success(translatedMessage, 'Success', {
                    positionClass: 'toast-top-right',
                    timeOut: 1500
                  });
                });
            },

            error:(err:any)=>
            {

              
              this.translateService.get("Message was not send").subscribe((translatedMessage: string) => {
                this.toastr.error(translatedMessage, 'Error', {
                  positionClass: 'toast-top-right',
                  timeOut: 1500
                });
              });
                console.log(err)
            }
        })
    }
   }
  
  imageRedirect(userId: number | undefined){
    this.router.navigate(['/profile/',userId]);
  }

  validateProgressKeyDown(event: KeyboardEvent) {
    const key = event.key;
    const input = event.target as HTMLInputElement;
    const selectionStart = input.selectionStart!;
    const selectionEnd = input.selectionEnd!;
    const value = input.value;
  
    // Ako postoji selektovan tekst, simuliramo unos tako da obrišemo selektovan tekst i dodamo novi unos
    const newValue = value.substring(0, selectionStart) + key + value.substring(selectionEnd);
    const regex = /^(?:100|[1-9]?[0-9]?)$/; // Regularni izraz za proveru unosa broja od 0 do 100
  
    if (!(event.key === 'Backspace' || regex.test(newValue))) {
        event.preventDefault(); // Zaustavlja unos ako nije valjan broj od 0 do 100
    }
  }
}
