import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePrototypeComponent } from './prototype/profile-prototype.component';
import { PetProfileComponent } from './pet/pet-profile.component';

const routes: Routes = [
  {
    path: 'prototype',
    component: ProfilePrototypeComponent,
    title: 'Profilo Prototipo - FiutaMi',
  },
  {
    path: 'pet/:id/documents',
    loadComponent: () => import('./pet-documents/pet-document-list.component').then(m => m.PetDocumentListComponent),
    title: 'Documenti Pet - FiutaMi',
  },
  {
    path: 'pet/:id/documents/upload',
    loadComponent: () => import('./pet-documents/pet-document-upload.component').then(m => m.PetDocumentUploadComponent),
    title: 'Carica Documento - FiutaMi',
  },
  {
    path: 'pet/:id/documents/:docId',
    loadComponent: () => import('./pet-documents/pet-document-viewer.component').then(m => m.PetDocumentViewerComponent),
    title: 'Documento - FiutaMi',
  },
  {
    path: 'pet/:id',
    component: PetProfileComponent,
    title: 'Profilo Pet - FiutaMi',
  },
  {
    path: '',
    redirectTo: 'prototype',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
