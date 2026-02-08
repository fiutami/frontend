import { TabItem } from '../../shared/components/bottom-tab-bar';

/**
 * Configurazione UNICA della Tab Bar per tutte le pagine
 *
 * Background: BLU (#4A74F0)
 * Icone inattive: BIANCHE
 * Icone attive: ARANCIONI (#F5A623)
 *
 * Ordine: Home, Calendario, Mappa, Profilo Pet, Specie
 */
export const MAIN_TAB_BAR_CONFIG: TabItem[] = [
  {
    id: 'home',
    icon: 'home',
    iconSrc: 'assets/icons/nav/home.svg',
    activeIconSrc: 'assets/icons/nav/home-active.svg',
    route: '/home/main',
    label: 'Home'
  },
  {
    id: 'calendar',
    icon: 'calendar_today',
    iconSrc: 'assets/icons/nav/calendar.svg',
    activeIconSrc: 'assets/icons/nav/calendar-active.svg',
    route: '/home/calendar',
    label: 'Calendario'
  },
  {
    id: 'map',
    icon: 'place',
    iconSrc: 'assets/icons/nav/map.svg',
    activeIconSrc: 'assets/icons/nav/map-active.svg',
    route: '/home/map',
    label: 'Mappa'
  },
  {
    id: 'pet-profile',
    icon: 'pets',
    iconSrc: 'assets/icons/nav/paw.svg',
    activeIconSrc: 'assets/icons/nav/paw-active.svg',
    route: '/home/pet-profile',
    label: 'Profilo Pet'
  },
  {
    id: 'species',
    icon: 'public',
    iconSrc: 'assets/icons/nav/globe.svg',
    activeIconSrc: 'assets/icons/nav/globe-active.svg',
    route: '/home/species',
    label: 'Specie'
  }
];

/**
 * Restituisce l'ID della tab attiva basandosi sulla route corrente
 */
export function getActiveTabId(currentRoute: string): string {
  if (currentRoute.includes('/home/main')) return 'home';
  if (currentRoute.includes('/home/calendar')) return 'calendar';
  if (currentRoute.includes('/home/map')) return 'map';
  if (currentRoute.includes('/home/pet-profile')) return 'pet-profile';
  if (currentRoute.includes('/home/species')) return 'species';
  return 'home';
}
