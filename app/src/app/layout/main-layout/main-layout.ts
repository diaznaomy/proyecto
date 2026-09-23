import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from '../header/header';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    Header
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})

export class MainLayout {

  private router = inject(Router);

  isHome() {
    return this.router.url === '/';
  }
}