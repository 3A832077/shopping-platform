import { AbstractControl } from '@angular/forms';

export function checkPassword(control: AbstractControl): { [key: string]: any } | null {

  const value = control.value || '';
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasMinLength = value.length >= 8;

  if (hasUpperCase && hasLowerCase && hasNumber && hasMinLength) {
    return null;
  }
  else if (value === '') {
    return null;
  }
  return {
    passwordError: true
  };

}
