import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AllergenListResponseDataInner, Category, EntitiesApi, IngredientListResponseDataInner, MealsApi, TagListResponseDataInner } from '../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../shared/loader/loader.service';
import { NotificationService } from '../../../shared/notification.service';

@Component({
  selector: 'app-add-meals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    RouterModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  templateUrl: './add-meals.component.html',
  styleUrls: ['./add-meals.component.css']
})
export class AddMealComponent implements OnInit {
  mealForm!: FormGroup;
  newIngredientForm!: FormGroup;
  isViewMode: boolean = true;
  mode: 'add' | 'edit' | 'view' = 'add';
  mealId: string | null = null;
  loading = false;
  mealData: any = {};
  categories: Category[] = [];
  allergens: AllergenListResponseDataInner[] = [];
  ingredients: IngredientListResponseDataInner[] = [];
  tags: TagListResponseDataInner[] = [];
  dataSource = new MatTableDataSource<FormGroup>();
  displayedColumns: string[] = ['name', 'quantity', 'unit', 'actions'];
  @ViewChildren(MatFormField) formFields!: QueryList<MatFormField>;

  newIngredientName = '';
  newIngredientQuantity = '';
  newIngredientUnit = '';
  uploadedFileName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private readonly mealsApi: MealsApi,
    private readonly entitiesApi: EntitiesApi,
    private readonly loaderService: LoaderService,
    private readonly notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.createForm();
    this.fetchCategories();
    this.fetchAllergens();
    this.fetchTags();
    this.fetchIgredients();

