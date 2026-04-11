import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule ,NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Servicio } from '../../servicios/servicio';
import { TableModule } from "primeng/table";
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';


@Component({
  selector: 'app-bitacora',
  imports: [CommonModule, 
            FormsModule,
            TableModule, 
            MessageModule, 
            ButtonModule, 
            Select, 
            Tag, 
            Dialog, 
            CheckboxModule,
            NgIf],
  templateUrl: './bitacora.html',
  styleUrl: './bitacora.css',
})
export class Bitacora implements OnInit {

  cargando = true;
  guardando = false;
  error = '';
  mensaje = '';
  bitacoras: any[] = [];
mostrarModal = false;
errorModal = '';


  estadosAnimo = [
    { label: 'Feliz',     value: 'Feliz'     },
    { label: 'Tranquilo', value: 'Tranquilo' },
    { label: 'Cansado',   value: 'Cansado'   },
    { label: 'Enojado',   value: 'Enojado'   },
    { label: 'Triste',    value: 'Triste'    },
  ];

  bitacora: any = {
    idNino: '',
    comida: false,
    siestaMinutos: 0,
    observaciones: '',
    estadoAnimo: ''
  };

  constructor(
    private servicio: Servicio,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit() {
    await this.cargarBitacoras();
  }

  async cargarBitacoras() {
    this.cargando = true;
    this.error = '';
    try {
      this.bitacoras = await this.servicio.getbitacora();
    } catch (err) {
      this.error = 'Error al cargar los registros';
      console.error(err);
    } finally {
      this.cargando = false;
    }
  }

  async guardar() {
    this.guardando = true;
    this.error = '';
    this.mensaje = '';
    try {
      await this.servicio.crearBitacora(this.bitacora);
      this.mensaje = 'Bitácora registrada correctamente';
      this.bitacora = {
        idNino: '',
        comida: false,
        siestaMinutos: 0,
        observaciones: '',
        estadoAnimo: ''
      };
      await this.cargarBitacoras(); // refresca la tabla al guardar
    } catch (err) {
      this.error = 'Error al registrar la bitácora';
      console.error(err);
    } finally {
      this.guardando = false;
    }
  }

  abrirModal() {
  this.bitacora = {
    idNino: '',
    comida: false,
    siestaMinutos: 0,
    observaciones: '',
    estadoAnimo: ''
  };
  this.errorModal = '';
  this.mostrarModal = true;
}
}