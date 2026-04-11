import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Documento {
  IdDocumento: number;
  Nombre: string;
  Tipo: string;
  IdNino: number;
  NinoNombre: string;
  NinoApellido: string;
  SubidoPor: string;
  FechaSubida: Date;
  Estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
  UrlArchivo: string;
}

@Component({
  selector: 'app-documentos',
  imports: [CommonModule, FormsModule],
  templateUrl: './documentos.html',
  styleUrl: './documentos.css',
})
export class Documentos implements OnInit {

  documentos: Documento[] = [
    {
      IdDocumento: 1,
      Nombre: 'Salida Museo',
      Tipo: 'Permiso',
      IdNino: 1,
      NinoNombre: 'Sofía',
      NinoApellido: 'García',
      SubidoPor: 'Maestro',
      FechaSubida: new Date('2024-01-10'),
      Estado: 'Pendiente',
      UrlArchivo: '#'
    },
    {
      IdDocumento: 2,
      Nombre: 'Falta por enfermedad',
      Tipo: 'Permiso',
      IdNino: 2,
      NinoNombre: 'Eithan',
      NinoApellido: 'Amaya',
      SubidoPor: 'Karen',
      FechaSubida: new Date('2024-02-05'),
      Estado: 'Aprobado',
      UrlArchivo: '#'
    }
  ];

  cargando = false;
  error = '';
  errorForm = '';

  form = {
    nombre: '',
    tipo: '',
    idNino: null as number | null,
    archivo: null as File | null
  };

  docSeleccionado: Documento | null = null;
  docAEliminar: Documento | null = null;

  // Simulación de rol — reemplaza con tu auth service
  auth = {
    isAdmin: () => true,
    isMaestro: () => false,
    isPadre: () => false,
    getUser: () => ({ email: 'admin@guarderia.com', roleName: 'Admin' })
  };

  private nextId = 3;

  ngOnInit() {}

  abrirModalSubir() {
    this.form = { nombre: '', tipo: '', idNino: null, archivo: null };
    this.errorForm = '';
    const modal = (window as any).bootstrap.Modal.getOrCreateInstance(
      document.getElementById('modalDocumento')
    );
    modal.show();
  }

  seleccionarArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    this.form.archivo = input.files?.[0] ?? null;
  }

  subirDocumento() {
    if (!this.form.nombre.trim() || !this.form.tipo || !this.form.idNino || !this.form.archivo) {
      this.errorForm = 'Todos los campos son obligatorios.';
      return;
    }

    const nuevo: Documento = {
      IdDocumento: this.nextId++,
      Nombre: this.form.nombre,
      Tipo: this.form.tipo,
      IdNino: this.form.idNino,
      NinoNombre: 'Niño',
      NinoApellido: `#${this.form.idNino}`,
      SubidoPor: this.auth.getUser().email,
      FechaSubida: new Date(),
      Estado: 'Pendiente',
      UrlArchivo: URL.createObjectURL(this.form.archivo)
    };

    this.documentos.push(nuevo);

    const modal = (window as any).bootstrap.Modal.getInstance(
      document.getElementById('modalDocumento')
    );
    modal.hide();
  }

  verDocumento(doc: Documento) {
    this.docSeleccionado = doc;
    const modal = (window as any).bootstrap.Modal.getOrCreateInstance(
      document.getElementById('modalDetalle')
    );
    modal.show();
  }

  cambiarEstado(doc: Documento, estado: 'Aprobado' | 'Rechazado') {
    const index = this.documentos.findIndex(d => d.IdDocumento === doc.IdDocumento);
    if (index !== -1) this.documentos[index].Estado = estado;
  }

  confirmarEliminar(doc: Documento) {
    this.docAEliminar = doc;
    const modal = (window as any).bootstrap.Modal.getOrCreateInstance(
      document.getElementById('modalEliminar')
    );
    modal.show();
  }

  eliminarDocumento() {
    this.documentos = this.documentos.filter(
      d => d.IdDocumento !== this.docAEliminar?.IdDocumento
    );
    const modal = (window as any).bootstrap.Modal.getInstance(
      document.getElementById('modalEliminar')
    );
    modal.hide();
  }
}