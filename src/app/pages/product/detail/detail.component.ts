import { Component, Input, OnInit } from '@angular/core';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { SupabaseService } from '../../../service/supabase.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';

@Component({
  selector: 'app-detail',
  imports:[
    NzGridModule,
    NzButtonModule,
    NzDividerModule,
    CommonModule,
    MatButtonModule,
    RouterLink,
    NzPageHeaderModule
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent implements OnInit {

  product: any = [];

  @Input() id: number = 0;

  relatedProducts: any[] = [];

  constructor(
                private supabaseService: SupabaseService,
                private route: ActivatedRoute,
                private router: Router
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
}
