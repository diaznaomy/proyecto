import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

import { ProfesionalesService } from '../../../../core/services/profesionales.service';
import { calcularCoincidencias, ProfesionalConPuntaje } from './matching-algorithm';
import {
  PerfilProfesional,
  PROVINCIAS_CR,
  TIPOS_ESPECIALIDAD,
  QuizRespuestas,
} from '../../../../core/models/profesionalIdeal.model';

@Component({
  selector: 'app-quiz-profesional-ideal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quiz-profesional.html',
  styleUrl: './quiz-profesional.css',
})
export class QuizProfesionalIdeal implements OnInit {
  readonly provincias = PROVINCIAS_CR;
  readonly tiposInteres = TIPOS_ESPECIALIDAD;
  readonly totalPasos = 4;
  readonly apiUrl = environment.apiUrl; 

  pasoActual = signal(0);
  cargando = signal(false);
  resultados = signal<ProfesionalConPuntaje[]>([]);
  mostrarResultados = signal(false);

  form: FormGroup;

  private profesionales: PerfilProfesional[] = [];

  constructor(
    private fb: FormBuilder,
    private profesionalesService: ProfesionalesService
  ) {
    this.form = this.fb.group({
      edad: [null, [Validators.required, Validators.min(13), Validators.max(99)]],
      provinciaPreferida: ['Cualquiera', Validators.required],
      modalidadPreferida: ['Cualquiera', Validators.required],
      tiposInteres: this.fb.control<string[]>([], Validators.required),
      presupuestoMax: [null],
    });
  }

  ngOnInit(): void {
    this.cargando.set(true);
    this.profesionalesService.obtenerProfesionalesDisponibles().subscribe((profesionales) => {
      this.profesionales = profesionales;
      this.cargando.set(false);
    });
  }

  get progreso(): number {
    return Math.round(((this.pasoActual() + 1) / this.totalPasos) * 100);
  }

  toggleInteres(tipo: string): void {
    const control = this.form.get('tiposInteres');
    const actuales: string[] = control?.value ?? [];
    const nuevos = actuales.includes(tipo)
      ? actuales.filter((t) => t !== tipo)
      : [...actuales, tipo];
    control?.setValue(nuevos);
    control?.markAsTouched();
  }

  esInteresSeleccionado(tipo: string): boolean {
    return (this.form.get('tiposInteres')?.value ?? []).includes(tipo);
  }

  campoValidoEnPaso(paso: number): boolean {
    switch (paso) {
      case 0:
        return !!this.form.get('edad')?.valid;
      case 1:
        return !!this.form.get('provinciaPreferida')?.valid && !!this.form.get('modalidadPreferida')?.valid;
      case 2:
        return (this.form.get('tiposInteres')?.value ?? []).length > 0;
      case 3:
        return true; // el presupuesto es opcional
      default:
        return true;
    }
  }

  siguiente(): void {
    if (!this.campoValidoEnPaso(this.pasoActual())) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.pasoActual() < this.totalPasos - 1) {
      this.pasoActual.update((p) => p + 1);
    } else {
      this.buscarProfesionales();
    }
  }

  atras(): void {
    if (this.pasoActual() > 0) {
      this.pasoActual.update((p) => p - 1);
    }
  }

  buscarProfesionales(): void {
    const respuestas: QuizRespuestas = this.form.value;
    const coincidencias = calcularCoincidencias(this.profesionales, respuestas, 3);
    this.resultados.set(coincidencias);
    this.mostrarResultados.set(true);
  }

  reiniciar(): void {
    this.form.reset({
      edad: null,
      provinciaPreferida: 'Cualquiera',
      modalidadPreferida: 'Cualquiera',
      tiposInteres: [],
      presupuestoMax: null,
    });
    this.pasoActual.set(0);
    this.resultados.set([]);
    this.mostrarResultados.set(false);
  }
}
