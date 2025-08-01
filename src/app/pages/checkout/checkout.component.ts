import { Component, inject } from '@angular/core';
import { OnInit } from '@angular/core';
import { SupabaseService } from '../../service/supabase.service';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzColDirective } from "ng-zorro-antd/grid";
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-checkout',
  imports: [
    NzResultModule,
    NzStepsModule,
    MatButtonModule,
    RouterLink,
    NzRadioModule,
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    NzColDirective,
    NzSelectModule
],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {

  current = 0;

  cartItems: any[] = [];

  total: number = 0;

  data = inject(NZ_MODAL_DATA) || undefined;

  shippingMethod: string = 'home';

  constructor(
    private supabaseService: SupabaseService
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.cartItems = this.data.cartItems || [];
      this.total = this.data.total || 0;
    }
  }

  next(): void {
    this.current += 1;
  }

  prev(): void {
    this.current -= 1;
  }

}
