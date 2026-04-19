import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Nota, NotaConNino } from '../interfaces/nota';

@Injectable({
  providedIn: 'root',
})
export class NotaService {


  constructor(
    private router: Router,
    private http: HttpClient,
      @Inject(PLATFORM_ID) private platformId: Object 
  ) {}

//Metodo para obtener todas las notas de competencias
async getNotasCompetencias(): Promise<NotaConNino[]> {
  return await firstValueFrom(
    this.http.get<NotaConNino[]>('notas-competencias', { withCredentials: true })
  );
}
//Metodo para crear una nueva nota de competencia
async crearNota(data: { idNino: number; competencia: string; nota: number; comentarios?: string }) {
  return await firstValueFrom(
    this.http.post('notas-competencias', data, { withCredentials: true })
  );
}
//metodo para actualizar una nota de competencia existente
async actualizarNota(idNota: number, data: { competencia: string; nota: number; comentarios?: string }) {
  return await firstValueFrom(
    this.http.put(`notas-competencias/${idNota}`, data, { withCredentials: true })
  );
}
//Metodo para eliminar una nota de competencia
async eliminarNota(idNota: number) {
  return await firstValueFrom(
    this.http.delete(`notas-competencias/${idNota}`, { withCredentials: true })
  );
}
//Metodo para obtener las notas de competencias de un niño específico
async getNotasPorNino(idNino: number): Promise<NotaConNino[]> {
  return await firstValueFrom(
    this.http.get<NotaConNino[]>(`notas-competencias/nino/${idNino}`, { withCredentials: true })
  );
}

async getniveles(): Promise<any[]> {
    const niveles = await firstValueFrom(
        this.http.get<any[]>(`niveles`, { withCredentials: true })
    );
    return niveles.map(n => ({
        label: n.nombre_nivel,
        value: n.id_nivel
    }));
}

}