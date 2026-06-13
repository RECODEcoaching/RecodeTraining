-- ══════════════════════════════════════════════════════════════════
-- RECODE Training App — Schéma Supabase
-- Colle ce SQL dans Supabase > SQL Editor > New Query > Run
-- ══════════════════════════════════════════════════════════════════

-- 1. CLIENTS (créés par le coach)
CREATE TABLE public.clients (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email            TEXT UNIQUE NOT NULL,
  prenom           TEXT NOT NULL,
  pin_hash         TEXT NOT NULL,
  is_first_login   BOOLEAN DEFAULT TRUE,
  objectif         TEXT,
  bilan_frequence  TEXT DEFAULT 'semaine', -- semaine | deux_semaines | mois
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Si la table clients existe déjà, ajouter la colonne avec :
-- ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS bilan_frequence TEXT DEFAULT 'semaine';

-- 2. SÉANCES (planifiées par le coach, réalisées par la cliente)
CREATE TABLE public.seances (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id  UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  date       DATE NOT NULL,
  titre      TEXT NOT NULL,
  type       TEXT DEFAULT 'force',
  statut     TEXT DEFAULT 'planifie', -- planifie | en_cours | termine
  exercices  JSONB DEFAULT '[]'::jsonb,
  notes      TEXT,
  duree_min  INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PERFORMANCES (historique exercices)
CREATE TABLE public.perfs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id  UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  exercice   TEXT NOT NULL,
  date       DATE NOT NULL,
  sets       JSONB DEFAULT '[]'::jsonb, -- [{reps, poids, rpe, technique}]
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MÉTRIQUES CORPORELLES
CREATE TABLE public.metriques (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id  UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  type       TEXT NOT NULL, -- poids | tour_taille | tour_hanches | tour_cuisse | tour_bras
  valeur     NUMERIC(6,2) NOT NULL,
  unite      TEXT DEFAULT 'kg',
  date       DATE NOT NULL,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HABITUDES QUOTIDIENNES
CREATE TABLE public.habitudes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id  UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  date       DATE NOT NULL,
  sommeil    INTEGER CHECK (sommeil BETWEEN 1 AND 4),
  stress     INTEGER CHECK (stress BETWEEN 1 AND 4),
  marche     BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, date)
);

-- 6. CYCLE MENSTRUEL — logs quotidiens
CREATE TABLE public.cycle_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id   UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  date        DATE NOT NULL,
  temperature NUMERIC(4,2),
  glaire      TEXT, -- sec | cremeux | filant | aqueux
  regles      BOOLEAN DEFAULT FALSE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, date)
);

-- 7. CYCLE MENSTRUEL — configuration
CREATE TABLE public.cycle_config (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id       UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL UNIQUE,
  duree_cycle     INTEGER DEFAULT 28,
  duree_regles    INTEGER DEFAULT 5,
  derniere_regles DATE,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 14. BILAN LOGS (suivi des bilans effectués par la cliente)
CREATE TABLE public.bilan_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id  UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  date       DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (client_id, date)
);

-- 15. BILAN SCHEDULE (jours de bilan programmés par le coach)
CREATE TABLE public.bilan_schedule (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id  UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  date       DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (client_id, date)
);

