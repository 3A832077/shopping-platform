import { Component, effect, OnInit } from '@angular/core';
import { NzFormModule } from 'ng-zorro-antd/form';
import { formatDate } from '@angular/common';
import { FormsModule,ReactiveFormsModule,FormGroup,FormBuilder,Validators } from '@angular/forms';
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
// import { checkCardNumberValidator } from '../../../../validator/checkCradNumber';
// import { checkExpireDateValidator } from '../../../../validator/checkExpireDate';
import { SellerService } from '../../../../service/seller.service';
import { NzModalService } from 'ng-zorro-antd/modal';

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

  accessToken: string | null = null;

  isExpired: boolean = false;

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
    private modal: NzModalRef,
    private http: HttpClient,
    private sellerService: SellerService,
    private modalService: NzModalService
  ) {
      effect(() => {
        this.accessToken = this.sellerService.authToken();
        this.isExpired = this.sellerService.isExpired();
      });
    }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [null],
      product: [null],
      category: [null],
      date: [null],
      time: [null],
      detailTime: [null],
    });
    this.generateWeekList();
    this.getCategory();
  }

  /**
   * 監聽時間選擇的變化
   * @param event
   */
  timeChange(event: any): void {
    if (event) {
      const [start, end] = event.split(' - ');
      const selectedDate = this.form.value.date;

      if (selectedDate) {
        const now = new Date();
        // 1. 關鍵：把選取的日期和現在的日期都歸零到 00:00:00，只比日期
        const selectedDay = new Date(selectedDate);
        selectedDay.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 2. 如果選的是今天，才需要判斷時分秒
        if (selectedDay.getTime() === today.getTime()) {
          const startDateTime = new Date(selectedDate);
          const [startHour, startMin] = start.split(':').map(Number);
          startDateTime.setHours(startHour, startMin, 0, 0);

          const endDateTime = new Date(selectedDate);
          const [endHour, endMin] = end.split(':').map(Number);
          endDateTime.setHours(endHour, endMin, 0, 0);

          // 如果連結束時間都比現在早，才報錯
          if (endDateTime < now) {
            this.message.warning('該時段已超過目前時間，請重新選擇');
            this.form.get('time')?.setValue(null); // 把選錯的大時段清掉
            this.detailTimeList = [];
            this.form.get('detailTime')?.setValue(null);
            return;
          }
        }
        // 3. 如果選的是未來日期 (selectedDay > today)，直接跳過判斷，執行 generateDetailTime
        else if (selectedDay < today) {
          // 如果是過去的日期 (DatePicker沒擋住的情況)
          this.message.warning('不可選擇過去的日期');
          this.form.get('time')?.setValue(null);
          return;
        }
      }

      // 合法時段或是未來日期，執行生成邏輯
      this.form.get('detailTime')?.setValue(null);
      this.generateDetailTime(start, end);
    }
    else {
      this.detailTimeList = [];
      this.form.get('detailTime')?.setValue(null);
    }
  }

  // 取得「目前選中日期」下可用的時段
  get filteredTimeList(): any[] {
    const selectedDate = this.form.get('date')?.value;
    if (!selectedDate) return [];

    const now = new Date();
    const todayStr = now.toDateString();
    const selectedDateObj = new Date(selectedDate);
    const isToday = selectedDateObj.toDateString() === todayStr;

    // 如果選的是未來日期，直接回傳原始清單
    if (selectedDateObj.setHours(0,0,0,0) > now.setHours(0,0,0,0)) {
      return this.timeList;
    }

    // 如果是今天，過濾掉已經結束的時段
    if (isToday) {
      return this.timeList.filter(item => {
        // 取得結束時間，例如 "09:00 - 10:00" 取出 "10:00"
        const endTimeStr = item.label.split(' - ')[1];
        const [endHour, endMin] = endTimeStr.split(':').map(Number);

        const endDateTime = new Date(selectedDateObj);
        endDateTime.setHours(endHour, endMin, 0, 0);

        // 只要結束時間比現在晚，就顯示出來
        return endDateTime > now;
      });
    }

    // 如果是過去的日期（DatePicker 沒擋住的情況），回傳空陣列
    return [];
  }

  /**
   * 監聽類別選擇的變化
   * @param event
   */
  categoryChange(event: any): void {
    if (event) {
      this.form.get('product')?.setValue(null);
      this.selectedProducts = this.productList
        .filter((e: any) => e.category === event)
        .flatMap((e: any) => e.products);
    }
    else {
      this.selectedProducts = [];
      this.form.get('product')?.setValue(null);
    }
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
   * 關閉modal
   */
  close() {
    this.modal.destroy();
  }

  /**
   * 生成星期列表
   */
  generateWeekList(): void {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const mmdd = `${date.getFullYear()}-${this.pad(
        date.getMonth() + 1
      )}-${this.pad(date.getDate())}`;
      const weekday = weekdays[date.getDay()];

      this.weekList.push({
        value: mmdd,
        label: `${mmdd} (${weekday})`,
      });
    }
  }

  /**
   * 補零
   * @param n
   */
  pad(n: number): string {
    return n < 10 ? '0' + n : n.toString();
  }

  /**
   * 生成詳細時間列表
   * @param start
   * @param end
   */
  private generateDetailTime(start: string, end: string): void {
    const selectedDate = this.form.value.date;
    if (!selectedDate) return;

    // 1. 建立當天的開始與結束時間物件，確保日期與選取的日期一致
    const startTime = this.getDateTime(selectedDate, start);
    const endTime = this.getDateTime(selectedDate, end);

    const now = new Date();
    const times: { label: string; value: string }[] = [];

    // 2. 判斷是否為今天
    const isToday = new Date(selectedDate).toDateString() === now.toDateString();

    let currentTime = new Date(startTime.getTime());

    while (currentTime < endTime) {
      // 3. 邏輯：如果不是今天，直接放進去；如果是今天，才需要比現在時間晚
      if (!isToday || currentTime > now) {
        times.push({
          label: this.formatTime(currentTime),
          value: this.formatTime(currentTime),
        });
      }
      currentTime = new Date(currentTime.getTime() + 15 * 60000); // 加 15 分鐘
    }

    this.detailTimeList = times;
  }

  /**
   * 輔助方法：結合日期與時間字串 (HH:mm) 產生完整的 Date 物件
   */
  private getDateTime(date: Date, timeStr: string): Date {
    const res = new Date(date);
    const [hours, minutes] = timeStr.split(':').map(Number);
    res.setHours(hours, minutes, 0, 0);
    return res;
  }

  /**
   * 將時間字串解析為 Date 物件
   */
  private parseTime(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * 將 Date 格式化為 HH:mm
   */
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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
  createEvent() {
    const selectedDate = this.form.value.date;
    const selectedTime = this.form.value.detailTime;

    // 1. 安全檢查：確保有選取日期和時間，避免 split 報錯
    if (!selectedDate || !selectedTime) {
      this.message.warning('請選擇完整的預約日期與時間');
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(hours, minutes, 0, 0);

    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // 加 30 分鐘

    // 2. 第一層防護：發送前的前端判斷
    if (this.accessToken === null || this.isExpired) {
      this.handleGoogleAuthError();
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    });

    const event = {
      summary: 'test',
      description: '123',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Taipei',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Taipei',
      },
      conferenceData: {
        createRequest: {
          requestId: 'meet-' + Date.now().toString(), // 建議用時間戳比隨機數穩定
        },
      },
    };

    // 3. 發送請求並處理第二層防護 (API 回傳 401)
    this.http.post(`${env.googleApiUrl}`, event, { headers }).pipe(
      tap((response: any) => {
        this.meetUrl = response.hangoutLink;
        console.log('會議連結:', this.meetUrl);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Google API Error:', error);

        // 如果 API 回傳 401，代表 Token 在後端已經失效了
        if (error.status === 401) {
          this.handleGoogleAuthError();
        } else {
          this.message.error('建立行事曆事件失敗，請稍後再試');
        }

        // 返回 EMPTY 讓 subscribe 不會執行
        return EMPTY;
      })
    ).subscribe(() => {
      // 只有成功拿回連結後才執行最後的 submit
      this.submit();
    });
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
   * 判斷信用卡號類別
   * @param event
   */
  // checkCardType(event: any): void {
  //   if (!event) {
  //     this.cardTypeImg = null;
  //     return;
  //   }
  //   const n = event.replace(/\D/g, '');
  //   if (/^4/.test(n)) this.cardTypeImg = '/img/visa.png';
  //   else if (/^5[1-5]/.test(n)) this.cardTypeImg = '/img/mastercard.png';
  //   else if (/^3[47]/.test(n)) this.cardTypeImg = '/img/amex.png';
  //   else if (/^35/.test(n)) this.cardTypeImg = '/img/JCB.png';
  //   else this.cardTypeImg = null;
  // }
}
