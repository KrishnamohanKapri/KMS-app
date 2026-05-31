import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login-prompt',
  standalone: true,
  templateUrl: './login-prompt.component.html',
  styleUrls: ['./login-prompt.component.css'],
  imports: [CommonModule, MatDialogModule, MatButtonModule],
})
export class LoginPromptComponent {
  constructor(public dialogRef: MatDialogRef<LoginPromptComponent>) {}

  onLogin() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
