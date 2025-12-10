import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface EventType {
  id: string;
  label: string;
  color: string;
}

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventCreateComponent {
  @Output() eventCreated = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  // Form state
  title = signal('');
  selectedDate = signal(this.getTodayDateString());
  selectedTime = signal('10:00');
  selectedType = signal<string>('appointment');

  // Event types
  eventTypes: EventType[] = [
    { id: 'appointment', label: 'Appuntamento', color: '#4A74F0' },
    { id: 'reminder', label: 'Promemoria', color: '#F5A623' },
    { id: 'activity', label: 'Attività', color: '#43A047' },
  ];

  private getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    const titleValue = this.title();
    const dateValue = this.selectedDate();
    const timeValue = this.selectedTime();
    const typeValue = this.selectedType();

    // Validate
    if (!titleValue || !dateValue || !timeValue) {
      return;
    }

    // Combine date and time
    const [year, month, day] = dateValue.split('-').map(Number);
    const [hours, minutes] = timeValue.split(':').map(Number);
    const eventDate = new Date(year, month - 1, day, hours, minutes);

    // Find selected type
    const eventType = this.eventTypes.find(t => t.id === typeValue);

    // Emit event
    this.eventCreated.emit({
      title: titleValue,
      date: eventDate,
      type: typeValue,
      color: eventType?.color || '#4A74F0',
    });

    // Reset form
    this.resetForm();
  }

  onCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }

  selectType(typeId: string): void {
    this.selectedType.set(typeId);
  }

  private resetForm(): void {
    this.title.set('');
    this.selectedDate.set(this.getTodayDateString());
    this.selectedTime.set('10:00');
    this.selectedType.set('appointment');
  }

  // Prevent backdrop clicks from closing when clicking inside
  onModalContentClick(event: Event): void {
    event.stopPropagation();
  }
}
