import { Injectable, signal } from '@angular/core';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../env/environment';
import { Database } from '../types/supabase';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SellerService {

  private supabase?: SupabaseClient;

  userId = signal<string | null>(null);

  email = signal<string | null>(null);

  authToken = signal<string | null>(null);

  isExpired = signal<boolean>(false);

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
        this.userId.set(session.user.id);
        this.email.set(session.user.email ?? null);
        this.authToken.set(session.access_token);
        this.isExpired.set(session.expires_at ? (Date.now() >= Number(session.expires_at * 1000)) : false);
      }
      else {
        this.userId.set(null);
        this.email.set(null);
        this.authToken.set(null);
        this.isExpired.set(false);
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
        scopes: 'https://www.googleapis.com/auth/calendar.events openid email profile'
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
   * 取得產品列表
   * @param page
   * @param limit
   */
  getProducts(page: number, limit: number, searchTerm: any, sortField: string = 'update', sortOrder: boolean = false, category: any = null) {
    let query = this.supabase?.from('products').select('*', { count: 'exact' });

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    if (Array.isArray(category) && category.length > 0) {
      query = query?.in('category', category);
    }
    else if (category !== undefined && category !== null) {
      query = query?.eq('category', category);
    }

    return query?.order(sortField, { ascending: sortOrder })
      .ilike('name', `%${searchTerm}%`)
      .order('id')
      .range(from, to);
  }

  /**
   * 新增產品
   * @param data
   */
  addProduct(data: any) {
    return this.supabase?.from('products').insert([data]);
  }

  /**
   * 更新產品
   * @param id
   * @param data
   */
  updateProduct(id: string, data: any) {
    return this.supabase?.from('products').update(data).eq('id', id);
  }

  /**
   * 刪除產品
   * @param id
   */
  deleteProduct(id: string) {
    return this.supabase?.from('products').delete().eq('id', id);
  }

  /**
   * 取得產品類別
   */
  getCategories() {
    return this.supabase?.from('categories').select('*');
  }

  /**
   * 取得所有產品
   */
  getAllProducts(){
    return this.supabase?.from('products').select('*');
  }

  /**
   * 上傳圖片到 Supabase Storage
   * @param file
   */
  async uploadImage(file: any) {
    if (!this.supabase) {
      console.error('Supabase client is not initialized');
      return;
    }
    const ext = file.name.split('.').pop(); // 副檔名
    const safeName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const { data, error } = await this.supabase.storage.from('image').upload(`public/img/${safeName}`, file);
    if (error) {
      console.error('上傳失敗', error);
      return;
    }

    // 建立可公開存取的網址
    const imageUrl = this.supabase?.storage.from('image').getPublicUrl(data.path).data.publicUrl;

    console.log('圖片網址：', imageUrl);
    return imageUrl;
  }

  /**
   * 取得所有訂單
   * @param page
   * @param limit
   * @param col
   * @param order
   */
  getOrders(page: number, limit: number, col: string = 'update', order: boolean = false) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    return this.supabase?.from('orders').select(`*,order_items(*)`, { count: 'exact' }).
    order(col, { ascending: order }).range(from, to);
  }

  /**
   * 編輯訂單
   * @param id
   * @param data
   */
  editOrder(id: string, data: any) {
    return this.supabase?.from('orders').update(data).eq('id', id);
  }

  /**
   * 取得所有檢測
   * @param page
   * @param limit
   */
  getInspections(page: number, limit: number) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    return this.supabase?.from('inspections').select('*', { count: 'exact' }).order('update', { ascending: false }).order('id').range(from, to);
  }

  /**
   * 新增檢測
   * @param data
   */
  addInspection(data: any) {
    return this.supabase?.from('inspections').insert([data]);
  }

  /**
   * 取得各類別銷售量
   */
  getCategorySales(){
    return this.supabase?.from('order_items').select(`quantity, products_id, products (category, categories (name))`);
  }

  /**
   * 取得所有訂單數量
   */
  getAllOrders() {
    return this.supabase?.from('orders').select('*', { count: 'exact' });
  }
}
