import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'meetingStatus',
  standalone: true
})
export class CanOpenPipe implements PipeTransform {

  /**
   * @param now 當前時間（從 timer 傳入）
   * @param targetDateStr 預約的日期時間字串
   */
  transform(now: Date | null, targetDateStr: string): number {
    if (!now || !targetDateStr) return 0;

    const target = new Date(targetDateStr);
    const diff = (target.getTime() - now.getTime()) / (1000 * 60); // 分鐘差

    if (diff > 30) {
      return 0; // 未開放 (距離開始還有 30 分鐘以上)
    }
    else if (diff <= 30 && diff >= -15) {
      return 1; // 前往檢測 (開始前 30 分至開始後 15 分)
    }
    else {
      return 2; // 已過期 (開始超過 15 分鐘)
    }
  }
}
