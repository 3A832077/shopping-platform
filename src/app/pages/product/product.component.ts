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
    FormsModule
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

  selectSort: string = 'default'; // 預設排序方式

  constructor(
                private supabaseService: SupabaseService
             ) { }

  @HostListener('window:resize')
  onResize() {
    if (typeof window !== 'undefined') {
      this.isSmallScreen = window.innerWidth < 768;
      if (!this.isSmallScreen) {
        this.filterOpen = true; // 桌面版直接展開
      }
      else {
        this.filterOpen = false; // 小畫面預設收起
      }
    }
  }

  ngOnInit(): void {
    this.getCategory();
    this.onResize(); // 初始化時檢查螢幕大小
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
