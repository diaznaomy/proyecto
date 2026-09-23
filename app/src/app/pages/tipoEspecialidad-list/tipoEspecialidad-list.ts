import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { TipoEspecialidad } from '../../core/models/tipoEspecialidad.model';
import { TipoEspecialidadService } from '../../core/services/tipoEspecialidad.service';


@Component({
  selector: 'app-tipos-especialidad-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './tipoEspecialidad-list.html',
  styleUrl: './tipoEspecialidad-list.css',
})
export class TiposEspecialidadList {

  private readonly tipoEspecialidadService = inject(TipoEspecialidadService);


  protected readonly tiposEspecialidad = signal<TipoEspecialidad[]>([]);

  protected readonly cargando = signal<boolean>(true);

  protected readonly error = signal<string | null>(null);


  protected readonly terminoBusqueda = signal<string>('');

  protected readonly estadoSeleccionado = signal<string>('');


  protected readonly actualizandoEstado = signal<Set<number>>(new Set());



  protected readonly tiposEspecialidadFiltrados = computed<TipoEspecialidad[]>(() => {

    const termino = this.terminoBusqueda()
      .trim()
      .toLowerCase();


    const estado = this.estadoSeleccionado();



    return this.tiposEspecialidad().filter((tipo) => {


      const coincideBusqueda =
        termino.length === 0 ||
        tipo.nombre.toLowerCase().includes(termino);



      const coincideEstado =
        estado.length === 0 ||
        tipo.estadoTipoEspecialidad.nombre === estado;



      return coincideBusqueda && coincideEstado;

    });

  });



  constructor() {
    this.cargarTiposEspecialidad();
  }



  protected recargar(): void {
    this.cargarTiposEspecialidad();
  }



  protected actualizarBusqueda(valor: string): void {
    this.terminoBusqueda.set(valor);
  }



  protected actualizarEstado(valor: string): void {
    this.estadoSeleccionado.set(valor);
  }



  protected estaActivo(tipo: TipoEspecialidad): boolean {

    return tipo.estadoTipoEspecialidad.nombre
      .toLowerCase()
      .startsWith('activ');

  }



  protected estaActualizando(tipo: TipoEspecialidad): boolean {

    return this.actualizandoEstado()
      .has(tipo.id);

  }



  protected alternarEstado(tipo: TipoEspecialidad): void {


    if (this.estaActualizando(tipo)) {
      return;
    }



    this.marcarActualizando(tipo.id, true);



    this.tipoEspecialidadService
      .cambiarEstado(tipo.id)
      .subscribe({

        next: (tipoActualizado) => {


          this.tiposEspecialidad.update((lista) =>

            lista.map((item) =>

              item.id === tipoActualizado.id
                ? tipoActualizado
                : item

            )

          );


          this.marcarActualizando(tipo.id, false);

        },


        error: () => {

          this.error.set(
            'No se pudo actualizar el estado del tipo de especialidad. Intenta de nuevo.'
          );


          this.marcarActualizando(tipo.id, false);

        },

      });


  }



  private marcarActualizando(
    id: number,
    enProceso: boolean
  ): void {


    this.actualizandoEstado.update((idsActuales) => {


      const nuevosIds = new Set(idsActuales);



      if (enProceso) {

        nuevosIds.add(id);

      } else {

        nuevosIds.delete(id);

      }



      return nuevosIds;

    });


  }



  private cargarTiposEspecialidad(): void {


    this.cargando.set(true);

    this.error.set(null);



    this.tipoEspecialidadService
      .listar()
      .subscribe({

        next: (tipos) => {

          this.tiposEspecialidad.set(tipos);

          this.cargando.set(false);

        },


        error: () => {


          this.error.set(
            'No se pudieron cargar los tipos de especialidad. Intenta de nuevo.'
          );


          this.cargando.set(false);

        },


      });


  }

}