import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { UserService } from '../../../shared/user.service';
import { MatDialog } from '@angular/material/dialog';
import { AddKitchenRulesComponent } from './add-kitchen-rules/add-kitchen-rules.component';
import { MatIconModule } from "@angular/material/icon";
import { KitchenRulesApi } from '../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../shared/loader/loader.service';
import { NotificationService } from '../../../shared/notification.service';

@Component({
  standalone: true,
  selector: 'app-kitchen-rules',
  templateUrl: './kitchen-rules.component.html',
  styleUrls: ['./kitchen-rules.component.css'],
  imports: [CommonModule, NavbarComponent, MatIconModule],
})
export class KitchenRulesComponent implements OnInit {
  rules:any[] = [];
  private ruleId = '';
  isAdmin: boolean = false;

  constructor(private readonly userService: UserService, private readonly dialog:MatDialog,
    private readonly kitchenRulesApi: KitchenRulesApi, private readonly loaderService: LoaderService, private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.fetchKitchenRules();
    const user = this.userService.getUserInfo();
    if (user && user.role === 'admin') {
      this.isAdmin = true;
    }
  }

    openAddRuleDialog() {
    // Open a dialog for adding a new rule
    const dialogRef = this.dialog.open(AddKitchenRulesComponent, {
      width: '800px',
      height: '800px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.rules.push(result);
      }
    });
  }

  openEditRulesDialog() {
    const dialogRef = this.dialog.open(AddKitchenRulesComponent, {
      width: '800px',
      height: '800px',
      data: { rules: [...this.rules], mode: 'edit', ruleId: this.ruleId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.rules = result;
      }
    });
  }

  private fetchKitchenRules() {
    this.loaderService.show();
    this.kitchenRulesApi.kitchenRulesMyKitchenGet().subscribe({
      next: (response) => {
        this.loaderService.hide();
        this.rules = response.data?.rules || [];
        this.ruleId = response.data?._id || '';
      },
      error: (err) => {
        this.loaderService.hide();
        this.notificationService.show('Failed to fetch kitchen rules. Please try again.', 'error');
        console.error('Error fetching kitchen rules:', err);
      }
    });
  }
}
