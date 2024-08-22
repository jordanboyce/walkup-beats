import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { Observable, catchError, from, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase('https://walkup-beats-api.pockethost.io/');
  }

  login(email: string, password: string): Observable<any> {
    return from(this.pb.collection('users').authWithPassword(email, password));
  }

  register(name: string, email: string, username: string, password: string, passwordConfirm: string): Observable<any> {
    const data = {
      "username": username,
      "email": email,
      "emailVisibility": true,
      "password": password,
      "passwordConfirm": passwordConfirm,
      "name": name
    };
    return from(this.pb.collection('users').create(data));
  }

  sendVerificationEmail(email: string): Observable<any> {
    return from(this.pb.collection('users').requestVerification(email));
  }

  resetPassword(email: string): Observable<any> {
    return from(this.pb.collection('users').requestPasswordReset(email));
  }

  refreshAuth() {
    return from(this.pb.collection('users').authRefresh());
  }

  logout() {
    this.pb.authStore.clear();
  }

  isLoggedIn(): boolean {
    return this.pb.authStore.isValid;
  }

  getCurrentUser() {
    return this.pb.authStore.model;
  }
}