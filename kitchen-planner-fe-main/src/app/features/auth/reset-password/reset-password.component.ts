import { Component, OnInit } from '@angular/core';
import { AuthenticationApi } from '../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../shared/loader/loader.service';
import { NotificationService } from '../../../shared/notification.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  password: string = '';
  token: string = '';
  constructor(private readonly loaderService: LoaderService, private readonly authApi: AuthenticationApi, 
    private readonly notificationService: NotificationService, private route: ActivatedRoute) { }

    ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token')!;
    if(!this.token){
      this.notificationService.show('Invalid or missing token. Please request a new password reset.','error');
      setTimeout(() => {
        window.location.href = '/login';
      }, 5000);
    }
  }

  resetPassword() {
    if (!this.password) {
      alert('Please enter your new password.');
      return;
    }

    this.loaderService.show();
    this.authApi.authResetPasswordTokenPost(this.token,{newPassword:this.password}).subscribe({
      next: () => {
        this.loaderService.hide();
        this.notificationService.show('Password successfully reset!');
        setTimeout(() => {
          window.location.href = '/login';
        }, 5000);
      },
      error: (error) => {
        this.loaderService.hide();
        if(error.status === 400){
          this.notificationService.show('Invalid or expired token. Please request a new password reset.','error');
        } else {
        this.notificationService.show('Failed to reset the password. Please try again.','error');
        }
        console.error('Error updating the new password:', error);
      }
    });
    this.password = '';
  }
}
