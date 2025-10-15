import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { SellerComponent } from './pages/seller/seller.component';
import { HomeComponent } from './pages/main/home/home.component';
import { CartComponent } from './pages/main/cart/cart.component';
import { LoginComponent } from './pages/main/login/login.component';
import { CategoryComponent } from './pages/main/category/category.component';
import { ProductComponent } from './pages/main/product/product.component';
import { OrdersComponent } from './pages/main/orders/orders.component';
import { DashboardComponent } from './pages/seller/dashboard/dashboard.component';
import { ProductsComponent } from './pages/seller/products/products.component';
import { OrdersComponent as SellerOrdersComponent } from './pages/seller/orders/orders.component';
import { InspectionsComponent } from './pages/seller/inspections/inspections.component';

export const routes: Routes = [
  // --- 前台路由群組 ---
  {
    path: '',
    component: MainComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'cart', component: CartComponent },
      { path: 'login', component: LoginComponent },
      {
        path: 'category',
        loadChildren: () => import('./pages/main/category/category.routes').then(m => m.categoryRoutes)
      },
      {
        path: 'product',
        loadChildren: () => import('./pages/main/product/product.routes').then(m => m.productsRoutes)
      },
      { path: 'order', component: OrdersComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  // --- 後台(賣家)路由群組 ---
  {
    path: 'seller',
    component: SellerComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'orders', component: SellerOrdersComponent },
      { path: 'inspections', component: InspectionsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ],
  },

  // --- 404 頁面 ---
  // 匹配不到任何路徑時，可以導回首頁
  { path: '**', redirectTo: '' },
];
