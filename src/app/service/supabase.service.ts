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

  cartItems$ = new BehaviorSubject<any[]>([]);

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
  getProducts(page: number = 1, limit: number = 12, sort: boolean = false, category?: any, minPrice?: number, maxPrice?: number) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let query = this.supabase?.from('products').select('*', { count: 'exact' }).eq('status', true);

    if (Array.isArray(category) && category.length > 0) {
      query = query?.in('category', category);
    }
    else if (category !== undefined && category !== null) {
      query = query?.eq('category', category);
    }

    if (minPrice !== undefined && minPrice !== null) {
      query = query?.gte('price', minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== null && maxPrice > 0) {
      query = query?.lte('price', maxPrice);
    }

    return query?.order('update', { ascending: sort }).order('id').range(from, to);
  }

  /**
   * 取得產品詳細資訊
   * @param id
   */
  getProductById(id: number) {
    return this.supabase?.from('products').select('*').eq('id', id).single();
  }

  /**
   * 取得同類別商品
   * @param id
   */
  getRelatedProducts(id: number) {
    return this.supabase?.from('products').select('*').eq('category', id);
  }

  /**
   * 取得購物車商品
   */
  getCartItems() {
    return this.supabase?.from('cart').select(`id, product_id, quantity,
      products (id, name, price, imageUrl, stock)`).eq('user_id', this.userId$.getValue());
  }

  /**
   * 用BehaviorSubject 管理購物車資料
   */
  fetchCartItems() {
    this.getCartItems()?.then(({ data, error }) => {
      if (!error) {
        this.cartItems$.next(data || []);
      }
    });
  }

  /**
   * 新增商品到購物車
   * @param productId
   * @param quantity
   */
  addToCart(productId: number, quantity: number) {
    return this.supabase?.from('cart').insert({
      user_id: this.userId$.getValue(),
      product_id: productId,
      quantity: quantity,
    });
  }

  /**
   * 移除購物車商品
   * @param itemId
   */
  removeCartItem(itemId: string) {
    return this.supabase?.from('cart').delete().eq('id', itemId);
  }

  /**
   * 更新購物車商品數量
   * @param itemId
   * @param quantity
   */
  updateCartItem(itemId: string, quantity: number) {
    return this.supabase?.from('cart').update({ quantity }).eq('id', itemId);
  }

  /**
   * 建立訂單
   * @param orderData
   */
  createOrder(orderData: any) {
    return this.supabase?.from('orders').insert(orderData).select('id').single();
  }

  /**
   * 建立訂單商品
   * @param orderItemData
   */
  createOrderItem(orderItemData: any) {
    return this.supabase?.from('order_items').insert(orderItemData);
  }

  /**
   * 商品庫存扣掉訂單數量
   */
  async updateProductStock(productId: number, quantity: number) {
    const response = await this.supabase?.from('products').select('stock').eq('id', productId).single();
    if (response && response.data && response.data.stock) {
      await this.supabase?.from('products').update({ stock: response.data.stock - quantity }).eq('id', productId);
    }
  }

  /**
   * 取得所有訂單
   */
  getOrders(page: number, limit: number) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    return this.supabase?.from('orders').select(`*,
      order_items(orders_id, name, quantity, pay, shipping)`,
      { count: 'exact' }).order('update', { ascending: false }).order('id').range(from, to).
      eq('member_id', this.userId$.getValue());
  }
  /**
   * 取得縣市列表
   */
  getCities() {
    return this.supabase?.from('city').select('*').order('id', { ascending: true });
  }

  /**
   * 取得縣市下的區域列表
   * @param cityId
   */
  getDistricts(cityId: number) {
    return this.supabase?.from('area').select('*').eq('city_id', cityId).order('id', { ascending: true });
  }

  /**
   * 取得711門市
   * @param cityId
   * @param areaId
   */
  getStores(cityId: number, areaId: number) {
    return this.supabase?.from('store').select('*').eq('city_id', cityId).eq('area_id', areaId);
  }

  /**
   * 更新訂單狀態
   * @param orderId
   * @param params
   */
  editOrder(orderId: string, params: any) {
    return this.supabase?.from('orders').update(params).eq('id', orderId);
  }

}
