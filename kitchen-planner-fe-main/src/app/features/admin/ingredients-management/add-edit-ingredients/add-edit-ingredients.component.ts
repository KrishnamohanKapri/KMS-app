import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { EntitiesApi } from '../../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../../shared/loader/loader.service';
import { NotificationService } from '../../../../shared/notification.service';

@Component({
  selector: 'app-add-edit-ingredients',
  imports: [MatInputModule, ReactiveFormsModule, NgIf, MatButtonModule, MatDialogModule, MatSelectModule, CommonModule],
  templateUrl: './add-edit-ingredients.component.html',
  styleUrl: './add-edit-ingredients.component.css'
})
export class AddEditIngredientsComponent {
  ingredientForm!: FormGroup;

  allStates: { value: string; label: string }[] = [
    { value: 'raw', label: 'Raw' },
    { value: 'peeled', label: 'Peeled' },
    { value: 'frozen', label: 'Frozen' },
    { value: 'cooked', label: 'Cooked' },
    { value: 'dried', label: 'Dried' },
    { value: 'chopped', label: 'Chopped' },
    { value: 'sliced', label: 'Sliced' },
    { value: 'boiled', label: 'Boiled' },
    { value: 'grated', label: 'Grated' },
    { value: 'powdered', label: 'Powdered' },
    { value: 'whole', label: 'Whole' },
    { value: 'ground', label: 'Ground' },
    { value: 'roasted', label: 'Roasted' },
    { value: 'blanched', label: 'Blanched' },
    { value: 'marinated', label: 'Marinated' },
    { value: 'smoked', label: 'Smoked' },
    { value: 'pickled', label: 'Pickled' },
    { value: 'fresh', label: 'Fresh' },
    { value: 'canned', label: 'Canned' },
    { value: 'steamed', label: 'Steamed' },
    { value: 'fermented', label: 'Fermented' },
    { value: 'pasteurized', label: 'Pasteurized' },
    { value: 'baked', label: 'Baked' },
    { value: 'minced', label: 'Minced' },
    { value: 'shelled', label: 'Shelled' },
    { value: 'deshelled', label: 'Deshelled' },
    { value: 'filleted', label: 'Filleted' },
    { value: 'boneless', label: 'Boneless' },
    { value: 'with-bone', label: 'With Bone' },
    { value: 'skimmed', label: 'Skimmed' },
    { value: 'condensed', label: 'Condensed' },
    { value: 'evaporated', label: 'Evaporated' },
    { value: 'powder', label: 'Powder' },
    { value: 'liquid', label: 'Liquid' },
    { value: 'concentrated', label: 'Concentrated' },
    { value: 'other', label: 'Other' }
  ];

  // Mapping of category to allowed states
  categoryStatesMap: { [key: string]: string[] } = {
    vegetable: ['raw', 'peeled', 'frozen', 'cooked', 'dried', 'chopped', 'sliced', 'boiled', 'grated', 'powdered', 'whole', 'roasted', 'blanched', 'pickled', 'fresh', 'canned', 'steamed', 'fermented', 'baked', 'minced', 'other'],
    fruit: ['raw', 'peeled', 'frozen', 'cooked', 'dried', 'chopped', 'sliced', 'boiled', 'grated', 'powdered', 'whole', 'roasted', 'blanched', 'pickled', 'fresh', 'canned', 'steamed', 'fermented', 'baked', 'minced', 'other'],
    meat: ['raw', 'frozen', 'cooked', 'dried', 'chopped', 'sliced', 'boiled', 'whole', 'roasted', 'marinated', 'smoked', 'minced', 'filleted', 'boneless', 'with-bone', 'other'],
    dairy: ['fresh', 'pasteurized', 'powdered', 'liquid', 'condensed', 'evaporated', 'skimmed', 'fermented', 'other'],
    grain: ['raw', 'cooked', 'dried', 'powdered', 'whole', 'ground', 'roasted', 'fermented', 'baked', 'other'],
    spice: ['raw', 'dried', 'powdered', 'whole', 'ground', 'roasted', 'other'],
    herb: ['raw', 'dried', 'chopped', 'whole', 'fresh', 'other'],
    other: ['raw', 'other']
  };

  states: { value: string; label: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditIngredientsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit'; ingredient?: any },
    private entitiesApi: EntitiesApi,
    private loaderService: LoaderService,
    private notificationService: NotificationService
  ) {}

