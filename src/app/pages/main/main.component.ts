import { Component, effect, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { SupabaseService } from '../../service/supabase.service';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoginComponent } from '../seller/login/login.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { SellerService } from '../../service/seller.service';
import { NzBadgeModule } from 'ng-zorro-antd/badge';

@Component({
  selector: 'app-main',
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    NzCarouselModule,
    NzGridModule,
    NzIconModule,
    NzCardModule,
    NzLayoutModule,
    NzDropDownModule,
    NzDividerModule,
    NzModalModule,
    NzBadgeModule
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {

  userId: string | null = null;

  email: string | null = null;

  sellerId: string | null = null;

  sellerEmail: string | null = null;

  cartCount: number = 0;

  constructor(
                public supabaseService: SupabaseService,
                private router: Router,
                private message: NzMessageService,
                private modalService: NzModalService,
                public sellerService: SellerService
              ){
                effect(() => {
                  this.userId = this.supabaseService.userId();
                  this.email = this.supabaseService.email();
                  this.cartCount = this.supabaseService.cartCount();
                });
              }

  ngOnInit(){

  }

  /**
   * 登出
   */
  logout() {
    this.supabaseService?.logout()?.then(() => {
      this.userId = null;
      this.email = null;
      window.location.href = '/login';
    });
  }

  /**
  * 僅當前路徑完全相等時返回 true
  * @param url
  * @returns
  */
  isActive(url: string): boolean {
    return this.router.url === url;
  }

  /**
   * 開啟登入模態框
   */
  openModal() {
    this.modalService.create({
      nzContent: LoginComponent,
      nzFooter: null,
      nzClosable: true,
      nzWidth: '400px',
      nzCentered: true,
      nzMaskClosable: true
    });
  }


}
