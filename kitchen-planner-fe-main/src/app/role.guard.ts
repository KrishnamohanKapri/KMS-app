import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { UserService } from './shared/user.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const user = this.userService.getUserInfo();
    const allowedRoles = route.data['roles'] as string[];
    if (user && typeof user.role === 'string' && allowedRoles && allowedRoles.includes(user.role)) {
      return true;
    }
    return this.router.createUrlTree(['/login']);
  }
}
