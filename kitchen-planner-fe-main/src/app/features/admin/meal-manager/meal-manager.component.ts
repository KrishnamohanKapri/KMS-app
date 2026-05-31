import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MealsApi } from '../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../shared/loader/loader.service';
import { NotificationService } from '../../../shared/notification.service';

@Component({
  selector: 'app-meal-manager',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './meal-manager.component.html',
  styleUrl: './meal-manager.component.css'
})
export class MealsManagerComponent implements AfterViewInit {
  searchTerm = '';
  displayedColumns: string[] = ['title', 'category', 'tags', 'ingredients', 'actions'];

  meals: any = [];
  dataSource = new MatTableDataSource(this.meals);
  totalMeals = 0;
  pageSize = 10;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private router: Router, private readonly mealsApi: MealsApi, private readonly loaderService: LoaderService, private readonly notificationService: NotificationService) {}

  ngOnInit() {
    this.fetchMeals();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter() {
    // Optionally, you can implement server-side filtering here
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  addMeal() {
    // Later connect to your Meal Add form
    this.router.navigate(['/admin/add-meals']);
  }

  editMeal(id: number) {
    this.router.navigate(['/admin/add-meals'], { queryParams: { id, mode: 'edit' } });
  }

  viewMeal(id: number) {
    this.router.navigate(['/admin/add-meals'], { queryParams: { id, mode: 'view' } });
  }

  private fetchMeals() {
    this.loaderService.show();
    this.mealsApi.mealsGet(1, 1000).subscribe({
      next: (response) => {
        this.meals = response.data || [];
        this.dataSource.data = this.meals;
        this.totalMeals = this.meals.length;
        this.loaderService.hide();
      },
      error: () => {
        this.loaderService.hide();
        this.notificationService.show('Failed to load meals', 'error');
      }
    });
  }

  deleteMeal(id: string) {
    this.loaderService.show();
    this.mealsApi.mealsMealIdDelete(id).subscribe({
      next: () => {
        this.loaderService.hide();  
        this.notificationService.show('Meal deleted successfully', 'success');
  this.fetchMeals();
      },
      error: () => {
        this.loaderService.hide();  
        this.notificationService.show('Failed to delete meal', 'error');
      }
    });
  }

  
}
