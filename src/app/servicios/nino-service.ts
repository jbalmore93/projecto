import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Ninos } from '../interfaces/nino';

@Injectable({
  providedIn: 'root',
})
export class NinoService {

  constructor(
    private router: Router,
    private http: HttpClient,
      @Inject(PLATFORM_ID) private platformId: Object 
  ) {}

async obtenerNinos(): Promise<{ tutor: any; ninos: Ninos[] }> {
      try {
        const data = await firstValueFrom(
          this.http.get<{ tutor: any; ninos: any[] }>('padre/ninos', { withCredentials: true })
        );
        return data;
      } catch (error) {
        throw error;
      }
    }
  
async listarNinos(): Promise<Ninos[]> {
  try {
    const data = await firstValueFrom(
      this.http.get<Ninos[]>('ninos', { withCredentials: true })
    );
    return data;
  } catch (error) {
    throw error;
  }
}

async registrarNino(data: {
  idTutor: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  alergias?: string;
  grupo: string;
}): Promise<Ninos> {
  try {
    const res = await firstValueFrom(
      this.http.post<Ninos>('ninos', data, { withCredentials: true })
    );
    return res;
  } catch (error) {
    throw error;
  }
}

async actualizarNino(id: number, data: {
  idTutor: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  alergias?: string;
  grupo: string;
}): Promise<any> {
  try {
    const res = await firstValueFrom(
      this.http.put(`ninos/${id}`, data, { withCredentials: true })
    );
    return res;
  } catch (error) {
    throw error;
  }
}

async eliminarNino(id: number): Promise<any> {
  try {
    const res = await firstValueFrom(
      this.http.delete(`ninos/${id}`, { withCredentials: true })
    );
    return res;
  } catch (error) {
    throw error;
  }
}

}
