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
import { TooltipModule } from 'primeng/tooltip';
import { FloatLabelModule } from 'primeng/floatlabel';
import { NotaCompetencia } from '../../interfaces/nota';

@Component({
  selector: 'app-notas',
  imports: [
    CommonModule, FormsModule, FloatLabelModule,
    TableModule, ButtonModule, MessageModule,
    DialogModule, Select, Tag,
    InputTextModule, TooltipModule
  ],
  templateUrl: './notas.html',
})
export class NotasComponent implements OnInit {

  cargando = false;
  guardando = false;
  error = '';
  mensaje = '';
  filtro = '';

  // Listas
  Arreglonivel: { label: string, value: number }[] = [];
  competencias: { label: string, value: number }[] = [];
  criterios: { label: string, value: number }[] = [];

  // Filtros tabla
  filtroNivelId: number | null = null;
  filtroIdNino: number | null = null;

  notas: NotaCompetencia[] = [];
  notasFiltradas: NotaCompetencia[] = [];
  notaAEliminar: NotaCompetencia | null = null;
  editandoId: number | null = null;

  modalVisible = false;
  modalEliminarVisible = false;

  form: any = this.formVacio();
  errorForm = '';

  filtros = [
    { label: 'Niño',  value: '1' },
    { label: 'Nivel', value: '2' }
  ];

  resultadoOpciones = [
    { label: 'Si',    value: 'Si'    },
    { label: 'No', value: 'No' }
  ];

  constructor(public auth: AuthService, private servicio: NotaService) {}

  async ngOnInit() {
    await this.cargarNotas();
    await this.cargarNiveles();
  }

  async cargarNotas() {
    this.cargando = true;
    this.error = '';
    try {
      this.notas = await this.servicio.getNotasCompetencias();
      this.notasFiltradas = [...this.notas];
    } catch (err) {
      this.error = 'Error al cargar las evaluaciones';
    } finally {
      this.cargando = false;
    }
  }

  async cargarNiveles() {
    try {
      this.Arreglonivel = await this.servicio.getniveles();
    } catch (err) {
      this.error = 'Error al cargar los niveles';
    }
  }

  // ── SELECTS ENCADENADOS FORMULARIO ──

  async onNivelFormChange() {
    this.competencias = [];
    this.criterios = [];
    this.form.idCompetencia = null;
    this.form.idReq = null;
    this.form.opciones = null;
    if (!this.form.idNivel) return;
    try {
      this.competencias = await this.servicio.getCompetencias(this.form.idNivel);
    } catch (err) {
      this.errorForm = 'Error al cargar competencias';
    }
  }

  async onCompetenciaFormChange() {
    this.criterios = [];
    this.form.idReq = null;
    this.form.opciones = null;
    if (!this.form.idCompetencia) return;
    try {
      this.criterios = await this.servicio.getCriterios(this.form.idCompetencia);
    } catch (err) {
      this.errorForm = 'Error al cargar criterios';
    }
  }

  // ── FILTRO NIÑO ──

  async buscarPorNino() {
    this.error = '';
    try {
      if (!this.filtroIdNino) {
        this.notas = await this.servicio.getNotasCompetencias();
      } else {
        this.notas = await this.servicio.getNotasPorNino(this.filtroIdNino);
      }
      this.notasFiltradas = [...this.notas];
    } catch (err) {
      this.error = 'No se encontraron evaluaciones para ese niño.';
      this.notas = [];
      this.notasFiltradas = [];
    }
  }

  // ── FILTRO NIVEL ──

  async onNivelFiltroChange() {
    this.error = '';
    try {
      if (!this.filtroNivelId) {
        this.notas = await this.servicio.getNotasCompetencias();
      } else {
        this.notas = await this.servicio.getNotasPorNivel(this.filtroNivelId);
      }
      this.notasFiltradas = [...this.notas];
    } catch (err) {
      this.error = 'No se encontraron evaluaciones para ese nivel.';
      this.notas = [];
      this.notasFiltradas = [];
    }
  }

  severidadResultado(resultado: string): 'success' | 'warn' | 'danger' {
    if (resultado === 'Si')    return 'success';
    if (resultado === 'No') return 'warn';
    return 'danger';
  }

  // ── MODAL ──

  abrirModalNueva() {
    this.editandoId = null;
    this.form = this.formVacio();
    this.competencias = [];
    this.criterios = [];
    this.errorForm = '';
    this.modalVisible = true;
  }

  async guardarNota() {
    if (!this.form.idNino || !this.form.idNivel || !this.form.idCompetencia || !this.form.idReq || !this.form.opciones) {
      this.errorForm = 'Todos los campos son obligatorios.';
      return;
    }

    this.guardando = true;
    this.errorForm = '';
console.log(this.form.idCompetencia);
    try {
      if (this.editandoId) {
        await this.servicio.actualizarNota(this.editandoId, {
          idNivel:        this.form.idNivel,
          idCompetencia:  this.form.idCompetencia,
          idReq:          this.form.idReq,
          opciones:       this.form.opciones
        });
        this.mensaje = 'Evaluación actualizada correctamente';
      } else {
        await this.servicio.crearNota({
          idNino:         this.form.idNino,
          idNivel:        this.form.idNivel,
          idCompetencia:  this.form.idCompetencia,
          idReq:          this.form.idReq,
          opciones:       this.form.opciones
        });
        this.mensaje = 'Evaluación registrada correctamente';
      }
      this.modalVisible = false;
      await this.cargarNotas();
    } catch (err: any) {
      this.errorForm = err?.error?.error ?? 'Error al guardar la evaluación';
    } finally {
      this.guardando = false;
    }
  }

async editarNota(n: any) {
  const data = await this.servicio.obtenerNota(n.id_nota);
  this.competencias = [];
  this.criterios = [];
  this.errorForm = '';
  this.editandoId = data.id_nota;

  try {
    this.competencias = await this.servicio.getCompetencias(data.idnivel);
  } catch (err) {
    this.errorForm = 'Error al cargar competencias';
  }

  try {
    this.criterios = await this.servicio.getCriterios(data.idcompetencia);
  } catch (err) {
    this.errorForm = 'Error al cargar criterios';
  }

  this.form = {
    idNino:        data.IdNino,
    idNivel:       data.idnivel,
    idCompetencia: data.idcompetencia,
    idReq:         data.idreq,
    opciones:      data.opciones
  };

  this.modalVisible = true;
}

  pedirEliminar(nota: NotaCompetencia) {
    this.notaAEliminar = nota;
    this.modalEliminarVisible = true;
  }

  async eliminarNota() {
    if (!this.notaAEliminar) return;
    this.guardando = true;
    try {
      await this.servicio.eliminarNota(this.notaAEliminar.id_nota);
      this.mensaje = 'Evaluación eliminada correctamente';
      this.modalEliminarVisible = false;
      this.notaAEliminar = null;
      await this.cargarNotas();
    } catch (err) {
      this.error = 'Error al eliminar la evaluación';
    } finally {
      this.guardando = false;
    }
  }

  private formVacio() {
    return {
      idNino:        null,
      idNivel:       null,
      idCompetencia: null,
      idReq:         null,
      opciones:      null
    };
  }
}