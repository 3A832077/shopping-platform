import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SupabaseService } from '../../service/supabase.service';
import { checkPassword } from '../../validator/checkPassword';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    FormsModule,
    ReactiveFormsModule,
    NzLayoutModule,
    NzIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  form: FormGroup = new FormGroup({});

  constructor(
               private fb: FormBuilder,
               public supabaseService: SupabaseService,
             ) { }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), checkPassword]],
    });
  }

  async login() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      const result = await this.supabaseService.login(email, password);
      if (result?.error) {
        console.error(result.error.message);
      }
      else {
        window.location.href = '/home';
      }
    }
  }
}



