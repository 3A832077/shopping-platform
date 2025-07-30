import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { OnInit } from '@angular/core';
import { SupabaseService } from '../../service/supabase.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cart',
  imports: [
    MatButtonModule,
    RouterLink,
    MatIconModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {

  cartItems: any[] = [];

  constructor(
    private supabaseService: SupabaseService
  ) { }

  ngOnInit(): void {

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
        this.cartItems = data || [];
      }
    });
  }

}
