import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { MatIconModule } from "@angular/material/icon";
import { CartService } from '../../../shared/cart.service';

@Component({
  standalone: true,
  selector: 'app-success',
  imports: [CommonModule, RouterModule, NavbarComponent, MatIconModule],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent {

  constructor(private router: Router, private readonly cartService: CartService){

  }

  goHome() {
    this.cartService.resetCartData();
    this.router.navigate(['/home']);
  }
}

