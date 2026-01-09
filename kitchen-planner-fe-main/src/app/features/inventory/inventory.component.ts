import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
  imports: [CommonModule],
})
export class InventoryComponent {
  inventoryItems = [
    { name: 'Chicken Breast', quantity: 20, unit: 'kg' },
    { name: 'Tomatoes', quantity: 50, unit: 'pcs' },
    { name: 'Rice', quantity: 100, unit: 'kg' },
    { name: 'Butter', quantity: 10, unit: 'kg' },
    { name: 'Mushrooms', quantity: 30, unit: 'kg' },
  ];
}
