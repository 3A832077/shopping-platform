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
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    RouterLink,
    NzPaginationModule,
    MatTooltipModule
],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit {

  productsList : any[] = [];

  pageIndex: number = 1;

  pageSize: number = 12;

  categoryList: any[] = [];

  selectedSort = 'default';

  filterOpen = false;

  isSmallScreen = false;

  selectSort: boolean = false;

  categoryIsExpanded = false;

  priceIsExpanded = false;

  minPrice: number = 0;

  maxPrice: number = 0;

  selectCategory: any;

  total: number = 0;

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

  /**
   * 切換篩選面板
   */
  toggleFilter() {
    this.filterOpen = !this.filterOpen;
  }

  /**
   * 類別篩選
   */
  onCheckboxChange() {
    this.selectCategory = this.categoryList.filter(item => item.checked).map(item => item.id);
    if (this.selectCategory.length === 0) {
      this.selectCategory = undefined;
    }
    this.getProducts(this.pageIndex, this.pageSize, this.selectSort, this.selectCategory, this.minPrice, this.maxPrice);
  }

  /**
   * 取得產品列表
   * @param pageIndex
   * @param pageSize
   */
  getProducts(pageIndex: number = 1, pageSize: number = 12, sort: boolean = true, category?: any, minPrice?: number, maxPrice?: number) {
    sort = this.selectSort === true ? true : false;
    this.supabaseService?.getProducts(pageIndex, pageSize, sort, category, minPrice, maxPrice)?.then(({ data, count, error }) => {
      if (error) {
        console.error(error);
        return;
      }
      this.productsList = data || [];
      this.total = count || 0;
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
      this.getProducts(this.pageIndex, this.pageSize, this.selectSort, this.selectCategory, this.minPrice, this.maxPrice);
    });
  }

  /**
   * 清除篩選條件
   */
  resetFilter() {
    this.selectSort = false;
    this.categoryList.forEach(item => item.checked = false);
    this.minPrice = 0;
    this.maxPrice = 0;
    this.selectCategory = undefined;
    this.getProducts(this.pageIndex, this.pageSize, this.selectSort, this.selectCategory, this.minPrice, this.maxPrice);
  }


}
