import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoaderService } from '../../shared/loader/loader.service';
import { AuthenticationApi } from '../../api/api-kms-planner-masterdata';
import { NotificationService } from '../../shared/notification.service';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class ForgotPasswordComponent {
  email = '';

  constructor(private readonly loaderService: LoaderService, private readonly authApi: AuthenticationApi, private readonly notificationService: NotificationService) {}

  sendResetLink() {
    if (!this.email) {
      alert('Please enter your email.');
      return;
    }

    this.loaderService.show();
    this.authApi.authForgotPasswordPost({email:this.email}).subscribe({
      next: () => {
        this.loaderService.hide();
        this.notificationService.show('Password reset link sent successfully!');
        setTimeout(() => {
          window.location.href = '/login';
        }, 5000);
      },
      error: (error) => {
        this.loaderService.hide();
        this.notificationService.show('Failed to send password reset link. Please try again.','error');
        console.error('Error sending reset link:', error);
      }
    });
    this.email = '';
  }
}
