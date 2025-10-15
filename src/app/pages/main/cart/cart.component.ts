import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { OnInit } from '@angular/core';
import { SupabaseService } from '../../../service/supabase.service';
import { MatIconModule } from '@angular/material/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { CheckoutComponent } from '../checkout/checkout.component';
import { CommonModule } from '@angular/common';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
  selector: 'app-cart',
  imports: [
    MatButtonModule,
    RouterLink,
    MatIconModule,
    NzInputNumberModule,
    FormsModule,
    ReactiveFormsModule,
    NzModalModule,
    CommonModule,
    NzDividerModule,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  public cartItems: any[] = [];

  sum: number = 0;

  userId: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private messageService: NzMessageService,
    private modalService: NzModalService
  ) {}

  ngOnInit(): void {
    this.supabaseService.userId$.subscribe((userId) => {
      this.userId = userId;
    });
    this.supabaseService.cartItems$.subscribe((items) => {
      if (!this.userId) {
        this.messageService.info('請先登入');
        return;
      }
      this.cartItems = items || [];
      this.sum = this.cartItems.reduce(
        (acc, item) => acc + item.products.price * item.quantity,
        0
      );
      this.cartItems.forEach((item) => {
        if (item.quantity === 0) {
          this.removeCartItem(item.id);
        }
        if (item.products.stock < item.quantity) {
          this.messageService.warning(
            `${item.products.name} 庫存不足，請調整數量`
          );
        }
      });
    });
    this.supabaseService.fetchCartItems();
  }

  /**
   * 移除購物車商品
   */
  removeCartItem(itemId: string): void {
    this.supabaseService.removeCartItem(itemId)?.then(({ error }) => {
      if (error) {
        console.error(error);
      } else {
        this.messageService.success('商品已移除');
        this.supabaseService.fetchCartItems();
      }
    });
  }

  /**
   * 更新購物車商品數量
   */
  updateCartItem(itemId: string, quantity: number): void {
    if (quantity === 0) {
      this.messageService.warning('數量不能為0');
      this.removeCartItem(itemId);
    } else {
      this.supabaseService
        .updateCartItem(itemId, quantity)
        ?.then(({ error }) => {
          if (error) {
            console.error(error);
          } else {
            this.supabaseService.fetchCartItems();
          }
        });
    }
  }

  /**
   * 打開結帳視窗
   */
  openCheckout(): void {
    this.modalService.create({
      nzTitle: '結帳',
      nzContent: CheckoutComponent,
      nzCentered: true,
      nzMaskClosable: false,
      nzFooter: null,
      nzWidth: '600px',
      nzData: {
        cartItems: this.cartItems,
        total: this.sum,
      },
    });
  }
}
