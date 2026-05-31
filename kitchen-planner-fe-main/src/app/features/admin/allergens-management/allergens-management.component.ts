import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { AddEditAllergensComponent } from './add-edit-allergens/add-edit-allergens.component';
import { AllergenListResponseDataInner, EntitiesApi } from '../../../api/api-kms-planner-masterdata';
import { NotificationService } from '../../../shared/notification.service';
import { LoaderService } from '../../../shared/loader/loader.service';


@Component({
  standalone: true,
  selector: 'app-allergens-management',
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
  templateUrl: './allergens-management.component.html',
  styleUrl: './allergens-management.component.css'
})
export class AllergensManagementComponent {
 displayedColumns: string[] = ['name', 'description', 'createdAt', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<AllergenListResponseDataInner>([]);
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog, private entitiesApi: EntitiesApi,
    private notificationService: NotificationService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.loadAllergens();
  }

  private loadAllergens() {
    this.loaderService.show();
    this.entitiesApi.entitiesAllergensGet().subscribe({
      next: (response: any) => {
        if (response.success) { 
          this.dataSource.data = response.data || [];
        }
        this.loaderService.hide();
      },
      error: () => {
        this.notificationService.show('Failed to fetch allergens');
        this.loaderService.hide();
      }
    });
  }


  applyFilter() {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  openAdd() {
    const dialogRef = this.dialog.open(AddEditAllergensComponent, {
      data: { mode: 'add' },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') this.loadAllergens();
    });
  }

  openEdit(allergen: AllergenListResponseDataInner) {
    const dialogRef = this.dialog.open(AddEditAllergensComponent, {
      data: { mode: 'edit', allergen },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') this.loadAllergens();
    });
  }

  delete(id: string) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.loaderService.show();
      this.entitiesApi.entitiesAllergensAllergenIdDelete(id).subscribe({
        next: (response: any) => {  
            this.notificationService.show('Allergen deleted successfully');
            this.loadAllergens();
          this.loaderService.hide();
        },
        error: () => {
          this.notificationService.show('Failed to delete allergen');
          this.loaderService.hide();
        } 
      });
    }
  }
}

