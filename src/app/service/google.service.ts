import { Injectable, signal } from '@angular/core';

declare const google: any;
@Injectable({
  providedIn: 'root'
})
export class GoogleService {

  private tokenClient: any;

  private accessToken: string | null = null;

  private expireAt: number = 0;

  googleLinked = signal(false);

  init(clientId: string) {
    // 防止重複初始化
    if (this.tokenClient) return;

    // 防止 script 還沒載好
    if (typeof google === 'undefined' || !google.accounts?.oauth2) {
      throw new Error('Google Identity Services not loaded yet');
    }

    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      callback: () => {},
    });
  }

  async getAccessToken(): Promise<string> {
    // 已有有效 token
    if (this.accessToken && Date.now() < this.expireAt - 60_000) {
      this.googleLinked.set(true);
      return this.accessToken;
    }

    return new Promise((resolve, reject) => {
      this.tokenClient.callback = (resp: any) => {
        if (resp?.error) {
          this.googleLinked.set(false);
          reject(resp);
          return;
        }

        this.accessToken = resp.access_token;
        this.expireAt = Date.now() + resp.expires_in * 1000;

        this.googleLinked.set(true); // ✅ 這裡才代表真的綁定過
        if (this.accessToken){
          resolve(this.accessToken);
        }
      };

      this.tokenClient.requestAccessToken({
        prompt: this.accessToken ? '' : 'consent',
      });
    });
  }


}

