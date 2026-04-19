import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


/* PrimeNG */
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NinoService } from '../../servicios/nino-service';
import { Ninos as Nino} from '../../interfaces/nino';

@Component({
  selector: 'app-ninos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    DialogModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    ProgressSpinnerModule,
    MessageModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './ninos.html',
  styleUrl: './ninos.css',
})
export class Ninos implements OnInit {

  ninos: Nino[] = [];
  cargando = true;
  error = '';

 
  mostrarModal = false;
  mostrarDetalle = false;

 grupos = [
  { label: 'Maternal 1', value: 'Maternal 1' },
  { label: 'Maternal 2', value: 'Maternal 2' },
  { label: 'Maternal 3', value: 'Maternal 3' }
];

  form = {
    idTutor: null as number | null,
    nombre: '',
    apellido: '',
    fechaNacimiento: null as Date | null,
    alergias: '',
    grupo: ''
  };

  errorForm = '';
  modoEdicion = false;
  ninoEditandoId: number | null = null;

  ninoSeleccionado: any = null;

  constructor(
    private servicio: NinoService,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit() {
    await this.cargarNinos();
  }
/* CARGAR NIÑOS */
  async cargarNinos() {
    this.cargando = true;
    this.error = '';
    try {
      this.ninos = await this.servicio.listarNinos();
    } catch {
      this.error = 'Error al cargar los niños.';
    } finally {
      this.cargando = false;
    }
  }

/* RESETEAR FORMULARIO */
  private resetForm() {
    this.form = {
      idTutor: null,
      nombre: '',
      apellido: '',
      fechaNacimiento: null,
      alergias: '',
      grupo: ''
    };
    this.errorForm = '';
    this.modoEdicion = false;
    this.ninoEditandoId = null;
  }

/* ABRIR MODAL CREAR/EDITAR */
  abrirModalCrear() {
    this.resetForm();
    this.mostrarModal = true;
  }

  abrirModalEditar(nino: any) {
    this.modoEdicion = true;
    this.ninoEditandoId = nino.IdNino;

    this.form = {
      idTutor: nino.IdTutor,
      nombre: nino.Nombre,
      apellido: nino.Apellido,
      fechaNacimiento: new Date(nino.FechaNacimiento),
      alergias: nino.Alergias || '',
      grupo: nino.Grupo
    };

    this.mostrarModal = true;
  }

  verDetalle(nino: any) {
    this.ninoSeleccionado = nino;
    this.mostrarDetalle = true;
  }


  async guardarNino() {
    this.errorForm = '';

    if (!this.form.idTutor || !this.form.nombre || !this.form.apellido ||
        !this.form.fechaNacimiento || !this.form.grupo) {
      this.errorForm = 'Todos los campos son requeridos.';
      return;
    }

    const payload = {
      idTutor: this.form.idTutor,
      nombre: this.form.nombre,
      apellido: this.form.apellido,
      fechaNacimiento: this.form.fechaNacimiento.toISOString().split('T')[0],
      alergias: this.form.alergias || undefined,
      grupo: this.form.grupo
    };

    try {
      if (this.modoEdicion && this.ninoEditandoId) {
        await this.servicio.actualizarNino(this.ninoEditandoId, payload);
      } else {
        await this.servicio.registrarNino(payload);
      }

      this.mostrarModal = false;
      await this.cargarNinos();
      this.resetForm();

    } catch (err: any) {
      if (err.status === 404) {
        this.errorForm = 'Tutor no encontrado.';
      } else if (err.status === 400) {
        this.errorForm = 'Datos inválidos.';
      } else {
        this.errorForm = 'Error al guardar.';
      }
    }
  }

  /* CONFIRMAR ELIMINAR */
  confirmarEliminar(nino: any) {
    this.confirmationService.confirm({
      message: `¿Eliminar a ${nino.Nombre} ${nino.Apellido}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: async () => {
        await this.eliminarNino(nino.IdNino);
      }
    });
  }

  async eliminarNino(id: number) {
    try {
      await this.servicio.eliminarNino(id);
      await this.cargarNinos();
    } catch {
      this.error = 'Error al eliminar el niño.';
    }
  }

/* EXPORTAR A PDF */
  exportToPDF(): void {
  
    const pdf = new jsPDF();
  
  
    const img = new Image();
    img.src = 'logo.jpeg'; 
  
    img.onload = () => {
  const pageWidth = pdf.internal.pageSize.getWidth();
    
   pdf.addImage(img, 'JPEG', 14, 8, 25, 20);
  
      
   pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(
        'CENTRO DE ATENCION DE PRIMERA INSTANCIA',
        pageWidth / 2,
        12,
        { align: 'center' }
    );
    pdf.text(
        'CAPI "PASITO A PASITO"',
        pageWidth / 2,
        18,
        { align: 'center' }
    );

    // Subtítulo
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Reporte de Niños', pageWidth / 2, 25, { align: 'center' });

    // Fecha — abajo a la derecha, sin solaparse
    pdf.setFontSize(9);
    pdf.text(
        `Fecha: ${new Date().toLocaleDateString('es-SV')}`,
        pageWidth - 14,
        32,
        { align: 'right' }
    );

    // Línea separadora
    pdf.setLineWidth(0.3);
    pdf.line(14, 35, pageWidth - 14, 35);

  
      
      autoTable(pdf, {
        startY: 40,
        head: [['#', 'Nombre', 'Apellido', 'Nivel', 'Alergias']],
        body: this.ninos.map(a => [
          a.IdNino,
          a.Nombre,
          a.Apellido,
          a.Grupo,
          a.Alergias || 'Ninguna'
        ]),



        styles: {
          fontSize: 9
        },
        headStyles: {
          fillColor: [41, 128, 185]
        },
        theme: 'grid'
      });
  
      pdf.save('ninos.pdf');
    };
  }
}