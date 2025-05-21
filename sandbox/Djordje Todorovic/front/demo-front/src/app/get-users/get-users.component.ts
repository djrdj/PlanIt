import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/User';

@Component({
  selector: 'app-get-users',
  templateUrl: './get-users.component.html',
  styleUrls: ['./get-users.component.css']
})
export class GetUsersComponent implements OnInit {
  Users?: User[];

  ime = "";
  prezime = "";
  jmbg = 0;
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get<User[]>(environment.apiUrl+"Ucenik").subscribe(Users=>{
      this.Users = Users;
    })
  }

  
  dodajUcenika(): void
  {
    this.http.post<User[]>(environment.apiUrl+"Ucenik", {
      Ime: this.ime,
      Prezime: this.prezime,
      JMBG: this.jmbg
    }).subscribe(Users=>{
      this.Users = Users;
    });
  }

  obrisiUcenika(id: number): void
  {
    const body = { id: id }; 

    const httpOptions = {
      body: body,
    };
    this.http.delete<User[]>(environment.apiUrl+"Ucenik/" + id).subscribe(Users=>{
      this.Users = Users;
    });

  }
}
