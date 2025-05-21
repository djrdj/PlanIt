import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FilmoviIzmenaComponent } from './filmovi-izmena/filmovi-izmena.component';
import { FilmoviGlavnaComponent } from './filmovi-glavna/filmovi-glavna.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
@NgModule({
  declarations: [
    AppComponent,
    FilmoviIzmenaComponent,
    FilmoviGlavnaComponent
      ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    TableModule,
    ButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
