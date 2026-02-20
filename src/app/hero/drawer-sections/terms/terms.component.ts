import { Component, inject, ChangeDetectionStrategy, signal, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CmsService } from 'src/app/core/services/cms.service';
import { CmsSection } from 'src/app/core/models/cms.models';

// Shell Drawer (sfondo blu solido, solo header + back, niente avatar/logo/mascot/tab bar)
import { TabPageShellDrawerComponent } from '../../../shared/components/tab-page-shell-drawer';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, TranslateModule, TabPageShellDrawerComponent],
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsComponent implements OnInit, AfterViewInit, OnDestroy {
  private location = inject(Location);
  private cmsService = inject(CmsService);
  private translate = inject(TranslateService);

  @ViewChildren('sectionEl') sectionElements!: QueryList<ElementRef>;

  /** Translated page title */
  protected pageTitle = this.translate.instant('drawer.terms');

  title = 'Termini di Servizio';
  lastUpdated = 'Dicembre 2025';

  // Active section for navigation
  activeSection = signal('');
  isLoading = signal(true);

  private observer?: IntersectionObserver;

  // Terms sections (starts with hardcoded fallback, replaced by CMS if available)
  sections: CmsSection[] = [
    {
      id: 'acceptance',
      title: '1. Accettazione dei Termini',
      content: `Utilizzando FiutaMi, accetti integralmente i presenti Termini e Condizioni d'Uso.
        Se non accetti questi termini, ti preghiamo di non utilizzare il servizio.
        L'utilizzo continuato dell'applicazione costituisce accettazione di eventuali modifiche ai termini.`
    },
    {
      id: 'service',
      title: '2. Descrizione del Servizio',
      content: `FiutaMi è una piattaforma dedicata alla gestione e cura degli animali domestici.
        Il servizio offre funzionalità per tracciare informazioni sui tuoi pet, connetterti con altri proprietari,
        accedere a risorse utili e trovare servizi nelle vicinanze. L'applicazione è disponibile per dispositivi mobili
        e può essere utilizzata previa registrazione gratuita.`
    },
    {
      id: 'account',
      title: '3. Registrazione e Account',
      content: `Per utilizzare determinate funzionalità del servizio, è necessario creare un account.
        Sei responsabile della sicurezza del tuo account e di tutte le attività che si verificano sotto il tuo account.
        Devi fornire informazioni accurate e mantenerle aggiornate. FiutaMi si riserva il diritto di sospendere
        o terminare account che violino questi termini.`
    },
    {
      id: 'privacy',
      title: '4. Privacy e Dati Personali',
      content: `La tua privacy è importante per noi. Consulta la nostra Informativa sulla Privacy per comprendere
        come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali. Utilizzando il servizio,
        acconsenti al trattamento dei tuoi dati come descritto nell'Informativa sulla Privacy.`
    },
    {
      id: 'content',
      title: '5. Contenuti Generati dagli Utenti',
      content: `Sei responsabile dei contenuti che pubblichi su FiutaMi. Non devi pubblicare contenuti illegali,
        offensivi, diffamatori, o che violano i diritti di terzi. FiutaMi si riserva il diritto di rimuovere
        qualsiasi contenuto che violi questi termini senza preavviso. Concedi a FiutaMi una licenza non esclusiva
        per utilizzare i contenuti che pubblichi ai fini del funzionamento del servizio.`
    },
    {
      id: 'liability',
      title: '6. Limitazioni di Responsabilità',
      content: `FiutaMi viene fornito "così com'è" senza garanzie di alcun tipo, esplicite o implicite.
        Non siamo responsabili per eventuali danni diretti, indiretti, incidentali o consequenziali derivanti
        dall'uso del servizio. Non garantiamo l'accuratezza delle informazioni fornite da altri utenti
        o da fonti terze presenti nell'applicazione.`
    },
    {
      id: 'modifications',
      title: '7. Modifiche ai Termini',
      content: `Ci riserviamo il diritto di modificare questi termini in qualsiasi momento.
        Le modifiche saranno effettive immediatamente dopo la pubblicazione nell'applicazione.
        Ti notificheremo eventuali modifiche significative via email o tramite notifica in-app.
        L'uso continuato del servizio dopo le modifiche costituisce accettazione dei nuovi termini.`
    },
    {
      id: 'termination',
      title: '8. Cessazione del Servizio',
      content: `Puoi interrompere l'utilizzo del servizio e cancellare il tuo account in qualsiasi momento.
        FiutaMi può sospendere o terminare il tuo accesso al servizio per violazioni dei presenti termini
        o per qualsiasi altro motivo a nostra discrezione. In caso di cessazione, alcune informazioni
        potrebbero essere conservate come richiesto dalla legge.`
    },
    {
      id: 'contact',
      title: '9. Contatti',
      content: `Per domande su questi termini o per segnalazioni, contattaci attraverso la sezione
        "Contattaci" dell'app o all'indirizzo email: support@fiutami.it.
        Risponderemo alle tue richieste nel più breve tempo possibile.`
    }
  ];

  private readonly fallbackSections = [...this.sections];

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.pageTitle = this.translate.instant('drawer.terms');
    });
  }

  ngOnInit(): void {
    this.cmsService.getPage('terms').subscribe(page => {
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
    // Observer will be set up once sections load via sectionElements changes
    this.sectionElements.changes.subscribe(() => {
      this.setupScrollObserver();
    });
    // Also try immediately in case sections are already rendered
    if (this.sectionElements.length > 0) {
      this.setupScrollObserver();
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private setupScrollObserver(): void {
    this.observer?.disconnect();

    const options: IntersectionObserverInit = {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.activeSection.set(entry.target.id);
        }
      }
    }, options);

    this.sectionElements.forEach((elRef) => {
      this.observer!.observe(elRef.nativeElement);
    });
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
