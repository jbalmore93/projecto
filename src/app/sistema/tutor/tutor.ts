import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Servicio } from '../../servicios/servicio';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import {  CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Message } from 'primeng/message';


@Component({
  selector: 'app-tutor',
  imports: [TableModule, ButtonModule, 
    DialogModule, InputTextModule, FormsModule, CommonModule, Message],
  templateUrl: './tutor.html',
  styleUrl: './tutor.css',
})
export class Tutor   implements OnInit {
tutores: any[] = [];
  cargando = false;

  mostrarModal = false;
  editando = false;
errorModal = '';
guardando = false;
  tutor: any = {
    idUsuario: '',
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: ''
  };

constructor(private servicio: Servicio) {}


  async ngOnInit() {
    this.listar();
  }

  async listar() {
    this.cargando = true;
    try {
      this.tutores = await this.servicio.obtenerTutores();
    } finally {
      this.cargando = false;
    }
  }

 nuevo() {
  this.editando = false;
  this.tutor = {};
  this.errorModal = '';
  this.mostrarModal = true;
}

editar(t: any) {
  this.editando = true;
  this.tutor = { ...t };
  this.errorModal = '';
  this.mostrarModal = true;
}

  async guardar() {
  this.errorModal = '';

  if (!this.tutor.nombre || !this.tutor.apellido || !this.tutor.telefono || !this.tutor.direccion) {
    this.errorModal = 'Todos los campos son obligatorios.';
    return;
  }

  this.guardando = true;
  try {
    if (this.editando) {
      await this.servicio.actualizarTutor(this.tutor.idTutor, this.tutor);
    } else {
      await this.servicio.crearTutor(this.tutor);
    }
    this.mostrarModal = false;
    await this.listar();
  } catch (e: any) {
    this.errorModal = e?.error?.error || 'Error al guardar el tutor.';
  } finally {
    this.guardando = false;
  }
}

 async eliminar(id: number) {

  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'No podrás revertir esto',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await this.servicio.eliminarTutor(id);

      await Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El tutor fue eliminado correctamente',
        timer: 1500,
        showConfirmButton: false
      });

      this.listar();

    } catch (error: any) {

        Swal.fire({
    icon: 'error',
    title: 'Error',
    text: error?.error?.error || 'Error al eliminar'
  });


    }
  }
}
}
