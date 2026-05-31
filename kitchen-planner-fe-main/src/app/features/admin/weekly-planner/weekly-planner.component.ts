import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table';
import { MealPlanningApi, PlanningMealPlansMealPlanIdDuplicatePostRequest } from '../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../shared/loader/loader.service';
import { NotificationService } from '../../../shared/notification.service';
import { DialogDuplicateMealsComponent } from './dialog-duplicate-meals/dialog-duplicate-meals.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-weekly-planner',
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule
  ],
  templateUrl: './weekly-planner.component.html',
  styleUrl: './weekly-planner.component.css'
})
export class WeeklyPlannerComponent implements OnInit {
  searchTerm = '';

  displayedColumns: string[] = ['type','startDate', 'endDate', 'meals', 'staff', 'actions'];

  mealPlans:any = [];

  dataSource = new MatTableDataSource(this.mealPlans);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private router: Router, private readonly mealPlannerApi: MealPlanningApi, private readonly loaderService: LoaderService, private readonly notificationService: NotificationService, private dialog: MatDialog,) {}

  ngOnInit(): void {
    this.loadMealPlans();
  }

  private loadMealPlans(){
    this.loaderService.show();
    this.mealPlannerApi.planningMealPlansGet().subscribe({
      next: (response) => {
        this.mealPlans = response.data;
        this.dataSource.data = this.mealPlans;
        this.loaderService.hide();
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        this.notificationService.show('Failed to load meal plans', 'error');
        this.loaderService.hide();
      }
    });
  }

  applyFilter() {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  addPlan() {
    this.router.navigate(['/admin/add-plan']);
  }

  editPlan(planId: number) {
    this.router.navigate(['/admin/add-plan'], {
      queryParams: { id: planId, mode: 'edit' }
    });
  }

  viewPlan(planId: number) {
    this.router.navigate(['/admin/add-plan'], {
      queryParams: { id: planId, mode: 'view' }
    });
  }

  deletePlan(planId: string) {
    if (confirm('Are you sure you want to delete this plan?')) {
      this.loaderService.show();
      this.mealPlannerApi.planningMealPlansMealPlanIdDelete(planId).subscribe({
        next: () => {
          this.notificationService.show('Meal Plan deleted successfully');
          this.loadMealPlans();
          this.loaderService.hide();
        },
        error: (error) => {
          this.loaderService.hide();
          this.notificationService.show('Failed to delete Meal Plan', 'error');
        },
        complete: () => {
          this.loaderService.hide();
        }
      });
    }
  }


  duplicatePlan(plan: any) {
    const dialogRef = this.dialog.open(DialogDuplicateMealsComponent, {
      width: '600px',
      maxWidth: 'none',
      height:'400px',
      maxHeight: '90vh',
      data: { plan }
    });
    console.log('Dialog opened with plan:', plan);
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with result:', result);
      if (!result) return; // If dialog was closed without action
      // If result is valid, proceed with duplication
      if (result) {
        const payload: PlanningMealPlansMealPlanIdDuplicatePostRequest = {
          newStartDate: result.startDate,
          newEndDate: result.endDate,
          newDate: result.date,
        };
        this.duplicatePlanApi(plan._id, payload);
      }
    });
}

  private duplicatePlanApi(planId: string, payload: PlanningMealPlansMealPlanIdDuplicatePostRequest) {
    this.loaderService.show();
    this.mealPlannerApi.planningMealPlansMealPlanIdDuplicatePost(planId, payload).subscribe({
      next: () => {
        this.notificationService.show('Meal Plan duplicated successfully');
        this.loaderService.hide();
        this.loadMealPlans();
      },
      error: (error) => {
        this
        this.notificationService.show('Failed to duplicate Meal Plan', 'error');
      },
      complete: () => {
        this.loaderService.hide();
      }
    });
  }
}
