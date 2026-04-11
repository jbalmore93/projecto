import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Servicio } from '../../servicios/servicio';
import Swal from 'sweetalert2';

// PrimeNG
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    TagModule,
    SelectModule,
    MessageModule
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {

  usuarios: any[] = [];
  cargando = true;
  error = '';

  // control del modal PrimeNG
  mostrarModalUsuario = false;

  // select roles
  roles = [
    { label: 'Admin', value: 1 },
    { label: 'Maestro', value: 2 },
    { label: 'Padre', value: 3 }
  ];

  // formulario
  email: string = '';
  password: string = '';
  rol: number | null = null;

  constructor(private servicio: Servicio) {}

  async ngOnInit() {
    await this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.cargando = true;
    this.error = '';

    try {
      this.usuarios = await this.servicio.obtenerUsuarios();
    } catch (err) {
      this.error = 'Error al cargar usuarios.';
    } finally {
      this.cargando = false;
    }
  }

  // abrir modal
  agregar() {
    this.resetForm();
    this.mostrarModalUsuario = true;
  }

  // limpiar formulario
  resetForm() {
    this.email = '';
    this.password = '';
    this.rol = null;
  }

  // guardar usuario
  async guardarUsuario() {

    if (!this.email || !this.password || !this.rol) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Todos los campos son obligatorios'
      });
      return;
    }

    if (this.password.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña inválida',
        text: 'Debe tener al menos 6 caracteres'
      });
      return;
    }

    try {
      await this.servicio.crearUsuario({
        email: this.email,
        password: this.password,
        idRole: this.rol
      });

      // recargar tabla
      await this.cargarUsuarios();

      Swal.fire({
        icon: 'success',
        title: 'Usuario creado',
        text: 'El usuario fue registrado correctamente',
        timer: 2000,
        showConfirmButton: false
      });

      // cerrar modal
      this.mostrarModalUsuario = false;

      // limpiar
      this.resetForm();

    } catch (err: any) {

      let mensaje = 'Error al crear usuario';

      if (err?.error?.msg) {
        mensaje = err.error.msg;
      }

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: mensaje
      });
    }
  }
}