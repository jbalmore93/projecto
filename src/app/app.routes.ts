import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './sistema/dashboard/dashboard';
import { Layout } from './Layout/layout/layout';
import { Admin } from './sistema/admin/admin';
import { MisNinos } from './sistema/mis-ninos/mis-ninos';
import { Asistencia } from './sistema/asistencia/asistencia';
import { Bitacora } from './sistema/bitacora/bitacora';
import { Ninos } from './sistema/ninos/ninos';
import { Documentos } from './sistema/documentos/documentos';
import { NotasComponent } from './sistema/notas/notas';
import { Tutor } from './sistema/tutor/tutor';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'sistema',        
    component: Layout,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'admin/usuarios', component: Admin },
      {path:'mis-ninos',component: MisNinos},
      {path: 'asistencia',component: Asistencia},
      {path:'bitacora',component: Bitacora},
      {path: 'ninos',component: Ninos},
      {path:'documentos',component: Documentos},
      {path:'notas',component: NotasComponent},
      {path: 'admin/tutores', component: Tutor},
    ]
  },

  { path: '**', redirectTo: 'login' }
];