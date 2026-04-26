import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private user: any = null;

  constructor(private http: HttpClient) {}

  async login(email: string, password: string) {
    const res: any = await firstValueFrom(
      this.http.post('auth/login', { email, password }, { withCredentials: true })
    );

    // guardar token si el backend lo envía
    if (res.token) {
      localStorage.setItem('token', res.token);
    }

    return this.loadUser();
  }

  async loadUser() {
    try {
      const data = await firstValueFrom(
        this.http.get('me', { withCredentials: true })
      );

      this.user = data;
      return data;

    } catch {
      this.user = null;
      return null;
    }
  }

  getUser() { return this.user; }
  getRole() { return this.user?.roleName; }

  isAdmin() { return this.user?.roleName === 'Admin'; }
  isMaestro() { return this.user?.roleName === 'Maestro'; }
  isPadre() { return this.user?.roleName === 'Padre'; }

  async logout() {

    await firstValueFrom(
      this.http.post('auth/logout', {}, { withCredentials: true })
    );

    localStorage.removeItem('token');
    this.user = null;
  }

  async obtenerAvisos(): Promise<any[]> {
  return await firstValueFrom(
    this.http.get<any[]>('avisos', { withCredentials: true })
  );
}

async obtenerAviso(id: number): Promise<any> {
  return await firstValueFrom(
    this.http.get<any>(`avisos/${id}`, { withCredentials: true })
  );
}

async crearAviso(data: any) {
  return await firstValueFrom(
    this.http.post('avisos', data, { withCredentials: true })
  );
}

async actualizarAviso(id: number, data: any) {
  return await firstValueFrom(
    this.http.put(`avisos/${id}`, data, { withCredentials: true })
  );
}

async eliminarAviso(id: number) {
  return await firstValueFrom(
    this.http.delete(`avisos/${id}`, { withCredentials: true })
  );
}

}