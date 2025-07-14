import { Component, OnInit } from '@angular/core';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { SupabaseService } from '../../service/supabase.service';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
  selector: 'app-home',
  imports: [
    NzLayoutModule,
    NzGridModule,
    NzDividerModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  categoryList: any[] = [];

  constructor(
                private supabaseService: SupabaseService
             ) { }

  ngOnInit(): void {
    this.getCategories();
  }

  /**
   * 取得產品類別
   */
  async getCategories() {
    const res = this.supabaseService?.getCategories();
    res?.then((data: any) => {
      if (data.error) {
        console.error(data.error);
      }
      else {
        this.categoryList = data;
      }
    });
  }


}
