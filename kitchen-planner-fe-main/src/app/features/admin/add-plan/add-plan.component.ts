import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../shared/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../shared/user.service';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { ChefManagementApi, MealPlanningApi, MealsApi } from '../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../shared/loader/loader.service';
import { MatCardModule } from "@angular/material/card";

@Component({
  selector: 'app-add-plan',
  templateUrl: './add-plan.component.html',
  styleUrl: './add-plan.component.css',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    NgIf,
    MatInputModule,
    CommonModule,
    MatCardModule
]
})
export class AddPlanComponent implements OnInit {
  planForm!: FormGroup;
  mode: 'add' | 'edit' | 'view' = 'add';
  planId: string | null = null;

  mealsList: any[] = [];
  staffList: Array<{ id: string, name: string }> = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private notification: NotificationService,
    private route: ActivatedRoute,
    private userService: UserService,
    private readonly mealsApi: MealsApi,
    private loaderService: LoaderService,
    private readonly chefApi: ChefManagementApi,
    private readonly mealPlannerApi: MealPlanningApi,

  ) { }

  ngOnInit() {
    this.getStaffList();
    this.planForm = this.fb.group({
      type: ['week', Validators.required],
      mealTimeType: [Validators.required],
      date: [null],
      startDate: [null],
      endDate: [null],
      meals: this.fb.array([]),
      assignedStaff: [[], Validators.required],
      notes: ['']
    });

    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      const mode = params['mode'] as 'add' | 'edit' | 'view';
      this.planId = id;
      this.mode = mode || 'add';
      if ((this.mode === 'edit' || this.mode === 'view') && id) {
        this.loadPlan(id);
      }
      if (this.mode === 'view') this.planForm.disable();
    });

    this.planForm.get('type')?.valueChanges.subscribe(type => {
      if (type === 'day') {
        this.planForm.get('date')?.setValidators([Validators.required]);
        this.planForm.get('startDate')?.clearValidators();
        this.planForm.get('endDate')?.clearValidators();
      } else {
        this.planForm.get('date')?.clearValidators();
        this.planForm.get('startDate')?.setValidators([Validators.required]);
        this.planForm.get('endDate')?.setValidators([Validators.required]);
      }
      this.planForm.get('date')?.updateValueAndValidity();
      this.planForm.get('startDate')?.updateValueAndValidity();
      this.planForm.get('endDate')?.updateValueAndValidity();
    });
  }

  get mealsFormArray() {
    return this.planForm.get('meals') as FormArray;
  }

  addMeal() {
    this.mealsFormArray.push(
      this.fb.group({
        mealId: ['', Validators.required],
        servings: [1, [Validators.required, Validators.min(1)]]
      })
    );
  }

  removeMeal(index: number) {
    this.mealsFormArray.removeAt(index);
  }

  loadPlan(id: string) {
    this.loaderService.show();
    this.mealPlannerApi.planningMealPlansMealPlanIdGet(id).subscribe({
      next: (response: any) => {
        const plan = response.data;
        this.planForm.patchValue({
          type: plan.type,
          date: plan.date ? new Date(plan.date) : null,
          startDate: plan.startDate ? new Date(plan.startDate) : null,
          endDate: plan.endDate ? new Date(plan.endDate) : null,
          assignedStaff: plan.assignedStaff?.map((staff: any) => staff._id) || [],
          mealTimeType: plan.mealTimeType || '',
          notes: plan.notes || ''
        });
        this.mealsFormArray.clear();
        if (plan.meals && Array.isArray(plan.meals)) {
          plan.meals.forEach((meal: any) => {
            this.mealsFormArray.push(this.fb.group({
              mealId: [meal.mealId._id, Validators.required],
              servings: [meal.servings, [Validators.required, Validators.min(1)]]
            }));
          });
        }
        this.loaderService.hide();
      },
      error: (error) => {
        this.notification.show('Failed to load Meal Plan', 'error');
        this.loaderService.hide();
      }
    });
  }

  savePlan() {
    if (this.planForm.invalid) return;
    const value = this.planForm.value;
    this.loaderService.show();
    const payload = {
      type: value.type,
      date: value.type === 'day' ? this.formatDate(value.date) : undefined,
      startDate: value.type === 'week' ? this.formatDate(value.startDate) : undefined,
      endDate: value.type === 'week' ? this.formatDate(value.endDate) : undefined,
      mealTimeType: value.mealTimeType,
      meals: value.meals.map((meal: any) => ({
        mealId: meal.mealId,
        servings: meal.servings
      })),
      assignedStaff: value.assignedStaff,
      notes: value.notes,
      createdBy: this.userService.getUserInfo()!._id ?? '',
    };
    if (this.mode === 'edit' && this.planId) {
      this.mealPlannerApi.planningMealPlansMealPlanIdPut(this.planId, payload).subscribe({
        next: () => {
          this.notification.show('Meal Plan updated successfully!');
          this.loaderService.hide();
          this.router.navigate(['/admin/weekly-planner']);
        },
        error: (error) => {
          this.notification.show(error.error.message, 'error');
          this.loaderService.hide();
        }
      });
    } else {
      this.mealPlannerApi.planningMealPlansPost(payload).subscribe({
        next: () => {
          this.notification.show('Meal Plan created successfully!');
          this.loaderService.hide();
          this.router.navigate(['/admin/weekly-planner']);
        },
        error: (error) => {
          this.notification.show(error.error.message, 'error');
          this.loaderService.hide();
        }
      });
    }
  }

  public getMealsList(value: 'breakfast' | 'lunch' | 'dinner') {
    this.loaderService.show();
    this.mealsApi.mealsGet(1, 100, value).subscribe({
      next: (response) => {
        this.mealsList = response.data?.map(meal => ({
          id: meal._id,
          name: meal.title
        })) ?? [];
        this.loaderService.hide();
      },
      error: (error) => {
        this.notification.show('Failed to load meals', 'error');
        this.loaderService.hide();
      }
    });
  }

  private getStaffList() {
    this.chefApi.chefGet().subscribe({
      next: (response:any) => {
        this.staffList = response.data.map((s:any) => ({ id: s._id, name: s.firstName + ' ' + s.lastName }));
      },
      error: () => {
        this.notification.show('Failed to load staff', 'error');
      }
    });
  }

 private formatDate(date?: string | Date | null): string | undefined {
  if (!date) return undefined;

  const d = typeof date === 'string' ? new Date(date) : date;

  // Use local timezone, not UTC
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

}
