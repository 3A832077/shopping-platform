import { Component, inject, OnInit } from '@angular/core';
import { NzFormModule } from 'ng-zorro-antd/form';
import { formatDate } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { SellerService } from '../../../../service/seller.service';

@Component({
  selector: 'products-form',
  imports: [
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzDividerModule,
    NzSelectModule,
    NzRadioModule,
    NzUploadModule
],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit{

  data = inject(NZ_MODAL_DATA) || undefined;

  form: FormGroup = new FormGroup({});

  fileList: NzUploadFile[] = [];

  categoryList: any[] = [];

  constructor(
                private fb: FormBuilder,
                private message: NzMessageService,
                private modal: NzModalRef,
                public sellerService: SellerService
              ){}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data?.name || null],
      price: [this.data?.price || null],
      info: [this.data?.info || null],
      category: [this.data?.category || null],
      stock: [this.data?.stock || 0],
      status: [this.data?.status || true],
    });
    if (this.data?.imageUrl) {
      this.fileList = [{
        uid: '-1',
        name: this.data.fileName,
        status: 'done',
        url: this.data.imageUrl,
      }];
    }
    this.getCategory();
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    return false;
  };

  /**
   * 關閉新增/編輯modal
   */
  close() {
    this.modal.destroy();
  }

  /**
   * 取得所有產品類別
   */
  getCategory(){
    this.sellerService.getCategories()?.then(({ data, error }) => {
      if (error) {
        console.error('取得產品類別失敗', error);
        return;
      }
      this.categoryList = data || [];
    });
  }

  /**
   * 新增/編輯產品
   */
  async sumbit() {
    let imageUrl = '';
    if (this.fileList.length > 0 &&(!this.data?.imageUrl || this.fileList[0].url !== this.data.imageUrl)) {
      imageUrl = await this.sellerService.uploadImage(this.fileList[0]) || '';
      this.fileList[0].url = imageUrl;
    }
    else {
      imageUrl = this.data?.imageUrl || '';
    }

    const params: any = {
      name: this.form.value.name,
      price: Number(this.form.value.price),
      info: this.form.value.info,
      category: this.form.value.category,
      stock: Number(this.form.value.stock),
      status: this.form.value.status,
      update: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'zh-TW', '+0800'),
      imageUrl: imageUrl,
      fileName: this.fileList.length > 0 ? this.fileList[0].name : ''
    };

    const res = this.data ? await this.sellerService.updateProduct(this.data.id, params) : await this.sellerService.addProduct(params);

    if (res?.error) {
      console.error(res.error);
      return;
    }
    this.message.success(this.data ? '編輯成功' : '新增成功');
    this.modal.close('success');
  }



}
