import { Component, OnInit } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    CardModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  constructor(public auth: AuthService) {}

  dialogVisible = false;
  imagenes: any[] = [];

  imagenEditando: any = {
    id: null,
    url: '',
    titulo: '',
    descripcion: ''
  };

  // ── Errores de validación ──
  errores: { titulo?: string; descripcion?: string; imagen?: string } = {};

  async ngOnInit() {
    await this.auth.loadUser();
    await this.cargarAvisos();
  }

  // ── CARGAR ──
  async cargarAvisos() {
    try {
      const data = await this.auth.obtenerAvisos();
      this.imagenes = data.map((a: any) => ({
        id: a.id_aviso,
        url: a.imagen?.startsWith('data:')
              ? a.imagen
              : (a.imagen ? `data:image/jpeg;base64,${a.imagen}` : ''),
        titulo: a.Titulo,
        descripcion: a.Contenido
      }));
    } catch (error) {
      console.error(error);
    }
  }

  // ── NUEVO ──
  nuevoAviso() {
    this.imagenEditando = { id: null, url: '', titulo: '', descripcion: '' };
    this.errores = {};
    this.dialogVisible = true;
  }

  // ── EDITAR — 
  editarCarrusel(img: any) {
    console.log('Editando aviso con id:', img.id); 
    this.imagenEditando = { ...img };              
    this.errores = {};
    this.dialogVisible = true;
  }

  // ── VALIDAR ──
  private validar(): boolean {
    this.errores = {};

    if (!this.imagenEditando.titulo?.trim()) {
      this.errores.titulo = 'El título es obligatorio.';
    } else if (this.imagenEditando.titulo.trim().length < 3) {
      this.errores.titulo = 'El título debe tener al menos 3 caracteres.';
    }

    if (!this.imagenEditando.descripcion?.trim()) {
      this.errores.descripcion = 'La descripción es obligatoria.';
    } else if (this.imagenEditando.descripcion.trim().length < 5) {
      this.errores.descripcion = 'La descripción debe tener al menos 5 caracteres.';
    }

    if (!this.imagenEditando.url) {
      this.errores.imagen = 'Debes seleccionar una imagen.';
    }

    return Object.keys(this.errores).length === 0;
  }

  // ── GUARDAR ──
  async guardarCambios() {
    if (!this.validar()) return;

    try {
      const aviso = this.imagenEditando;

      if (aviso.id != null) {
        // UPDATE
        await this.auth.actualizarAviso(aviso.id, {
          titulo:    aviso.titulo.trim(),
          contenido: aviso.descripcion.trim(),
          imagen:    aviso.url
        });
        Swal.fire('¡Actualizado!', 'El aviso fue actualizado correctamente.', 'success');
      } else {
        // CREATE
        await this.auth.crearAviso({
          titulo:    aviso.titulo.trim(),
          contenido: aviso.descripcion.trim(),
          imagen:    aviso.url
        });
        Swal.fire('¡Creado!', 'El aviso fue creado correctamente.', 'success');
      }

      this.dialogVisible = false;
      await this.cargarAvisos();

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Ocurrió un error al guardar el aviso.', 'error');
    }
  }

  // ── ELIMINAR ──
  async eliminarAviso(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await this.auth.eliminarAviso(id);
          await this.cargarAvisos();
          Swal.fire('¡Eliminado!', 'El aviso ha sido eliminado.', 'success');
        } catch (error) {
          console.error(error);
          Swal.fire('Error', 'No se pudo eliminar el aviso.', 'error');
        }
      }
    });
  }

  // ── SUBIR IMAGEN → BASE64 ──
  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      this.errores.imagen = 'La imagen no debe superar 1 MB.';
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.errores.imagen = 'El archivo debe ser una imagen.';
      return;
    }

    this.errores.imagen = undefined;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagenEditando.url = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}