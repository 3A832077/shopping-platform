import { Component, OnInit } from '@angular/core';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { SupabaseService } from '../../../service/supabase.service';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../../directive/reveal-on-scroll.directive';
import { MatIconModule } from '@angular/material/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  categoryList: any[] = [];

  productsList: any[] = [];

  constructor(
                private supabaseService: SupabaseService,
                private message: NzMessageService
             ) {}

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
      this.productsList.forEach(item => {
        item.showQty = false;
      });
    });
  }

  /**
   * 前往產品頁面
   */
  toProduct() {
    window.location.href = '/product';
  }

  /**
 * 即時更新購物車數量
 * @param item 產品物件（包含 id, stock, tempQty 等）
 * @param delta 變化量 (+1 或 -1)
 */
async addToCart(item: any, delta: number) {
  // 1. 初始化當前數量（如果沒有則設為 0）
  const currentQty = item.tempQty || 0;
  const newQty = currentQty + delta;

  // 2. 邊界判斷：超過庫存
  if (newQty > item.stock) {
    this.message.warning(`抱歉，庫存僅剩 ${item.stock} 件`);
    return;
  }

  // 3. 邊界判斷：按到 0，執行「移除」或「切換回圖示」
  if (newQty <= 0) {
    // 這裡可以選擇是否呼叫 API 刪除購物車項目
    // 或者單純讓前端 UI 切換回購物車圖示
    item.showQty = false;
    item.tempQty = 0;

    // 如果資料庫已經有這筆，可以呼叫 removeCartItem
    // await this.supabaseService.removeCartItem(item.id);

    this.message.info('已取消選擇商品');
    return;
  }

  // 4. 通過檢查後，更新前端 UI (為了讓使用者感覺反應很快)
  item.tempQty = newQty;

  // 5. 同步到資料庫 (Supabase)
  try {
    // 注意：這裡是用我們之前寫的 Service，它會處理 update/insert 邏輯
    await this.supabaseService.addToCart(item.id, delta);

    // 6. 更新全域購物車狀態 (Signal)
    this.supabaseService.fetchCartItems();

  } catch (error) {
    // 如果後端失敗，要把數量回滾回去
    item.tempQty = currentQty;
    this.message.error('系統忙碌中，請稍後再試');
  }
}

}
