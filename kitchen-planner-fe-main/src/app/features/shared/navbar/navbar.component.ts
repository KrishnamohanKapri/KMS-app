import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';


@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule,MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() role: 'admin' | 'customer' | 'public' = 'public';
  logoPath = 'assets/images/logo.PNG';

  isLoggedIn = false;

  ngOnInit() {
    // Your logic to determine login state
    this.isLoggedIn = !!localStorage.getItem('token'); // example
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    // Redirect to home or login
  }

  goHome() {
    this.router.navigate(['/home']);
  }
  constructor(private router: Router){

  }
}
