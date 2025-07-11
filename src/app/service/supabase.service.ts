import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../env/environment';
import { Database } from '../types/supabase';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {

  private supabase?: SupabaseClient;

  constructor() {
    this.createClient();
  }

  /**
   * 建立 Supabase 客戶端
   */
  createClient() {
    if (typeof window === 'undefined' || createClient<Database> === undefined) return;
    this.supabase = createClient<Database>(env.supabaseUrl, env.supabaseKey);
  }

  login(email: string, password: string) {
    return this.supabase?.auth.signInWithPassword({ email, password });
  }

  register(email: string, password: string) {
    return this.supabase?.auth.signUp({ email, password });
  }

  googleLogin() {
    return this.supabase?.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  }

  /**
   * 取得產品類別
   */
  getCategories() {
    return this.supabase?.from('categories').select('*');
  }



}
