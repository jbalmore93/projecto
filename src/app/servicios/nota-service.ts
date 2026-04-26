import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { NotaCompetencia } from '../interfaces/nota';

@Injectable({
  providedIn: 'root',
})
export class NotaService {

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ── EVALUACIONES ──

  async getNotasCompetencias(): Promise<NotaCompetencia []> {
    return await firstValueFrom(
      this.http.get<NotaCompetencia[]>('notas-competencias', { withCredentials: true })
    );
  }

  async crearNota(data: { idNino: number; idNivel: number; idCompetencia: number; idReq: number; opciones: string }) {
    return await firstValueFrom(
      this.http.post('notas-competencias', data, { withCredentials: true })
    );
  }

async obtenerNota(idNota: number): Promise<NotaCompetencia> {
    return await firstValueFrom(
      this.http.get<NotaCompetencia>(`notas-competencias/${idNota}`, { withCredentials: true })
    );
  }

  async actualizarNota(idNota: number, data: { idNivel: number; idCompetencia: number; idReq: number; opciones: string }) {
    return await firstValueFrom(
      this.http.put(`notas-competencias/${idNota}`, data, { withCredentials: true })
    );
  }

  async eliminarNota(idNota: number) {
    return await firstValueFrom(
      this.http.delete(`notas-competencias/${idNota}`, { withCredentials: true })
    );
  }

  async getNotasPorNino(idNino: number): Promise<NotaCompetencia[]> {
    return await firstValueFrom(
      this.http.get<NotaCompetencia[]>(`notas-competencias/nino/${idNino}`, { withCredentials: true })
    );
  }

  async getNotasPorNivel(idNivel: number): Promise<NotaCompetencia[]> {
    return await firstValueFrom(
      this.http.get<NotaCompetencia[]>(`notas-competencias/nivel/${idNivel}`, { withCredentials: true })
    );
  }

  // ── NIVELES ──

  async getniveles(): Promise<any[]> {
    const niveles = await firstValueFrom(
      this.http.get<any[]>('niveles', { withCredentials: true })
    );
    return niveles.map(n => ({
      label: n.nombre_nivel,
      value: n.id_nivel
    }));
  }

  // ── COMPETENCIAS ──

  async getCompetencias(nivelId: number): Promise<any[]> {
    const competencias = await firstValueFrom(
      this.http.get<any[]>(`competencias/${nivelId}`, { withCredentials: true })
    );
    return competencias.map(c => ({
      label: c.nombre_competencia,
      value: c.id_comp
    }));
  }

  // ── CRITERIOS ──

  async getCriterios(compId: number): Promise<any[]> {
    const criterios = await firstValueFrom(
      this.http.get<any[]>(`criterios/${compId}`, { withCredentials: true })
    );
    return criterios.map(c => ({
      label: c.nombre_criterios,
      value: c.id_crit
    }));
  }
}