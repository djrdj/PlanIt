import { Component,OnInit } from '@angular/core';
import { PaymentDetailService } from '../shared/payment-detail.service';
import { NgForm } from '@angular/forms';
import { PaymentDetail } from '../shared/payment-detail.model';
@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styles: [
  ]
})
export class PaymentDetailsComponent implements OnInit{

  constructor(public service : PaymentDetailService)
  {

  }
  ngOnInit(): void {
    this.service.refreshList();
  }
  populateForm(selectedRecord:PaymentDetail)
  {
    
    this.service.formData =Object.assign({},selectedRecord);
  }

  onDelete(id:number)
  {
    if(confirm('Are you sure to delte this record'))
    this.service.deletePaymentDetail(id)
    .subscribe({
      next: res => {
        this.service.list = res as PaymentDetail[]
        window.location.reload();
      },
      error: err => {console.log(err)}
    })
  }
}
