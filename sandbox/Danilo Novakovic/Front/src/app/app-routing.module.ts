import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FilmoviGlavnaComponent } from './filmovi-glavna/filmovi-glavna.component';
import { FilmoviIzmenaComponent } from './filmovi-izmena/filmovi-izmena.component';



const routes: Routes = [
  

  {path:'izmena/:id',component:FilmoviIzmenaComponent},
  { path:'glavna',component:FilmoviGlavnaComponent},
  {path:'izmena',component:FilmoviIzmenaComponent},
  { path:'**',redirectTo:'glavna'},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
