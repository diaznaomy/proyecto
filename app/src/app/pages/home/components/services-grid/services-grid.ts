import { Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

interface ServiceCard {
  title: string;
  description: string;
  badge: string;
  variant: 'brown' | 'rose' | 'sage' | 'cream';
}

@Component({
  selector: 'app-services-grid',
  imports: [MatCardModule],
  templateUrl: './services-grid.html',
  styleUrl: './services-grid.css'
})
export class ServicesGrid {
  cards = signal<ServiceCard[]>([
    {
      title: 'Psicología',
      description: 'Acompañamiento emocional durante el diagnóstico, tratamiento y recuperación.',
      badge: 'assets/uploads/home/PsicologiaBadge.png',
      variant: 'brown'
    },
    {
      title: 'Ginecología',
      description: 'Encuentra especialistas en salud hormonal, fertilidad y enfermedades ginecológicas.',
      badge: 'assets/uploads/home/GinecologiaBadge.png',
      variant: 'rose'
    },
    {
      title: 'Nutrición',
      description: 'Alimentación adaptada a tus necesidades y tratamiento.',
      badge: 'assets/uploads/home/NutricionBadge.png',
      variant: 'sage'
    },
    {
      title: 'Bienestar',
      description: 'Espacios orientados al autocuidado y calidad de vida.',
      badge: 'assets/uploads/home/BienestarBadge.png',
      variant: 'cream'
    }
  ]);
}
