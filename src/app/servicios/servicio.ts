import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Ninos } from '../interfaces/nino';
import { Usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root',
})
export class Servicio {

  private user: any = null; // ← guardar usuario en memoria

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ← método para cargar y guardar el usuario
  async loadUser() {
    try {
      const data = await firstValueFrom(
        this.http.get<any>('me', { withCredentials: true })
      );
      this.user = data;
      return data;
    } catch {
      this.user = null;
      return null;
    }
  }

  getUser()    { return this.user; }
  getRole()    { return this.user?.roleName; }
  isAdmin()    { return this.user?.roleName === 'Admin'; }
  isMaestro()  { return this.user?.roleName === 'Maestro'; }
  isPadre()    { return this.user?.roleName === 'Padre'; }

  async login(email: string, password: string): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const res: any = await firstValueFrom(
      this.http.post('auth/login', { email, password }, { withCredentials: true })
    );

    if (res?.token) {
      localStorage.setItem('token', res.token);
    }

    // ← guarda en this.user sin perder el /me
    const data = await firstValueFrom(
      this.http.get('me', { withCredentials: true })
    );
    this.user = data;

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

  async obtenerUsuarios(): Promise<Usuario[]> {
    try {
      return await firstValueFrom(
        this.http.get<Usuario[]>('admin/usuarios', { withCredentials: true })
      );
    } catch (error) {
      throw error;
    }
  }

  async editarPasswordUsuario(id: number, password: string) {
    try {
      return await firstValueFrom(
        this.http.put(`admin/usuarios/${id}/password`, { password }, { withCredentials: true })
      );
    } catch (error) {
      throw error;
    }
  }

  async desbloquearUsuario(id: number) {
    return await firstValueFrom(
      this.http.put(`admin/usuarios/${id}/unlock`, {}, { withCredentials: true })
    );
  }

  async crearUsuario(data: any) {
    try {
      return await firstValueFrom(
        this.http.post('auth/register', data, { withCredentials: true })
      );
    } catch (error) {
      throw error;
    }
  }

  async obtenerBitacora(idNino: number): Promise<Ninos[]> {
    try {
      return await firstValueFrom(
        this.http.get<Ninos[]>(`padre/ninos/${idNino}/bitacora`, { withCredentials: true })
      );
    } catch (error) {
      throw error;
    }
  }

  async getbitacora(): Promise<any[]> {
    try {
      return await firstValueFrom(
        this.http.get<any[]>('bitacora', { withCredentials: true })
      );
    } catch (error) {
      throw error;
    }
  }

  async obtenerAsistencias(): Promise<any[]> {
    try {
      return await firstValueFrom(
        this.http.get<any[]>('asistencia', { withCredentials: true })
      );
    } catch (error) {
      throw error;
    }
  }

  async crearBitacora(data: any) {
    return await firstValueFrom(
      this.http.post('bitacora', data)
    );
  }

  async checkin(idNino: number) {
    try {
      return await firstValueFrom(
        this.http.post('asistencia/checkin', { idNino }, { withCredentials: true })
      );
    } catch (error) {
      throw error;
    }
  }

  async checkout(idAsistencia: number, personaRecoge: string) {
    try {
      return await firstValueFrom(
        this.http.post('asistencia/checkout', { idAsistencia, personaRecoge })
      );
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

  async idusuario(): Promise<{ label: string; value: number }[]> {
    try {
      const data = await firstValueFrom(
        this.http.get<{ IdUsuario: number; Email: string }[]>('idusuario', { withCredentials: true })
      );
      return data.map(u => ({ label: u.Email, value: u.IdUsuario }));
    } catch (error) {
      throw error;
    }
  }

  async obtenerNinos(): Promise<any[]> {
    try {
      return await firstValueFrom(
        this.http.get<any[]>('ninos-id', { withCredentials: true })
      );
    } catch (error) {
      throw error;
    }
  }

  async verificarBloqueo(email: string): Promise<{ blocked: boolean; secondsLeft: number }> {
  try {
    const res = await firstValueFrom(
      this.http.post<{ blocked: boolean; secondsLeft: number }>(
        'auth/check-block', { email }, { withCredentials: true }
      )
    );
    return res;
  } catch {
    return { blocked: false, secondsLeft: 0 };
  }
}
}