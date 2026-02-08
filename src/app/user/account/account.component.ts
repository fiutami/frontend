import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService, User } from '../../core/services/auth.service';

interface PetInfo {
  name: string;
  weight: number;
  age: number;
  sex: 'male' | 'female';
  petAge: number;
}

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  user: User | null = null;
  userForm!: FormGroup;
  isLoading = false;
  successMessage = '';

  pet: PetInfo = {
    name: 'Thor',
    weight: 30,
    age: 9,
    sex: 'male',
    petAge: 60
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.initForm();
  }

  get userFullName(): string {
    if (!this.user) return 'Madison Smith';
    return `${this.user.firstName} ${this.user.lastName}`.trim() || 'Madison Smith';
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      fullName: [this.userFullName, Validators.required],
      email: [{ value: this.user?.email || 'madisons@example.com', disabled: true }],
      petName: [this.pet.name || '']
    });
  }

  goBack(): void {
    this.location.back();
  }

  onEditAvatar(): void {
    // TODO: Implement avatar edit
    console.log('Edit avatar');
  }

  addPet(): void {
    this.router.navigate(['/onboarding/pet']);
  }

  async saveProfile(): Promise<void> {
    if (this.userForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.successMessage = '';

    try {
      // TODO: Call API to update profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.successMessage = 'Profilo aggiornato con successo!';
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
