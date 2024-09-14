import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  @ViewChild('loginTab') loginTab!: ElementRef;
  @ViewChild('registerTab') registerTab!: ElementRef;

  isLoading: boolean = false;

  loginForm: any;
  registerForm: any;

  errorMessage: string = '';
  successMessage: string = '';
  private messageTimeout: any;

  num1: number = 0;
  num2: number = 0;
  captchaError: boolean = false;

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      captchaAnswer: ['', [Validators.required]]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      captchaAnswer: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.generateCaptcha();
  }

  generateCaptcha(): void {
    this.num1 = Math.floor(Math.random() * 10) + 1;
    this.num2 = Math.floor(Math.random() * 10) + 1;
  }

  validateCaptcha(form: FormGroup): boolean {
    const captchaAnswer = form.get('captchaAnswer')?.value;
    return captchaAnswer == (this.num1 + this.num2);
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      return { 'passwordMismatch': true };
    }

    return null;
  }

  login() {
    this.isLoading = true;
    if (this.loginForm.valid) {
      if (!this.validateCaptcha(this.loginForm)) {
        this.captchaError = true;
        this.generateCaptcha();
        this.isLoading = false;
        return;
      }
      this.captchaError = false;

      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (res: any) => {
          this.loginForm.reset()
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
        error: (err: any) => {
          console.error('Login failed', err);
          this.showMessage(err.message, true);
          this.isLoading = false;
        }
      });
    }
  }


  register() {
    this.isLoading = true;
    if (this.registerForm.valid) {
      if (!this.validateCaptcha(this.registerForm)) {
        this.captchaError = true;
        this.generateCaptcha();
        this.isLoading = false;
        return;
      }
      this.captchaError = false;

      const { name, email, username, password, confirmPassword } = this.registerForm.value;
      this.authService.register(name, email, username, password, confirmPassword).subscribe({
        next: (res: any) => {
          this.registerForm.reset();
          this.showMessage('Registration successful. Please login', false);
          // go to login tab
          this.switchToLoginTab();
          this.authService.sendVerificationEmail(email).subscribe({
            next: () => {
              this.showMessage('Check your email to verify email', false);
            },
            error: (err: any) => {
              console.error(err);
            }
          });
          this.isLoading = false;
        },
        error: (err: any) => {
          this.showMessage(err.message, true);
          this.isLoading = false;
        }
      });
    }
  }

  switchToLoginTab() {
    this.loginTab.nativeElement.click();
  }

  switchToRegisterTab() {
    this.registerTab.nativeElement.click();
  }

  private showMessage(message: string, isError: boolean = false) {
    // Clear any existing timeout
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }

    // Set the appropriate message
    if (isError) {
      this.errorMessage = message;
      this.successMessage = '';
    } else {
      this.successMessage = message;
      this.errorMessage = '';
    }

    // Set a timeout to clear the message after 3 seconds
    this.messageTimeout = setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }


}