    this.newIngredientForm = this.fb.group({
      name: [''],
      quantity: [''],
      unit: [''],
    });
    this.route.queryParams.subscribe(params => {
      this.mode = params['mode'] || 'add';
      this.mealId = params['id'] ? params['id'] : null;

      if (this.mode !== 'add' && this.mealId) {
        this.loadMeal(this.mealId)
      }

      if (this.mode === 'view') {
        this.mealForm.disable();
      } else {
        this.mealForm.enable();
      }
    });
  }

  createForm() {
    this.mealForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      servings: ['', Validators.required],
      category: ['', Validators.required],
      price: ['', Validators.required],
      tags: [[]],
      ingredients: this.fb.array([]),
      allergens: [[]],
      images: [null, Validators.required],
      cookTime: ['',Validators.required],
      servingEnd:['',Validators.required],
      servingStart :['',Validators.required],
      mealType :['',Validators.required]
    });
  }

   get ingredientsArray(): FormArray {
    return this.mealForm.get('ingredients') as FormArray;
  }

  updateDataSource() {
  // Cast controls to FormGroup[] for TypeScript
  this.dataSource.data = this.ingredientsArray.controls as FormGroup[];
}

  addIngredientManually() {
    const { name, quantity, unit } = this.newIngredientForm.value;
    if (!name) return;

    this.ingredientsArray.push(
      this.fb.group({
        name: [name],
        quantity: [quantity || ''],
        unit: [unit || ''],
      })
    );

    this.newIngredientForm.reset();
    this.updateDataSource(); // <-- important
  }

  removeIngredient(index: number) {
    this.ingredientsArray.removeAt(index);
    this.updateDataSource(); // <-- important
  }

  loadMeal(id: string) {
    this.loaderService.show();
    this.mealsApi.mealsMealIdGet(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loaderService.hide();
          this.mealForm = this.buildMealForm(response.data)
          this.mealData = response.data;
        }
      },
      error: () => {
        this.loaderService.hide();
        this.notificationService.show('Failed to fetch the meal details', 'error');
      }
    })
  }

  saveMeal() {
    if (this.mode === 'view') return;
    console.log(this.mealForm)
    if (this.mealForm.invalid) {
      alert('Please fill required fields');
      return;
    }

    this.loaderService.show();
    const formValue = this.mealForm.value;

    if (this.mode === 'edit' && this.mealData?._id) {
      this.mealsApi.mealsMealIdPut(
        this.mealData._id, // Meal ID
        formValue.name,
        formValue.description,
        formValue.servings,
        formValue.price,
        undefined, // stock
        formValue.cookTime,
        formValue.servingEnd,
        formValue.servingStart,
        formValue.mealType,
        undefined, // discount
        formValue.category,
        JSON.stringify(formValue.tags || []),
        JSON.stringify(formValue.ingredients.map((i: any) => i.name)),
        JSON.stringify(formValue.ingredients.map((i: any) => i.quantity)),
        JSON.stringify(formValue.ingredients.map((i: any) => i.unit)),
        JSON.stringify(formValue.allergens || []),
        JSON.stringify(this.mealData.images || []), 
        formValue.images 
      ).subscribe({
        next: () => {
          this.loaderService.hide();
          this.notificationService.show('Meal updated!');
          this.router.navigate(['/admin/meal-manager']);
        },
        error: (err) => {
          this.loaderService.hide();
          this.notificationService.show('Failed to update meal due to: '+ err.error.message, 'error');
        }
      });
    } else {
      this.mealsApi.mealsPost(
        formValue.name,
        formValue.description,
        formValue.servings,
        formValue.cookTime,
        formValue.servingEnd,
        formValue.servingStart,
        formValue.mealType,
        formValue.price,
        formValue.category,
        JSON.stringify(formValue.tags || []),
        JSON.stringify(formValue.ingredients.map((i: any) => i.name)),
        JSON.stringify(formValue.allergens || []),
        JSON.stringify(formValue.ingredients.map((i: any) => i.quantity)),
        JSON.stringify(formValue.ingredients.map((i: any) => i.unit)),
        formValue.images, // must be File/Blob
      ).subscribe({
        next: () => {
          this.loaderService.hide();
          this.notificationService.show('Meal added!');
          this.router.navigate(['/admin/meal-manager']);
        },
        error: (err) => {
          this.loaderService.hide();
          this.notificationService.show(err.error.message, 'error');
        }
      });
    }
  }

  goBackToMeals() {
    this.router.navigate(['/admin/meal-manager']);
  }


  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.mealForm.patchValue({ images: file });
      this.mealForm.get('images')?.updateValueAndValidity();

      this.uploadedFileName = file.name;
    }
  }

  removeImage() {
    this.mealForm.patchValue({ images: null });
    this.mealForm.get('images')?.updateValueAndValidity();
    this.uploadedFileName = null;
  }

  onIngredientSelected(value: string) {
    const selectedIngredient: any | undefined = this.ingredients.find(i => i.name === value);

    if (selectedIngredient && selectedIngredient.baseUnit) {
      this.newIngredientForm.get('unit')?.setValue(selectedIngredient.baseUnit);
    } else {
      this.newIngredientForm.get('unit')?.setValue('');
    }
  }


  private buildMealFormData(formValue: any): FormData {
    const formData = new FormData();

    // Basic fields
    formData.append('title', formValue.name);
    formData.append('description', formValue.description);
    formData.append('servings', formValue.servings.toString());
    formData.append('price', formValue.price.toString());
    formData.append('category', formValue.category);

    // Tags (convert array → JSON string)
    if (formValue.tags && formValue.tags.length) {
      formData.append('tags', JSON.stringify(formValue.tags));
    }

    // Ingredients (convert to schema)
    if (formValue.ingredients && formValue.ingredients.length) {
      const ingredientNames = formValue.ingredients.map((i: any) => i.name.name); // just the name
      const ingredientQuantities = formValue.ingredients.map((i: any) => i.quantity);
      const ingredientUnits = formValue.ingredients.map((i: any) => i.unit);

      formData.append('ingredients', JSON.stringify(ingredientNames));
      formData.append('ingredientQuantities', JSON.stringify(ingredientQuantities));
      formData.append('ingredientUnits', JSON.stringify(ingredientUnits));
    }


    // Allergens
    if (formValue.allergens && formValue.allergens.length) {
      formData.append('allergens', JSON.stringify(formValue.allergens));
    }

    // Images
    if (formValue.images && formValue.images.length) {
      formValue.images.forEach((file: File) => {
        formData.append('images', file, file.name);
      });
    }

    return formData;
  }


  private fetchTags() {
    this.entitiesApi.entitiesTagsGet().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.tags = response.data || [];
        }
      },
      error: () => {
        this.notificationService.show('Failed to fetch tags');
      }
    });
  }

  private fetchCategories() {
    this.mealsApi.mealsCategoryGetGet().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.categories = response.data || [];
        }
      },
      error: () => {
        this.notificationService.show('Failed to fetch categories');
      }
    });
  }

  private fetchAllergens() {
    this.loaderService.show();
    this.entitiesApi.entitiesAllergensGet().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.allergens = response.data || [];
        }
        this.loaderService.hide();
      },
      error: () => {
        this.notificationService.show('Failed to fetch allergens');
        this.loaderService.hide();
      }
    });
  }

  private fetchIgredients() {
    this.entitiesApi.entitiesIngredientsGet().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.ingredients = response.data || [];
        }
      },
      error: () => {
        this.notificationService.show('Failed to fetch ingredients');
      }
    });
  }

  private buildMealForm(meal: any): FormGroup {
    return this.fb.group({
      name: [meal.title || ''],
      description: [meal.description || ''],
      servings: [meal.servings || 1],
      price: [meal.price || 0],
      category: [meal.category?._id || ''],

      // Use FormControl with array value for multi-select
      tags: this.fb.control((meal.tags || []).map((t: any) => t.name)),
      allergens: this.fb.control((meal.allergens || []).map((a: any) => a.name)),

      ingredients: this.fb.array(
        (meal.ingredients || []).map((ing: any) =>
          this.fb.group({
            name: [ing.ingredient.name],
            quantity: [ing.quantity || 0],
            unit: [ing.unit || '']
          })
        )
      ),
      images: [[]]
    });
  }

public setMealsServingTime(value: 'breakfast' | 'lunch' | 'dinner') {
  switch (value) {
    case 'breakfast':
      this.mealForm.patchValue({
        servingStart: '06:00',
        servingEnd: '09:00'
      });
      break;

    case 'lunch':
      this.mealForm.patchValue({
        servingStart: '11:30',
        servingEnd: '15:00'
      });
      break;

    case 'dinner':
      this.mealForm.patchValue({
        servingStart: '18:30',
        servingEnd: '21:30'
      });
      break;
  }
}


}
