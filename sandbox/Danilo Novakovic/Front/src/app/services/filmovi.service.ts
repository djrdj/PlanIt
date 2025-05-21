import { Injectable } from '@angular/core';
import { Film } from '../models/film';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import{environment}from '../../environments/environment'
@Injectable({
  providedIn: 'root'
})
export class FilmoviService {

 private  url="Film"
  constructor(private http:HttpClient) { }

  public getFilmovi():Observable<Film[]>{
     return this.http.get<Film[]>(`${environment.apiUrl}/${this.url}`);
         
  }
  public getFilm(id:number):Observable<Film>{
    return  this.http.get<Film>(`${environment.apiUrl}/${this.url}/${id}`);
  }

  public updateFilm(film:Film):Observable<Film[]>{
    return this.http.put<Film[]>(`${environment.apiUrl}/${this.url}`,film);

  }

  public createFilm(film:Film):Observable<Film[]>{
    return this.http.post<Film[]>(`${environment.apiUrl}/${this.url}`,film);
    }

  public deleteFilm(film:Film):Observable<Film[]>{
    return this.http.delete<Film[]>(`${environment.apiUrl}/${this.url}/${film.id}`);
  }



}
