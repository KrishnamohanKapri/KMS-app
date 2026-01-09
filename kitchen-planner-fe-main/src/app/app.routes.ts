import { Routes } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AdminLayoutComponent } from './features/admin/admin-layout/admin-layout.component';
import { CartStepperComponent } from './features/customer/cart-stepper/cart-stepper.component';
import { CartComponent } from './features/customer/cart/cart.component';
import { OrderPageComponent } from './features/customer/order-page.component';
import { DeliveryAddressComponent } from './features/customer/delivery-address/delivery-address.component';
import { PaymentComponent } from './features/customer/payment/payment.component';
import { SuccessComponent } from './features/customer/success/success.component';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./features/signup/signup.component').then(m => m.SignupComponent) },
  { path: 'home', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'change-password', loadComponent: () => import('./features/auth/change-password.component').then(m => m.ChangePasswordComponent) },
  { path: 'reset-password/:token', loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'notifications' , loadComponent: () => import('./shared/notification/notification.component').then(m => m.NotificationComponent) },
  {
    path: 'customer',
  canActivate: [RoleGuard],
    data: { roles: ['user'] },
    children: [
      { path: 'meals-list', loadComponent: () => import('./features/meals/meals-list.component').then(m => m.MealsListComponent) },
      { path: 'meal/:id', loadComponent: ()=> import('./features/meals/meal-details/meal-details.component').then(m => m.MealDetailsComponent) },
      { path: 'weekly-meals', loadComponent: () => import('./features/meals/weekly-meals/weekly-meals.component').then(m => m.WeeklyMealsComponent) },
      { path: 'meals-dashboard', loadComponent: () => import('./features/meals/meals-dashboard/meals-dashboard.component').then(m => m.MealsDashboardComponent) },
      { path: 'customer-profile', loadComponent: () => import('./features/customer/customer-profile/customer-profile.component').then(m => m.CustomerProfileComponent) },
      { path: 'customer-own-order', loadComponent: () => import('./features/customer/customer-own-order/customer-own-order.component').then(m => m.CustomerOwnOrderComponent) },
      { path: 'tracking', loadComponent: () => import('./features/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent) },
    ]
  },
  {
    path: 'checkout',
    component: CartStepperComponent,
  canActivate: [RoleGuard],
    data: { roles: ['user'] },
    children: [
      { path: 'cart', component: CartComponent },
      { path: 'billing', component: OrderPageComponent },
      { path: 'shipping', component: DeliveryAddressComponent },
      { path: 'payment', component: PaymentComponent },
      { path: 'payment/:id', component: PaymentComponent },
      { path: 'success', component: SuccessComponent },
      { path: '', redirectTo: 'checkout', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
  canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    children: [
      { path: 'inventory', loadComponent: () => import('./features/inventory/inventory.component').then(m => m.InventoryComponent) },
      { path: 'delivery', loadComponent: () => import('./features/delivery/delivery.component').then(m => m.DeliveryComponent) },
      { path: 'catering', loadComponent: () => import('./features/catering/catering.component').then(m => m.CateringComponent) },
 
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
  canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'recent-activity', loadComponent: () => import('./features/admin/recent-acivity-dashboard/recent-acivity-dashboard.component').then(m => m.RecentAcivityDashboardComponent) },
      { path: 'orders', loadComponent: () => import('./features/orders/orders-list.component').then(m => m.OrdersListComponent) },
      { path: 'orders/:id', loadComponent: () => import('./features/admin/view-order-details/view-order-details.component').then(m => m.ViewOrderDetailsComponent) },
      { path: 'kitchen-rules', loadComponent: () => import('./features/admin/kitchen-rules/kitchen-rules.component').then(m => m.KitchenRulesComponent) },
      { path: 'customers', loadComponent: () => import('./features/admin/customers/customers.component').then(m => m.CustomersComponent) },
      { path: 'customer-detail-dialog', loadComponent: () => import('./features/admin/customers/customer-detail-dialog.component').then(m => m.CustomerDetailDialogComponent) },
      { path: 'cheflist', loadComponent: () => import('./features/admin/chef-management/chef-management.component').then(m => m.ChefManagementComponent) },
      { path: 'user-detail-dialog', loadComponent: () => import('./features/admin/chef-management/dialog/user-detail-dialog.component').then(m => m.UserDetailDialogComponent) },
      { path: 'category-management', loadComponent: () => import('./features/admin/categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'add-plan', loadComponent: () => import('./features/admin/add-plan/add-plan.component').then(m => m.AddPlanComponent) },
      { path: 'weekly-planner', loadComponent: () => import('./features/admin/weekly-planner/weekly-planner.component').then(m => m.WeeklyPlannerComponent) },
      { path: 'add-meals', loadComponent: () => import('./features/admin/add-meals/add-meals.component').then(m => m.AddMealComponent) },
      { path: 'meal-manager', loadComponent: () => import('./features/admin/meal-manager/meal-manager.component').then(m => m.MealsManagerComponent) },
      { path: 'stock-management', loadComponent: () => import('./features/admin/stock-management/stock-management.component').then(m => m.StockManagementComponent) },
      { path: 'allergens-management', loadComponent: () => import('./features/admin/allergens-management/allergens-management.component').then(m => m.AllergensManagementComponent) },
      { path: 'tags-management', loadComponent: () => import('./features/admin/tags-management/tags-management.component').then(m => m.TagsManagementComponent) },
      { path: 'ingredients-management', loadComponent: () => import('./features/admin/ingredients-management/ingredients-management.component').then(m => m.IngredientsManagementComponent) },
      { path: 'out-of-stock', loadComponent: () => import('./features/admin/stock-management/out-of-stock/out-of-stock.component').then(m => m.OutOfStockComponent) },
      { path: 'expiring-stock', loadComponent: () => import('./features/admin/stock-management/expiring-stock/expiring-stock.component').then(m => m.ExpiringStockComponent) },
      { path: 'low-stock', loadComponent: () => import('./features/admin/stock-management/low-stock/low-stock.component').then(m => m.LowStockComponent) },
      { path: 'stock-report', loadComponent: () => import('./features/admin/stock-management/stock-report/stock-report.component').then(m => m.StockReportComponent) },
      { path: 'staff-management', loadComponent: () => import('./features/admin/staff-management/staff-management.component').then(m => m.StaffManagementComponent) },
      { path: 'kitchen-rules', loadComponent: () => import('./features/admin/kitchen-rules/kitchen-rules.component').then(m => m.KitchenRulesComponent) },
      { path:'recipe-workflows', loadComponent: () => import('./features/admin/recipe-workflows/recipe-workflows.component').then(m => m.RecipeWorkflowsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },
  {
    path: 'rider',
    component: AdminLayoutComponent,
  canActivate: [RoleGuard],
    data: { roles: ['rider'] },
    children: [
    { path: 'orders', loadComponent: () => import('./features/orders/orders-list.component').then(m => m.OrdersListComponent) },
    { path: 'orders/:id', loadComponent: () => import('./features/admin/view-order-details/view-order-details.component').then(m => m.ViewOrderDetailsComponent) }
  ]
  },
  {
    path: 'chef',
    component: AdminLayoutComponent,
  canActivate: [RoleGuard],
    data: { roles: ['chef'] },
    children: [
    { path: 'orders', loadComponent: () => import('./features/orders/orders-list.component').then(m => m.OrdersListComponent) },
    { path: 'kitchen-rules', loadComponent: () => import('./features/admin/kitchen-rules/kitchen-rules.component').then(m => m.KitchenRulesComponent) },
    { path:'recipe-workflows', loadComponent: () => import('./features/admin/recipe-workflows/recipe-workflows.component').then(m => m.RecipeWorkflowsComponent) },
    { path: 'orders/:id', loadComponent: () => import('./features/admin/view-order-details/view-order-details.component').then(m => m.ViewOrderDetailsComponent) }
    ]
  },
  {
    path: 'employee',
    component: AdminLayoutComponent,
  canActivate: [RoleGuard],
    data: { roles: ['employee'] },
    children: [
      { path: 'orders', loadComponent: () => import('./features/orders/orders-list.component').then(m => m.OrdersListComponent) },
      { path: 'orders/:id', loadComponent: () => import('./features/admin/view-order-details/view-order-details.component').then(m => m.ViewOrderDetailsComponent) },
      { path: 'kitchen-rules', loadComponent: () => import('./features/admin/kitchen-rules/kitchen-rules.component').then(m => m.KitchenRulesComponent) },
      { path: 'category-management', loadComponent: () => import('./features/admin/categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'add-plan', loadComponent: () => import('./features/admin/add-plan/add-plan.component').then(m => m.AddPlanComponent) },
      { path: 'weekly-planner', loadComponent: () => import('./features/admin/weekly-planner/weekly-planner.component').then(m => m.WeeklyPlannerComponent) },
      { path: 'add-meals', loadComponent: () => import('./features/admin/add-meals/add-meals.component').then(m => m.AddMealComponent) },
      { path: 'meal-manager', loadComponent: () => import('./features/admin/meal-manager/meal-manager.component').then(m => m.MealsManagerComponent) },
      { path: 'stock-management', loadComponent: () => import('./features/admin/stock-management/stock-management.component').then(m => m.StockManagementComponent) },
      { path: 'allergens-management', loadComponent: () => import('./features/admin/allergens-management/allergens-management.component').then(m => m.AllergensManagementComponent) },
      { path: 'tags-management', loadComponent: () => import('./features/admin/tags-management/tags-management.component').then(m => m.TagsManagementComponent) },
      { path: 'ingredients-management', loadComponent: () => import('./features/admin/ingredients-management/ingredients-management.component').then(m => m.IngredientsManagementComponent) },
      { path: 'out-of-stock', loadComponent: () => import('./features/admin/stock-management/out-of-stock/out-of-stock.component').then(m => m.OutOfStockComponent) },
      { path: 'expiring-stock', loadComponent: () => import('./features/admin/stock-management/expiring-stock/expiring-stock.component').then(m => m.ExpiringStockComponent) },
      { path: 'low-stock', loadComponent: () => import('./features/admin/stock-management/low-stock/low-stock.component').then(m => m.LowStockComponent) },
      { path: 'stock-report', loadComponent: () => import('./features/admin/stock-management/stock-report/stock-report.component').then(m => m.StockReportComponent) },
      { path: 'kitchen-rules', loadComponent: () => import('./features/admin/kitchen-rules/kitchen-rules.component').then(m => m.KitchenRulesComponent) },
      { path:'recipe-workflows', loadComponent: () => import('./features/admin/recipe-workflows/recipe-workflows.component').then(m => m.RecipeWorkflowsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
