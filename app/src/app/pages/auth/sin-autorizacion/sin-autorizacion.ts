import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sin-autorizacion',
  imports: [RouterLink],
  template: `
    <section class="sin-autorizacion-page">
      <div class="sin-autorizacion-card">
        <h1>Acceso no autorizado</h1>
        <p>Tu cuenta no tiene permisos para ver esta página.</p>
        <a routerLink="/perfil" class="boton-primario">Volver a mi perfil</a>
      </div>
    </section>
  `,
  styles: `
    .sin-autorizacion-page {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', system-ui, sans-serif;
      padding: 1.5rem;
    }
    .sin-autorizacion-card {
      text-align: center;
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 4px 16px rgba(224, 122, 139, 0.1);
      padding: 2.5rem;
      max-width: 380px;
    }
    .sin-autorizacion-card h1 {
      color: #e07a8b;
      margin: 0 0 0.5rem;
      font-size: 1.4rem;
    }
    .sin-autorizacion-card p {
      color: #8a8a8a;
      margin: 0 0 1.5rem;
    }
    .boton-primario {
      display: inline-block;
      border: none;
      background: #e07a8b;
      color: #fff;
      border-radius: 999px;
      padding: 0.65rem 1.4rem;
      font-size: 0.9rem;
      text-decoration: none;
    }
  `,
})
export class SinAutorizacion {}
