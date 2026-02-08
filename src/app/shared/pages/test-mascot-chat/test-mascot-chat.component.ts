import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  ElementRef,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * Demo: Fiuto AI Mascot Chat
 * URL: /test/mascot-chat
 *
 * Simulates AI conversations with Fiuto mascot.
 * Works without backend using local response generation.
 */
@Component({
  selector: 'app-test-mascot-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-mascot-chat.component.html',
  styleUrls: ['./test-mascot-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestMascotChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesEl!: ElementRef<HTMLDivElement>;

  /** Chat state */
  messages = signal<ChatMessage[]>([]);
  inputText = signal('');
  isTyping = signal(false);
  isChatOpen = signal(false);
  hasUnread = signal(false);

  /** Mascot state */
  mascotExpanded = signal(false);

  /** Quick suggestions */
  suggestions = [
    { icon: '🐕', text: 'Che cane mi consigli?' },
    { icon: '🐱', text: 'Meglio un gatto o un cane?' },
    { icon: '🏠', text: 'Vivo in appartamento, che animale?' },
    { icon: '👶', text: 'Ho bambini piccoli, quale razza?' },
  ];

  private shouldScroll = false;

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  openChat(): void {
    this.isChatOpen.set(true);
    this.hasUnread.set(false);
    this.mascotExpanded.set(false);

    if (this.messages().length === 0) {
      this.addAssistantMessage(
        'Ciao! Sono Fiuto 🐕 il tuo assistente per trovare l\'animale perfetto per te! Chiedimi quello che vuoi su razze, compatibilità, cura e molto altro.'
      );
    }
  }

  closeChat(): void {
    this.isChatOpen.set(false);
  }

  toggleMascot(): void {
    if (this.isChatOpen()) {
      return;
    }
    this.mascotExpanded.update(v => !v);
  }

  async sendMessage(text?: string): Promise<void> {
    const msg = (text || this.inputText()).trim();
    if (!msg || this.isTyping()) return;

    this.inputText.set('');

    // Add user message
    this.messages.update(msgs => [...msgs, {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: msg,
      timestamp: Date.now(),
    }]);
    this.shouldScroll = true;

    // Simulate AI thinking
    this.isTyping.set(true);

    const delay = 800 + Math.random() * 1200;
    await new Promise(r => setTimeout(r, delay));

    // Generate response
    const response = this.generateResponse(msg);
    this.addAssistantMessage(response);
    this.isTyping.set(false);
  }

  sendQuick(suggestion: { icon: string; text: string }): void {
    this.sendMessage(suggestion.text);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private addAssistantMessage(content: string): void {
    this.messages.update(msgs => [...msgs, {
      id: crypto.randomUUID(),
      role: 'assistant' as const,
      content,
      timestamp: Date.now(),
    }]);
    this.shouldScroll = true;

    if (!this.isChatOpen()) {
      this.hasUnread.set(true);
    }
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesEl?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  /**
   * Local AI response generator - simulates Fiuto's personality.
   * Pattern-matches user input to give contextual responses.
   */
  private generateResponse(input: string): string {
    const lower = input.toLowerCase();

    // Greetings
    if (lower.match(/^(ciao|hey|salve|buon|hello|hi)\b/)) {
      return this.pick([
        'Ciao! 🐾 Come posso aiutarti oggi? Stai cercando un nuovo amico peloso?',
        'Woof! 🐕 Benvenuto! Raccontami cosa cerchi e ti aiuterò a trovare il compagno ideale!',
        'Ehi ciao! 👋 Sono Fiuto, esperto in animali domestici. Dimmi tutto!',
      ]);
    }

    // Dog recommendations
    if (lower.match(/cane|cani|dog/)) {
      if (lower.match(/piccol|mini|toy|apartment/)) {
        return '🐕 Per un cane piccolo da appartamento ti consiglio:\n\n' +
          '• **Cavalier King Charles Spaniel** - Dolcissimo, tranquillo, perfetto per famiglie\n' +
          '• **Maltese** - Poco pelo perso, affettuoso, ideale per spazi piccoli\n' +
          '• **Carlino** - Simpaticissimo, poco esercizio, ama la compagnia\n\n' +
          'Vuoi saperne di più su una di queste razze? 🐾';
      }
      if (lower.match(/grand|gross|big|larg/)) {
        return '🐕 Se hai spazio per un cane grande, eccoti alcune razze fantastiche:\n\n' +
          '• **Labrador Retriever** - Il più amato! Docile, intelligente, ottimo con bambini\n' +
          '• **Golden Retriever** - Gentile, paziente, si addestra facilmente\n' +
          '• **Pastore Tedesco** - Leale, protettivo, molto intelligente\n\n' +
          'Hai un giardino o fai molta attività all\'aperto? 🏡';
      }
      if (lower.match(/consig|raccomand|sugger|quale/)) {
        return 'Per consigliarti il cane giusto, dimmi qualcosa su di te! 🤔\n\n' +
          '• Vivi in appartamento o casa con giardino?\n' +
          '• Quanto tempo puoi dedicare alle passeggiate?\n' +
          '• Hai bambini o altri animali?\n' +
          '• Preferisci un cane attivo o tranquillo?\n\n' +
          'Più mi dici, meglio ti consiglio! 🐾';
      }
      return 'Adoro i cani! 🐕 Sono animali fantastici. Ci sono oltre 300 razze riconosciute, ' +
        'ognuna con caratteristiche uniche. Stai cercando un cane per la famiglia, per compagnia, ' +
        'o per attività sportive? Dimmi di più e ti guido nella scelta! 🐾';
    }

    // Cat recommendations
    if (lower.match(/gatt|cat|micio|felin/)) {
      if (lower.match(/consig|quale|meglio|raccomand/)) {
        return '🐱 Ecco alcune razze di gatto molto amate:\n\n' +
          '• **Ragdoll** - Docilissimo, ama stare in braccio, ideale per famiglie\n' +
          '• **British Shorthair** - Indipendente ma affettuoso, facile da gestire\n' +
          '• **Maine Coon** - Il gigante gentile! Socievole e giocherellone\n' +
          '• **Certosino** - Tranquillo, silenzioso, il gatto perfetto da appartamento\n\n' +
          'Preferisci un gatto coccolone o più indipendente? 😺';
      }
      return '😺 I gatti sono compagni meravigliosi! Indipendenti ma affettuosi a modo loro. ' +
        'Sono perfetti per chi vive in appartamento. Vuoi un gatto tranquillo o uno giocherellone? ' +
        'Con pelo lungo o corto? Dimmi le tue preferenze! 🐱';
    }

    // Apartment living
    if (lower.match(/appartament|casa piccol|spazio|indoor/)) {
      return '🏠 Vivere in appartamento non è un limite! Ecco i migliori animali:\n\n' +
        '**Cani:**\n' +
        '• Cavalier King Charles, Maltese, Carlino, Shih Tzu\n\n' +
        '**Gatti** (quasi tutti vanno bene!):\n' +
        '• Ragdoll, British Shorthair, Certosino, Persiano\n\n' +
        '**Piccoli animali:**\n' +
        '• Coniglio nano, Criceto, Porcellino d\'India\n\n' +
        'L\'importante è dedicare tempo e amore! ❤️ Quale ti incuriosisce?';
    }

    // Children
    if (lower.match(/bambin|figli|piccol|kid|child|famiglia/)) {
      return '👶 Per le famiglie con bambini, la sicurezza viene prima! Ecco le razze più adatte:\n\n' +
        '**Cani top per bambini:**\n' +
        '• **Golden Retriever** - Pazienza infinita, dolcissimo ⭐\n' +
        '• **Labrador** - Giocherellone e protettivo\n' +
        '• **Beagle** - Energico, resistente, sempre allegro\n' +
        '• **Cavalier King** - Gentile anche con i più piccoli\n\n' +
        '**Gatti top per bambini:**\n' +
        '• **Ragdoll** - Si lascia coccolare senza reagire\n' +
        '• **Maine Coon** - Paziente e socievole\n\n' +
        'Che età hanno i tuoi bimbi? 🐾';
    }

    // Comparison cat vs dog
    if (lower.match(/gatto.*cane|cane.*gatto|meglio|differ|vs|versus/)) {
      return '🐕 vs 🐱 La grande domanda! Ecco un confronto:\n\n' +
        '**Cane:**\n' +
        '✅ Fedele, socievole, ti esce con lui\n' +
        '❌ Più impegno (passeggiate, addestramento)\n\n' +
        '**Gatto:**\n' +
        '✅ Indipendente, meno manutenzione, ok da solo\n' +
        '❌ Meno interattivo, può graffiare mobili\n\n' +
        '**Dipende dal tuo stile di vita:**\n' +
        '• Sei spesso fuori casa? → Gatto 🐱\n' +
        '• Ami le attività all\'aperto? → Cane 🐕\n' +
        '• Hai poco spazio? → Gatto 🐱\n' +
        '• Vuoi un compagno di avventure? → Cane 🐕\n\n' +
        'Tu come vivi? Ti aiuto a scegliere! 💡';
    }

    // Thanks
    if (lower.match(/grazi|thank|perfett|ottim|great|brav/)) {
      return this.pick([
        'Di niente! 🐾 Sono qui per questo! Se hai altre domande, non esitare a chiedere!',
        'Woof! 🐕 Felice di aiutarti! Ricorda, qualsiasi animale tu scelga, l\'amore è la cosa più importante! ❤️',
        'Grazie a te! 🐾 Se vuoi fare il nostro questionario completo, posso aiutarti a trovare il match perfetto! 🎯',
      ]);
    }

    // Allergies
    if (lower.match(/allerg|pelo|ipoa|senza pelo/)) {
      return '🤧 Se hai problemi di allergie, ci sono ottime opzioni!\n\n' +
        '**Cani ipoallergenici:**\n' +
        '• **Barboncino** - Pelo riccio che non cade\n' +
        '• **Bichon Frisé** - Minima perdita di pelo\n' +
        '• **Schnauzer** - Pelo duro, poca forfora\n\n' +
        '**Gatti ipoallergenici:**\n' +
        '• **Siberiano** - Produce meno proteina Fel d1\n' +
        '• **Sphynx** - Senza pelo (ma richiede cure speciali)\n\n' +
        'Nessun animale è 100% ipoallergenico, ma queste razze sono le migliori! 💪';
    }

    // Cost / budget
    if (lower.match(/cost|spesa|budget|prez|quanto|econom/)) {
      return '💰 Ottima domanda! I costi variano molto:\n\n' +
        '**Cane medio:** €80-150/mese\n' +
        '(cibo, veterinario, accessori)\n\n' +
        '**Gatto medio:** €50-100/mese\n' +
        '(cibo, lettiera, veterinario)\n\n' +
        '**Piccoli animali:** €20-50/mese\n' +
        '(cibo, substrato, visite)\n\n' +
        '⚠️ Ricorda i costi iniziali: vaccinazioni, sterilizzazione, microchip, primo kit.\n\n' +
        'Vuoi che ti consiglio razze più economiche da mantenere? 🐾';
    }

    // Catch-all
    return this.pick([
      'Interessante! 🤔 Dimmi di più sul tuo stile di vita e ti consiglierò l\'animale perfetto. ' +
        'Dove vivi? Quanto tempo hai? Hai esperienza con animali?',
      'Bella domanda! 🐾 Per darti il miglior consiglio, ho bisogno di sapere qualcosa in più. ' +
        'Prova a chiedermi di una razza specifica o dimmi cosa cerchi in un animale domestico!',
      'Hmm, lasciami pensare... 🐕 Posso aiutarti con:\n' +
        '• Consigli su razze specifiche\n' +
        '• Compatibilità con il tuo stile di vita\n' +
        '• Costi e manutenzione\n' +
        '• Razze adatte a bambini o allergie\n\n' +
        'Di cosa vuoi parlare? 💬',
    ]);
  }

  /** Simple markdown-like formatting */
  formatMessage(content: string): string {
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  private pick(options: string[]): string {
    return options[Math.floor(Math.random() * options.length)];
  }
}
