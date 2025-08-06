import { Component, inject } from '@angular/core';
import { OnInit } from '@angular/core';
import { SupabaseService } from '../../service/supabase.service';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzPageHeaderModule } from "ng-zorro-antd/page-header";
import { CommonModule } from '@angular/common';
import { Router, NavigationStart } from '@angular/router';

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
    NzSelectModule,
    NzFormModule,
    NzPageHeaderModule,
    CommonModule
],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {

  current = 0;

  cartItems: any[] = [];

  total: number = 0;

  data = inject(NZ_MODAL_DATA) || undefined;

  shippingMethod: number = 1;

  cities: any[] = [];

  areaList: any[] = [];

  storeList: any[] = [];

  form: FormGroup = new FormGroup({});

  payMethod: number = 1;

  constructor(
    private supabaseService: SupabaseService,
    private fb: FormBuilder,
    private router: Router,
    private modalRef: NzModalRef
  ) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
          this.modalRef.close();
        }
      });
   }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      city: [null, Validators.required],
      area: [null, Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
    });
    this.getCity();
    if (this.data) {
      this.cartItems = this.data.cartItems || [];
      this.total = this.data.total || 0;
    }
  }

  /**
   * 下一步
   */
  next(): void {
    if (this.current === 1 || this.current === 2) {
      if (this.form.invalid) {
        Object.values(this.form.controls).forEach(control => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        });
        return;
      }
    }
    this.current += 1;
    if (this.current === 3) {
      this.createOrder();
    }
  }

  /**
   * 返回上一步
   */
  prev(): void {
    this.current -= 1;
  }

  /**
   * 取得縣市
   */
  getCity(){
    this.supabaseService.getCities()?.then(({data, error}) => {
      if (error) {
        console.error(error);
      }
      else {
        this.cities = data;
        if (this.cities.length > 0) {
          this.form.patchValue({ city: this.cities[0].id });
          this.getArea(this.cities[0].id);
        }
      }
    });
  }

  /**
   * 取得區域
   * @param cityId
   */
  getArea(cityId: any) {
    this.form.patchValue({ area: null });
    this.areaList = [];
    this.supabaseService.getDistricts(cityId)?.then(({data, error}) => {
      if (error) {
        console.error(error);
      }
      else {
        this.areaList = data;
        if (this.areaList.length > 0) {
          this.form.patchValue({ area: this.areaList[0].id });
          this.getStore(cityId, this.areaList[0].id);
        }
      }
    });
  }

  /**
   * 取得711門市
   * @param cityId
   * @param areaId
   */
  getStore(cityId: any, areaId: any) {
    this.form.patchValue({ store: null });
    this.storeList = [];
    this.supabaseService.getStores(cityId, areaId)?.then(({data, error}) => {
      if (error) {
        console.error(error);
      }
      else {
        this.storeList = data;
        if (this.storeList.length > 0) {
          this.form.patchValue({ store: this.storeList[0].id });
        }
      }
    });
  }

  /**
   * 取得選擇的711門市index
   * @returns
   */
  getSelectedStoreIndex(): number {
    return this.storeList.findIndex(store => store.id === this.form.value.store);
  }

  /**
   * 建立訂單
   */
  createOrder() {
    const sumPrice = this.cartItems.reduce((acc, item) => {
      return acc + (item.products.price * item.quantity) + (this.shippingMethod === 1 ? 70 : 60);
    }, 0);
    const orders: any = {
      member_id: this.supabaseService.userId$.getValue(),
      date: new Date().toISOString(),
      update: new Date().toISOString(),
      status: 0,
      total: sumPrice
    }
    const orderItems: any = {
      name: this.form.value.name,
      city: this.form.value.city,
      area: this.form.value.area,
      store: this.form.value.store,
      address: this.form.value.address,
      phone: this.form.value.phone,
      pay: this.payMethod,
      shipping: this.shippingMethod,
    };
    this.supabaseService.createOrder(orders)?.then(({ data, error }: { data: { id: number }[] | null, error: any }) => {
      if (error) {
        console.error(error);
      }
      else {
        this.cartItems.forEach(item => {
          orderItems['product_id'] = item.product_id;
          orderItems['quantity'] = item.quantity;
          orderItems['price'] = item.products.price;
          if (data && data[0]) {
            orderItems['order_id'] = data[0].id;
          }
        });
        this.supabaseService.createOrderItem(orderItems)?.then(({ data, error }) => {
          if (error) {
            console.error(error);
          }
          else {
            this.cartItems.forEach(item => {
              this.supabaseService.updateProductStock(item.id, item.quantity);
            });
          }
        });
      }
    });
  }

  /**
   * 運送方式變動
   */
  onShippingMethodChange() {
    if (this.shippingMethod === 2) {
      this.form.addControl('store', this.fb.control(null, Validators.required));
    }
    else {
      this.form.removeControl('store');
    }
  }

  /**
   * 付款方式變動
   */
  onPayMethodChange() {
    if (this.payMethod === 1) {
      this.form.addControl('cardNumber', this.fb.control('', Validators.required));
      this.form.addControl('cardHolder', this.fb.control('', Validators.required));
      this.form.addControl('expiryDate', this.fb.control('', Validators.required));
      this.form.addControl('csv', this.fb.control('', Validators.required));
    }
    else {
      ['cardNumber', 'cardHolder', 'expiryDate', 'csv'].forEach(ctrl => {
        this.form.removeControl(ctrl);
      });
    }
  }

}

