import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { MatStepperModule } from '@angular/material/stepper';
import { NavbarComponent } from "../../../shared/navbar/navbar.component";

@Component({
  selector: 'app-cart-stepper',
  imports: [RouterModule, CommonModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule, NavbarComponent],
  templateUrl: './cart-stepper.component.html',
  styleUrl: './cart-stepper.component.css'
})
export class CartStepperComponent {
 selectedIndex = 0;

  stepRoutes = [
    '/checkout/cart',
    '/checkout/billing',
    '/checkout/shipping',
    '/checkout/payment',
    '/checkout/success'
  ];
  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url = e.urlAfterRedirects;
        const idx = this.stepRoutes.indexOf(url);
        if (idx > -1) {
          this.selectedIndex = idx;
        }
      });
  }

  onStepChange(event: any) {
    this.router.navigate([this.stepRoutes[event.selectedIndex]]);
  }
}
