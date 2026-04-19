import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Servicio } from '../../servicios/servicio';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    FormsModule,
    TableModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    TagModule,
    MessageModule
  ],
  templateUrl: './asistencia.html',
  styleUrl: './asistencia.css',
})
export class Asistencia implements OnInit {

  asistencias: any[] = [];
  cargando = true;
  error = '';


  mostrarDetalle = false;
  mostrarCheckout = false;
  mostrarCheckin = false;

  asistenciaCheckout: any = null;
  personaRecoge: string = '';
  errorCheckout = '';

  idNinoCheckin: number | null = null;
  errorCheckin = '';

  asistenciaSeleccionada: any = null;

  constructor(private servicio: Servicio) {}

  async ngOnInit() {
    await this.cargarAsistencias();
  }

  async cargarAsistencias() {
    this.cargando = true;
    this.error = '';

    try {
      this.asistencias = await this.servicio.obtenerAsistencias();
      console.log('Asistencias cargadas:', this.asistencias);
      
    } catch (err) {
      this.error = 'Error al cargar las asistencias.';
    } finally {
      this.cargando = false;
    }
  }

exportToPDF(): void {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();

    const img = new Image();
    img.src = 'logo.jpeg';

    img.onload = () => {
      
        pdf.addImage(img, 'JPEG', 14, 8, 25, 20);

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(
            'CENTRO DE ATENCION DE PRIMERA INSTANCIA',
            pageWidth / 2, 12,
            { align: 'center' }
        );
        pdf.text(
            'CAPI "PASITO A PASITO"',
            pageWidth / 2, 18,
            { align: 'center' }
        );

        // Subtítulo
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Reporte de Asistencia', pageWidth / 2, 25, { align: 'center' });

        // Fecha
        pdf.setFontSize(9);
        pdf.text(
            `Fecha: ${new Date().toLocaleDateString('es-SV')}`,
            pageWidth - 14, 32,
            { align: 'right' }
        );

     
        pdf.setLineWidth(0.3);
        pdf.line(14, 35, pageWidth - 14, 35);

        // Tabla
        autoTable(pdf, {
            startY: 40,
            head: [['#', 'Nombre', 'Apellido', 'Entrada', 'Salida', 'Recoge']],
            body: this.asistencias.map(a => [
                a.IdAsistencia,
                a.nombre,
                a.apellido,
                this.formatearFecha(a.HoraEntrada),
                a.HoraSalida ? this.formatearFecha(a.HoraSalida) : 'En guardería',
                a.PersonaRecoge || '—'
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [41, 128, 185] },
            theme: 'grid'
        });

        pdf.save('asistencias.pdf');
    };
}

formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleString('es-SV', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
  
  verDetalle(asistencia: any) {
    this.asistenciaSeleccionada = asistencia;
    this.mostrarDetalle = true;
  }

  abrirModalCheckin() {
    this.idNinoCheckin = null;
    this.errorCheckin = '';
    this.mostrarCheckin = true;
  }

  abrirModalCheckout(asistencia: any) {
    this.asistenciaCheckout = asistencia;
    this.personaRecoge = '';
    this.errorCheckout = '';
    this.mostrarCheckout = true;
  }

 async registrarCheckout() {
    try {
      if (!this.asistenciaCheckout) {
        this.errorCheckout = 'No hay asistencia seleccionada';
        return;
      }

      await this.servicio.checkout(
        this.asistenciaCheckout.IdAsistencia,
        this.personaRecoge
      );

      // cerrar modal
      this.mostrarCheckout = false;

      // limpiar
      this.personaRecoge = '';
      this.asistenciaCheckout = null;

      // refrescar
      await this.cargarAsistencias();

    } catch (err: any) {
      if (err.status === 404) {
        this.errorCheckout = 'Asistencia no encontrada o ya cerrada';
      } else if (err.status === 400) {
        this.errorCheckout = 'Datos inválidos';
      } else {
        this.errorCheckout = 'Error al registrar salida';
      }
    }
  }

  async registrarCheckin() {
    try {
      if (!this.idNinoCheckin) {
        this.errorCheckin = 'Debe ingresar un ID válido';
        return;
      }

      await this.servicio.checkin(this.idNinoCheckin);

      // cerrar modal
      this.mostrarCheckin = false;

      // limpiar
      this.idNinoCheckin = null;

      // refrescar
      await this.cargarAsistencias();

    } catch (err: any) {
      if (err.status === 400) {
        this.errorCheckin = 'ID inválido';
      } else if (err.status === 401) {
        this.errorCheckin = 'No autorizado';
      } else {
        this.errorCheckin = 'Error al registrar entrada';
      }
    }
  }
}