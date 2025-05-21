import { Injectable } from '@angular/core';
import { AddCategoryRequest } from '../models/add-category-request.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) { }

  addCategory(model: AddCategoryRequest): Observable<void> {
    return this.http.post<void>(`https://localhost:7179/api/Categories`, model);
  }

  deleteCategory(categoryId: number): Observable<void>{
    return this.http.delete<void>(`https://localhost:7179/api/Categories/${categoryId}`);
  }

}
