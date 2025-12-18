import { Injectable } from '@angular/core';
import { QuizAnswers } from '../quiz/quiz.models';

/**
 * Species match result
 */
export interface SpeciesMatch {
  id: string;
  name: string;
  icon: string;
  suggestedBreed: string;
  compatibility: number; // 0-100
  description: string;
}

/**
 * Normalized quiz answers for matching algorithm
 */
interface NormalizedAnswers {
  activityLevel: 'sedentary' | 'moderate' | 'active';
  livingArea: 'city' | 'suburbs' | 'countryside';
  hasOtherPets: boolean;
  homeType: 'apartment' | 'house' | 'house_garden';
  homeSize: 'small' | 'medium' | 'large';
  hasOutdoorSpace: boolean;
  availableHours: 'low' | 'medium' | 'high';
  travelsOften: boolean;
  experience: 'none' | 'little' | 'much';
}

/**
 * QuizMatchingService - Species matching algorithm
 *
 * Calculates compatibility scores for different pet species
 * based on user's quiz answers about lifestyle, space, and time.
 */
@Injectable({
  providedIn: 'root',
})
export class QuizMatchingService {
  /**
   * Calculate species matches from quiz answers
   */
  calculateMatches(answers: QuizAnswers): SpeciesMatch[] {
    const normalized = this.normalizeAnswers(answers);

    const matches: SpeciesMatch[] = [
      this.calculateDogScore(normalized),
      this.calculateCatScore(normalized),
      this.calculateRabbitScore(normalized),
      this.calculateBirdScore(normalized),
    ];

    // Sort by compatibility descending
    return matches.sort((a, b) => b.compatibility - a.compatibility);
  }

  /**
   * Get top match
   */
  getTopMatch(answers: QuizAnswers): SpeciesMatch {
    const matches = this.calculateMatches(answers);
    return matches[0];
  }

  /**
   * Normalize quiz answers to algorithm format
   */
  private normalizeAnswers(answers: QuizAnswers): NormalizedAnswers {
    return {
      // Phase 1
      activityLevel: this.mapActivity(answers.phase1.q1),
      livingArea: this.mapLocation(answers.phase1.q2),
      hasOtherPets: answers.phase1.q3 === 'yes',

      // Phase 2
      homeType: this.mapHousing(answers.phase2.q1),
      homeSize: this.mapSize(answers.phase2.q2),
      hasOutdoorSpace: answers.phase2.q3 === 'yes',

      // Phase 3
      availableHours: this.mapHours(answers.phase3.q1),
      travelsOften: answers.phase3.q2 === 'yes',
      experience: this.mapExperience(answers.phase3.q3),
    };
  }

  private mapActivity(value: string | null): 'sedentary' | 'moderate' | 'active' {
    switch (value) {
      case 'sedentary':
        return 'sedentary';
      case 'moderate':
        return 'moderate';
      case 'active':
        return 'active';
      default:
        return 'moderate';
    }
  }

  private mapLocation(value: string | null): 'city' | 'suburbs' | 'countryside' {
    switch (value) {
      case 'city':
        return 'city';
      case 'suburbs':
        return 'suburbs';
      case 'countryside':
        return 'countryside';
      default:
        return 'city';
    }
  }

  private mapHousing(value: string | null): 'apartment' | 'house' | 'house_garden' {
    switch (value) {
      case 'apartment':
        return 'apartment';
      case 'house':
        return 'house';
      case 'house_garden':
        return 'house_garden';
      default:
        return 'apartment';
    }
  }

  private mapSize(value: string | null): 'small' | 'medium' | 'large' {
    switch (value) {
      case 'small':
        return 'small';
      case 'medium':
        return 'medium';
      case 'large':
        return 'large';
      default:
        return 'medium';
    }
  }

  private mapHours(value: string | null): 'low' | 'medium' | 'high' {
    switch (value) {
      case 'few':
        return 'low';
      case 'some':
        return 'medium';
      case 'many':
        return 'high';
      default:
        return 'medium';
    }
  }

  private mapExperience(value: string | null): 'none' | 'little' | 'much' {
    switch (value) {
      case 'none':
        return 'none';
      case 'little':
        return 'little';
      case 'much':
        return 'much';
      default:
        return 'little';
    }
  }

