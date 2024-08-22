// src/app/services/theme.service.ts
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private theme = new BehaviorSubject<'light' | 'dark'>('dark');

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  getCurrentTheme() {
    return this.theme.asObservable();
  }

  toggleTheme() {
    this.theme.next(this.theme.value === 'dark' ? 'light' : 'dark');
    this.updateTheme();
  }

  private updateTheme() {
    this.renderer.setAttribute(document.documentElement, 'data-theme', this.theme.value);
    localStorage.setItem('walkupTheme', this.theme.value);
  }

  setInitialTheme() {
    const savedTheme = localStorage.getItem('walkupTheme') as 'light' | 'dark' | null;
    if (savedTheme) {
      this.theme.next(savedTheme);
    }
    this.updateTheme();
  }
}