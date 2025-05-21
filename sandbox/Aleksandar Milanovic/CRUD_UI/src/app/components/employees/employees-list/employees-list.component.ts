import { Component, OnInit } from '@angular/core';
import { Employee } from 'src/app/models/employee.model';
import { EmployeesService } from 'src/app/services/employees.service';

@Component({
  selector: 'app-employees-list',
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.css']
})
export class EmployeesListComponent implements OnInit{
  employees: Employee[] = [
    // {
    //   id: 'alkdfsgj-1j1k1k1',
    //   name: 'Mika',
    //   email: 'mika@gmail.com',
    //   phone: 123456789,
    //   salary: 1000,
    //   department: 'Human Resources'
    // },
    // {
    //   id: 'lkadfsgj-1j1k1k1',
    //   name: 'Pera',
    //   email: 'pera@gmail.com',
    //   phone: 432112389,
    //   salary: 2000,
    //   department: 'Information Technology',
    // },
    // {
    //   id: 'asdfagha-1j1k1k1',
    //   name: 'Laza',
    //   email: 'laza@gmail.com',
    //   phone: 890892389,
    //   salary: 4000,
    //   department: 'Information Technology',
    // },

  ];

  // constructor() { }
  constructor(private employeesService: EmployeesService) { }

  ngOnInit() {
    console.log(this.employees);
    this.employeesService.getAllEmployees()
    .subscribe({
      next: (employees) => {
        console.log(employees);
        this.employees = employees;
      },
      error: (response) => {
        console.log(response);
      }
    });
  }
  
}
