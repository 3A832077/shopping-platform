import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { SellerComponent } from './pages/seller/seller.component';
import { HomeComponent } from './pages/main/home/home.component';

export const routes: Routes = [
  // --- 前台路由群組 ---
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./pages/main/home/home.routes').then(m => m.HomeRoutes)
      },
      {
        path: 'cart',
        loadChildren: () => import('./pages/main/cart/cart.routes').then(m => m.cartRoutes)
      },
      {
        path: 'login',
        loadChildren: () => import('./pages/main/login/login.routes').then(m => m.loginRoutes)
      },
      {
        path: 'category',
        loadChildren: () => import('./pages/main/category/category.routes').then(m => m.categoryRoutes)
      },
      {
        path: 'product',
        loadChildren: () => import('./pages/main/product/product.routes').then(m => m.productsRoutes)
      },
      {
        path: 'order',
        loadChildren: () => import('./pages/main/orders/orders.routes').then(m => m.orderRoutes)
      },
    ],
  },
  // --- 後台(賣家)路由群組 ---
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'seller',
    component: SellerComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/seller/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
      },
      {
        path: 'products',
        loadChildren: () => import('./pages/seller/products/products.routes').then(m => m.ProductRoutes)
      },
      {
        path: 'orders',
        loadChildren: () => import('./pages/seller/orders/orders.routes').then(m => m.OrdersRoutes)
      },
      {
        path: 'inspections',
        loadChildren: () => import('./pages/seller/inspections/inspections.routes').then(m => m.inspectionsRoutes)
      },
    ],
  },
];
