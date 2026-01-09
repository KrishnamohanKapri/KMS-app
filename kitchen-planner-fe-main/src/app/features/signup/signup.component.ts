import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../shared/notification.service';
import { LoaderService } from '../../shared/loader/loader.service';
import { AuthenticationApi, UserRegistration } from '../../api/api-kms-planner-masterdata';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule]
  
})
export class SignupComponent {
  signupForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private notificationService: NotificationService,
    private loaderService: LoaderService,
    private authApi: AuthenticationApi
  ) {
    this.signupForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  signup() {
    if (this.signupForm.valid) {
      const payload = {
        firstName: this.signupForm.value.firstName,
        lastName: this.signupForm.value.lastName,
        email: this.signupForm.value.email,
        password: this.signupForm.value.password,
        role: UserRegistration.RoleEnum.User // Default role for new users
      }
      this.loaderService.show();
      this.authApi.authRegisterPost(payload).subscribe({
        next: (response) => {
          this.loaderService.hide();
          if (response && response.success) {
            this.notificationService.show('Signup successful! Please log in.');
            this.router.navigate(['/login']);
          } else {
            this.notificationService.show('Signup failed. Please try again.');
          }
        },
        error: (error) => {
          this.loaderService.hide();
          this.notificationService.show('Signup failed. Please check your details.');
        }
      });
    }
  }
}