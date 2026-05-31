import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerSnackbarComponent } from './customer-snackbar/customer-snackbar.component';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) { }

 show(message: string, type: 'success' | 'error' = 'success') {
  const config = {
    duration: 4000,
    horizontalPosition: 'right' as const,
    verticalPosition: 'top' as const,
    panelClass: type === 'success' ? 'custom-snackbar' : 'error-snackbar'
  };

  const snackBarRef = this.snackBar.openFromComponent(CustomerSnackbarComponent, config);
  snackBarRef.instance.message = message;
  snackBarRef.instance.type = type;
}

}

