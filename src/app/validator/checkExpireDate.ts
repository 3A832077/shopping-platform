import { AbstractControl } from '@angular/forms';

export function checkExpireDateValidator(control: AbstractControl): { [key: string]: any } | null {
  const value = control.value;

  if (!value) {
    return { required: true };
  }

  if (value) {
    const currentDate = new Date();
    const inputDate = new Date(value);

    // 比較年份和月份
    if (
      inputDate.getFullYear() < currentDate.getFullYear() ||
      (inputDate.getFullYear() === currentDate.getFullYear() && inputDate.getMonth() < currentDate.getMonth())) {
      return { expired: true };
    }
  }
  return null;

}
