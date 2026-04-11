import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NinoService } from '../../servicios/nino-service'; 
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Servicio } from '../../servicios/servicio';

@Component({
  selector: 'app-mis-ninos',
  imports: [CommonModule, TableModule, ButtonModule, TagModule],
  templateUrl: './mis-ninos.html',
  styleUrl: './mis-ninos.css',
})
export class MisNinos implements OnInit {

  tutor: any = null;
  ninos: any[] = [];
  cargando = true;
  error = '';

  ninoSeleccionado: any = null;
  bitacora: any[] = [];
  cargandoBitacora = false;

  constructor(
    private Ninoservicio: NinoService,
    private servicio : Servicio,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit() {
    try {
      const { tutor, ninos } = await this.Ninoservicio.obtenerNinos();
      this.tutor = tutor;
      this.ninos = ninos;
    } catch (err) {
      this.error = 'Error al cargar los datos.';
    } finally {
      this.cargando = false;
    }
  }

estadoClase(animo: string) {

  switch (animo) {
    case 'Feliz':
      return 'bg-success';
    case 'Satisfecho':
      return 'bg-primary';
    case 'Regular':
      return 'bg-warning text-dark';
    case 'Triste':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }

}


  async verBitacora(nino: any) {
    this.ninoSeleccionado = nino;
    this.bitacora = [];
    this.cargandoBitacora = true;

  
    if (isPlatformBrowser(this.platformId)) {
      const { Modal } = await import('bootstrap');
      const modalEl = document.getElementById('modalBitacora')!;
      const modal = new Modal(modalEl);
      modal.show();
    }

    try {
      this.bitacora = await this.servicio.obtenerBitacora(nino.IdNino);
    } catch (e) {
      this.bitacora = [];
    } finally {
      this.cargandoBitacora = false;
    }
  }
}