import { Component, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormComponent } from './form/form.component';
import { SellerService } from '../../../service/seller.service';

@Component({
  selector: 'app-inspections',
  imports: [
              CommonModule, NzTableModule, NzButtonModule,
              NzModalModule, NzDividerModule, NzFormModule,
              NzInputModule, FormsModule, ReactiveFormsModule,
              NzIconModule
           ],
  templateUrl: './inspections.component.html',
  styleUrl: './inspections.component.css'
})
export class InspectionsComponent implements OnInit {

  displayedList: any[] = [];

  total: number = 0;

  pageIndex: number = 1;

  pageSize: number = 10;

  loading: boolean = false;

  meetUrl: string = '';

  userId: string | null = null;

  email: string | null = null;

  hasWarned = false;

  constructor(
                private modalService: NzModalService,
                private sellerService: SellerService,
              ) {
                effect(() => {
                  this.userId = this.sellerService.userId();
                  this.email = this.sellerService.email();
                });
               }

  ngOnInit(): void {
    this.getInspections();
  }

  /**
   * 取得檢測列表
   * @param pageIndex
   * @param pageSize
   */
  getInspections(pageIndex: number = 1, pageSize: number = 10) {
    this.loading = true;
    this.sellerService.getInspections(pageIndex, pageSize)?.then(({ data, error, count }) => {
      this.loading = false;
      if (error) {
        console.error(error);
        return;
      }
      this.displayedList = data || [];
      this.total = count || 0;
    });
  }

  /**
   * 開啟新增/編輯modal
   * @param data
   */
  openModal(){
    const modal = this.modalService.create({
      nzTitle: '新增',
      nzContent: FormComponent,
      nzMaskClosable: false,
      nzClosable: false,
      nzCentered: true,
      nzFooter: null,
      nzZIndex: 60,
    });
    modal.afterClose.subscribe((res) => {
      if (res === 'success') {
        this.getInspections();
      }
    });
  }

  /**
   * 檢查是否可以開啟連結
   * @param date
   */
  canOpenLink(date: string): boolean {
    if (!date) return false;
    const now = new Date();
    const target = new Date(date);
    const diff = (target.getTime() - now.getTime()) / (1000 * 60); // 分鐘
    return diff <= 30 && diff >= -15;
  }

  /**
   * 開啟檢測連結
   * @param url
   */
  openLink(url: string): void {
    window.open(url, '_blank');
  }




}
