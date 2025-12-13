import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ContactService, ContactFormData, ContactFormResponse } from '../../../core/services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent implements OnInit {
  private location = inject(Location);
  private contactService = inject(ContactService);
  private fb = inject(FormBuilder);

  title = 'Contattaci';

  // Form
  contactForm!: FormGroup;
  subjectOptions: string[] = [];

  // State signals
  isSubmitting = signal(false);
  isSuccess = signal(false);
  hasError = signal(false);
  errorMessage = signal('');
  successResponse = signal<ContactFormResponse | null>(null);


  ngOnInit(): void {
    this.subjectOptions = this.contactService.getSubjectOptions();
    this.initForm();
  }

  private initForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');

    const formData: ContactFormData = this.contactForm.value;

    this.contactService.submitContactForm(formData).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.isSuccess.set(true);
        this.successResponse.set(response);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.hasError.set(true);
        this.errorMessage.set(error.message || 'Si è verificato un errore. Riprova più tardi.');
      }
    });
  }

  resetForm(): void {
    this.contactForm.reset();
    this.isSuccess.set(false);
    this.successResponse.set(null);
    this.hasError.set(false);
    this.errorMessage.set('');
  }

  // Form field helpers
  getFieldError(fieldName: string): string {
    const control = this.contactForm.get(fieldName);
    if (control?.touched && control.errors) {
      if (control.errors['required']) {
        return 'Campo obbligatorio';
      }
      if (control.errors['email']) {
        return 'Email non valida';
      }
      if (control.errors['minlength']) {
        const minLength = control.errors['minlength'].requiredLength;
        return `Minimo ${minLength} caratteri`;
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.contactForm.get(fieldName);
    return !!(control?.touched && control.invalid);
  }
}
