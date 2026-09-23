import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Reportes } from '../../core/models/reporte.model';
import { NotificationService } from '../../core/services/notification.service';
import { ReporteService } from '../../core/services/reporte.service';
import { PdfReportesService } from '../../services/pdf.reportes';
import { PerfilProfesional } from '../../core/models/perfil-profesional.model';
import { Especialidad } from '../../core/models/especialidad.model';
import { PerfilProfesionalService } from '../../core/services/perfil-profesional.service';
import { EspecialidadService } from '../../core/services/especialidad.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class ReportesPage {
  private readonly reporteService = inject(ReporteService);
  private readonly pdf = inject(PdfReportesService);
  private readonly notification = inject(NotificationService);
  private readonly profesionalService = inject(PerfilProfesionalService);
  private readonly especialidadService = inject(EspecialidadService);

  datos = signal<Reportes | null>(null);
  cargando = signal(false);
  fechaDesde = '';
  fechaHasta = '';
  profesionalId: number | null = null;
  especialidadId: number | null = null;
  profesionales = signal<PerfilProfesional[]>([]);
  especialidades = signal<Especialidad[]>([]);

  constructor() {
    this.cargarCatalogos();
    this.cargar();
  }

  private cargarCatalogos(): void {
    this.profesionalService.listar().subscribe({
      next: (response) => this.profesionales.set(response.data ?? []),
      error: () => this.notification.error('No fue posible cargar los profesionales.'),
    });
    this.especialidadService.listar().subscribe({
      next: (response) => this.especialidades.set(response.data ?? []),
      error: () => this.notification.error('No fue posible cargar las categorías.'),
    });
  }

  cargar(): void {
    if (this.fechaDesde && this.fechaHasta && this.fechaDesde > this.fechaHasta) {
      this.notification.warning('La fecha desde no puede ser posterior a la fecha hasta.');
      return;
    }
    this.cargando.set(true);
    this.reporteService.obtener(
      this.fechaDesde,
      this.fechaHasta,
      this.profesionalId,
      this.especialidadId
    ).subscribe({
      next: (response) => {
        this.datos.set(response.data ?? null);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.notification.error(error.error?.message ?? 'No fue posible cargar los reportes.');
      },
    });
  }

  limpiar(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.profesionalId = null;
    this.especialidadId = null;
    this.cargar();
  }

  exportarEstado(): void { if (this.datos()) this.pdf.citasPorEstado(this.datos()!); }
  exportarProfesional(): void { if (this.datos()) this.pdf.citasPorProfesional(this.datos()!); }
  exportarCalificaciones(): void { if (this.datos()) this.pdf.calificaciones(this.datos()!); }

  periodoAplicado(reporte: Reportes): string {
    if (!reporte.periodo.fechaDesde && !reporte.periodo.fechaHasta) return 'Todos los registros';
    return `${reporte.periodo.fechaDesde ?? 'Inicio'} al ${reporte.periodo.fechaHasta ?? 'Actualidad'}`;
  }
}
