import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { Router, RouterModule } from '@angular/router';
import { UserService, Role } from '../../shared/user.service'
import { AuthenticationApi, ChefManagementApi, Customer, CustomerManagementApi } from '../../api/api-kms-planner-masterdata';
import { NotificationService } from '../../shared/notification.service';
import { LoaderService } from '../../shared/loader/loader.service';
@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private router: Router, private userService: UserService, private loginApi: AuthenticationApi,
    private notificationService: NotificationService, private loaderServie: LoaderService,
    private customerApi: CustomerManagementApi, private readonly chefApi: ChefManagementApi,) { }

  login() {
    this.loaderServie.show();
    this.loginApi.authLoginPost({ email: this.username, password: this.password }).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        if (response && response.success) {
          localStorage.setItem('token', response.data!.token!);
          localStorage.setItem('user', JSON.stringify(response.data?.user));
          this.notificationService.show('Login successful!');
          if (response.data?.user && response.data?.user?.role === 'user') {
            this.customerApi.customerUserUserIdGet(response.data.user._id!).subscribe({
              next: (customerResponse: any) => {
                this.loaderServie.hide();
                if (customerResponse) {
                  localStorage.setItem('preferences', JSON.stringify(customerResponse.data.preferences))
                  this.router.navigate(['/meals-list']);
                }
              },
              error: (error) => {

                this.loaderServie.hide();
                // No user profile exists, redirect to create profile
                this.router.navigate(['customer/customer-profile']);
                console.error('Error fetching customer data:', error);
              }
            });

          } else if (response.data?.user && response.data?.user?.role === 'admin') {
            this.loaderServie.hide();
            this.router.navigate(['admin/dashboard']);

          } else if (response.data?.user && response.data?.user?.role === 'chef') {
            this.chefApi.chefAttendanceMarkGet().subscribe({
              next: (response: any) => {
              }
            });
            this.loaderServie.hide();
            this.router.navigate(['chef/orders']);
          } else if (response.data?.user && response.data?.user?.role === 'rider') {
            this.loaderServie.hide();
            this.router.navigate(['rider/orders']);
          } else if (response.data?.user && response.data?.user?.role === 'employee') {
            this.loaderServie.hide();
            this.router.navigate(['employee/orders']);
          }
          else {
            this.loaderServie.hide();
            this.notificationService.show('Login failed. Please try again.', 'error');
          }
        }
      },
      error: (error) => {
        this.loaderServie.hide();
        this.notificationService.show('Login failed. Please check your credentials.', 'error');
      }
    });
  }
}

