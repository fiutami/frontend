import { Component, inject, ChangeDetectionStrategy, signal, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CmsService } from 'src/app/core/services/cms.service';
import { CmsSection } from 'src/app/core/models/cms.models';

// Shell Blue (sfondo blu solido, include: Avatar, Logo, MascotPeek, BottomTabBar)
import { TabPageShellBlueComponent } from '../../../shared/components/tab-page-shell-blue/tab-page-shell-blue.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, TranslateModule, TabPageShellBlueComponent],
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyComponent implements OnInit, AfterViewInit {
  private location = inject(Location);
  private cmsService = inject(CmsService);
  private translate = inject(TranslateService);

  @ViewChildren('sectionEl') sectionElements!: QueryList<ElementRef>;

  pageTitle = this.translate.instant('drawer.privacy');
  title = 'Privacy Policy';
  lastUpdated = 'Dicembre 2025';

  // Active section for navigation
  activeSection = signal('');
  isLoading = signal(true);

  // Privacy sections (starts with hardcoded fallback, replaced by CMS if available)
  sections: CmsSection[] = [
    {
      id: 'intro',
      title: '1. Introduzione',
      content: `La tua privacy è importante per noi. Questa Informativa sulla Privacy spiega come FiutaMi
        raccoglie, utilizza, condivide e protegge i tuoi dati personali quando utilizzi la nostra applicazione.
        Ti invitiamo a leggere attentamente questo documento per comprendere le nostre pratiche relative ai tuoi dati.`
    },
    {
      id: 'data-collected',
      title: '2. Dati che Raccogliamo',
      content: 'Raccogliamo le seguenti tipologie di dati:',
      bullets: [
        'Informazioni di registrazione (nome, email, password)',
        'Informazioni sui tuoi animali domestici (nome, specie, razza, età, foto)',
        'Dati di utilizzo dell\'app (funzionalità utilizzate, tempi di utilizzo)',
        'Informazioni del dispositivo (modello, sistema operativo, identificatori)',
        'Dati di geolocalizzazione (solo con il tuo consenso esplicito)',
        'Log tecnici e informazioni di debug'
      ]
    },
    {
      id: 'data-usage',
      title: '3. Come Utilizziamo i Tuoi Dati',
      content: 'Utilizziamo i tuoi dati per:',
      bullets: [
        'Fornire e migliorare i nostri servizi',
        'Personalizzare la tua esperienza nell\'app',
        'Comunicare con te riguardo aggiornamenti e novità',
        'Garantire la sicurezza del servizio e prevenire frodi',
        'Rispettare gli obblighi legali applicabili',
        'Analizzare l\'utilizzo dell\'app per miglioramenti futuri'
      ]
    },
    {
      id: 'data-sharing',
      title: '4. Condivisione dei Dati',
      content: `Non vendiamo i tuoi dati personali a terzi. Possiamo condividere i dati solo nei seguenti casi:`,
      bullets: [
        'Con il tuo consenso esplicito',
        'Con fornitori di servizi fidati che ci aiutano a gestire l\'app',
        'Per rispettare obblighi legali o richieste delle autorità',
        'Per proteggere i diritti, la sicurezza e la proprietà di FiutaMi',
        'In caso di fusione, acquisizione o vendita di asset (con preavviso)'
      ]
    },
    {
      id: 'data-security',
      title: '5. Sicurezza dei Dati',
      content: `Implementiamo misure di sicurezza tecniche e organizzative per proteggere i tuoi dati personali
        da accessi non autorizzati, perdita, alterazione o distruzione. Utilizziamo crittografia SSL/TLS per la trasmissione
        dei dati e conserviamo le informazioni su server protetti. Tuttavia, nessun sistema è completamente sicuro,
        e non possiamo garantire la sicurezza assoluta dei tuoi dati.`
    },
    {
      id: 'your-rights',
      title: '6. I Tuoi Diritti',
      content: 'In conformità con il GDPR e altre normative applicabili, hai diritto di:',
      bullets: [
        'Accedere ai tuoi dati personali in nostro possesso',
        'Correggere dati inesatti o incompleti',
        'Richiedere la cancellazione dei tuoi dati (diritto all\'oblio)',
        'Opporti al trattamento dei tuoi dati per finalità specifiche',
        'Richiedere la portabilità dei dati in formato leggibile',
        'Revocare il consenso in qualsiasi momento'
      ]
    },
    {
      id: 'cookies',
      title: '7. Cookie e Tecnologie Simili',
      content: `Utilizziamo cookie e tecnologie simili per migliorare la tua esperienza, analizzare l'utilizzo dell'app
        e personalizzare i contenuti. Puoi gestire le preferenze sui cookie dalle impostazioni del tuo browser.
        Alcuni cookie sono essenziali per il funzionamento dell'app e non possono essere disattivati.`
    },
    {
      id: 'data-retention',
      title: '8. Conservazione dei Dati',
      content: `Conserviamo i tuoi dati personali per il tempo necessario a fornire i servizi richiesti e per adempiere
        agli obblighi legali. Quando non avrai più un account attivo, conserveremo alcuni dati per un periodo limitato
        per scopi di backup, prevenzione frodi e conformità legale. Puoi richiedere la cancellazione dei tuoi dati
        in qualsiasi momento contattandoci.`
    },
    {
      id: 'changes',
      title: '9. Modifiche a Questa Informativa',
      content: `Potremmo aggiornare questa Informativa sulla Privacy periodicamente per riflettere cambiamenti
        nelle nostre pratiche o per altri motivi operativi, legali o regolamentari. Ti notificheremo eventuali
        modifiche significative via email o tramite notifica in-app. Ti consigliamo di consultare regolarmente
        questa pagina per essere informato sulle nostre pratiche in materia di privacy.`
    },
    {
      id: 'contact',
      title: '10. Contatti',
      content: `Per domande su questa informativa, per esercitare i tuoi diritti sulla privacy,
        o per qualsiasi altra richiesta relativa ai tuoi dati personali, contattaci tramite
        la sezione "Contattaci" dell'app o all'indirizzo email: privacy@fiutami.it.
        Risponderemo alle tue richieste entro 30 giorni come previsto dalla normativa.`
    }
  ];

  private readonly fallbackSections = [...this.sections];

  ngOnInit(): void {
    this.cmsService.getPage('privacy').subscribe(page => {
      if (page) {
        const parsed = this.cmsService.parseSections(page);
        if (parsed.length > 0) {
          this.sections = parsed;
          this.title = page.title || this.title;
          const d = new Date(page.lastUpdated);
          if (!isNaN(d.getTime())) {
            this.lastUpdated = d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
          }
        }
      }
      this.isLoading.set(false);
      if (this.sections.length > 0) {
        this.activeSection.set(this.sections[0].id);
      }
    });
  }

  ngAfterViewInit(): void {
    // activeSection is set in ngOnInit after CMS load
  }

  goBack(): void {
    this.location.back();
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeSection.set(sectionId);
    }
  }
}
