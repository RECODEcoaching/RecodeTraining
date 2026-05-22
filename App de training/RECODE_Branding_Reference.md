# RECODE Coaching — Référence Branding Complète

> Document de référence pour toute création visuelle, page web, ou contenu de marque.
> Version 1.0 — @indianaafit

---

## Identité de marque

**Nom de marque :** RECODE Coaching  
**Coach :** Kevin — @indianaafit  
**Canal principal :** Instagram  
**Site / contact :** contact@coaching-indianaafit.fr

**Promesse :** Aider les femmes de 25 à 45 ans, pratiquantes de musculation de niveau intermédiaire, à dépasser la stagnation après leurs premiers résultats.

**Positionnement :** Vision globale — chaque facteur est adressé (nutrition, training, hormones, mindset, relation à l'alimentation). Fort accompagnement, communication et éducation.

**Ton éditorial :** Direct, scientifique, vulgarisé. Ironie légère. Tutoiement toujours. Phrases courtes. Jamais de fausse ultra-bienveillance ni de manque de nuance.

---

## Palette de couleurs

| Rôle | Nom | Code hex |
|------|-----|----------|
| Couleur signature — accent fort | Violet | `#7C3AED` |
| Fonds doux — tags — badges | Lavande | `#EDE9FE` |
| Texte sur fond violet | Lavande Mid | `#C4B5FD` |
| Fond principal | Blanc Apple | `#FAFAFA` |
| Fond secondaire — sections | Gris Apple | `#F5F5F7` |
| Texte principal — fond dark | Noir | `#1D1D1F` |
| Texte secondaire — légendes | Gris | `#6E6E73` |

### Règles couleurs

- Maximum **3 couleurs par visuel**. En cas de doute : noir + blanc + violet.
- Le violet `#7C3AED` est réservé aux **accents forts** : CTA, soulignements, ligne intro. Pas en fond de grands blocs.
- La lavande `#EDE9FE` s'utilise en **fonds légers** : tags, encadrés doux, sections nuancées.
- Jamais de texte clair sur fond clair. Jamais de texte saturé sur fond saturé.
- Sur fond dark `#1D1D1F` : texte blanc `#FFFFFF`, accents en `#C4B5FD`.

---

## Typographie

**Police unique : Open Sans**  
Google Fonts : `https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap`  
Disponible sur : Canva / Google Fonts / Adobe Fonts / Web

| Niveau | Usage | Poids | Taille | Particularités |
|--------|-------|-------|--------|----------------|
| H1 | Titre principal, hook | 800 ExtraBold | 48–64px | Letter-spacing : -0.03em · Line-height : 1.05 |
| H2 | Titre de section | 700 Bold | 28–36px | Letter-spacing : -0.02em · Line-height : 1.15 |
| H3 | Sous-titre | 700 Bold | 20–24px | Letter-spacing : -0.01em · Line-height : 1.3 |
| Body | Texte courant | 400 Regular | 15–17px | Letter-spacing : 0 · Line-height : 1.7 |
| Label | Eyebrow, catégories | 700 Bold | 10–12px | Uppercase · Letter-spacing : 0.12em |
| Citation | Quote impactante | 700 Bold Italic | 18–22px | Couleur violet ou noir |

### Règles typographie

- **Une seule police** : Open Sans. Toutes variations passent par le poids (400, 700, 800) et la taille.
- Jamais de police décorative ou script pour les textes courants.
- La hiérarchie H1 → H2 → Body est non négociable sur chaque visuel.

---

## Style graphique

### Formes & icônes
- Formes **géométriques** : angles droits, lignes fines. Cohérent avec le logo anatomique.
- Icônes style **outline uniquement** (jamais pleines/filled).
- **Border-radius** : 8–12px pour les cartes et composants. 6px pour les badges.
- Jamais d'arrondis excessifs — ni de formes organiques qui cassent l'identité scientifique.

### Éléments de signature visuelle
- **Ligne accent violette** (28px × 2–3px, `#7C3AED`) pour introduire un titre ou une section.
- **Point violet** (`#7C3AED`) comme bullet point dans les listes.
- **Tag/badge en lavande** avec point violet pour catégoriser le contenu.
- **Handle @indianaafit** visible sur chaque post.

### Mise en page
- Marges généreuses — le vide est intentionnel et stratégique.
- **1 message = 1 bloc = 1 slide.** Pas de surcharge.
- Alignement gauche en priorité. Centré uniquement pour les hooks courts.
- Respiration entre chaque bloc : minimum 24px.

---

## Composants réutilisables

### Badge / Tag
```html
<span style="display:inline-flex;align-items:center;gap:5px;background:#EDE9FE;border-radius:6px;padding:4px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#5C3ABE;">
  <span style="width:5px;height:5px;border-radius:50%;background:#7C3AED;"></span>
  Nutrition
</span>
```

### Bouton primaire
```html
<a href="#" style="display:inline-flex;align-items:center;gap:8px;background:#7C3AED;color:#fff;border-radius:8px;padding:10px 20px;font-size:14px;font-weight:700;font-family:'Open Sans',sans-serif;text-decoration:none;">
  Commencer mon coaching →
</a>
```

### Bouton secondaire
```html
<a href="#" style="display:inline-flex;align-items:center;gap:8px;background:#EDE9FE;color:#5C3ABE;border:1px solid rgba(124,58,237,0.2);border-radius:8px;padding:10px 20px;font-size:14px;font-weight:700;font-family:'Open Sans',sans-serif;text-decoration:none;">
  En savoir plus
</a>
```

### Ligne d'accent violette
```html
<div style="width:28px;height:3px;border-radius:2px;background:#7C3AED;margin-bottom:1rem;"></div>
```

### Card light (fond blanc)
```html
<div style="background:#fff;border:1px solid rgba(0,0,0,0.08);border-radius:14px;padding:1.5rem;">
  <div style="width:28px;height:3px;border-radius:2px;background:#7C3AED;margin-bottom:1rem;"></div>
  <p style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7C3AED;margin-bottom:8px;">Nutrition</p>
  <p style="font-size:20px;font-weight:800;letter-spacing:-0.02em;line-height:1.2;color:#1D1D1F;">Titre de la card.</p>
  <p style="font-size:13px;color:#6E6E73;margin-top:8px;line-height:1.6;">Description courte.</p>
</div>
```

### Card dark (fond noir)
```html
<div style="background:#1D1D1F;border-radius:14px;padding:1.5rem;">
  <div style="width:28px;height:3px;border-radius:2px;background:#7C3AED;margin-bottom:1rem;"></div>
  <p style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#C4B5FD;margin-bottom:8px;">RECODE Coaching</p>
  <p style="font-size:20px;font-weight:800;letter-spacing:-0.02em;line-height:1.2;color:#fff;">Tu stagnes pas par manque d'effort.</p>
  <p style="font-size:13px;color:#6E6E73;margin-top:8px;line-height:1.6;">Description courte.</p>
</div>
```

---

## Posts Instagram

### 3 styles à alterner sur le feed

**Style 1 — Dark Hook** (fort, accrocheur)
- Fond : `#1D1D1F`
- Ligne accent violette en haut à gauche
- Titre blanc, gros, percutant (hook direct)
- Handle `@indianaafit` en violet en bas

**Style 2 — Blanc Éducatif** (valeur, pédagogie)
- Fond : `#FAFAFA`
- Tag catégorie en lavande en haut
- Titre noir, questions ou promesse
- Handle `@indianaafit` en gris en bas

**Style 3 — Lavande Citation** (mindset, vérité)
- Fond : `#EDE9FE`
- Guillemet violet décoratif (grand, transparent)
- Citation en italique noir
- Handle `@indianaafit` en violet foncé en bas

### Structure carrousel éducatif
1. **Slide 1 (Hook)** — Question/affirmation choc. Max 8 mots. Fond dark ou blanc.
2. **Slides 2–5 (Contenu)** — 1 idée par slide. Tag catégorie. Texte court et aéré.
3. **Dernière slide (CTA)** — Message clair, isolé. Invitation à commenter / DM / swipe.

---

## Style photo & vidéo

### Mode Studio clair (contenus éducatifs face caméra)
- Fond neutre : blanc, gris clair, mur uni
- Lumière naturelle ou softbox frontale douce
- Plans buste ou serré
- Tenue sobre, pas de motifs qui parasitent
- Regard caméra, énergie directe

### Mode Performance / Lifestyle (training & terrain)
- Environnement authentique : salle de sport, extérieur
- Contraste plus marqué, ambiance dynamique
- Peut inclure plans d'action ou de mouvement
- Rester cohérent avec la palette RECODE (pas de filtres qui dénaturent les couleurs)

### À éviter absolument
- Filtres Instagram qui changent la colorimétrie
- Photos sous-exposées ou floues
- Trop de styles différents sur le même feed
- Surcharger une image de texte sur Canva

---

## Règles d'or — Checklist avant publication

**Consistance visuelle**
- [ ] Seulement les couleurs de la palette RECODE
- [ ] Open Sans uniquement, bons poids
- [ ] 3 couleurs max par visuel
- [ ] Formes géométriques cohérentes

**Clarté & lisibilité**
- [ ] 1 message = 1 slide ou 1 bloc
- [ ] Titre lisible en 1 seconde
- [ ] Contraste texte/fond correct
- [ ] @indianaafit visible

**Alignement marque**
- [ ] Ton direct, pas de fausse bienveillance
- [ ] Ça renforce l'identité RECODE ?
- [ ] Ça parle à la cible (femme 25–45 ans, musculation intermédiaire) ?
- [ ] Ça soutient la promesse (dépasser la stagnation) ?

---

## Offres

**RECODE Coaching** (12 mois — Premium)
- Suivi entraînement personnalisé
- Conseils nutrition, habitudes de vie, mindset
- Application coaching + ressources pédagogiques
- Canal WhatsApp dédié — réponse 24h
- Bilan hebdomadaire vidéo ou WhatsApp

**RECODE Coaching Starter** (12 mois)
- Même base de suivi
- Canal WhatsApp — réponse 48h
- Bilan toutes les 2 semaines

---

## Fichiers du dossier Branding

| Fichier | Contenu |
|---------|---------|
| `Logo.png` | Logo officiel RECODE Coaching |
| `RECODE_Design_System.html` | Design system visuel interactif complet |
| `RECODE_Branding_Reference.md` | Ce fichier — référence texte complète |
| `qui-je-suis.md` | Positionnement & cible |
| `mes-offres.md` | Détail des offres |
| `mon-style.md` | Style éditorial & références |

---

*RECODE Coaching — Design System v1.0*  
*@indianaafit · contact@coaching-indianaafit.fr*
