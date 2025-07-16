import { Routes } from '@angular/router';
import { ProductComponent } from './product.component';
import { DetailComponent } from './detail/detail.component';

export const productsRoutes: Routes = [
  { path: '', component: ProductComponent },
  { path: 'product/:id', component: DetailComponent },
]
