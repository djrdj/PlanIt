import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CategoryService } from '../services/category.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent  implements OnInit{

  public getJsonValue: any;
  
  constructor(private http: HttpClient, private categoryService: CategoryService){

  }
  
  ngOnInit(): void {
    this.getMethod();
  }

  public getMethod(){
    this.http.get("https://localhost:7179/api/categories").subscribe(
      (data) => {
        console.log(data);
        this.getJsonValue = data;
      }
    );
  }

  deleteCategory(categoryId: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(categoryId).subscribe(() => {
        // After deletion, reload categories
        this.getMethod();
      });
    }
  }
}
