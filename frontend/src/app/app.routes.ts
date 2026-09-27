import { Routes } from '@angular/router';
import { adminGuard, loginGuard } from './admin/admin.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Prince Henri Junior Pamousso — Développeur Full-Stack',
    loadComponent: () => import('./public/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'admin/connexion',
    title: 'Connexion — Administration',
    canActivate: [loginGuard],
    loadComponent: () => import('./admin/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'competences' },
      {
        path: 'competences',
        title: 'Compétences — Administration',
        loadComponent: () => import('./admin/skills-admin.component').then((m) => m.SkillsAdminComponent),
      },
      {
        path: 'projets',
        title: 'Projets — Administration',
        loadComponent: () => import('./admin/projects-admin.component').then((m) => m.ProjectsAdminComponent),
      },
      {
        path: 'services',
        title: 'Services — Administration',
        loadComponent: () => import('./admin/services-admin.component').then((m) => m.ServicesAdminComponent),
      },
      {
        path: 'cv-photo',
        title: 'CV & photo — Administration',
        loadComponent: () => import('./admin/files-admin.component').then((m) => m.FilesAdminComponent),
      },
      {
        path: 'contact',
        title: 'Liens de contact — Administration',
        loadComponent: () => import('./admin/contacts-admin.component').then((m) => m.ContactsAdminComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