  categories = [
  { value: 'vegetable', label: 'Vegetable' },
  { value: 'fruit', label: 'Fruit' },
  { value: 'meat', label: 'Meat' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'grain', label: 'Grain' },
  { value: 'spice', label: 'Spice' },
  { value: 'herb', label: 'Herb' },
  { value: 'other', label: 'Other' }
];



baseUnits: { value: string; label: string }[] = [
  { value: 'g', label: 'Grams (g)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'l', label: 'Liters (l)' },
  { value: 'tbsp', label: 'Tablespoon (tbsp)' },
  { value: 'tsp', label: 'Teaspoon (tsp)' },
  { value: 'cup', label: 'Cup' },
  { value: 'piece', label: 'Piece' },
  { value: 'slice', label: 'Slice' },
  { value: 'whole', label: 'Whole' }
];

packagingUnits: { value: string; label: string }[] = [
  { value: 'sack', label: 'Sack' },
  { value: 'bag', label: 'Bag' },
  { value: 'box', label: 'Box' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'can', label: 'Can' },
  { value: 'jar', label: 'Jar' },
  { value: 'pack', label: 'Pack' },
  { value: 'bundle', label: 'Bundle' },
  { value: 'carton', label: 'Carton' },
  { value: 'piece', label: 'Piece' },
  { value: 'whole', label: 'Whole' }
];


  ngOnInit() {
    this.ingredientForm = this.fb.group({
      name: [this.data.ingredient?.name?.split('-')[0] || '', [Validators.required, Validators.maxLength(100)]],
      state: [this.data.ingredient?.state || ''],
      description: [this.data.ingredient?.description || '', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      category: [this.data.ingredient?.category || '', Validators.required],
      baseUnit: [this.data.ingredient?.baseUnit || 'g', Validators.required],
      packagingUnit: [this.data.ingredient?.packagingUnit || 'piece', Validators.required],
      packagingQuantity: [this.data.ingredient?.packagingQuantity || 1, [Validators.min(0.01), Validators.max(10000)]],
      costPerPackage: [this.data.ingredient?.costPerPackage || 0, [Validators.min(0), Validators.max(9999.99)]],
      reorderLevel: [this.data.ingredient?.reorderLevel || 10, [Validators.min(0), Validators.max(10000)]],
      isActive: [this.data.ingredient?.isActive ?? true],
    });

    // Set initial states based on category
    const initialCategory = this.ingredientForm.get('category')?.value;
    this.updateStates(initialCategory);

    // Listen for category changes
    this.ingredientForm.get('category')?.valueChanges.subscribe((cat) => {
      this.updateStates(cat);
      // Reset state if not in new list
      if (!this.states.find(s => s.value === this.ingredientForm.get('state')?.value)) {
        this.ingredientForm.get('state')?.setValue('');
      }
    });
  }

  updateStates(category: string) {
    const allowed = this.categoryStatesMap[category] || this.categoryStatesMap['other'];
  this.states = this.allStates.filter((s: { value: string; label: string }) => allowed.includes(s.value));
  }

  // ✅ Getters for template
  get nameCtrl() { return this.ingredientForm.get('name'); }
  get stateCtrl() { return this.ingredientForm.get('state'); }
  get descriptionCtrl() { return this.ingredientForm.get('description'); }
  get categoryCtrl() { return this.ingredientForm.get('category'); }
  get baseUnitCtrl() { return this.ingredientForm.get('baseUnit'); }
  get packagingUnitCtrl() { return this.ingredientForm.get('packagingUnit'); }
  get packagingQuantityCtrl() { return this.ingredientForm.get('packagingQuantity'); }
  get costPerPackageCtrl() { return this.ingredientForm.get('costPerPackage'); }
  get reorderLevelCtrl() { return this.ingredientForm.get('reorderLevel'); }

  onSubmit() {
    if (this.ingredientForm.invalid) return;

    this.loaderService.show();
    const formValue = this.ingredientForm.value;
    const ingredientData = {
      ...formValue,
      name: `${formValue.name}-${formValue.state}`,
    };

    if (this.data.mode === 'edit') {
      this.entitiesApi.entitiesIngredientsIngredientIdPut(this.data.ingredient._id, ingredientData).subscribe({
        next: () => {
          this.loaderService.hide();
          this.notificationService.show('Ingredient updated successfully!');
          this.dialogRef.close('saved');
        },
        error: (error) => {
          this.loaderService.hide();
          this.notificationService.show('Failed to update ingredient: ' + error.message);
        }
      });
    } else {
      this.entitiesApi.entitiesIngredientsPost(ingredientData).subscribe({
        next: () => {
          this.loaderService.hide();
          this.notificationService.show('Ingredient added successfully!');
          this.dialogRef.close('saved');
        },
        error: (error) => {
          this.loaderService.hide();
          this.notificationService.show('Failed to add ingredient: ' + error.error.message);
        }
      });
    }
  }
}
