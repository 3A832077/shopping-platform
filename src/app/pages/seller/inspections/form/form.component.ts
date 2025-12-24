import { Component, OnInit } from '@angular/core';
import { NzFormModule } from 'ng-zorro-antd/form';
import { formatDate } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { catchError, EMPTY, tap } from 'rxjs';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { env } from '../../../../env/environment';
import { SellerService } from '../../../../service/seller.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { GoogleService } from '../../../../service/google.service';

@Component({
  selector: 'inspections-form',
  imports: [
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzDividerModule,
    NzSelectModule,
    NzDatePickerModule
],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent implements OnInit {
  form: FormGroup = new FormGroup({});

  weekList: any[] = [];

  categoryList: any[] = [];

  productList: any[] = [];

  detailTimeList: any[] = [];

  selectedProducts: any[] = [];

  cardError: string | null = null;

  meetUrl: string = '';

  cardTypeImg: string | null = null;

  timeList: any[] = [
    { label: '09:00 - 10:00' },
    { label: '10:00 - 11:00' },
    { label: '11:00 - 12:00' },
    { label: '13:00 - 14:00' },
    { label: '14:00 - 15:00' },
    { label: '15:00 - 16:00' },
    { label: '16:00 - 17:00' },
  ];

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    public modal: NzModalRef,
    private http: HttpClient,
    private sellerService: SellerService,
    private modalService: NzModalService,
    private googleService: GoogleService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      product: [null, Validators.required],
      category: [null, Validators.required],
      date: [null, Validators.required],
      time: [null, Validators.required],
      detailTime: [null, Validators.required],
    });
    this.generateWeekList();
    this.getCategory();
    this.waitForGoogleScript().then(() => {
      this.googleService.init(env.googleClientId);
    });
  }

  /**
   * 監聽日期選擇的變化
   * @param event
   */
  dateChange(event: any): void {
    this.form.patchValue({ time: null, detailTime: null });
    this.detailTimeList = [];
  }

  /**
   * 監聽時間選擇的變化
   * @param event
   */
  timeChange(event: any): void {
    this.form.get('detailTime')?.setValue(null);
    this.detailTimeList = [];
    if (!event) return;

    const selectedDate = this.form.value.date;
    if (!selectedDate) return;

    const [start, end] = event.split(' - ');
    const endDT = this.getDateTime(selectedDate, end);

    // 如果現在時間已經讓這個時段沒有可選的小節點了
    if (this.isTooLate(endDT)) {
      this.message.warning('該時段已無剩餘預約點，請選擇下一時段');
      this.form.get('time')?.setValue(null);
      return;
    }

    this.generateDetailTime(this.getDateTime(selectedDate, start), endDT);
  }

  /**
   * 取得「目前選中日期」下可用的時段
   * @returns
   */
  get filteredTimeList(): any[] {
    const selectedDate = this.form.get('date')?.value;
    if (!selectedDate) return [];

    const selectedTS = this.getDayTimestamp(selectedDate);
    const todayTS = this.getDayTimestamp(new Date());

    if (selectedTS > todayTS) return this.timeList;

    if (selectedTS === todayTS) {
      return this.timeList.filter(item => {
        const endStr = item.label.split(' - ')[1];
        const endDT = this.getDateTime(selectedDate, endStr);

        // 改用 isTooLate：如果現在是 14:46，距離 15:00 不到 15 分鐘，回傳 true (過濾掉)
        return !this.isTooLate(endDT);
      });
    }
    return [];
  }

  /**
   * 監聽類別選擇的變化
   * @param event
   */
  categoryChange(event: any): void {
    this.form.get('product')?.setValue(null);
    this.selectedProducts = event ? this.productList.find(p => p.category === event)?.products || [] : [];
  }

  /**
   * 取得產品列表
   */
  getProducts() {
    this.sellerService.getAllProducts()?.then(({ data, error }) => {
      if (error) {
        console.error('取得產品列表失敗', error);
        return;
      }
      const originalList = data;
      this.productList = this.categoryList.map((category: any) => {
        const name = originalList.filter((e: any) =>
          e.category.toString() === category.id.toString()
        ).map((e: any) => e.name);
        return {
          category: category.name,
          products: name,
        };
      });
    });
  }

  /**
   * 取得類別列表
   */
  getCategory() {
    this.sellerService.getCategories()?.then(({ data, error }) => {
      if (error) {
        console.error('取得類別列表失敗', error);
        return;
      }
      this.categoryList = data || [];
      this.getProducts();
    });
  }

  /**
   * 生成星期列表
   */
  generateWeekList(): void {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const mmdd = formatDate(d, 'yyyy-MM-dd', 'en-US');
      this.weekList.push({ value: mmdd, label: `${mmdd} (${weekdays[d.getDay()]})` });
    }
  }

  /**
   * 生成詳細時間列表
   * @param start
   * @param end
   */
  private generateDetailTime(startTime: Date, endTime: Date): void {
    const times = [];
    let current = new Date(startTime);

    while (current < endTime) {
      if (!this.isPast(current)) {
        const timeStr = this.formatTime(current);
        times.push({ label: timeStr, value: timeStr });
      }
      current = new Date(current.getTime() + 15 * 60000);
    }
    this.detailTimeList = times;
  }

  /**
   * 提交表單
   */
  submit(): void {
    if (this.form.valid) {
      const data = {
        product: this.form.value.product,
        category: this.form.value.category,
        date: this.form.value.date,
        detailTime: this.form.value.detailTime,
        url: this.meetUrl,
        update: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'zh-TW', '+0800'),
      };

      this.sellerService.addInspection(data)?.then(({data, error}) => {
        if (error) {
          console.error(error);
          this.message.error('新增檢測失敗');
          return;
        }
        this.message.success('新增成功');
        this.modal.close('success');
      });
    }
    else {
      // 表單驗證
      Object.values(this.form.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  /**
   * 建立會議
   */
  async createEvent() {
    const { date, detailTime } = this.form.value;
    const accessToken = await this.sellerService.getAccessToken();

    if (!date || !detailTime) return this.message.warning('請選擇完整的預約日期與時間');
    if (!accessToken) return this.handleGoogleAuthError();

    const startDT = this.getDateTime(date, detailTime);
    const endDT = new Date(startDT.getTime() + 30 * 60000);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    const eventBody = {
      summary: '檢測會議',
      description: '',
      start: { dateTime: startDT.toISOString(), timeZone: 'Asia/Taipei' },
      end: { dateTime: endDT.toISOString(), timeZone: 'Asia/Taipei' },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`
        },
      },
    };

    this.http.post(`${env.googleApiUrl}`, eventBody, { headers }).pipe(
      tap((res: any) => {
        this.meetUrl = res.hangoutLink;
        this.submit();
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) this.handleGoogleAuthError();
        else this.message.error('建立會議失敗');
        return EMPTY;
      })
    ).subscribe();
  }

  /**
 * 統一處理 Google 授權失效的彈窗邏輯
 */
  private handleGoogleAuthError(): void {
    this.modalService.info({
      nzContent: 'Google帳號授權已過期或未綁定，請重新登入',
      nzOkText: '確定',
      nzOnOk: () => {
        this.sellerService.googleLogin();
      }
    });
  }

  /**
   * 等待 Google Script載入完成
   * @returns
   */
  waitForGoogleScript(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined') {
        if ((window as any).google?.accounts?.oauth2) {
          resolve();
          return;
        }

        const timer = setInterval(() => {
          if ((window as any).google?.accounts?.oauth2) {
            clearInterval(timer);
            resolve();
          }
        }, 50);
      }
    });
  }

  /**
   * 檢查日期是否為過去
   * @param date
   * @returns
   */
  private isPast(date: Date): boolean {
    return date.getTime() < Date.now();
  }

  /**
   * 取得日期的時間
   * @param date
   * @returns
   */
  private getDayTimestamp(date: any): number {
    return new Date(date).setHours(0, 0, 0, 0);
  }

  /**
   * 取得日期與時間的 Date物件
   * @param date
   * @param timeStr
   * @returns
   */
  private getDateTime(date: any, timeStr: string): Date {
    const res = new Date(date);
    const [h, m] = timeStr.split(':').map(Number);
    res.setHours(h, m, 0, 0);
    return res;
  }

  /**
   * 格式化時間字串
   * @param date
   * @returns
   */
  private formatTime(date: Date): string {
    return formatDate(date, 'HH:mm', 'en-US');
  }

  /**
   * 檢查該時段是否已無可用的小時段
   * @param endTime 該大時段的結束時間 (例如 15:00)
   */
  private isTooLate(endTime: Date): boolean {
    const now = new Date();
    // 緩衝時間：最後一個時段是 45 分，所以如果現在距離整點不到 15 分鐘，就代表沒時段了
    const bufferTime = 15 * 60000;
    return (endTime.getTime() - now.getTime()) <= bufferTime;
  }


}
