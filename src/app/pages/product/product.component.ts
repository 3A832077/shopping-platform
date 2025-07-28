import { Component, HostListener, OnInit } from '@angular/core';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../service/supabase.service';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputNumberModule  } from 'ng-zorro-antd/input-number';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product',
  imports: [
    NzCollapseModule,
    NzButtonModule,
    NzDividerModule,
    NzGridModule,
    CommonModule,
    NzSelectModule,
    NzIconModule,
    FormsModule,
    NzCheckboxModule,
    NzInputNumberModule,
    RouterLink
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit {

  productsList : any[] = [];

  pageIndex: number = 1;

  pageSize: number = 10;

  categoryList: any[] = [];

  selectedSort = 'default';

  filterOpen = false;

  isSmallScreen = false;

  selectSort: string = 'default';

  categoryIsExpanded = false;

  priceIsExpanded = false;

  minPrice: number = 0;

  maxPrice: number = 0;

  constructor(
                private supabaseService: SupabaseService
             ) { }

  @HostListener('window:resize')
  onResize() {
    if (typeof window !== 'undefined') {
      this.isSmallScreen = window.innerWidth < 768;
      if (!this.isSmallScreen) {
        this.filterOpen = true;
      }
      else {
        this.filterOpen = false;
      }
    }
  }

  ngOnInit(): void {
    this.getCategory();
    this.onResize();
  }

  toggleFilter() {
    this.filterOpen = !this.filterOpen;
  }

  /**
   * 取得產品列表
   * @param pageIndex
   * @param pageSize
   */
  getProducts(pageIndex: number = 1, pageSize: number = 10) {
    this.supabaseService?.getProducts(pageIndex, pageSize)?.then(({ data, error }) => {
      if (error) {
        console.error(error);
        return;
      }
      this.productsList = data || [];
    });
  }

   /**
   * 取得產品類別
   */
  getCategory(){
    this.supabaseService?.getCategories()?.then(({ data, error }) => {
      if (error) {
        console.error(error);
        return;
      }
      this.categoryList = data || [];
      this.getProducts();
    });
  }


}
