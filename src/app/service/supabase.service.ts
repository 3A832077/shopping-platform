import { Injectable, signal, computed } from '@angular/core';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../env/environment';
import { Database } from '../types/supabase';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {

  supabase?: SupabaseClient;

  // 使用 Signal 管理狀態
  userId = signal<string | null>(null);

  email = signal<string | null>(null);

  cartItems = signal<any[]>([]);

  // 利用 computed 自動追蹤數量，當 cartItems 改變時，這個值也會跟著變
  cartCount = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.quantity, 0)
  );

  constructor() {
    this.createClient();
    this.loginState();
  }

  /**
   * 建立 Supabase 客戶端
   */
  createClient() {
    if (typeof window === 'undefined' || createClient === undefined) return;
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
        this.fetchCartItems(); // 登入後自動抓取購物車
      }
      else {
        this.userId.set(null);
        this.email.set(null);
        this.cartItems.set([]); // 登出時清空
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
  getProducts(page: number = 1, limit: number = 12, sort: boolean = false, category?: any, minPrice?: number, maxPrice?: number, excellent?: boolean) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let query = this.supabase?.from('products').select('*', { count: 'exact' }).eq('status', true);

    if (Array.isArray(category) && category.length > 0) {
      query = query?.in('category', category);
    } else if (category !== undefined && category !== null) {
      query = query?.eq('category', category);
    }

    if (minPrice !== undefined && minPrice !== null) {
      query = query?.gte('price', minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== null && maxPrice > 0) {
      query = query?.lte('price', maxPrice);
    }

    if (excellent) {
      query = query?.eq('good', true);
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
   * 取得所有商品資料
   */
  getAllProducts() {
    return this.supabase?.from('products').select('*');
  }

  /**
   * 取得購物車商品
   */
  getCartItems() {
    const currentUserId = this.userId(); // 替代 .getValue()
    if (!currentUserId) return null;

    return this.supabase
      ?.from('cart')
      .select(`id, product_id, quantity, products (id, name, price, imageUrl, stock)`)
      .eq('user_id', currentUserId);
  }

  /**
   * 用Signal管理購物車資料
   */
  fetchCartItems() {
    this.getCartItems()?.then(({ data, error }) => {
      if (!error) {
        this.cartItems.set(data || []); // 替代 .next()
      }
    });
  }

  /**
   * 新增商品到購物車
   * @param productId
   * @param quantity
   */
  async addToCart(productId: number, quantity: number) {
    const currentUserId = this.userId();
    // 1. 先檢查購物車裡是否已經有這件商品
    const { data: existingItem, error: fetchError } = await this.supabase!
      .from('cart')
      .select('id, quantity')
      .eq('user_id', currentUserId)
      .eq('product_id', productId)
      .maybeSingle(); // 使用 maybeSingle 避免找不到時報錯

    if (fetchError) {
      console.error('檢查購物車失敗:', fetchError);
      return;
    }

    if (existingItem) {
      // 2. 如果已存在，更新數量 (原本數量 + 新增數量)
      const newQuantity = existingItem.quantity + quantity;
      return this.supabase!.from('cart')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);
    }
    else {
      // 3. 如果不存在，直接新增
      return this.supabase!.from('cart')
        .insert({
          user_id: currentUserId,
          product_id: productId,
          quantity: quantity,
        });
    }
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
    if (response?.data?.stock) {
      await this.supabase?.from('products').update({ stock: response.data.stock - quantity }).eq('id', productId);
    }
  }

  /**
   * 取得所有訂單
   */
  getOrders(page: number, limit: number) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const currentUserId = this.userId(); // 替代 .getValue()

    return this.supabase
      ?.from('orders')
      .select(`*,order_items(*)`, { count: 'exact' })
      .order('id', { ascending: true })
      .order('update', { ascending: false })
      .order('date', { ascending: false })
      .range(from, to)
      .eq('member_id', currentUserId);
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
