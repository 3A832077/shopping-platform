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
import { CanOpenPipe } from '../../../pipe/can-open.pipe';
import { map, shareReplay, timer } from 'rxjs';

@Component({
  selector: 'app-inspections',
  imports: [
              CommonModule, NzTableModule, NzButtonModule,
              NzModalModule, NzDividerModule, NzFormModule,
              NzInputModule, FormsModule, ReactiveFormsModule,
              NzIconModule, CanOpenPipe
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

  now$ = timer(0, 30000).pipe(
    map(() => new Date()),
    shareReplay(1)
  );

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
   * 開啟檢測連結
   * @param url
   */
  openLink(url: string): void {
    window.open(url, '_blank');
  }




}
