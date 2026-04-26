import { Component, OnInit } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/auth';

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

  indexEditando = 0;

  async ngOnInit() {
    await this.auth.loadUser();
    await this.cargarAvisos(); // 🔥 cargar datos
  }

  // 🔥 CARGAR AVISOS
  async cargarAvisos() {
    try {
      const data = await this.auth.obtenerAvisos();

      this.imagenes = data.map(a => ({
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

  // 🆕 NUEVO AVISO
  nuevoAviso() {
    this.imagenEditando = {
      id: null,
      url: '',
      titulo: '',
      descripcion: ''
    };
    this.dialogVisible = true;
  }

  // ✏️ EDITAR
  editarCarrusel(index: number) {
    this.indexEditando = index;
    this.imagenEditando = { ...this.imagenes[index] };
    this.dialogVisible = true;
  }

  // 💾 GUARDAR (CREATE / UPDATE)
  async guardarCambios() {
    try {

      const aviso = this.imagenEditando;

      if (aviso.id != null) {
        // 🔥 UPDATE
        await this.auth.actualizarAviso(aviso.id, {
          titulo: aviso.titulo,
          contenido: aviso.descripcion,
          imagen: aviso.url
        });
      } else {
        // 🔥 CREATE
        await this.auth.crearAviso({
          titulo: aviso.titulo,
          contenido: aviso.descripcion,
          imagen: aviso.url
        });
      }

      this.dialogVisible = false;
      await this.cargarAvisos();

    } catch (error) {
      console.error(error);
    }
  }

  // 🗑 ELIMINAR
  async eliminarAviso(id: number) {
    if (!confirm('¿Eliminar aviso?')) return;

    try {
      await this.auth.eliminarAviso(id);
      await this.cargarAvisos();
    } catch (error) {
      console.error(error);
    }
  }

  // 📁 SUBIR IMAGEN → BASE64
  onFileSelect(event: any) {
    const file = event.target.files[0];

    if (file) {

      // 🔥 VALIDACIÓN (opcional pero recomendada)
      if (file.size > 1024 * 1024) {
        alert('La imagen no debe superar 1MB');
        return;
      }

      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.imagenEditando.url = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  }

}