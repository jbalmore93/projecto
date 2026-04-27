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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { StringToken } from '@angular/compiler';


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
ninos: { label: String, value: Number }[] = [];


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
    await this.cargarNinos();
  }

async cargarNinos() {
  try {
    const ninosData = await this.servicio.obtenerNinos();
    this.ninos = ninosData.map((nino: any) => ({
      label: `${nino.Nombre} ${nino.Apellido}`,
      value: nino.IdNino
    }));
  } catch (err) {
    console.error('Error al cargar los niños:', err);
  }
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
       this.mostrarModal = false;
       Swal.fire({
        icon: 'success',
        title: '¡Bitacora almacenada correctamente!',
        timer: 2000,
        showConfirmButton: false
      });
      await this.cargarBitacoras();
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
        pdf.text('Reporte de Bitácora', pageWidth / 2, 25, { align: 'center' });

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
            head: [['#', 'Nombre', 'Apellido', 'Fecha', 'Comió', 'Siesta', 'Ánimo', 'Observaciones']],
            body: this.bitacoras.map(a => [
                a.IdLog,
                a.NinoNombre,
                a.NinoApellido,
                this.formatearFecha(a.Fecha),
                a.Comida ? 'Sí' : 'No',
                a.SiestaMinutos  || '—',
                a.EstadoAnimo || '—',
                a.Observaciones || '—'
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [41, 128, 185] },
            theme: 'grid'
        });

        pdf.save('bitacoras.pdf');
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
}