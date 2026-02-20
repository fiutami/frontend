import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ContactService, ContactFormData, ContactFormResponse } from '../../../core/services/contact.service';

// Shell Blue (sfondo blu solido, include: Avatar, Logo, MascotPeek, BottomTabBar)
import { TabPageShellBlueComponent } from '../../../shared/components/tab-page-shell-blue/tab-page-shell-blue.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    TabPageShellBlueComponent,
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent implements OnInit {
  private location = inject(Location);
  private contactService = inject(ContactService);
  private fb = inject(FormBuilder);
  private translate = inject(TranslateService);

  /** Translated page title */
  protected pageTitle = this.translate.instant('drawerContact.title');

  // Form
  contactForm!: FormGroup;
  subjectOptions: string[] = [];

  // State signals
  isSubmitting = signal(false);
  isSuccess = signal(false);
  hasError = signal(false);
  errorMessage = signal('');
  successResponse = signal<ContactFormResponse | null>(null);

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.pageTitle = this.translate.instant('drawerContact.title');
    });
  }

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
        this.errorMessage.set(
          error.message || this.translate.instant('drawerContact.errorDefault')
        );
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
        return this.translate.instant('drawerContact.errorRequired');
      }
      if (control.errors['email']) {
        return this.translate.instant('drawerContact.errorEmail');
      }
      if (control.errors['minlength']) {
        const minLength = control.errors['minlength'].requiredLength;
        return this.translate.instant('drawerContact.errorMinLength', { min: minLength });
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.contactForm.get(fieldName);
    return !!(control?.touched && control.invalid);
  }
}
