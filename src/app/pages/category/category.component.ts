import { Component, HostListener, Input, OnInit } from '@angular/core';
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
import { RouterLink, Router } from '@angular/router';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';

@Component({
  selector: 'app-category',
  imports: [
    CommonModule,
    NzCollapseModule,
    NzButtonModule,
    NzDividerModule,
    NzGridModule,
    NzSelectModule,
    NzIconModule,
    FormsModule,
    NzCheckboxModule,
    NzInputNumberModule,
    RouterLink,
    NzPaginationModule,
    NzPageHeaderModule
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit {

  @Input() id: number = 0;

  productsList : any[] = [];

  pageIndex: number = 1;

  pageSize: number = 10;

  selectedSort = 'default';

  filterOpen = false;

  isSmallScreen = false;

  selectSort: boolean = false;

  priceIsExpanded = false;

  minPrice: number = 0;

  maxPrice: number = 0;

  constructor(
                private supabaseService: SupabaseService,
                private router: Router
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
   * 取得該類別所有商品
   * @param id
   */
  getCategory(){
    this.supabaseService?.getRelatedProducts(this.id)?.then(({ data, error }) => {
      if (error) {
        console.error(error);
        return;
      }
      this.productsList = data || [];
      this.getProducts(this.pageIndex, this.pageSize, this.selectSort, this.minPrice, this.maxPrice);
    });
  }

  /**
   * 取得產品列表
   */
  getProducts(pageIndex: number = 1, pageSize: number = 10, sort: boolean = true, minPrice?: number, maxPrice?: number) {
    sort = this.selectSort === false ? false : true;
    this.supabaseService?.getProducts(pageIndex, pageSize, sort, minPrice, maxPrice)?.then(({ data, error }) => {
      if (error) {
        console.error(error);
        return;
      }
      this.productsList = data || [];
    });
  }

  /**
   * 清除篩選條件
   */
  resetFilter() {
    this.pageIndex = 1;
    this.pageSize = 10;
    this.selectSort = false;
    this.minPrice = 0;
    this.maxPrice = 0;
    this.getProducts(this.pageIndex, this.pageSize, this.selectSort, this.minPrice, this.maxPrice);
  }

  /**
   * 返回上一頁
   */
  onBack() {
    this.router.navigate(['/category']);
  }

}
