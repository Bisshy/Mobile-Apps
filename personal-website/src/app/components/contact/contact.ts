import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-contact',
  styleUrl: './contact.css',
  templateUrl: './contact.html',
})
export class Contact {
  submitted = false;

  constructor(private cdr: ChangeDetectorRef){}

  contactForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    message: new FormControl('', Validators.required)
  })

  onSubmit(): void {
    if(this.contactForm.valid) {
      this.submitted = true;

      setTimeout(()=>{
        this.submitted = false;
        this.cdr.detectChanges();
        this.contactForm.reset();
      }, 3000)
    }else{
      this.contactForm.markAllAsTouched();
    }
  }
}
