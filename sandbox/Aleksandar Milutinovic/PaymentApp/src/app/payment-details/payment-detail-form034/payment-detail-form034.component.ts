import { Component } from '@angular/core';
import { PaymentDetailService } from 'src/app/shared/payment-detail.service';
import { NgForm } from '@angular/forms';
import { PaymentDetail } from 'src/app/shared/payment-detail.model';
@Component({
  selector: 'app-payment-detail-form034',
  templateUrl: './payment-detail-form034.component.html',
  styles: [
  ]
})
export class PaymentDetailForm034Component {

  
  constructor(public service : PaymentDetailService)
  {

  }

  onSubmit(form:NgForm){
    this.service.formSubmitted=true;
    if(form.valid)
    {
      if(this.service.formData.paymentDetailId == 0)
      {
        this.insertRecord(form)
      }
      else 
        this.updateRecord(form)
    }
   
  }

  insertRecord(form:NgForm){
    this.service.postPaymentDetail()
      .subscribe({
          next:res=>{
            console.log(res);
            this.service.formSubmitted=false;
            window.location.reload();
          },
          error:err => {console.log(err)}
      })
  }
  updateRecord(form:NgForm){
    this.service.putPaymentDetail()
      .subscribe({
          next:res=>{
            console.log(res);
            this.service.formSubmitted=false;
            window.location.reload();
          },
          error:err => {console.log(err)}
      })
  }

}
