import { Component, signal } from '@angular/core';

interface Stat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-quote-stats',
  imports: [],
  templateUrl: './quote-stats.html',
  styleUrl: './quote-stats.css'
})
export class QuoteStats {
  stats = signal<Stat[]>([
    { value: '50+', label: 'Profesionales' },
    { value: '20+', label: 'Especialidades' },
    { value: '1000+', label: 'Citas realizadas' },
    { value: '95%', label: 'Pacientes satisfechas' }
  ]);
}
