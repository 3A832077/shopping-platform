import { Component, Input, OnInit } from '@angular/core';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { SupabaseService } from '../../../../service/supabase.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-detail',
  imports:[
    NzGridModule,
    NzButtonModule,
    NzDividerModule,
    CommonModule,
    MatButtonModule,
    RouterLink,
    NzPageHeaderModule,
    NzInputNumberModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent implements OnInit {

  product: any = [];

  @Input() id: number = 0;

  relatedProducts: any[] = [];

  quantity: number = 1;

  constructor(
                private supabaseService: SupabaseService,
                private route: ActivatedRoute,
                private router: Router,
                private message: NzMessageService
             ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.getProductDetail(id);
    });
  }

  /**
   * 取得產品詳細資訊
   */
  getProductDetail(id: number) {
    this.supabaseService.getProductById(id)?.then(({ data, error }) => {
      if (error) {
        console.error('Error fetching product details:', error);
      }
      else {
        this.product = data;
        this.getRelatedProducts();
      }
    });
  }

  /**
   * 取得同類別商品
   */
  getRelatedProducts() {
    this.supabaseService.getRelatedProducts(this.product.category)?.then(({ data, error }) => {
      if (error) {
        console.error('Error fetching related products:', error);
      }
      else {
        this.relatedProducts = (data || []).filter(item => item.id !== this.product.id);
      }
    });
  }

  /**
   * 返回上一頁
   */
  onBack() {
    this.router.navigate(['/product']);
  }

  /**
   * 新增商品到購物車
   */
  addToCart(productId: number, quantity: number = 1, buyNow: boolean = false) {
    this.supabaseService.addToCart(productId, quantity).then((result) => {
      // 注意：這裡要判斷 result 是否為空或包含 error
      if (result?.error) {
        console.error(result.error);
        this.message.error('加入失敗');
      }
      else {
        this.message.success('已加入購物車！');
        this.supabaseService.fetchCartItems();
        if (buyNow) {
          this.router.navigate(['/cart']);
        }
      }
    }).catch(err => {
      console.error(err);
  });

}

}
