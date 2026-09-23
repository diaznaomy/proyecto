import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {
  BloqueAgenda,
  ClienteCita,
  CrearCitaPayload,
  DisponibilidadCita,
  ProfesionalCita,
  ServicioCita,
} from '../../../core/models/cita.model';
import { AuthService } from '../../../core/services/auth.service';
import { CitaService } from '../../../core/services/cita.service';

@Component({
  selector: 'app-cita-admin-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './cita-admin-form.html',
  styleUrl: './cita-admin-form.css',
})
export class CitaAdminForm {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly citaService = inject(CitaService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  clientes = signal<ClienteCita[]>([]);
  profesionales = signal<ProfesionalCita[]>([]);
  servicios = signal<ServicioCita[]>([]);
  disponibilidad = signal<DisponibilidadCita | null>(null);
  cargando = signal(false);
  cargandoAgenda = signal(false);
  guardando = signal(false);
  errorServicios = signal(false);
  private solicitudAgendaActual = 0;
  readonly esCliente = computed(() => this.authService.tieneRol(['Cliente']));

  formulario = this.formBuilder.nonNullable.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    profesionalId: [0, [Validators.required, Validators.min(1)]],
    servicioId: [0, [Validators.required, Validators.min(1)]],
    fecha: [null as Date | null, Validators.required],
    hora: ['', Validators.required],
    comentario: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]],
  });

  readonly servicioSeleccionado = signal<ServicioCita | null>(null);
  readonly bloqueSeleccionado = signal<BloqueAgenda | null>(null);

  constructor() {
    const usuario = this.authService.usuario();
    if (usuario) {
      this.formulario.controls.clienteId.setValue(usuario.id);
      this.formulario.controls.clienteId.disable();
      this.clientes.set([
        {
          id: usuario.id,
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          correo: usuario.correo,
          telefono: usuario.telefono,
          rol: usuario.rol,
          edad: usuario.edad,
        },
      ]);
    }
    this.cargarDatos();
    this.formulario.controls.profesionalId.valueChanges.subscribe(() => {
      this.formulario.controls.servicioId.setValue(0);
      this.servicioSeleccionado.set(null);
      this.reiniciarAgenda(true);
    });
    this.formulario.controls.fecha.valueChanges.subscribe(() => {
      this.formulario.controls.hora.setValue('');
      this.bloqueSeleccionado.set(null);
      this.cargarDisponibilidad();
    });
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.citaService.listarProfesionales().subscribe({
      next: (items) => this.profesionales.set(items),
      error: () => this.snackBar.open('No fue posible cargar profesionales.', 'Cerrar'),
    });
    this.citaService.listarServicios().subscribe({
      next: (items) => {
        this.servicios.set(items);
        this.errorServicios.set(false);
        this.cargando.set(false);
      },
      error: () => {
        this.errorServicios.set(true);
        this.cargando.set(false);
      },
    });
  }

  serviciosDelProfesional(): ServicioCita[] {
    const id = this.formulario.controls.profesionalId.value;
    return this.servicios().filter((item) => item.perfilProfesionalId === id);
  }

  seleccionarServicio(servicioId: number): void {
    this.servicioSeleccionado.set(
      this.servicios().find((item) => item.id === Number(servicioId)) ?? null,
    );
    this.reiniciarAgenda(false);
    this.cargarDisponibilidad();
  }

  cargarDisponibilidad(): void {
    const profesionalId = this.formulario.controls.profesionalId.value;
    const servicioId = this.formulario.controls.servicioId.value;
    const fecha = this.formulario.controls.fecha.value;
    if (!profesionalId || !servicioId || !fecha) {
      this.disponibilidad.set(null);
      return;
    }

    const solicitud = ++this.solicitudAgendaActual;
    this.cargandoAgenda.set(true);
    this.formulario.controls.hora.setValue('');
    this.bloqueSeleccionado.set(null);
    this.citaService
      .obtenerDisponibilidad(profesionalId, servicioId, this.formatearFecha(fecha))
      .subscribe({
        next: (response) => {
          if (solicitud !== this.solicitudAgendaActual) return;
          this.disponibilidad.set(response.data ?? null);
          this.cargandoAgenda.set(false);
        },
        error: (error) => {
          if (solicitud !== this.solicitudAgendaActual) return;
          this.disponibilidad.set(null);
          this.cargandoAgenda.set(false);
          this.snackBar.open(error.error?.message ?? 'No fue posible cargar la agenda.', 'Cerrar');
        },
      });
  }

  seleccionarBloque(bloque: BloqueAgenda): void {
    if (!bloque.disponible) return;
    this.formulario.controls.hora.setValue(bloque.hora);
    this.formulario.controls.hora.markAsTouched();
    this.bloqueSeleccionado.set(bloque);
  }
  private reiniciarAgenda(limpiarFecha: boolean): void {
    this.solicitudAgendaActual += 1;
    this.disponibilidad.set(null);
    this.bloqueSeleccionado.set(null);
    this.formulario.controls.hora.setValue('');
    if (limpiarFecha) this.formulario.controls.fecha.setValue(null);
  }
  nombreCliente(cliente?: ClienteCita): string {
    return cliente ? `${cliente.nombre} ${cliente.apellidos}` : '';
  }
  nombreProfesional(item: ProfesionalCita): string {
    return `${item.usuario.nombre} ${item.usuario.apellidos}`;
  }
  campoInvalido(campo: keyof typeof this.formulario.controls): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.dirty || control.touched);
  }
  fechaMinima(): Date {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return hoy;
  }
  formatearFecha(fecha: Date): string {
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  }

  guardar(): void {
    if (this.formulario.invalid || !this.bloqueSeleccionado()?.disponible) {
      this.formulario.markAllAsTouched();
      this.snackBar.open('Seleccione todos los datos y un horario disponible.', 'Cerrar');
      return;
    }
    const datos = this.formulario.getRawValue();
    const servicio = this.servicioSeleccionado()!;
    const payload: CrearCitaPayload = {
      clienteId: this.authService.usuario()?.id ?? Number(datos.clienteId),
      profesionalId: Number(datos.profesionalId),
      servicioId: Number(datos.servicioId),
      modalidadId: servicio.modalidadId,
      fecha: this.formatearFecha(datos.fecha as Date),
      hora: datos.hora,
      comentario: datos.comentario.trim(),
    };
    this.guardando.set(true);
    this.citaService.crear(payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.snackBar.open('Cita registrada correctamente.', 'Cerrar', { duration: 3500 });
        this.router.navigate(['/citas']);
      },
      error: (error) => {
        this.guardando.set(false);
        this.snackBar.open(error?.error?.message ?? 'No fue posible registrar la cita.', 'Cerrar', {
          duration: 5000,
        });
        this.cargarDisponibilidad();
      },
    });
  }
  cancelar(): void {
    this.router.navigate(['/citas']);
  }
}
