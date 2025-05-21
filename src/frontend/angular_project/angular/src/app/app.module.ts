import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration} from '@angular/platform-browser';
import { FormsModule} from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SigninComponent } from './components/signin/signin.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { LayoutComponent } from './components/layout/layout.component';
import { NewPasswordComponent } from './components/new-password/new-password.component';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { ProjectDashboardComponent } from './components/project-dashboard/project-dashboard.component';
import { ProjectViewComponent } from './components/project-view/project-view.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AddProjectComponent } from './components/add-project/add-project.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { DismissComponent } from './components/dismiss/dismiss.component';

import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { SliderModule } from 'primeng/slider';

import { ProjectService } from './services/project.service';
import { AddTaskComponent } from './components/add-task/add-task.component';
import { UpdateTaskComponent } from './components/update-task/update-task.component';
import { UpdateProjectComponent } from './components/update-project/update-project.component';
import { CreateAccountComponent } from './components/create-account/create-account.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EditPermissionsComponent } from './components/edit-permissions/edit-permissions.component';
import { AllUsersComponent } from './components/all-users/all-users.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { KanbanComponent } from './components/kanban/kanban.component';



import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {ConfirmationService}from 'primeng/api'
import { MessageService } from 'primeng/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ToastrModule } from 'ngx-toastr';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { InterceptorService } from './services/interceptor.service';
import { HomepageComponent } from './components/homepage/homepage.component';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AddColumnDialogComponent } from './components/add-column-dialog/add-column-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DismissProjectComponent } from './components/dismiss-project/dismiss-project.component';
import { TagModule } from 'primeng/tag';
import { UserActivationDialogComponent } from './components/user-activation-dialog/user-activation-dialog.component';
import { EditPermissionsDialogComponent } from './components/edit-permissions-dialog/edit-permissions-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import{}from 'primeng/';
import { GanticComponent } from './components/gantic/gantic.component'
import { GANTT_GLOBAL_CONFIG, NgxGanttModule } from '@worktile/gantt';
import html2canvas from 'html2canvas';
import { GanttchartComponent } from './components/ganttchart/ganttchart.component';
import { Page404Component } from './components/page-404/page-404.component';
import { TaskpageComponent } from './components/taskpage/taskpage.component';
import { AssignUsersComponent } from './components/assign-users/assign-users.component';
import { DatePipe } from '@angular/common';
import { UrlnavigationComponent } from './components/urlnavigation/urlnavigation.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { EditorModule } from 'primeng/editor';
import { StatisticComponent } from './components/statistic/statistic.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { ClockitComponent } from './components/clockit/clockit.component';
import { FilterService, PrimeNGConfig } from 'primeng/api';
import { DragDropModule } from '@angular/cdk/drag-drop';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    ForgotPasswordComponent,
    LayoutComponent,
    NewPasswordComponent,
    ProjectDashboardComponent,
    ProjectViewComponent,
    ProfileComponent,
    AddProjectComponent,
    AddProjectComponent,
    EditProfileComponent,
    AddTaskComponent,
    UpdateTaskComponent,
    UpdateProjectComponent,
    CreateAccountComponent,
    AddUserComponent,
    EditPermissionsComponent,
    AllUsersComponent,
    NotificationsComponent,
    KanbanComponent,
    SpinnerComponent,
    HomepageComponent,
    DismissComponent,
    ProjectListComponent,
    SidebarComponent,
    SettingsComponent,
    AddColumnDialogComponent,
    DismissProjectComponent,
    UserActivationDialogComponent,
    EditPermissionsDialogComponent,
    GanticComponent,
    GanttchartComponent,
    Page404Component,
    TaskpageComponent,
    AssignUsersComponent,
    UrlnavigationComponent,
    StatisticComponent,
    NavigationComponent,
    ClockitComponent
  ],
  imports: [
    DragDropModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    TableModule,
    ChartModule,
    ButtonModule,
    ProgressBarModule,
    ToastModule,
    MatSlideToggleModule,
    ConfirmDialogModule,
    BrowserAnimationsModule,
    MultiSelectModule,
    CalendarModule,
    ToastrModule.forRoot(), 
    PasswordModule,
    DividerModule,
    MatDialogModule,
    MatFormField,
    MatInputModule,
    TagModule,
    DropdownModule,
    ReactiveFormsModule,
    NgxGanttModule,
    EditorModule,
    SliderModule,
    //LANGUAGE SERVICE
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      defaultLanguage: 'en'
    })
  ],
  providers: [
   // {provide: GANTT_GLOBAL_CONFIG},
   FilterService, PrimeNGConfig,
    provideClientHydration(),
    ProjectService,MessageService,ConfirmationService,DatePipe,
    {provide:HTTP_INTERCEPTORS,useClass:InterceptorService,multi:true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
