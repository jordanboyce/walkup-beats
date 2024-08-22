import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  currentTheme$: Observable<'light' | 'dark'>;

  constructor(private themeService: ThemeService, public authService: AuthService, private router: Router) {
    this.currentTheme$ = this.themeService.getCurrentTheme();
  }

  ngOnInit() {
    this.themeService.setInitialTheme();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['']);
    this.closeDropdown();
  }

  closeDropdown() {
    const detailsElement = document.querySelector('details.dropdown-end');
    if (detailsElement) {
      detailsElement.removeAttribute('open');
    }
  }
}