-- Si les tables existent déjà (mise à jour d'un projet existant), exécuter uniquement :
-- CREATE TABLE public.bilan_schedule (
--   id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   client_id  UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
--   date       DATE NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   UNIQUE (client_id, date)
-- );
-- ALTER TABLE public.bilan_schedule ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "anon_all_bilan_schedule" ON public.bilan_schedule FOR ALL TO anon USING (true) WITH CHECK (true);

-- 16. MÉTRIQUES CLIENT — REPRÉSENTATION AUTO (2026-06-11)
-- La table public.client_metriques existe déjà (créée hors de ce fichier, colonnes :
-- id, client_id, nom, unite, icone, frequence, created_at). Pour activer le choix du
-- "type" de métrique côté coach (déterminant l'affichage côté cliente dans module3),
-- exécuter dans Supabase :
--
-- ALTER TABLE public.client_metriques
--   ADD COLUMN IF NOT EXISTS type    TEXT DEFAULT 'mesure',   -- mesure | score5 | objectif
--   ADD COLUMN IF NOT EXISTS cible   NUMERIC,                  -- valeur cible si type = 'objectif'
--   ADD COLUMN IF NOT EXISTS inverse BOOLEAN DEFAULT FALSE;    -- si type = 'score5' : 1 = excellent, 5 = préoccupant (ex: stress)

-- 17. HABITUDES — FRÉQUENCE + PROGRESSION (2026-06-11)
-- Les tables public.habitudes (bibliothèque, colonnes id/nom/type) et
-- public.client_habitudes (assignées, colonnes id/client_id/nom/type/created_at)
-- existent déjà (créées hors de ce fichier). Pour activer la fréquence définie par
-- le coach (ex: "1x/jour", "8x/jour" pour l'hydratation, "3x/semaine", "2x/mois")
-- et le calcul de % de respect / barre de progression côté cliente, exécuter dans Supabase :
--
-- ALTER TABLE public.habitudes
--   ADD COLUMN IF NOT EXISTS frequence_count INTEGER DEFAULT 1,    -- nombre de fois...
--   ADD COLUMN IF NOT EXISTS frequence_unite  TEXT    DEFAULT 'jour'; -- ...par jour | semaine | mois
--
-- ALTER TABLE public.client_habitudes
--   ADD COLUMN IF NOT EXISTS frequence_count INTEGER DEFAULT 1,
--   ADD COLUMN IF NOT EXISTS frequence_unite  TEXT    DEFAULT 'jour';

-- 18. ÉCHAUFFEMENT (encart dans une séance, exercices en texte libre) (2026-06-11)
-- Le coach peut ajouter, dans une séance, un encart "Échauffement" composé
-- d'exercices issus de la bibliothèque (vidéo incluse) mais SANS séries/reps/charge :
-- juste une consigne en texte libre, visible côté cliente. Exécuter dans Supabase :
--
CREATE TABLE IF NOT EXISTS public.seance_echauffement (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seance_id   UUID REFERENCES public.seances(id) ON DELETE CASCADE,
  exercice_id UUID REFERENCES public.exercices(id) ON DELETE SET NULL,
  nom_exo     TEXT NOT NULL,
  ordre       INTEGER DEFAULT 0,
  consigne    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.seance_echauffement ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all anon on seance_echauffement"
  ON public.seance_echauffement FOR ALL TO anon USING (true) WITH CHECK (true);

-- 19. DÉSACTIVATION DE COMPTE CLIENTE (2026-06-13)
-- Le coach peut désactiver l'accès d'une cliente (elle ne peut plus se
-- connecter) sans supprimer ses données, et la réactiver plus tard.
-- Exécuter dans Supabase :
--
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS actif BOOLEAN NOT NULL DEFAULT TRUE;
--
-- Mettre à jour rpc_verify_login pour renvoyer aussi "actif" (le front
-- bloque la connexion si actif = false, voir login.html) :
-- (DROP nécessaire car le type de retour change)
--
DROP FUNCTION IF EXISTS public.rpc_verify_login(text, text);

CREATE OR REPLACE FUNCTION public.rpc_verify_login(p_email TEXT, p_pin TEXT)
RETURNS TABLE (id UUID, email TEXT, prenom TEXT, is_first_login BOOLEAN, actif BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c RECORD;
  legacy_hash TEXT;
  new_salt TEXT;
  new_hash TEXT;
BEGIN
  SELECT * INTO c FROM public.clients WHERE clients.email = lower(trim(p_email));
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF c.pin_salt IS NULL THEN
    -- Ancien format (sel commun) : on vérifie avec l'ancien sel
    legacy_hash := encode(digest(p_pin || 'recode_salt_v1', 'sha256'), 'hex');
    IF c.pin_hash IS DISTINCT FROM legacy_hash THEN
      RETURN;
    END IF;
    -- Migration silencieuse vers un sel individuel
    new_salt := encode(gen_random_bytes(16), 'hex');
    new_hash := encode(digest(p_pin || new_salt, 'sha256'), 'hex');
    UPDATE public.clients SET pin_hash = new_hash, pin_salt = new_salt WHERE clients.id = c.id;
  ELSE
    -- Nouveau format (sel individuel)
    new_hash := encode(digest(p_pin || c.pin_salt, 'sha256'), 'hex');
    IF c.pin_hash IS DISTINCT FROM new_hash THEN
      RETURN;
    END IF;
  END IF;

  RETURN QUERY SELECT c.id, c.email, c.prenom, c.is_first_login, c.actif;
END;
$$;

-- IMPORTANT : un DROP FUNCTION fait perdre les GRANT existants, il faut
-- redonner le droit d'exécution (voir supabase-security-update.sql) :
GRANT EXECUTE ON FUNCTION public.rpc_verify_login(TEXT, TEXT) TO anon, authenticated;

-- IMPORTANT : digest()/gen_random_bytes() (pgcrypto) vivent dans le schéma
-- "extensions" sur ce projet Supabase. La fonction doit pouvoir les trouver :
ALTER FUNCTION public.rpc_verify_login(text, text) SET search_path = public, extensions;

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────────

ALTER TABLE public.clients        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seances        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metriques      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habitudes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_config   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bilan_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bilan_schedule ENABLE ROW LEVEL SECURITY;

-- Policies ouvertes pour la clé anon (prototype)
CREATE POLICY "anon_all_clients"        ON public.clients        FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_seances"        ON public.seances        FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_perfs"          ON public.perfs          FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_metriques"      ON public.metriques      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_habitudes"      ON public.habitudes      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_cycle_logs"     ON public.cycle_logs     FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_cycle_config"   ON public.cycle_config   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_bilan_logs"     ON public.bilan_logs     FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_bilan_schedule" ON public.bilan_schedule FOR ALL TO anon USING (true) WITH CHECK (true);
