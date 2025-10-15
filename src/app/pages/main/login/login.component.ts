import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { SupabaseService } from '../../../service/supabase.service';
import { checkPassword } from '../../../validator/checkPassword';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService, NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    FormsModule,
    ReactiveFormsModule,
    NzLayoutModule,
    NzIconModule,
    NzModalModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  form: FormGroup = new FormGroup({});

  isRegister = false;

  email: string = '';

  modal: NzModalRef | null = null;

  constructor(
    private fb: FormBuilder,
    public supabaseService: SupabaseService,
    private message: NzMessageService,
    private modalService: NzModalService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, checkPassword]],
    });
  }

  /**
   * 登入
   */
  async login() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      const result = await this.supabaseService.login(email, password);
      if (result?.error) {
        this.message.error('登入失敗，電子郵件或密碼錯誤');
        console.error(result.error);
      } else {
        window.location.href = '/home';
      }
    }
  }

  /**
   * 切換登入/註冊模式
   */
  toggleMode() {
    this.isRegister = !this.isRegister;
  }

  /**
   * 註冊
   */
  async register() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      const result = await this.supabaseService.register(email, password);
      if (result?.error) {
        console.error(result.error);
      } else {
        this.message.success('註冊成功，請查看電子郵件確認連結');
        window.location.href = '/login';
      }
    }
  }

  /**
   * 忘記密碼
   */
  openModal(tplContent: TemplateRef<{}>) {
    const modal = this.modalService.create({
      nzTitle: '忘記密碼',
      nzContent: tplContent,
      nzMaskClosable: false,
      nzClosable: false,
      nzCentered: true,
      nzFooter: null,
      nzZIndex: 60,
    });
  }

  /**
   * 關閉modal
   */
  close() {
    this.modalService.closeAll();
  }

  /**
   * 發送重設密碼郵件
   */
  async sendResetEmail() {
    if (this.email) {
      const result = await this.supabaseService.forgetPassword(this.email);
      if (result?.error) {
        this.message.error(result.error.message);
      } else {
        this.message.success('重置密碼郵件已發送到您的電子郵件地址');
        this.close();
      }
    } else {
      this.message.error('請輸入您的電子郵件地址');
    }
  }
}
