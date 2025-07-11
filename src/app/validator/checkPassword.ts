import { AbstractControl } from '@angular/forms';

export function checkPassword(control: AbstractControl): { [key: string]: any } | null {

  const value = control.value || '';
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);

  if (hasUpperCase && hasLowerCase && hasNumber) {
    return null;
  }
  return {
    passwordComplexity: true
  };

}
