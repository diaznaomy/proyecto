import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Agenda } from './agenda';
import { CitaService } from '../../core/services/cita.service';
import { AuthService } from '../../core/services/auth.service';

describe('Agenda', () => {
  const mockCitas = [
    {
      id: 1,
      clienteId: 10,
      servicioId: 1,
      profesionalId: 2,
      estadoCitaId: 1,
      modalidadId: 1,
      fechaCita: '2026-08-18T09:00:00.000Z',
      horaInicio: '2026-08-18T09:00:00.000Z',
      horaFin: '2026-08-18T10:00:00.000Z',
      comentarioCliente: null,
      comentarioProfesional: null,
      montoEstimado: '12000',
      cliente: {
        id: 10,
        nombre: 'María',
        apellidos: 'López',
        correo: 'maria@test.com',
        telefono: null,
        rol: { id: 3, nombre: 'Cliente', descripcion: null }
      },
      profesional: {
        id: 2,
        tituloProfesional: 'Ginecología',
        disponible: true,
        usuario: {
          id: 20,
          nombre: 'Sofía',
          apellidos: 'Ramírez',
          correo: 'sofia@test.com',
          telefono: null
        },
        ubicacion: {
          id: 1,
          provincia: 'San José',
          canton: 'Escazú',
          distrito: 'San Rafael'
        }
      },
      servicio: {
        id: 1,
        perfilProfesionalId: 2,
        modalidadId: 1,
        estadoServicioId: 1,
        nombre: 'Consulta ginecológica',
        descripcion: 'Consulta',
        precio: '12000',
        duracionEstimada: 60,
        imagenServicio: null,
        modalidad: { id: 1, nombre: 'Presencial', descripcion: null },
        estadoServicio: { id: 1, nombre: 'Activo', descripcion: null },
        especialidades: []
      },
      estadoCita: { id: 1, nombre: 'Aceptada', descripcion: null },
      modalidad: { id: 1, nombre: 'Presencial', descripcion: null },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 2,
      clienteId: 11,
      servicioId: 2,
      profesionalId: 3,
      estadoCitaId: 2,
      modalidadId: 1,
      fechaCita: '2026-08-19T11:00:00.000Z',
      horaInicio: '2026-08-19T11:00:00.000Z',
      horaFin: '2026-08-19T12:00:00.000Z',
      comentarioCliente: null,
      comentarioProfesional: null,
      montoEstimado: '15000',
      cliente: {
        id: 11,
        nombre: 'Ana',
        apellidos: 'Rodríguez',
        correo: 'ana@test.com',
        telefono: null,
        rol: { id: 3, nombre: 'Cliente', descripcion: null }
      },
      profesional: {
        id: 3,
        tituloProfesional: 'Psicología',
        disponible: true,
        usuario: {
          id: 30,
          nombre: 'Valeria',
          apellidos: 'Soto',
          correo: 'valeria@test.com',
          telefono: null
        },
        ubicacion: {
          id: 2,
          provincia: 'San José',
          canton: 'Escazú',
          distrito: 'San Antonio'
        }
      },
      servicio: {
        id: 2,
        perfilProfesionalId: 3,
        modalidadId: 1,
        estadoServicioId: 1,
        nombre: 'Consulta psicológica',
        descripcion: 'Consulta',
        precio: '15000',
        duracionEstimada: 60,
        imagenServicio: null,
        modalidad: { id: 1, nombre: 'Presencial', descripcion: null },
        estadoServicio: { id: 1, nombre: 'Activo', descripcion: null },
        especialidades: []
      },
      estadoCita: { id: 2, nombre: 'Pendiente', descripcion: null },
      modalidad: { id: 1, nombre: 'Presencial', descripcion: null },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    }
  ] as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Agenda],
      providers: [
        {
          provide: CitaService,
          useValue: {
            listar: () => of({ success: true, data: mockCitas }),
          },
        },
        {
          provide: AuthService,
          useValue: {
            usuario: () => ({
              id: 1,
              nombre: 'Serena',
              apellidos: 'Pérez',
              correo: 'serena@test.com',
              rol: { nombre: 'Profesional' },
            }),
          },
        },
      ],
    }).compileComponents();
  });

  it('should map API citas to FullCalendar events', () => {
    const fixture = TestBed.createComponent(Agenda);
    fixture.detectChanges();

    expect(fixture.componentInstance.calendarOptions.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'María López • Consulta ginecológica',
          start: '2026-08-18T09:00:00',
          end: '2026-08-18T10:00:00',
        }),
        expect.objectContaining({
          title: 'Ana Rodríguez • Consulta psicológica',
          start: '2026-08-19T11:00:00',
          end: '2026-08-19T12:00:00',
        }),
      ])
    );
  });
});
