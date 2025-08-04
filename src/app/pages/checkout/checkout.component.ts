import { Component, inject } from '@angular/core';
import { OnInit } from '@angular/core';
import { SupabaseService } from '../../service/supabase.service';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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

  shippingMethod: string = 'home';

  cities: any[] = [];

  areaList: any[] = [];

  storeList: any[] = [];

  form: FormGroup = new FormGroup({});

  payMethod: string = 'credit';

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
      name: [''],
      city: [null],
      area: [null],
      store: [null],
      address: [''],
      phone: [''],
      cardNumber: [''],
      cardHolder: [''],
      expiryDate: [''],
      cvv: ['']
    });
    this.getCity();
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

  getSelectedStoreIndex(): number {
    return this.storeList.findIndex(store => store.id === this.form.value.store);
  }




}
