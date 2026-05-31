import { Component, Input } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-customer-snackbar',
  imports: [],
  templateUrl: './customer-snackbar.component.html',
  styleUrl: './customer-snackbar.component.css'
})
export class CustomerSnackbarComponent {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';

  constructor(public snackBarRef: MatSnackBarRef<CustomerSnackbarComponent>) {}

  close() {
    this.snackBarRef.dismiss();
  }
}
