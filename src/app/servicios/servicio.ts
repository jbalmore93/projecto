import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Ninos } from '../interfaces/nino';

@Injectable({
  providedIn: 'root',
})
export class Servicio {

  constructor(
    private router: Router,
    private http: HttpClient,
      @Inject(PLATFORM_ID) private platformId: Object 
  ) {}

  async login(email: string, password: string): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const res: any = await firstValueFrom(
      this.http.post('auth/login', { email, password }, { withCredentials: true })
    );

    if (res?.token) {
      localStorage.setItem('token', res.token);
    }

    await firstValueFrom(
      this.http.get('me', { withCredentials: true })
    );

    this.router.navigate(['/sistema/dashboard']);
    return { success: true };

  } catch (err: any) {
    if (err.status === 423) {
      return { success: false, status: 423, error: 'Cuenta bloqueada por intentos fallidos.' };
    }
    if (err.status === 401) {
      return { success: false, status: 401, error: 'Correo o contraseña incorrectos.' };
    }
    return { success: false, status: err.status, error: 'Error de conexión. Intente de nuevo.' };
  }
}

  async obtenerUsuarios(): Promise<any[]> {
    try {
      const data = await firstValueFrom(
        this.http.get<any[]>('admin/usuarios', { withCredentials: true })
      );
      return data;
    } catch (error) {
      throw error;
    }
  }

 
  async obtenerBitacora(idNino: number): Promise<Ninos[]> {
  try {
    const data = await firstValueFrom(
      this.http.get<Ninos[]>(`padre/ninos/${idNino}/bitacora`, { withCredentials: true })
    );
    return data;
  } catch (error) {
    throw error;
  }
}


async getbitacora(): Promise<any[]> {
  try {
    const data = await firstValueFrom(
      this.http.get<any[]>('bitacora', { withCredentials: true })
    );
    return data;
  } catch (error) {
    throw error;
  }
}

async obtenerAsistencias(): Promise<any[]> {
  try {
    const data = await firstValueFrom(
      this.http.get<any[]>('asistencia', { withCredentials: true })
    );
    return data;
  } catch (error) {
    throw error;
  }
}

async crearBitacora(data: any) {

  const res = await firstValueFrom(
    this.http.post('/bitacora', data)
  );

  return res;

}
async crearUsuario(data: any) {
  try {
    const res = await firstValueFrom(
      this.http.post('auth/register', data, { withCredentials: true })
    );
    return res;
  } catch (error) {
    throw error;
  }
}

async checkin(idNino: number) {
  try {
    const res = await firstValueFrom(
      this.http.post('asistencia/checkin', { idNino }, { withCredentials: true })
    );
    return res;
  } catch (error) {
    throw error;
  }
}

async checkout(idAsistencia: number, personaRecoge: string) {
  try {
    const res = await firstValueFrom(
      this.http.post('asistencia/checkout', {
        idAsistencia,
        personaRecoge
      })
    );
    return res;
  } catch (error) {
    throw error;
  }
}


async obtenerTutores(): Promise<any[]> {
  return await firstValueFrom(
    this.http.get<any[]>('tutores', { withCredentials: true })
  );
}

async crearTutor(data: any) {
  return await firstValueFrom(
    this.http.post('tutores', data, { withCredentials: true })
  );
}

async actualizarTutor(id: number, data: any) {
  return await firstValueFrom(
    this.http.put(`tutores/${id}`, data, { withCredentials: true })
  );
}

async eliminarTutor(id: number) {
  return await firstValueFrom(
    this.http.delete(`tutores/${id}`, { withCredentials: true })
  );
}

}