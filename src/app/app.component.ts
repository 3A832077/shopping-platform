import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { SupabaseService } from './service/supabase.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
                RouterOutlet, NzCarouselModule, NzGridModule,
                NzIconModule, NzCardModule, NzLayoutModule,
                CommonModule, RouterLink, NzDropDownModule
              ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  categoryList: any[] = [];

  userId: string | null = null;

  email: string | null = null;

  constructor(
                private supabaseService: SupabaseService
             ){
                this.supabaseService.userId$.subscribe(userId => {
                  this.userId = userId;
                });
                this.supabaseService.email$.subscribe(email => {
                  this.email = email;
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

}
