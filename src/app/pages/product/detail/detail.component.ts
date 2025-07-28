import { Component, Input, OnInit } from '@angular/core';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { SupabaseService } from '../../../service/supabase.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail',
  imports:[
    NzGridModule,
    NzButtonModule,
    NzDividerModule,
    CommonModule
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent implements OnInit {

  product: any = [];

  @Input() id: number = 0;

  constructor(
                private supabaseService: SupabaseService
             ) { }

  ngOnInit(): void {
    this.getProductDetail(this.id);
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
      }
    });
  }


}
