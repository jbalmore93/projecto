import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth';
import { NotaService } from '../../servicios/nota-service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Nota, NotaConNino } from '../../interfaces/nota';

@Component({
  selector: 'app-notas',
  imports: [
    CommonModule, FormsModule, FloatLabelModule,
    TableModule, ButtonModule, MessageModule,
    DialogModule, Select, Tag,
    InputTextModule, InputNumberModule, TooltipModule
  ],
  templateUrl: './notas.html',
})
export class NotasComponent implements OnInit {

  cargando = false;
  guardando = false;
  error = '';
  mensaje = '';

  filtroIdNino: number | null = null;

  severidad : string = '';

  notas: NotaConNino[] = [];
  notasFiltradas: NotaConNino[] = [];
  notaAEliminar: NotaConNino | null = null;
  editandoId: number | null = null;

  modalVisible = false;
  modalEliminarVisible = false;

  filtroNino = '';
  filtroAmbito = '';

  form: any = this.formVacio();
  errorForm = '';
  
private ambitoKeyMap: { [key: string]: string } = {
  // Social
  'Identidad y Autonomía': 'social',
  'Habilidades Socioemocionales': 'social',
  'Convivencia': 'social',

  // Explora
  'Pensamiento Científico': 'explora',
  'Pensamiento Tecnológico y Computacional': 'explora',
  'Pensamiento Lógico Matemático': 'explora',   // ← sin guión
  'Pensamiento Lógico-Matemático': 'explora',   // ← con guión (por si acaso)

  // Estética
  'Expresión Musical': 'estetica',
  'Expresión Plástica y Visual': 'estetica',
  'Expresión Dramática': 'estetica',

  // Lenguaje
  'Lenguaje Oral': 'lenguaje',
  'Lenguaje No Verbal': 'lenguaje',
  'Lectura y Escritura': 'lenguaje',
  'Comunicación y Lenguaje': 'lenguaje',   // ← este faltaba

  // Cuerpo
  'Cuerpo, Imagen y Percepción': 'cuerpo',
  'Movimiento y Expresión Corporal': 'cuerpo',
  'Bienestar Físico': 'cuerpo',
};


ambitoKeyDe(competencia: string): string {
  return this.ambitoKeyMap[competencia] ?? '';
}
  // Ámbitos para el filtro
  ambitoOpciones = [
    { label: 'Relaciones Sociales y Afectivas',      value: 'social'   },
    { label: 'Exploración y Experimentación',         value: 'explora'  },
    { label: 'Estéticas y Creativas',                 value: 'estetica' },
    { label: 'Lenguaje, Comunicación y Expresión',    value: 'lenguaje' },
    { label: 'Cuerpo, Movimiento y Bienestar Físico', value: 'cuerpo'   },
  ];

  // Competencias agrupadas por ámbito
  competenciaOpciones = [
    { label: '🤝 Identidad y Autonomía',                   value: 'Identidad y Autonomía'                   },
    { label: '🤝 Habilidades Socioemocionales',             value: 'Habilidades Socioemocionales'             },
    { label: '🤝 Convivencia',                              value: 'Convivencia'                              },
    { label: '🔬 Pensamiento Científico',                   value: 'Pensamiento Científico'                   },
    { label: '🔬 Pensamiento Tecnológico y Computacional',  value: 'Pensamiento Tecnológico y Computacional'  },
    { label: '🔬 Pensamiento Lógico-Matemático',            value: 'Pensamiento Lógico-Matemático'            },
    { label: '🎨 Expresión Musical',                        value: 'Expresión Musical'                        },
    { label: '🎨 Expresión Plástica y Visual',              value: 'Expresión Plástica y Visual'              },
    { label: '🎨 Expresión Dramática',                      value: 'Expresión Dramática'                      },
    { label: '💬 Lenguaje Oral',                            value: 'Lenguaje Oral'                            },
    { label: '💬 Lenguaje No Verbal',                       value: 'Lenguaje No Verbal'                       },
    { label: '💬 Lectura y Escritura',                      value: 'Lectura y Escritura'                      },
    { label: '🏃 Cuerpo, Imagen y Percepción',              value: 'Cuerpo, Imagen y Percepción'              },
    { label: '🏃 Movimiento y Expresión Corporal',          value: 'Movimiento y Expresión Corporal'          },
    { label: '🏃 Bienestar Físico',                         value: 'Bienestar Físico'                         },
  ];