  /**
   * Calculate dog compatibility score
   */
  private calculateDogScore(answers: NormalizedAnswers): SpeciesMatch {
    let score = 50; // Base score

    // Activity level
    if (answers.activityLevel === 'active') score += 30;
    else if (answers.activityLevel === 'moderate') score += 15;

    // Home type
    if (answers.homeType === 'house_garden') score += 20;
    else if (answers.homeType === 'house') score += 10;

    // Available hours
    if (answers.availableHours === 'high') score += 20;
    else if (answers.availableHours === 'medium') score += 10;

    // Outdoor space
    if (answers.hasOutdoorSpace) score += 10;

    // Travel penalty
    if (answers.travelsOften) score -= 20;

    // Living area bonus
    if (answers.livingArea === 'countryside') score += 10;

    return {
      id: 'dog',
      name: 'Cane',
      icon: '🐕',
      suggestedBreed: this.getSuggestedDogBreed(answers),
      compatibility: this.normalize(score),
      description:
        'Il cane e il miglior amico dell\'uomo. Fedele, affettuoso e sempre pronto a giocare. Richiede tempo e attenzioni quotidiane.',
    };
  }

  /**
   * Calculate cat compatibility score
   */
  private calculateCatScore(answers: NormalizedAnswers): SpeciesMatch {
    let score = 60; // Base score (cats are generally more adaptable)

    // Activity level
    if (answers.activityLevel === 'sedentary') score += 20;
    else if (answers.activityLevel === 'moderate') score += 15;

    // Home type
    if (answers.homeType === 'apartment') score += 20;

    // Available hours
    if (answers.availableHours === 'low') score += 15;
    else if (answers.availableHours === 'medium') score += 10;

    // Travel bonus (cats are more independent)
    if (answers.travelsOften) score += 10;

    // Size doesn't matter much for cats
    if (answers.homeSize === 'small') score += 5;

    return {
      id: 'cat',
      name: 'Gatto',
      icon: '🐱',
      suggestedBreed: this.getSuggestedCatBreed(answers),
      compatibility: this.normalize(score),
      description:
        'Il gatto e indipendente ma affettuoso. Perfetto per chi cerca compagnia senza troppi impegni. Si adatta bene agli appartamenti.',
    };
  }

  /**
   * Calculate rabbit compatibility score
   */
  private calculateRabbitScore(answers: NormalizedAnswers): SpeciesMatch {
    let score = 40; // Base score

    // Home size
    if (answers.homeSize !== 'small') score += 20;

    // Outdoor space
    if (answers.hasOutdoorSpace) score += 20;

    // Experience
    if (answers.experience === 'much') score += 15;
    else if (answers.experience === 'little') score += 10;

    // Other pets penalty (especially with dogs)
    if (answers.hasOtherPets) score -= 10;

    // Quiet environment
    if (answers.activityLevel === 'sedentary') score += 10;

    // Available time
    if (answers.availableHours !== 'low') score += 10;

    return {
      id: 'rabbit',
      name: 'Coniglio',
      icon: '🐰',
      suggestedBreed: 'Nano Olandese',
      compatibility: this.normalize(score),
      description:
        'Il coniglio e un animale dolce e silenzioso. Ideale per famiglie tranquille. Richiede spazio e cure specifiche.',
    };
  }

  /**
   * Calculate bird compatibility score
   */
  private calculateBirdScore(answers: NormalizedAnswers): SpeciesMatch {
    let score = 45; // Base score

    // Home type
    if (answers.homeType === 'apartment') score += 25;

    // Available hours (birds need less active time)
    if (answers.availableHours === 'low') score += 20;

    // Travel (easier to manage with birds)
    if (answers.travelsOften) score += 15;

    // Experience helps
    if (answers.experience !== 'none') score += 10;

    // City living
    if (answers.livingArea === 'city') score += 5;

    return {
      id: 'bird',
      name: 'Uccello',
      icon: '🐦',
      suggestedBreed: 'Canarino',
      compatibility: this.normalize(score),
      description:
        'Gli uccelli portano allegria con il loro canto. Richiedono poco spazio e sono perfetti per appartamenti.',
    };
  }

  /**
   * Get suggested dog breed based on lifestyle
   */
  private getSuggestedDogBreed(answers: NormalizedAnswers): string {
    if (answers.activityLevel === 'active' && answers.homeType === 'house_garden') {
      return 'Golden Retriever';
    }
    if (answers.homeType === 'apartment' && answers.homeSize === 'small') {
      return 'Bulldog Francese';
    }
    if (answers.activityLevel === 'active') {
      return 'Border Collie';
    }
    if (answers.experience === 'none') {
      return 'Labrador';
    }
    return 'Beagle';
  }

  /**
   * Get suggested cat breed based on lifestyle
   */
  private getSuggestedCatBreed(answers: NormalizedAnswers): string {
    if (answers.activityLevel === 'sedentary') {
      return 'Persiano';
    }
    if (answers.homeType === 'apartment' && answers.homeSize === 'small') {
      return 'Siamese';
    }
    if (answers.hasOtherPets) {
      return 'Ragdoll';
    }
    if (answers.experience === 'none') {
      return 'Europeo';
    }
    return 'Maine Coon';
  }

  /**
   * Normalize score to 0-100 range
   */
  private normalize(score: number): number {
    return Math.min(100, Math.max(0, Math.round(score)));
  }
}
