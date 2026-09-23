import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-specialties',
  imports: [],
  templateUrl: './specialties.html',
  styleUrl: './specialties.css'
})
export class Specialties {
  leftList = signal<string[]>(['SOP / SOMP', 'Cáncer de mama', 'Cáncer de ovario', 'Infertilidad']);
  rightList = signal<string[]>(['Cáncer de cuello uterino', 'Endometriosis', 'Menopausia', 'Dolor pélvico', 'Entre otros...']);
}
