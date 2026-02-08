---
# Fiutami Breed Content Template
# Copy this file and rename to [breed-slug].md

id: "breed-slug"                    # URL-friendly identifier
name: "Nome Razza"                  # Display name
name_en: "Breed Name"               # English name (for i18n)
species: "cane"                     # cane | gatto | coniglio | etc.
category: "mammiferi"               # mammiferi | uccelli | rettili | pesci | invertebrati
lang: "it"                          # Content language

# Classification (optional, depends on species)
fci_group: null                     # FCI group number for dogs (1-10)
fci_section: null                   # FCI section
wcf_category: null                  # WCF category for cats
tica_code: null                     # TICA breed code

# Physical characteristics
origin: ""                          # Country/region of origin
lifespan: ""                        # e.g., "10-12 anni"
size: ""                            # piccolo | medio | grande | gigante
weight_min: null                    # kg
weight_max: null                    # kg
height_min: null                    # cm (at withers for dogs)
height_max: null                    # cm
coat_type: ""                       # corto | medio | lungo | riccio | senza pelo
coat_colors: []                     # Array of colors

# Characteristics (1-5 scale)
energy_level: 3
trainability: 3
friendliness: 3
grooming_needs: 3
health_score: 3

# Tags for search
tags: []

# Media
image: ""                           # Primary image path
gallery: []                         # Additional images

# Status
status: "draft"                     # draft | review | published
needs_review: true
last_updated: ""
---

# {{name}}

## Descrizione
_Descrizione fisica e generale della razza._

## Comportamento
_Temperamento, carattere, comportamento tipico._

## Problemi Genetici
_Patologie ereditarie e predisposizioni genetiche._

## Cure
_Necessita di toelettatura, esercizio, alimentazione._

## Pro
_Punti di forza della razza._

## Contro
_Aspetti da considerare, potenziali svantaggi._

---

## Informazioni Aggiuntive

### Storia
_Origini e storia della razza._

### Standard di Razza
_Link o riferimenti agli standard ufficiali._

### Curiosita
_Fatti interessanti sulla razza._
