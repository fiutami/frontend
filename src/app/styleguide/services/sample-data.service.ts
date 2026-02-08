import { Injectable } from '@angular/core';
import { RadioOption } from '../../shared/components/radio-button-group/radio-button-group.models';
import { CheckboxOption } from '../../shared/components/checkbox-group/checkbox-group.models';
import { PetInfoItem } from '../../shared/components/pet-info-card/pet-info-card.models';
import { TabItem } from '../../shared/components/bottom-tab-bar/bottom-tab-bar.models';
import { AnswerOption } from '../../shared/components/answer-square/answer-square.models';

@Injectable({
  providedIn: 'root'
})
export class SampleDataService {

  readonly radioOptions: RadioOption[] = [
    { value: 'option1', label: 'Opzione 1' },
    { value: 'option2', label: 'Opzione 2' },
    { value: 'option3', label: 'Opzione 3', description: 'Con descrizione aggiuntiva' }
  ];

  readonly checkboxOptions: CheckboxOption[] = [
    { value: 'dogs', label: 'Cani' },
    { value: 'cats', label: 'Gatti' },
    { value: 'birds', label: 'Uccelli' },
    { value: 'fish', label: 'Pesci' }
  ];

  readonly petInfoItems: PetInfoItem[] = [
    { label: 'SESSO', value: 'Maschio' },
    { label: 'ANNI', value: '3' },
    { label: 'PESO', value: '12kg' },
    { label: 'RAZZA', value: 'Golden Retriever' }
  ];

  readonly tabItems: TabItem[] = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'calendar', icon: 'calendar_today', label: 'Calendario' },
    { id: 'location', icon: 'place', label: 'Luoghi' },
    { id: 'pet', icon: 'pets', label: 'Pet' },
    { id: 'profile', icon: 'person', label: 'Profilo' }
  ];

  readonly answerOptions: AnswerOption[] = [
    { value: 'poco', label: 'Poco', icon: '1' },
    { value: 'medio', label: 'Medio', icon: '2' },
    { value: 'molto', label: 'Molto', icon: '3' },
    { value: 'tantissimo', label: 'Tantissimo', icon: '4' }
  ];

  readonly questionCardOptions = [
    { value: 'yes', label: 'Si' },
    { value: 'no', label: 'No' },
    { value: 'maybe', label: 'Forse' }
  ];
}
