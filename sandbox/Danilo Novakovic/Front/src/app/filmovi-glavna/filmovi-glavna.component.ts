import { Component, OnInit } from '@angular/core';
import { Film } from '../models/film';
import { FilmoviService } from '../services/filmovi.service';


@Component({
  selector: 'app-filmovi-glavna',
  templateUrl: './filmovi-glavna.component.html',
  styleUrl: './filmovi-glavna.component.css'
})
export class FilmoviGlavnaComponent  implements OnInit{
  

  tabelaAzurirana=0
  filmovi:Film[]=[];
  filmEdit?:Film;
  
  constructor(private filmoviServis:FilmoviService){}
 

  ngOnInit(): void {
    this.filmoviServis.getFilmovi().subscribe({
          next:(rezultat:Film[])=>
        {
          console.log(rezultat);
          this.filmovi=rezultat
         
      },
      error:(err:any)=>
      {
            console.log(err)
      }
    })

  }
  
  updateFilmLista(filmovi:Film[]){
    this.filmovi=filmovi
  }

  newFilm(){
    this.filmEdit=new Film()

  }

  deleteFilm1(film:Film){
    this.filmoviServis.deleteFilm(film).subscribe({
      next:()=>
      {
      //  (filmovi:Film[])=>this.filmoviIzmena.emit(filmovi)
        window.location.reload()
      }
      
    })
  }

  


}
