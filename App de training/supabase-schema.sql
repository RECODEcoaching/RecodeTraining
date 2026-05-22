-- ══════════════════════════════════════════════════════════════════
-- RECODE Training App — Schéma Supabase
-- Colle ce SQL dans Supabase > SQL Editor > New Query > Run
-- ══════════════════════════════════════════════════════════════════

-- 1. CLIENTS (créés par le coach)
CREATE TABLE public.clients (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  prenom        TEXT NOT NULL,
  pin_hash      TEXT NOT NULL,
  is_first_login BOOLEAN DEFAULT TRUE,
  objectif      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

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

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────────

ALTER TABLE public.clients      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seances      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metriques    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habitudes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_config ENABLE ROW LEVEL SECURITY;

-- Policies ouvertes pour la clé anon (prototype)
CREATE POLICY "anon_all_clients"      ON public.clients      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_seances"      ON public.seances      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_perfs"        ON public.perfs        FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_metriques"    ON public.metriques    FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_habitudes"    ON public.habitudes    FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_cycle_logs"   ON public.cycle_logs   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_cycle_config" ON public.cycle_config FOR ALL TO anon USING (true) WITH CHECK (true);
