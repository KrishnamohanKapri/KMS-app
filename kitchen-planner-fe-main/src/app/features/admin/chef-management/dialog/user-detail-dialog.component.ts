import { Component, Inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-user-detail-dialog',
  imports: [MatDialogModule, MatButtonModule, NgIf],
  templateUrl: './user-detail-dialog.component.html',
  styleUrl: './user-detail-dialog.component.css'
})
export class UserDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
