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
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Category, MealsApi } from '../../../api/api-kms-planner-masterdata';
import { AddEditCategoryDialogComponent } from './add-edit-category-dialog/add-edit-category-dialog.component';
import { LoaderService } from '../../../shared/loader/loader.service';

@Component({
  selector: 'app-categories',
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
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent {
displayedColumns: string[] = ['name', 'isActive', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Category>([]);
  pagination = { currentPage: 0, totalItems: 0, itemsPerPage: 10 };
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog, private readonly categoryApi: MealsApi,
    private loaderService: LoaderService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

loadCategories(page: number = 0) {
  this.loaderService.show();
  this.categoryApi.mealsCategoryGetGet().subscribe((response: any) => {
    this.loaderService.hide();
    const mockData = response.data || [];
    const filteredData = mockData.filter((category: Category) =>
      category.name!.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
     const start = page * this.pagination.itemsPerPage;
  const pagedData = filteredData.slice(start, start + this.pagination.itemsPerPage);

  this.dataSource.data = pagedData;
  this.pagination = {
    ...this.pagination,
    currentPage: page,
    totalItems: filteredData.length
  };

  if (this.paginator) {
    this.paginator.length = this.pagination.totalItems;
  }
  });
 
}


  applyFilter() {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

 pageChanged(event: PageEvent) {
  this.pagination.currentPage = event.pageIndex + 1;
  this.pagination.itemsPerPage = event.pageSize;
  //this.updateDisplayedData();
  this.loadCategories();
}

  openAddCategory() {
    const dialogRef = this.dialog.open(AddEditCategoryDialogComponent, {
      data: { mode: 'add' },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') this.loadCategories();
    });
  }

  openEditCategory(category: Category) {
    const dialogRef = this.dialog.open(AddEditCategoryDialogComponent, {
      data: { mode: 'edit', category },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') this.loadCategories();
    });
  }

  deleteCategory(id: string) {
    if (confirm('Are you sure you want to delete this stock item?')) {
      // Call the API to delete the category
      alert(`Deleted stock with id: ${id}`);
      this.loadCategories();
    }
  }
}
