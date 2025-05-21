import { Component, Input, OnInit } from '@angular/core';
import { Film } from '../models/film';
import { FilmoviService } from '../services/filmovi.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-filmovi-izmena',
  templateUrl: './filmovi-izmena.component.html',
  styleUrl: './filmovi-izmena.component.css'
})
export class FilmoviIzmenaComponent implements OnInit{

  film1:Film={
    id:0,
    naziv:"",
    reditelj:"",
    ocena:0
  };
 

  edit=0
  constructor(private filmoviServis:FilmoviService,private route: ActivatedRoute){}

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      
      if(params['id']!=undefined || params['id']!=null  )
      {
        this.edit=1
        this.getFilm1(params['id'])
        console.log('Test ID:', params);
      }     
      
    });

  }

  getFilm1(id:number){
    
    this.filmoviServis.getFilm(id).subscribe({
        
     next:(film:Film)=>
     {
      this.film1=film
      console.log(this.film1)
     }
      
    })
  }

 updateFilm1(film:Film){
     this.filmoviServis.updateFilm(film).subscribe({
      next:()=>
      {
      window.location.reload()
         console.log(film)
      },

      error:(err:any)=>
      {
            console.log(err)
      }
  })
                       
 }

createFilm1(film:Film){

  this.filmoviServis.createFilm(film).subscribe({
      next:()=>{

          //(filmovi:Film[])=>this.filmoviIzmena.emit(filmovi)
          window.location.reload()
     }})
  }


  

}
