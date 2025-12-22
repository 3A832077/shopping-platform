import { Component, effect, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { SupabaseService } from '../../../service/supabase.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-orders',
  imports: [
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzDividerModule,
    NzFormModule,
    NzInputModule,
    FormsModule,
    ReactiveFormsModule,
    NzIconModule,
    NzRateModule,
    NzSelectModule,
    MatTooltipModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {

  displayedList: any[] = [];

  total: number = 0;

  pageIndex: number = 1;

  pageSize: number = 10;

  loading: boolean = false;

  editId: string | null = null;

  products: any;

  statusMap: any = {
    0: '新成立',
    1: '確認',
    2: '備貨中',
    3: '已出貨',
    4: '已送達',
    5: '已完成',
    6: '退貨中',
    7: '已取消',
  };

  statusList: any[] = [
    { label: '新成立', value: 0 },
    { label: '確認', value: 1 },
    { label: '備貨中', value: 2 },
    { label: '已出貨', value: 3 },
    { label: '已送達', value: 4 },
    { label: '已完成', value: 5 },
    { label: '退貨中', value: 6 },
    { label: '已取消', value: 7 },
  ];

  constructor(
                private supabaseService: SupabaseService,
                private messageService: NzMessageService
              ) {
                effect(() => {
                  if (this.supabaseService.userId()) {
                    this.getOrders();
                  }
                  else{
                    this.messageService.warning('請先登入');
                  }
                });
              }

  ngOnInit(): void {

  }

  /**
   * 取得訂單列表
   * @param pageIndex
   * @param pageSize
   */
  getOrders(pageIndex: number = 1, pageSize: number = 10) {
    this.loading = true;
    this.supabaseService.getOrders(pageIndex, pageSize)?.then(response => {
      this.loading = false;
      const { data, error, count } = response;
      if (error) {
        console.error(error);
        this.loading = false;
        return;
      }
      this.displayedList = data || [];
      this.getProducts();
      this.total = count || 0;
      this.loading = false;
    });
  }

  /**
   * 點擊出現select下拉選單
   * @param id
   */
  startEdit(id: string): void {
    this.editId = id;
  }

  /**
   * 更新訂單狀態
   * @param id
   * @param event
   */
  updateOrders(id:string, event: any, col: string): void {
    const params = {
      [col]: event,
      update: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'zh-TW', '+0800')
    }
    this.supabaseService.editOrder(id, params)?.then(response => {
      const { error } = response;
      if (error) {
        console.error(error);
        return;
      }
      this.messageService.success('訂單已更新');
      this.getOrders();
      this.editId = null;
    });
  }

  /**
   * 計算兩個日期之間的天數差
   * @param date1
   * @param date2
   */
  dateDiff(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d1.getTime() - d2.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 取得所有商品資料
   */
  getProducts() {
    this.supabaseService.getAllProducts()?.then(response => {
      const { data, error } = response;
      if (error) {
        console.error(error);
        return;
      }
      this.products = data || [];
      this.displayedList.forEach(order => {
        order.order_items.forEach((item: any) => {
          const product = this.products.find((p: any) => p.id === item.products_id);
          if (product) {
            item.productName = product.name;
          }
        });
      });
    });
  }



}
