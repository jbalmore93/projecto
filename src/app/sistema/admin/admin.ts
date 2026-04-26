import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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
import { Usuario } from '../../interfaces/usuario';

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

  usuarios: Usuario[] = [];
  cargando = true;
  error = '';

  // Modal nuevo usuario
  mostrarModalUsuario = false;

  // Modal editar contraseña
  mostrarModalEditar = false;
  usuarioSeleccionado: any = null;
  passwordEditar: string = '';

  roles = [
    { label: 'Admin', value: 1 },
    { label: 'Maestro', value: 2 },
    { label: 'Padre', value: 3 }
  ];

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

  agregar() {
    this.resetForm();
    this.mostrarModalUsuario = true;
  }

  resetForm() {
    this.email = '';
    this.password = '';
    this.rol = null;
  }

  async guardarUsuario() {
    if (!this.email || !this.password || !this.rol) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Todos los campos son obligatorios' });
      return;
    }

    if (this.password.length < 6) {
      Swal.fire({ icon: 'warning', title: 'Contraseña inválida', text: 'Debe tener al menos 6 caracteres' });
      return;
    }

    try {
      await this.servicio.crearUsuario({
        email: this.email,
        password: this.password,
        idRole: this.rol
      });

      await this.cargarUsuarios();

      Swal.fire({ icon: 'success', title: 'Usuario creado', text: 'El usuario fue registrado correctamente', timer: 2000, showConfirmButton: false });

      this.mostrarModalUsuario = false;
      this.resetForm();

    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: err?.error?.msg || 'Error al crear usuario' });
    }
  }

  editar(usuario: Usuario) {
    this.usuarioSeleccionado = usuario;
    this.passwordEditar = '';
    this.mostrarModalEditar = true;
  }

  async guardarEdicion(form: NgForm) {
    if (form.invalid) return;

    try {
      await this.servicio.editarPasswordUsuario(
        this.usuarioSeleccionado.IdUsuario,
        this.passwordEditar
      );

      this.mostrarModalEditar = false;
      Swal.fire({ icon: 'success', title: 'Contraseña actualizada', timer: 1500, showConfirmButton: false });

    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.error?.error || 'No se pudo cambiar la contraseña' });
    }
  }

  async desbloquear(usuario: Usuario) {
  const confirm = await Swal.fire({
    icon: 'question',
    title: '¿Desbloquear usuario?',
    text: `Se desbloqueará la cuenta de ${usuario.Email}`,
    showCancelButton: true,
    confirmButtonText: 'Sí, desbloquear',
    cancelButtonText: 'Cancelar'
  });

  if (!confirm.isConfirmed) return;

  try {
    await this.servicio.desbloquearUsuario(usuario.IdUsuario);
    await this.cargarUsuarios();
    Swal.fire({ icon: 'success', title: 'Usuario desbloqueado', timer: 1500, showConfirmButton: false });
  } catch (err: any) {
    Swal.fire({ icon: 'error', title: 'Error', text: err?.error?.error || 'No se pudo desbloquear' });
  }
}
}