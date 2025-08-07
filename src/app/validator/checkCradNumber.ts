import { AbstractControl } from '@angular/forms';

export function checkCardNumberValidator(control: AbstractControl): { [key: string]: any } | null {
  const cardNumber = control.value.replace(/[^0-9]/g, '');

  // 如果是空字串，直接通過驗證
  if (!cardNumber) {
    return { required: true };
  }

  // 必須是 16 位數字
  if (!/^\d{16}$/.test(cardNumber)) {
    return { invalidCardNumber: true };
  }

  // 檢查卡號開頭是否符合 VISA、Mastercard、American Express 或 JCB 的規則
  const firstDigit = parseInt(cardNumber[0], 10);
  const firstTwoDigits = parseInt(cardNumber.slice(0, 2), 10);
  const firstThreeDigits = parseInt(cardNumber.slice(0, 3), 10);

  if (!(firstDigit === 4 || // VISA
      (firstDigit === 5 && firstTwoDigits >= 51 && firstTwoDigits <= 55) || // Mastercard
      (firstDigit === 3 &&
        // JCB // American Express
        ((firstThreeDigits >= 340 && firstThreeDigits <= 379) || (firstThreeDigits >= 528 && firstThreeDigits <= 589)))))
  {
    return { invalidCardNumber: true };
  }

  // 使用 Luhn 演算法驗證卡號
  if (!luhnCheck(cardNumber)) {
    return { invalidCardNumber: true };
  }

  return null; // 驗證通過
}

/**
 * Luhn 演算法檢查卡號
 */
function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}
