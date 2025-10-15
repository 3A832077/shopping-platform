import { Component, OnInit } from '@angular/core';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { SupabaseService } from '../../../service/supabase.service';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../../directive/reveal-on-scroll.directive';

@Component({
  selector: 'app-home',
  imports: [
    NzLayoutModule,
    NzGridModule,
    NzDividerModule,
    NzButtonModule,
    MatButtonModule,
    RouterLink,
    RevealOnScrollDirective,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  categoryList: any[] = [];

  productsList: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.getCategory();
  }

  /**
   * 取得產品類別
   */
  getCategory() {
    this.supabaseService?.getCategories()?.then(({ data, error }) => {
      if (error) {
        console.error(error);
        return;
      }
      this.categoryList = data || [];
      this.getProoducts();
    });
  }

  /**
   * 取得產品列表
   */
  getProoducts() {
    this.supabaseService?.getProducts(1, 6)?.then(({ data, error }) => {
      if (error) {
        console.error(error);
        return;
      }
      this.productsList = data || [];
    });
  }

  /**
   * 前往產品頁面
   */
  toProduct() {
    window.location.href = '/product';
  }
}