  // Mapa competencia → ámbito para mostrar el tag en tabla
  private ambitoMap: { [key: string]: string } = {
  // Social
  'Identidad y Autonomía': 'Social',
  'Habilidades Socioemocionales': 'Social',
  'Convivencia': 'Social',

  // Explora
  'Pensamiento Científico': 'Explora',
  'Pensamiento Tecnológico y Computacional': 'Explora',
  'Pensamiento Lógico Matemático': 'Explora',   // sin guión (backend)
  'Pensamiento Lógico-Matemático': 'Explora',   // con guión (por si acaso)

  // Estética
  'Expresión Musical': 'Estética',
  'Expresión Plástica y Visual': 'Estética',
  'Expresión Dramática': 'Estética',

  // Lenguaje
  'Lenguaje Oral': 'Lenguaje',
  'Lenguaje No Verbal': 'Lenguaje',
  'Lectura y Escritura': 'Lenguaje',
  'Comunicación y Lenguaje': 'Lenguaje',   // ← visto en tu BD

  // Cuerpo
  'Cuerpo, Imagen y Percepción': 'Cuerpo',
  'Movimiento y Expresión Corporal': 'Cuerpo',
  'Bienestar Físico': 'Cuerpo',
};

  constructor(
    public auth: AuthService,
    private servicio: NotaService
  ) {}

  async ngOnInit() {
    await this.cargarNotas();
  }

  async cargarNotas() {
    this.cargando = true;
    this.error = '';
    try {
      this.notas = await this.servicio.getNotasCompetencias();
      this.aplicarFiltros();
    } catch (err) {
      this.error = 'Error al cargar las notas';
      console.error(err);
    } finally {
      this.cargando = false;
    }
  }

  async buscarPorNino() {
  this.error = '';
  try {
    if (!this.filtroIdNino) {
      this.notas = await this.servicio.getNotasCompetencias();
    } else {
      this.notas = await this.servicio.getNotasPorNino(this.filtroIdNino);
    }
    this.aplicarFiltros();
  } catch (err) {
    this.error = 'No se encontraron notas para ese niño.';
    this.notas = [];
    this.notasFiltradas = [];
  }
}

aplicarFiltros() {
  this.notasFiltradas = this.notas.filter(n =>
    !this.filtroAmbito || this.ambitoKeyDe(n.Competencia) === this.filtroAmbito,
 
  );
  console.log('Notas filtradas:', this.notasFiltradas);
}

  ambitoDe(competencia: string): string {
    return this.ambitoMap[competencia] ?? '—';
  }

  severidadNota(nota: number): 'success' | 'info' | 'warn' | 'danger' {
  if (nota >= 9) return 'success';
  if (nota >= 7) return 'info';
  if (nota >= 5) return 'warn';
  return 'danger';
}

  // ── MODAL NUEVA ──
  abrirModalNueva() {
    this.editandoId = null;
    this.form = this.formVacio();
    this.errorForm = '';
    this.modalVisible = true;
  }

  // ── GUARDAR / EDITAR ──
  async guardarNota() {
    if (!this.form.idNino || !this.form.competencia || !this.form.nota) {
      this.errorForm = 'ID Niño, competencia y nota son obligatorios.';
      return;
    }
    this.guardando = true;
    this.errorForm = '';
    try {
      if (this.editandoId) {
        await this.servicio.actualizarNota(this.editandoId, {
          competencia: this.form.competencia,
          nota: this.form.nota,
          comentarios: this.form.comentarios || null
        });
        this.mensaje = 'Nota actualizada correctamente';
      } else {
        await this.servicio.crearNota({
          idNino: this.form.idNino,
          competencia: this.form.competencia,
          nota: this.form.nota,
          comentarios: this.form.comentarios || null
        });
        this.mensaje = 'Nota registrada correctamente';
      }
      this.modalVisible = false;
      await this.cargarNotas();
    } catch (err: any) {
      this.errorForm = err?.error?.error ?? 'Error al guardar la nota';
      console.error(err);
    } finally {
      this.guardando = false;
    }
  }

  // ── EDITAR ──
  editarNota(nota: any) {
    this.editandoId = nota.IdNota;
    this.form = {
      idNino: nota.IdNino,
      competencia: nota.Competencia,
      nota: nota.Nota,
      comentarios: nota.Comentarios ?? ''
    };
    this.errorForm = '';
    this.modalVisible = true;
  }

  // ── ELIMINAR ──
  pedirEliminar(nota: any) {
    this.notaAEliminar = nota;
    this.modalEliminarVisible = true;
  }

  async eliminarNota() {
    if (!this.notaAEliminar) return;
    this.guardando = true;
    try {
      await this.servicio.eliminarNota(this.notaAEliminar.idnota);
      this.mensaje = 'Nota eliminada correctamente';
      this.modalEliminarVisible = false;
      this.notaAEliminar = null;
      await this.cargarNotas();
    } catch (err) {
      this.error = 'Error al eliminar la nota';
      console.error(err);
    } finally {
      this.guardando = false;
    }
  }

  private formVacio() {
    return { idNino: null, competencia: '', nota: null, comentarios: '' };
  }
}