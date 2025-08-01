import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { OnInit } from '@angular/core';
import { SupabaseService } from '../../service/supabase.service';
import { MatIconModule } from '@angular/material/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NzFormItemComponent } from "ng-zorro-antd/form";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { CheckoutComponent } from '../checkout/checkout.component';

@Component({
  selector: 'app-cart',
  imports: [
    MatButtonModule,
    RouterLink,
    MatIconModule,
    NzInputNumberModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormItemComponent,
    NzModalModule
],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {

  cartItems: any[] = [];

  sum: number = 0;

  userId: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private messageService: NzMessageService,
    private modalService: NzModalService
  ) { }

  ngOnInit(): void {
    this.getCartItems();
    this.supabaseService.userId$.subscribe(userId => {
      this.userId = userId;
    });
  }

  /**
   * 取得購物車商品
   */
  getCartItems(): void {
    this.supabaseService.getCartItems()?.then(({ data, error }) => {
      if (error) {
        console.error(error);
      }
      else {
        if (!this.userId){
          this.messageService.info('請先登入');
          return;
        }
        this.cartItems = data || [];
        this.sum = this.cartItems.reduce((acc, item) => {
          return acc + (item.products.price * item.quantity);
        }, 0);
      }
    });
  }

  /**
   * 移除購物車商品
   */
  removeCartItem(itemId: string): void {
    this.supabaseService.removeCartItem(itemId)?.then(({ error }) => {
      if (error) {
        console.error(error);
      }
      else {
        this.getCartItems();
      }
    });
  }

  /**
   * 更新購物車商品數量
   */
  updateCartItem(itemId: string, quantity: number): void {
    this.supabaseService.updateCartItem(itemId, quantity)?.then(({ error }) => {
      if (error) {
        console.error(error);
      }
      else {
        this.getCartItems();
      }
    });
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
      nzWidth: '650px',
      nzData: {
        cartItems: this.cartItems,
        total: this.sum
      }
    });
  }

}
