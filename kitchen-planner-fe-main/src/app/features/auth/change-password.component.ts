import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthenticationApi } from '../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../shared/loader/loader.service';
import { NotificationService } from '../../shared/notification.service';
import { UserService } from '../../shared/user.service';
import { NavbarComponent } from "../../shared/navbar/navbar.component";

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    NavbarComponent
],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;

  constructor(private fb: FormBuilder, private loaderService: LoaderService, private authApi: AuthenticationApi, private notificationService: NotificationService,
    private readonly userService: UserService
  ) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check password match
  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.changePasswordForm.valid) {
      const { currentPassword, newPassword } = this.changePasswordForm.value;
      console.log('Change password request:', { currentPassword, newPassword });
      this.loaderService.show();
      this.authApi.authChangePasswordPost({ currentPassword, newPassword }).subscribe({
        next: () => {
          this.loaderService.hide();
          this.notificationService.show('Password changed successfully!');
          setTimeout(() => {
            this.userService.logout(); // Ensure user is logged out after password change
            window.location.href = '/login';
          }, 5000);
        },
        error: (error) => {
          this.loaderService.hide();
          this.notificationService.show('Failed to change password. Please try again.', 'error');
          console.error('Error changing password:', error);
        }
      });
      this.changePasswordForm.reset();
    }
  }
}
