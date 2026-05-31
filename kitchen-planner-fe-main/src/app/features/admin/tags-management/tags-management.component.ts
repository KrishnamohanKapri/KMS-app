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
import { EntitiesApi, TagListResponseDataInner } from '../../../api/api-kms-planner-masterdata';
import { AddEditTagsComponent } from './add-edit-tags/add-edit-tags.component';
import { NotificationService } from '../../../shared/notification.service';
import { LoaderService } from '../../../shared/loader/loader.service';


@Component({
  selector: 'app-tags-management',
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
  templateUrl: './tags-management.component.html',
  styleUrl: './tags-management.component.css'
})
export class TagsManagementComponent {
  displayedColumns: string[] = ['name', 'description', 'color', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<TagListResponseDataInner>([]);
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog, private entitiesApi: EntitiesApi,
    private notificationService: NotificationService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.loadTags();
  }

  private loadTags() {
    this.loaderService.show();
    this.entitiesApi.entitiesTagsGet().subscribe({
      next: (response: any) => {
        if (response.success) { 
          this.dataSource.data = response.data || [];
        }
        this.loaderService.hide();
      },
      error: () => {
        this.notificationService.show('Failed to fetch tags');
        this.loaderService.hide();
      }
    });
  }


  applyFilter() {

    this.dataSource.filter = this.searchTerm.trim().toLowerCase();

  }

  openAdd() {
    const dialogRef = this.dialog.open(AddEditTagsComponent, {
      data: { mode: 'add' },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') this.loadTags();
    });
  }

  openEdit(tag: TagListResponseDataInner) {
    const dialogRef = this.dialog.open(AddEditTagsComponent, {
      data: { mode: 'edit', tag },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') this.loadTags();
    });
  }

  delete(id: string) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.loaderService.show();
      this.entitiesApi.entitiesTagsTagIdDelete(id).subscribe({
        next: (response: any) => {  
            this.notificationService.show('Tag deleted successfully');
            this.loadTags();
          this.loaderService.hide();
        },
        error: () => {
          this.notificationService.show('Failed to delete tag');
          this.loaderService.hide();
        } 
      });
    }
  }
}
