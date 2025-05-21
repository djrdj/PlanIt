import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from './components/signin/signin.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { NewPasswordComponent } from './components/new-password/new-password.component';
import { ProjectViewComponent } from './components/project-view/project-view.component';
import { ProfileComponent } from './components/profile/profile.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { KanbanComponent } from './components/kanban/kanban.component';
import { UnauthenticatedGuard } from './guards/unautenticated.guard';
import { AdminGuard } from './guards/administrator.guard';
import { AuthenticatedGuard } from './guards/autenticated.guard';
import { HomepageComponent } from './components/homepage/homepage.component';
import { ManagerEmployeeGuard } from './guards/manager-employee.guard';
import { SettingsComponent } from './components/settings/settings.component';
import { CreateAccountComponent } from './components/create-account/create-account.component';
import { GanttchartComponent } from './components/ganttchart/ganttchart.component';
import { ProjectDashboardComponent } from './components/project-dashboard/project-dashboard.component';
import { AllUsersComponent } from './components/all-users/all-users.component';
import { Page404Component } from './components/page-404/page-404.component';

import { TaskpageComponent } from './components/taskpage/taskpage.component';
import { StatisticComponent } from './components/statistic/statistic.component';
import { EditProfileGuard } from './guards/edit-profile.guard';
import { ClockitComponent } from './components/clockit/clockit.component';
const routes: Routes = [
  
  {path: '',redirectTo : 'home',pathMatch:'full'},
  {path:'home',component:HomepageComponent,canActivate:[AuthenticatedGuard]},
  {path:'dashboard',component:ProjectDashboardComponent,canActivate:[ManagerEmployeeGuard]},
  {path:'all-users',component:AllUsersComponent,canActivate:[AdminGuard]},
  {path : 'create-account', component:CreateAccountComponent, canActivate:[UnauthenticatedGuard]},
  {path: 'signin',component:SigninComponent,canActivate:[UnauthenticatedGuard]},
  {path: 'forgotpassword',component:ForgotPasswordComponent,canActivate:[UnauthenticatedGuard]},
  {path: 'newpassword',component:NewPasswordComponent,canActivate:[UnauthenticatedGuard]},
  {path: 'home/:projectID/:SubProjectID/:ProjectName/:SubProjectName/:TaskId/:TaskName/view',component:ProjectViewComponent,canActivate:[ManagerEmployeeGuard]},
  {path: 'home/:projectID/:SubProjectID/:ProjectName/:SubProjectName/view',component:ProjectViewComponent,canActivate:[ManagerEmployeeGuard]},
  {path:'home/:projectID/:SubProjectID/:ProjectName/:SubProjectName/:TaskId/:TaskName/kanban',component:KanbanComponent,canActivate:[ManagerEmployeeGuard]},
  {path:'home/:projectID/:SubProjectID/:ProjectName/:SubProjectName/kanban',component:KanbanComponent,canActivate:[ManagerEmployeeGuard]},
  {path:'home/:projectID/:SubProjectID/:ProjectName/:SubProjectName/:TaskId/:TaskName/ganttchart',component:GanttchartComponent,canActivate:[ManagerEmployeeGuard]},
  {path:'home/:projectID/:SubProjectID/:ProjectName/:SubProjectName/ganttchart',component:GanttchartComponent,canActivate:[ManagerEmployeeGuard]},
  {path: 'clockit',component:ClockitComponent,canActivate:[ManagerEmployeeGuard]},
  {path: 'home/:projectID/:SubProjectID/:ProjectName/:SubProjectName/clockit', component:ClockitComponent, canActivate:[ManagerEmployeeGuard]},
  {path:'home/:projectID/:SubProjectID/:ProjectName/:SubProjectName/:TaskId/:TaskName/clockit',component:KanbanComponent,canActivate:[ManagerEmployeeGuard]},
  {path: 'view',component:ProjectViewComponent,canActivate:[ManagerEmployeeGuard]},
  {path: 'profile/:userId',component:ProfileComponent,canActivate:[AuthenticatedGuard]},
  {path: 'edit-profile/:userId', component:EditProfileComponent,canActivate:[EditProfileGuard]},
  {path: 'add-user', component: AddUserComponent, canActivate: [AdminGuard]},
  {path: 'notifications', component: NotificationsComponent, canActivate: [ManagerEmployeeGuard]},
  {path: 'kanban', component: KanbanComponent, canActivate: [ManagerEmployeeGuard]},
  { path: 'settings', component: SettingsComponent, canActivate:[AuthenticatedGuard] },
  {path: 'ganttchart', component:GanttchartComponent, canActivate:[ManagerEmployeeGuard]},
  {path:'home/:ProjectId/:SubProjectID/:ProjectName/:SubProjectName/:TaskId/:TaskName/taskpage',component:TaskpageComponent,canActivate:[ManagerEmployeeGuard]},
  {path:'taskpage',component:TaskpageComponent,canActivate:[ManagerEmployeeGuard]},
  {path:'home/:projectID/:SubProjectID/:ProjectName/:SubProjectName/:TaskId/:TaskName/statistics',component:StatisticComponent,canActivate:[ManagerEmployeeGuard]},
  {path:'home/:projectID/:SubProjectID/:ProjectName/:SubProjectName/statistics',component:StatisticComponent,canActivate:[ManagerEmployeeGuard]},
  {path: 'statistics' , component:StatisticComponent, canActivate:[ManagerEmployeeGuard]},
  {path:'**',component:Page404Component}


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
