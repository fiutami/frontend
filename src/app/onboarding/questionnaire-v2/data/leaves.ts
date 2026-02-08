/**
 * Leaves (Terminal Nodes) for Questionnaire v1.1
 *
 * Leaves are endpoints in the flow where the questionnaire ends
 * and the user sees a result or gets redirected.
 *
 * @version 1.1
 */

import { Leaf, LeavesMap } from '../models/question.models';

// ============================================================================
// Leaf Definitions
// ============================================================================

export const LEAVES: Leaf[] = [
  {
    id: 'FINAL_RECOMMENDATION',
    type: 'recommendation',
    component: 'FinalRecommendationComponent'
  },
  {
    id: 'REGISTER_REDIRECT',
    type: 'redirect',
    route: '/onboarding/register-pet'
  },
  {
    id: 'DOG_RECOMMENDATION',
    type: 'recommendation',
    component: 'DogRecommendationComponent'
  },
  {
    id: 'CAT_RECOMMENDATION',
    type: 'recommendation',
    component: 'CatRecommendationComponent'
  },
  {
    id: 'SMALL_MAMMAL_RECOMMENDATION',
    type: 'recommendation',
    component: 'SmallMammalRecommendationComponent'
  },
  {
    id: 'BIRD_RECOMMENDATION',
    type: 'recommendation',
    component: 'BirdRecommendationComponent'
  },
  {
    id: 'FISH_RECOMMENDATION',
    type: 'recommendation',
    component: 'FishRecommendationComponent'
  },
  {
    id: 'EXOTIC_RECOMMENDATION',
    type: 'recommendation',
    component: 'ExoticRecommendationComponent'
  },
  {
    id: 'NOT_READY',
    type: 'end',
    component: 'NotReadyComponent'
  },
  {
    id: 'NEEDS_MORE_INFO',
    type: 'end',
    component: 'NeedsMoreInfoComponent'
  }
];

// ============================================================================
// Exported Map
// ============================================================================

export const LEAVES_MAP: LeavesMap = LEAVES.reduce(
  (acc, leaf) => {
    acc[leaf.id] = leaf;
    return acc;
  },
  {} as LeavesMap
);
