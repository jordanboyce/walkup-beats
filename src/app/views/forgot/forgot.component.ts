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

  num1: number = 0;
  num2: number = 0;
  captchaError: boolean = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      captchaAnswer: ['', [Validators.required]]
    });

    this.generateCaptcha();
  }

  generateCaptcha(): void {
    this.num1 = Math.floor(Math.random() * 10) + 1;
    this.num2 = Math.floor(Math.random() * 10) + 1;
  }

  validateCaptcha(): boolean {
    const captchaAnswer = this.forgotForm.value.captchaAnswer;
    return captchaAnswer == (this.num1 + this.num2);
  }

  sendForgotPassword() {
    this.isLoading = true;
    if (!this.validateCaptcha()) {
      this.captchaError = true;
      this.generateCaptcha();
      this.isLoading = false;
      return;
    }
    this.captchaError = false;

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
