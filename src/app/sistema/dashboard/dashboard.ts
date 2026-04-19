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

  imagenes = [
    {
      url: '/imagenes/2.jpeg',
      titulo: 'Día de juegos acuáticos',
      descripcion: 'Los niños disfrutando en la piscina'
    },
    {
      url: '/imagenes/3.jpeg',
      titulo: 'Día de juegos acuáticos',
      descripcion: 'Uno de nuestros niños disfrutando'
    },
    {
      url: '/imagenes/4.jpeg',
      titulo: 'Día de vacunación',
      descripcion: 'Se realizó campaña de vacunación'
    },
    {
      url: '/imagenes/9.jpeg',
      titulo: 'Cumpleaños Directora',
      descripcion: '¡¡Feliz cumpleaños directora!!'
    },
    {
      url: '/imagenes/5.jpeg',
      titulo: 'Volvemos de vacaciones',
      descripcion: 'Regreso a clases'
    }
  ];

  imagenEditando: any = {
    url: '',
    titulo: '',
    descripcion: ''
  };

  indexEditando = 0;

  async ngOnInit() {
    await this.auth.loadUser();
  }

 
  editarCarrusel(index: number) {
    this.indexEditando = index;
    this.imagenEditando = { ...this.imagenes[index] };
    this.dialogVisible = true;
  }

  
  guardarCambios() {
    this.imagenes[this.indexEditando] = { ...this.imagenEditando };
    this.dialogVisible = false;
  }

onFileSelect(event: any) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.imagenEditando.url = e.target.result; 
    };

    reader.readAsDataURL(file);
  }
}

}