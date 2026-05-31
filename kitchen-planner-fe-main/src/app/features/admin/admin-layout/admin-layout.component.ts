import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { UserService } from '../../../shared/user.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { NavbarComponent } from "../../../shared/navbar/navbar.component";

@Component({
  selector: 'app-admin-layout',
  imports: [RouterModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatExpansionModule, NavbarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  encapsulation: ViewEncapsulation.Emulated

})
export class AdminLayoutComponent implements OnInit{
  public  role: string = '';
  constructor(private readonly userService: UserService) {}

  ngOnInit() {
    this.role = this.userService.getUserInfo()?.role!;
  }

  public logout() {
    this.userService.logout();
  }

   public isStockSubmenuActive(): boolean {
    const paths = [
      'stock-management',
      'out-of-stock',
      'expiring-stock',
      'stock-report',
      'low-stock',
    ];
    return paths.some((path) => location.pathname.includes(path));
  }

}
