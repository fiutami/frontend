/**
 * Profile Icon Types
 * SVG icons for the pet profile page
 */

/** Circular blue icons (42x42) - quick actions */
export type CircularIconType = 'calendar' | 'notifications' | 'messages' | 'bookmark' | 'edit';

/** Golden CTA buttons with text - main actions */
export type CtaIconType = 'foto' | 'friends' | 'doc' | 'breed';

/** Info display boxes - pet data */
export type InfoIconType = 'age' | 'pet_age' | 'weight' | 'sex';

/** All profile icon types */
export type ProfileIconType = CircularIconType | CtaIconType | InfoIconType;

/** Variant determines the icon category and styling */
export type ProfileIconVariant = 'circular' | 'cta' | 'info';

/** Icon configuration */
export interface ProfileIconConfig {
  type: ProfileIconType;
  variant: ProfileIconVariant;
  ariaLabel: string;
}
