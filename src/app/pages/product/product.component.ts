import { Component, OnInit } from '@angular/core';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../service/supabase.service';


@Component({
  selector: 'app-product',
  imports: [
    NzCollapseModule,
    NzButtonModule,
    NzDividerModule,
    CommonModule,
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit {

  productsList : any[] = [];

  pageIndex: number = 1;

  pageSize: number = 10;

  categoryList: any[] = [];

  constructor(
                private supabaseService: SupabaseService
             ) { }

  ngOnInit(): void {
    this.getCategory();
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
