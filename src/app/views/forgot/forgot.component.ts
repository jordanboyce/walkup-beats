import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule],
  templateUrl: './forgot.component.html',
  styleUrl: './forgot.component.scss'
})
export class ForgotComponent implements OnInit {
  isLoading: boolean = false;
  showMessage: boolean = false;
  email: any;

  forgotForm: any;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  sendForgotPassword() {
    this.isLoading = true;
    const { email } = this.forgotForm.value;
    this.authService.resetPassword(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.forgotForm.reset();
        this.showMessage = true;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
        this.showMessage = true;
      }
    });
  }

}
