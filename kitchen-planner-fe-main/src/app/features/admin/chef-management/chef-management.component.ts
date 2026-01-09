import { Component, Inject, NgModule } from '@angular/core';
import { UserDetailDialogComponent } from './dialog/user-detail-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { ChefManagementApi } from '../../../api/api-kms-planner-masterdata';
import { NotificationService } from '../../../shared/notification.service';
import { LoaderService } from '../../../shared/loader/loader.service';

@Component({
  selector: 'app-chef-management',
  imports: [CommonModule,FormsModule],
  templateUrl: './chef-management.component.html',
  styleUrl: './chef-management.component.css'
})
export class ChefManagementComponent {
  searchTerm = '';
  page = 1;
  pageSize = 5;

  chefList = [];

  get filterChefs(): any[]  {
    return this.chefList
      .filter((chef:any) =>
        (chef.firstName + ' ' + chef.lastName + ' ' + chef.email).toLowerCase().includes(this.searchTerm.toLowerCase()))
      .slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
  }

  // openUserDetail(user: any) {
  //   this.dialog.open(UserDetailDialogComponent, {
  //     data: user,
  //     width: '500px'
  //   });
  // }

  toggleActive(user: any) {
    user.isActive = !user.isActive;
  }
  
  constructor(private readonly chefApi: ChefManagementApi, private readonly notificationService: NotificationService,
                private readonly loaderService: LoaderService) {}
  
    ngOnInit(): void {
      this.getChefs();
    }
  
    private getChefs(){
      this.loaderService.show();
      this.chefApi.chefGet().subscribe({
        next: (response: any) => {
          if (response.success) {
            this.chefList = response.data || [];
        }
          this.loaderService.hide();
      },
        error: (err) => {
          this.loaderService.hide();
          this.notificationService.show('Failed to fetch chefs');
        }
  })
}
    
}
