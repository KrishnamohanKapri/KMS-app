import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { EntitiesApi, IngredientListResponseDataInner } from '../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../shared/loader/loader.service';
import { NotificationService } from '../../../shared/notification.service';
import { AddEditIngredientsComponent } from './add-edit-ingredients/add-edit-ingredients.component';

@Component({
  selector: 'app-ingredients-management',
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
  templateUrl: './ingredients-management.component.html',
  styleUrl: './ingredients-management.component.css'
})
export class IngredientsManagementComponent {
displayedColumns: string[] = ['name', 'description', 'category', 'unit', 'actions'];
  dataSource = new MatTableDataSource<IngredientListResponseDataInner>([]);
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog, private entitiesApi: EntitiesApi,
    private notificationService: NotificationService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.loadIngredients();
  }

  private loadIngredients() {
    this.loaderService.show();
    this.entitiesApi.entitiesIngredientsGet().subscribe({
      next: (response: any) => {
        if (response.success) { 
          this.dataSource.data = response.data || [];
        }
        this.loaderService.hide();
      },
      error: () => {
        this.notificationService.show('Failed to fetch ingredients');
        this.loaderService.hide();
      }
    });
  }


  applyFilter() {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  openAdd() {
    const dialogRef = this.dialog.open(AddEditIngredientsComponent, {
      data: { mode: 'add' },
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') this.loadIngredients();
    });
  }

  openEdit(ingredient: IngredientListResponseDataInner) {
    const dialogRef = this.dialog.open(AddEditIngredientsComponent, {
      data: { mode: 'edit', ingredient },
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') this.loadIngredients();
    });
  }

  delete(id: string) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.loaderService.show();
      this.entitiesApi.entitiesIngredientsIngredientIdDelete(id).subscribe({
        next: (response: any) => {  
            this.notificationService.show('Ingredients deleted successfully');
            this.loadIngredients();
          this.loaderService.hide();
        },
        error: () => {
          this.notificationService.show('Failed to delete ingredient');
          this.loaderService.hide();
        } 
      });
    }
  }
}
