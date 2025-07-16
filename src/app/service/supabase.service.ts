import { Injectable } from '@angular/core';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../env/environment';
import { Database } from '../types/supabase';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {

  supabase?: SupabaseClient;

  userId$ = new BehaviorSubject<string | null>(null);

  email$ = new BehaviorSubject<string | null>(null);

  constructor() {
    this.createClient();
    this.loginState();
  }

  /**
   * 建立 Supabase 客戶端
   */
  createClient() {
    if (typeof window === 'undefined' || createClient<Database> === undefined) return;
    this.supabase = createClient<Database>(env.supabaseUrl, env.supabaseKey);
  }

  /**
   * 登入
   * @param email
   * @param password
   */
  login(email: string, password: string) {
    return this.supabase?.auth.signInWithPassword({ email, password });
  }

  /**
   * 註冊
   * @param email
   * @param password
   */
  register(email: string, password: string) {
    return this.supabase?.auth.signUp({ email, password });
  }

  /**
   * 使用者登出
   */
  logout() {
    return this.supabase?.auth.signOut();
  }

  /**
   * 監聽登入狀態變化
   */
  loginState() {
    return this.supabase?.auth.onAuthStateChange((_, session: Session | null) => {
      if (session) {
        this.userId$.next(session.user.id);
        this.email$.next(session.user.email ?? null);
      }
      else {
        this.userId$.next(null);
        this.email$.next(null);
      }
    });
  }

  /**
   * 使用 Google 登入
   */
  googleLogin() {
    return this.supabase?.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  }

  /**
   * 忘記密碼
   * @param email
   */
  forgetPassword(email: string) {
    return this.supabase?.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
  }

  /**
   * 取得產品類別
   */
  getCategories() {
    return this.supabase?.from('categories').select('*').order('id', { ascending: true });
  }

  /**
   * 取得產品列表
   * @param page
   * @param limit
   */
  getProducts(page: number, limit: number) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    return this.supabase?.from('products').select('*',
      { count: 'exact' }).order('update', { ascending: false }).order('id').range(from, to);
  }


}
