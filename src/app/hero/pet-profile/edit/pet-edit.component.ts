import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TabPageShellBlueComponent } from '../../../shared/components/tab-page-shell-blue/tab-page-shell-blue.component';

export interface PetEditForm {
  name: string;
  breed: string;
  sex: 'Maschio' | 'Femmina';
  birthDate: string;
  weight: number | null;
  bio: string;
}

export interface PersonalityChip {
  id: string;
  label: string;
}

@Component({
  selector: 'app-pet-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, TabPageShellBlueComponent],
  templateUrl: './pet-edit.component.html',
  styleUrls: ['./pet-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetEditComponent {
  private readonly router = inject(Router);

  // Profile photo
  readonly profilePhoto = signal('assets/images/default-pet-avatar.png');

  // Cover / gallery photos (mock)
  readonly coverPhotos = signal<string[]>([
    'assets/images/default-pet-avatar.png',
    'assets/images/default-pet-avatar.png',
    'assets/images/default-pet-avatar.png',
  ]);

  // Form data (mock pre-filled)
  readonly form = signal<PetEditForm>({
    name: 'Rocky',
    breed: 'Labrador',
    sex: 'Maschio',
    birthDate: '2022-03-15',
    weight: 28,
    bio: 'Sono Rocky, amo correre al parco e fare il bagno al mare!',
  });

  // Personality chips
  readonly chips = signal<PersonalityChip[]>([
    { id: '1', label: 'Giocherellone' },
    { id: '2', label: 'Socievole' },
    { id: '3', label: 'Energico' },
  ]);

  // Saving state
  readonly isSaving = signal(false);

  // Sex options for the select
  readonly sexOptions: Array<'Maschio' | 'Femmina'> = ['Maschio', 'Femmina'];

  // --- Navigation ---

  goBack(): void {
    window.history.back();
  }

  // --- Profile Photo ---

  onChangeProfilePhoto(): void {
    // In production this would open a file picker or camera modal
    console.log('Change profile photo');
  }

  // --- Cover Photos ---

  onCoverPhotoClick(index: number): void {
    console.log('Cover photo clicked:', index);
  }

  onAddCoverPhoto(): void {
    // In production this would open a file picker
    const current = this.coverPhotos();
    this.coverPhotos.set([
      ...current,
      'assets/images/default-pet-avatar.png',
    ]);
  }

  // --- Form Updates ---

  updateField<K extends keyof PetEditForm>(field: K, value: PetEditForm[K]): void {
    this.form.update(current => ({ ...current, [field]: value }));
  }

  // --- Personality Chips ---

  removeChip(chipId: string): void {
    this.chips.update(current => current.filter(c => c.id !== chipId));
  }

  addChip(): void {
    const label = prompt('Aggiungi tratto di personalita:');
    if (label && label.trim()) {
      const newId = Date.now().toString();
      this.chips.update(current => [
        ...current,
        { id: newId, label: label.trim() },
      ]);
    }
  }

  // --- Actions ---

  onSave(): void {
    this.isSaving.set(true);
    // Simulate API call
    setTimeout(() => {
      this.isSaving.set(false);
      console.log('Saved pet data:', this.form());
      console.log('Personality:', this.chips());
      this.goBack();
    }, 1200);
  }

  onDeleteProfile(): void {
    const confirmed = confirm(
      'Sei sicuro di voler eliminare questo profilo? Questa azione non puo essere annullata.'
    );
    if (confirmed) {
      console.log('Delete pet profile');
      this.router.navigate(['/home/main']);
    }
  }
}
