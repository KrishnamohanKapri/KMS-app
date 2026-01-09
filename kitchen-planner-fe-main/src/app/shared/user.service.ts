import { Injectable, signal } from '@angular/core';
import { UserProfile } from '../api/api-kms-planner-masterdata';
import { Router } from '@angular/router';
import {CartService} from './cart.service';

export type Role = 'admin' | 'customer' | 'public';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private router: Router, private readonly cartService: CartService) {}
   private plans = [
    {
      id: 1,
      startDate: new Date('2025-08-01'),
      endDate: new Date('2025-08-07'),
      selectedPlans: {
        Monday: { meals: ['Pasta'], staff: ['John'] },
        Tuesday: { meals: ['Burger'], staff: ['Emily'] },
        Wednesday: { meals: [], staff: [] },
        Thursday: { meals: [], staff: [] },
        Friday: { meals: [], staff: [] },
        Saturday: { meals: [], staff: [] },
        Sunday: { meals: [], staff: [] }
      }
    }
  ];

  getPlanById(id: number) {
    return this.plans.find(p => p.id === id);
  }

  public getUserInfo():UserProfile | null   {
    return localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  }

  public logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('preferences');
    this.cartService.resetCartData();
    this.router.navigate(['/login']);
  }
}
