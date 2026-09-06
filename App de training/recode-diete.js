// ══════════════════════════════════════════════════════════════════
// recode-diete.js — Socle commun du module Diète
// Inclus par module6_diete.html (côté cliente) et module4_coach.html (côté coach).
// Nécessite que la page ait déjà créé le client Supabase sous le nom `db`.
//
// Contient : le référentiel nutritionnel, les calculs, et tous les accès à la base.
// Ne contient aucun rendu : chaque page dessine ce qu'elle a à dessiner.
// ══════════════════════════════════════════════════════════════════

let ALIMENTS_BASE = [];

/*__ALIMENTS__*/

/* ══════════════════════════════════════════════════════════════
   RECODE — Module Diète v2 (prototype autonome)
   Base CIQUAL / ANSES — valeurs pour 100 g. 39 nutriments.
   ══════════════════════════════════════════════════════════════ */

// index dans ALIMENTS_BASE : 0 = nom, puis :
const NUT = [
  {i:1, k:'kcal', n:'Calories',     u:'kcal', grp:'macro'},
  {i:2, k:'p',    n:'Protéines',    u:'g',    grp:'macro'},
  {i:3, k:'g',    n:'Glucides',     u:'g',    grp:'macro'},
  {i:4, k:'l',    n:'Lipides',      u:'g',    grp:'macro'},
  {i:5, k:'fib',  n:'Fibres',       u:'g',    grp:'macro'},
  {i:6, k:'fru',  n:'Fructose',     u:'g',    grp:'fod'},
  {i:7, k:'glu',  n:'Glucose',      u:'g',    grp:'fod'},
  {i:8, k:'lac',  n:'Lactose',      u:'g',    grp:'fod'},
  {i:9, k:'pol',  n:'Polyols',      u:'g',    grp:'fod'},
  {i:-1,k:'fct',  n:'Fructanes',    u:'g',    grp:'fod', manuel:true},
  {i:-2,k:'gos',  n:'GOS',          u:'g',    grp:'fod', manuel:true},
  {i:10,k:'ags',  n:'AG saturés',   u:'g',    grp:'ag'},
  {i:11,k:'agmi', n:'Mono-insaturés',u:'g',   grp:'ag', pctLip:true},
  {i:12,k:'agpi', n:'Poly-insaturés',u:'g',   grp:'ag', pctLip:true},
  {i:13,k:'o6',   n:'Oméga 6',      u:'g',    grp:'ag'},
  {i:14,k:'o3',   n:'Oméga 3',      u:'g',    grp:'ag'},
  {i:15,k:'ed',   n:'EPA + DHA',    u:'g',    grp:'detail'},
  {i:16,k:'ala',  n:'ALA',          u:'g',    grp:'detail'},
  {i:17,k:'chol', n:'Cholestérol',  u:'mg',   grp:'ag', info:true},
  {i:18,k:'sel',  n:'Sel',          u:'g',    grp:'min'},
  {i:19,k:'na',   n:'Sodium',       u:'mg',   grp:'min'},
  {i:20,k:'ca',   n:'Calcium',      u:'mg',   grp:'min'},
  {i:21,k:'cu',   n:'Cuivre',       u:'mg',   grp:'min'},
  {i:22,k:'fe',   n:'Fer',          u:'mg',   grp:'min'},
  {i:23,k:'io',   n:'Iode',         u:'µg',   grp:'min'},
  {i:24,k:'mg',   n:'Magnésium',    u:'mg',   grp:'min'},
  {i:25,k:'mn',   n:'Manganèse',    u:'mg',   grp:'min'},
  {i:26,k:'ph',   n:'Phosphore',    u:'mg',   grp:'min'},
  {i:27,k:'k',    n:'Potassium',    u:'mg',   grp:'min'},
  {i:28,k:'se',   n:'Sélénium',     u:'µg',   grp:'min'},
  {i:29,k:'zn',   n:'Zinc',         u:'mg',   grp:'min'},
  {i:30,k:'va',   n:'Vitamine A',   u:'µg',   grp:'vit'},
  {i:31,k:'ret',  n:'Rétinol',      u:'µg',   grp:'detail'},
  {i:32,k:'bc',   n:'Bêta-carotène',u:'µg',   grp:'detail'},
  {i:33,k:'vd',   n:'Vitamine D',   u:'µg',   grp:'vit'},
  {i:34,k:'ve',   n:'Vitamine E',   u:'mg',   grp:'vit'},
  {i:35,k:'k1',   n:'Vitamine K1',  u:'µg',   grp:'vit'},
  {i:36,k:'k2',   n:'Vitamine K2',  u:'µg',   grp:'vit'},
  {i:37,k:'vc',   n:'Vitamine C',   u:'mg',   grp:'vit'},
  {i:38,k:'b1',   n:'Vitamine B1',  u:'mg',   grp:'vit'},
  {i:39,k:'b2',   n:'Vitamine B2',  u:'mg',   grp:'vit'},
  {i:40,k:'b3',   n:'Vitamine B3',  u:'mg',   grp:'vit'},
  {i:41,k:'b5',   n:'Vitamine B5',  u:'mg',   grp:'vit'},
  {i:42,k:'b6',   n:'Vitamine B6',  u:'mg',   grp:'vit'},
  {i:43,k:'b9',   n:'Vitamine B9',  u:'µg',   grp:'vit'},
  {i:44,k:'b12',  n:'Vitamine B12', u:'µg',   grp:'vit'}
];
// Part d'EPA+DHA en dessous de laquelle on alerte : l'ALA se convertit à quelques % seulement
const SEUIL_EPA_DHA = 0.30;
// Cholestérol : simple information, cible indicative par kg de masse maigre
const CHOL_PAR_KG_MM = 7.2;
const NUTBY = {}; NUT.forEach(x => NUTBY[x.k] = x);

// Cibles par défaut — femme adulte.
// src 'ok'  = valeur confirmée sur le tableau ANSES/CERIN (vitamines, fibres)
// src 'chk' = valeur de départ à vérifier sur le rapport ANSES 2021
// lim true  = c'est un plafond à ne pas dépasser, pas un objectif à atteindre
// Deux référentiels au choix, appliqués à TOUTES les clientes.
// VNR = valeurs de l'étiquetage européen (règlement 1169/2011) : un jeu unique, non différencié par sexe.
// ANSES = références françaises femme adulte (RNP ou apport satisfaisant), confirmées sur le tableau publié.
// Référentiel principal : PTC3 « La micronutrition » (Bayesian Bodybuilding).
// Colonne FEMME du tableau récapitulatif, majorée quand le document documente
// explicitement un besoin sportif supérieur. Les majorations sont tracées ci-dessous.
const PTC3_MAJORE = {
  vc: 'RDA femme 75 mg, jugée insuffisante pour les pratiquantes de musculation. Le document déconseille de dépasser 250 mg, au-delà desquels de fortes doses combinées à la vitamine E interfèrent avec la signalisation anabolique. Cible posée à 200 mg, dans la fenêtre utile.',
  vd: 'Tableau 15-20 µg, mais le document recommande au moins 2 000 UI par jour (50 µg) pour toute personne non exposée. Cette cible vaut hors période estivale : en été, avec une exposition solaire régulière, la synthèse cutanée couvre une bonne part du besoin.',
  b12:'RDA 2,4 µg. Le document indique que 4 à 7 µg conviennent davantage aux athlètes. Cible posée à 5 µg, au milieu de cette fourchette.',
  ca: 'RDA 1 000 mg, portée à 1 300 mg — le document retient cette valeur comme minimum pour les pratiquantes de musculation.',
  mg: 'RDA femme environ 310 mg, majorée de 20 % : réparation musculaire et pertes accrues par la transpiration et l\'urine.',
  zn: 'RDA femme 8 mg. Le document corrige les méthodes de mesure obsolètes (sous-estimation d\'environ 50 %) et ajoute 20 % pour l\'entraînement intensif, aboutissant à 14 mg chez la femme sportive.',
  na: 'Fourchette et non valeur unique. En dessous de 1,5 g, la restriction est délétère ; au-dessus de 4 g, l\'intérêt n\'est plus démontré chez tout le monde. La position dans la fourchette dépend fortement de la transpiration individuelle et de la charge d\'entraînement.'
};
const REF_SETS = {
  ptc3:{ nom:'PTC3 — femme sportive',
    desc:'Valeurs du document « La micronutrition », colonne femme, majorées là où le document documente un besoin sportif supérieur. Sept nutriments sont relevés — repérables au tag orange.',
    v:{ ca:1300, cu:0.9, fe:18, io:150, mg:370, mn:1.8, ph:700, k:4700, se:55, zn:14, na:4000,
        va:700, vd:50, ve:15, k1:90, vc:200, b1:1.1, b2:1.1, b3:14, b5:5, b6:1.3, b9:400, b12:5 } },
  ptc3b:{ nom:'PTC3 — valeurs brutes femme',
    desc:'Les mêmes valeurs, sans aucune majoration sportive : strictement la colonne femme du tableau récapitulatif du document.',
    v:{ ca:1000, cu:0.9, fe:18, io:150, mg:310, mn:1.8, ph:700, k:4700, se:55, zn:8, na:1500,
        va:700, vd:17.5, ve:15, k1:90, vc:75, b1:1.1, b2:1.1, b3:14, b5:5, b6:1.3, b9:400, b12:2.4 } },
  anses:{ nom:'ANSES — femme adulte',
    desc:'Références nutritionnelles françaises (RNP ou apport satisfaisant). Population générale, sans considération d\'entraînement.',
    v:{ ca:950, cu:1.5, fe:16, io:150, mg:360, mn:3, ph:550, k:3500, se:70, zn:9.5, na:2000,
        va:650, vd:15, ve:9.9, k1:79, vc:110, b1:1.2, b2:1.5, b3:14, b5:4.7, b6:1.5, b9:330, b12:4 } }
};
// Points d'attention — affichés côté cliente et côté coach. Tous les nutriments n'en ont pas.
const ATTENTION = {
  fe:'La cible affichée est l\'apport de base. <b>Chez une sportive, le besoin peut être jusqu\'à 50 % plus élevé</b> — soit environ 27 mg — et davantage encore pendant les règles, en cas de règles abondantes, ou lors d\'une grossesse. 52 % des athlètes féminines sont carencées alors qu\'elles consomment déjà plus que les sédentaires. Vigilance renforcée chez les végétariennes et les coureuses : impact au sol, pertes digestives et pertes menstruelles se cumulent.',
  vd:'Cible valable <b>hors été</b> : d\'octobre à mars, sous nos latitudes, la synthèse par la peau est quasi nulle. En été, avec une exposition solaire régulière, une part importante du besoin est couverte sans passer par l\'alimentation. Plus de 44 % des athlètes s\'entraînant en extérieur restent malgré tout carencées.',
  ca:'Attention en cas de faible disponibilité énergétique : un apport bas combiné à un déficit calorique prolongé fragilise l\'os, surtout si les cycles sont perturbés. Au-delà de 800 mg par repas, l\'absorption plafonne — mieux vaut répartir.',
  mg:'<b>Le chiffre affiché est probablement surévalué.</b> Les sols se sont appauvris en magnésium depuis la révolution agricole : les tables de composition reflètent mal la teneur réelle des aliments d\'aujourd\'hui. S\'y ajoutent le raffinage, qui retire 82 à 97 % du magnésium des céréales, et l\'acide phytique des légumineuses, du cacao et des céréales complètes, qui réduit l\'absorption d\'environ 60 %. Considère l\'apport réel comme inférieur à ce qui s\'affiche.',
  na:'<b>Ni trop bas, ni trop haut.</b> En dessous de 1,5 g, la restriction est plus délétère qu\'utile — résistance à l\'insuline, activation hormonale de compensation. Au-dessus de 4 g, le bénéfice n\'est plus démontré pour tout le monde. La bonne position dans la fourchette est très individuelle : une séance de musculation coûte 1 à 2 g de sodium, un effort par forte chaleur jusqu\'à 5,5 g par heure. Une cliente qui transpire beaucoup vise le haut de la fourchette, une autre le bas.',
  zn:'<b>Cible relevée pour la sportive</b> : 14 mg contre 8 mg pour une femme sédentaire. Les méthodes de mesure historiques sous-estiment le besoin d\'environ 50 %, et l\'entraînement intensif ajoute encore 20 %. Absorption réduite par les phytates des céréales complètes et légumineuses. Ne pas dépasser 20 mg en supplémentation : au-delà, le HDL baisse et une carence en cuivre s\'installe.',
  io:'Apport dépendant du sel iodé et des produits de la mer. Une alimentation sans sel ajouté ni poisson expose au déficit.',
  b12:'Absente des végétaux. Une supplémentation est à envisager en cas d\'alimentation végétarienne, et nécessaire si elle est végétalienne.',
  b9:'Besoins majorés en cas de projet de grossesse, à anticiper plusieurs semaines avant la conception et non au moment du test.',
  vc:'Besoins majorés par l\'entraînement, mais ne pas dépasser 250 mg : à forte dose, combinée à la vitamine E, la vitamine C interfère avec la signalisation anabolique et freine le gain de force sur le long terme. Couvrir, pas saturer.',
  ve:'Même logique que la vitamine C : les doses élevées altèrent les adaptations à l\'entraînement. L\'objectif est de couvrir le besoin, pas de le dépasser.',
  va:'Un apport excessif en vitamine A gêne l\'absorption de la vitamine K. Prudence si consommation régulière de foie ou d\'huile de foie de morue.',
  k:'Pertes sudorales à prendre en compte sur les séances longues, en complément du sodium.',
  se:'Teneur des aliments très dépendante des sols. La marge entre l\'apport utile et l\'excès est plus étroite que pour la plupart des minéraux.',
  k1:'Apport lié aux légumes verts. Interaction connue avec les traitements anticoagulants — à signaler si une cliente en prend.',
  o3:'<b>Tous les oméga 3 ne se valent pas.</b> L\'ALA des sources végétales — noix, colza, lin — ne se convertit en EPA et DHA qu\'à hauteur de quelques pour cent. Ce sont l\'EPA et le DHA, présents surtout dans les poissons gras, qui portent les effets recherchés : inflammation basse, synthèse protéique, récupération. Vise 3 g d\'EPA + DHA par jour. Le rapport avec les oméga 6 compte, mais moins que d\'en consommer assez.',
  agmi:'Olives, avocats, noix, œufs. Le document ne fixe pas de proportion idéale : il recommande simplement d\'avoir une source régulière de chaque famille d\'acides gras plutôt que de calculer des ratios précis.',
  agpi:'Présents dans presque tous les aliments. Un apport lipidique total suffisant, combiné à une attention portée aux oméga 3, couvre généralement le besoin sans effort particulier.',
  chol:'Sans limite. Le corps régule lui-même sa cholestérolémie, et un apport alimentaire élevé ne fait généralement pas monter le cholestérol sanguin. Un apport correct semble même favorable à la construction musculaire.',
  fib:'Augmenter progressivement : une montée rapide aggrave souvent l\'inconfort digestif, en particulier chez les clientes sensibles.',
  ags:'Limite conservée par prudence, mais à relativiser : plusieurs méta-analyses ne retrouvent pas de lien clair entre acides gras saturés et risque cardiovasculaire, et un apport trop bas s\'accompagne d\'une production hormonale réduite. Ce qui compte surtout, c\'est la provenance et ce qu\'ils remplacent.'
};
const DEF_MICRO = {
  fib:{v:30,  src:'ok'},
  ags:{v:22,  src:'chk', lim:true}, o6:{v:10, src:'chk'}, o3:{v:2, src:'chk'},
  agmi:{v:0, src:'chk', libre:true}, agpi:{v:0, src:'chk', libre:true}, chol:{v:400, src:'chk', libre:true},
  sel:{v:10,  src:'chk'}, na:{v:4000, src:'chk', min:1500},
  ca:{v:950,  src:'chk'}, cu:{v:1.5, src:'chk'}, fe:{v:16, src:'chk'},
  io:{v:150,  src:'chk'}, mg:{v:360, src:'chk'}, mn:{v:3, src:'chk'},
  ph:{v:550,  src:'chk'}, k:{v:3500, src:'chk'}, se:{v:70, src:'chk'}, zn:{v:9.5, src:'chk'},
  va:{v:650,  src:'ok'}, vd:{v:15, src:'ok'}, ve:{v:9.9, src:'ok'}, k1:{v:79, src:'chk'},
  k2:{v:10,   src:'chk'}, vc:{v:110, src:'ok'}, b1:{v:1.2, src:'ok'}, b2:{v:1.5, src:'ok'},
  b3:{v:14,   src:'ok'}, b5:{v:4.7, src:'ok'}, b6:{v:1.5, src:'ok'},
  b9:{v:330,  src:'ok'}, b12:{v:4, src:'ok'}
};
// Seuils FODMAP — PAR REPAS, pas par jour : la tolérance digestive dépend de la dose
// reçue en une prise, pas du cumul de la journée. Valeurs de départ à vérifier.
// Le seuil est la frontière moyen/haut ; la moitié du seuil est la frontière faible/moyen.
// Aucun seuil par défaut : les seuils FODMAP publiés viennent de bases sous licence
// que je n'ai pas pu vérifier. Un chiffre inventé donnerait une fausse précision.
// v = 0 signifie « pas de seuil » → la valeur est affichée en gramme, sans jugement.
// Le coach peut poser un seuil sur le lactose ou les polyols s'il a une raison de le faire.
const DEF_FODMAP = {
  fru:{v:0, n:'Fructose', info:true},  glu:{v:0, n:'Glucose', info:true},
  lac:{v:0, n:'Lactose', optionnel:true}, pol:{v:0, n:'Polyols', optionnel:true},
  fct:{v:0, n:'Fructanes', niveau:true},  gos:{v:0, n:'GOS', niveau:true}
};
// Seul indicateur réellement évalué côté sucres : le rapport fructose/glucose du repas.
// Le glucose facilite l'absorption intestinale du fructose ; au-delà de 1:1, le fructose
// est en excès et l'absorption devient moins confortable.
const RATIO_FG_MAX = 1;
// Fructanes et GOS : aucune table de référence exploitable, donc pas de grammes.
// Classement qualitatif par aliment, agrégé en niveau de repas.
// Poids calibrés pour que : 1 portion « haut » = haut · 1 portion « moyen » = moyen ·
// 2 portions « moyen » = haut (le cumul compte) · plusieurs « faible » restent faible.
const LVL = {1:{n:'faible',c:'var(--success)',poids:0.2},2:{n:'moyen',c:'var(--warn)',poids:2.2},3:{n:'haut',c:'var(--danger)',poids:5}};
const LVL_NAMES = {0:'non renseigné',1:'faible',2:'moyen',3:'haut'};
// score du repas = somme des poids, chacun ramené à la portion de référence de l'aliment
const LVL_SEUIL_MOYEN = 1.2, LVL_SEUIL_HAUT = 4;
const MEAL_ICONS = ['🌅','☀️','🌙','🍎','🥤','🍽️','🥗','🍵'];
const LS_KEY = 'recode_diete_proto_v5';

let SEARCH_INDEX = [];
function norm(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/ +/g,' ').trim();}
function buildIndex(){const t=performance.now();SEARCH_INDEX=ALIMENTS_BASE.map((a,i)=>({i,n:norm(a[0])}));console.log('Index : '+ALIMENTS_BASE.length+' aliments en '+(performance.now()-t).toFixed(1)+' ms');}

// ── Comblement des trous sur les sucres ──────────────────────────────
// Beaucoup de lignes n'ont pas la mesure des sucres alors que l'aliment en contient
// évidemment : « Pomme, crue » est vide, « Pomme, chair sans peau, crue » ne l'est pas.
// Afficher un vide ferait croire à la cliente que l'aliment n'en contient pas.
// On reprend donc les valeurs d'une variante du même aliment, en le signalant.
// Les substitutions sont désormais faites en base : la colonne sucres_estimes_de
// porte l'id de l'aliment dont les sucres ont été repris.
function appliquerSubstitutions(){}
function estimeDepuis(idx){
  const m = ALIM_META[idx];
  if(!m || m.estDe == null) return null;
  const j = ID2IDX[m.estDe];
  return (j == null || !ALIMENTS_BASE[j]) ? null : ALIMENTS_BASE[j][0];
}
function entreeEstimee(e){return e.ref>=0?estimeDepuis(e.ref):null;}

let S=null, view='cli', curDate=todayStr(), coachJT='defaut', pendingMeal=0, pendingFood=null;
// curClient  = la cliente ouverte côté coach
// viewClient = la cliente dont on simule l'écran dans la vue Cliente
let curClient=null, viewClient=null;
function cliClient(){return viewClient?S.clients[viewClient]:null;}


function todayStr(){return dstr(new Date());}
function dstr(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function parseD(s){const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d);}
function addDays(s,n){const d=parseD(s);d.setDate(d.getDate()+n);return dstr(d);}

function defaultMicroTargets(ref){
  const o={};Object.entries(DEF_MICRO).forEach(([k,v])=>o[k]=v.v);
  Object.entries(REF_SETS[ref||'vnr'].v).forEach(([k,v])=>o[k]=v);
  return o;
}
// applique un référentiel à toutes les clientes, en effaçant les personnalisations sur les nutriments concernés

function attBlock(k){
  return ATTENTION[k]?'<div class="att"><span class="att-i">!</span><div>'+ATTENTION[k]+'</div></div>':'';
}
function defaultFodmapTargets(){const o={};Object.entries(DEF_FODMAP).forEach(([k,v])=>o[k]=v.v);return o;}
function fodTarget(k,cl){cl=cl||client();return (cl.fodmapOverrides&&cl.fodmapOverrides[k]!==undefined)?cl.fodmapOverrides[k]:S.defaults.fodmap[k];}
function isFodOverridden(k,cl){cl=cl||client();return cl.fodmapOverrides&&cl.fodmapOverrides[k]!==undefined;}
// Une cible de repas peut être absente. « NA » signifie « pas de recommandation
// particulière sur ce repas » — ce n'est pas zéro, qui voudrait dire « zéro gramme ».
// On garde donc null partout plutôt que 0.
function nOuNull(v){ return (v===null || v===undefined || v==='') ? null : +v; }
function lireNA(v){
  if(v===null || v===undefined) return null;
  const t=String(v).trim().toLowerCase();
  if(t==='' || t==='na' || t==='n/a' || t==='-' || t==='—') return null;
  const n=parseFloat(t.replace(',','.'));
  return isNaN(n) ? null : n;
}
// Cinq écritures possibles dans une case de répartition :
//   NA / vide     -> aucune recommandation        {min:null, max:null}
//   « 35 »        -> cible unique                 {min:null, max:35}
//   « 30-35 »     -> fourchette                   {min:30,   max:35}
//   « 40+ »       -> minimum, sans plafond        {min:40,   max:null}
//   « ≤40 »       -> plafond, sans minimum        {min:0,    max:40}
// Le plafond est encodé par min=0 : « de 0 à 40 » dit exactement « au plus 40 »,
// ce qui évite une colonne supplémentaire en base.
function lirePlage(v){
  if(v===null || v===undefined) return {min:null,max:null};
  let t=String(v).trim().toLowerCase().replace(/\s/g,'').replace(/,/g,'.');
  if(t==='' || t==='na' || t==='n/a' || t==='—') return {min:null,max:null};
  // on ramène toutes les façons d'écrire un minimum à « + », et tous les plafonds à « M »
  t=t.replace(/^mini?/,'+').replace(/^>=/,'+').replace(/^≥/,'+').replace(/^>/,'+')
     .replace(/^max/,'M').replace(/^<=/,'M').replace(/^≤/,'M').replace(/^</,'M');

  // minimum sans plafond : « 40+ », « +40 », « min 40 », « ≥40 »
  let m=t.match(/^\+?(\d+(?:\.\d+)?)\+?$/);
  if(m && (/\+/.test(t))) return {min:parseFloat(m[1]), max:null};
  // plafond sans minimum : « M40 » (issu de max / ≤ / <)
  m=t.match(/^M(\d+(?:\.\d+)?)$/);
  if(m) return {min:0, max:parseFloat(m[1])};
  // fourchette
  m=t.match(/^(\d+(?:\.\d+)?)[-–à](\d+(?:\.\d+)?)$/);
  if(m){
    let a=parseFloat(m[1]), b=parseFloat(m[2]);
    if(a>b){ const tmp=a; a=b; b=tmp; }        // « 35-30 » vaut « 30-35 »
    return a===b ? {min:null,max:b} : {min:a,max:b};
  }
  if(t==='-') return {min:null,max:null};
  const n=parseFloat(t);
  return isNaN(n) ? {min:null,max:null} : {min:null,max:n};
}
function fmtPlage(min,max){
  if(max==null && min==null) return 'NA';
  if(max==null) return min+'+';        // minimum sans plafond
  if(min===0)   return '≤'+max;        // plafond sans minimum
  if(min==null) return String(max);    // cible unique
  return min+'-'+max;                  // fourchette
}
function afficheNA(v){ return v==null ? 'NA' : v; }
// une valeur respecte-t-elle la consigne ? (tolérance de 10 % sur une cible unique)
function dansPlage(v,min,max){
  if(max==null && min==null) return null;
  if(max==null) return v>=min;                 // minimum
  if(min===0)   return v<=max;                 // plafond
  if(min!=null) return v>=min && v<=max;       // fourchette
  return v>=max*0.9 && v<=max*1.1;             // cible unique
}
// une case est-elle renseignée ?
function aUneConsigne(min,max){ return !(min==null && max==null); }
function repas4(kcal,p,g,l,f){
  return [['Petit-déjeuner',.25],['Déjeuner',.35],['Collation',.10],['Dîner',.30]].map(([nom,r])=>({
    nom,kcal:Math.round(kcal*r),p:Math.round(p*r),g:Math.round(g*r),l:Math.round(l*r),f:Math.round(f*r)}));
}
function defaultState(){
  return {
    // cibles par defaut du coach, appliquees a toutes les clientes
    defaults:{ kcal:2000, p:140, g:190, l:65, f:30, refSet:'ptc3', micro:defaultMicroTargets('ptc3'), fodmap:defaultFodmapTargets() },
    // fructanes / GOS saisis a la main par le coach — cle 'b<index>' (base) ou 'c<id>' (perso)
    fodmapLib:{},
    alimentsCustom:[
      {id:'c1',nom:'Skyr nature Lidl',kcal:63,p:11,g:4,l:.2,f:0,statut:'en_attente',par:'Léa'},
      {id:'c2',nom:'Barre protéinée chocolat (marque X)',kcal:352,p:32,g:31,l:11,f:6,statut:'en_attente',par:'Marie'},
      {id:'c3',nom:'Whey isolate vanille',kcal:373,p:86,g:2.5,l:1.2,f:0,statut:'valide',par:'Léa'}
    ],
    clients:{
      lea:{nom:'Léa',
        cibles:{defaut:{kcal:1900,p:150,g:180,l:60,f:28,repas:repas4(1900,150,180,60,28)}},
        microOverrides:{}, fodmapOverrides:{}, jours:{}, journal:{}},
      marie:{nom:'Marie',
        cibles:{
          defaut:{kcal:2100,p:140,g:210,l:70,f:30,repas:repas4(2100,140,210,70,30)},
          entrainement:{kcal:2400,p:150,g:270,l:70,f:30,repas:repas4(2400,150,270,70,30)},
          off:{kcal:1850,p:145,g:140,l:72,f:30,repas:repas4(1850,145,140,72,30)}
        },
        microOverrides:{fe:18,ca:1100}, fodmapOverrides:{lac:2}, jours:{}, journal:{}}
    }
  };
}
// ══════════════════════════════════════════════════════════════
//  SUPABASE — connexion, chargement, écritures
// ══════════════════════════════════════════════════════════════
// Le client Supabase (db) est créé par la page hôte, avant l'inclusion de ce fichier.
const sb = db;

// colonnes de la table aliments, dans l'ordre exact des index NUT
const COLS_ALIM = ['nom','kcal','prot','gluc','lip','fibres','fructose','glucose','lactose','polyols',
  'ags','agmi','agpi','omega6','omega3','epa_dha','ala','cholesterol','sel','sodium','calcium','cuivre',
  'fer','iode','magnesium','manganese','phosphore','potassium','selenium','zinc','vit_a','retinol',
  'beta_carotene','vit_d','vit_e','vit_k1','vit_k2','vit_c','b1','b2','b3','b5','b6','b9','b12'];
let ALIM_IDS = [], ALIM_META = [], ID2IDX = {};

function erreur(e, quoi){
  console.error(quoi, e);
  dtToast('Erreur — ' + quoi);
  return null;
}

async function chargerAliments(){
  let tout = [], from = 0;
  const PAGE = 1000;                     // Supabase plafonne à 1000 lignes par requête
  while(true){
    const { data, error } = await sb.from('aliments').select('*').order('nom').range(from, from+PAGE-1);
    if(error){ erreur(error, 'chargement des aliments'); break; }
    tout = tout.concat(data);
    if(data.length < PAGE) break;
    from += PAGE;
  }
  ALIMENTS_BASE = tout.map(r => COLS_ALIM.map((c,i) => i===0 ? r[c] : (r[c]==null ? null : +r[c])));
  ALIM_IDS  = tout.map(r => r.id);
  ALIM_META = tout.map(r => ({ source:r.source, statut:r.statut, propose_par:r.propose_par,
    fct:r.fructanes_niveau, gos:r.gos_niveau, portion:+r.fod_portion || 100, estDe:r.sucres_estimes_de }));
  ID2IDX = {}; tout.forEach((r,i) => ID2IDX[r.id] = i);
  console.log('Aliments chargés depuis Supabase :', tout.length);
}

async function chargerDefaults(){
  const { data, error } = await sb.from('diete_defaults').select('*').eq('id',1).single();
  if(error || !data){ S.defaults = defaultState().defaults; return; }
  S.defaults = {
    refSet: data.ref_set || 'ptc3',
    kcal:+data.kcal, p:+data.prot, g:+data.gluc, l:+data.lip, f:+data.fibres,
    micro: (data.micro && Object.keys(data.micro).length) ? data.micro : defaultMicroTargets(data.ref_set||'ptc3'),
    fodmap:(data.fodmap && Object.keys(data.fodmap).length) ? data.fodmap : defaultFodmapTargets()
  };
}

async function chargerClientes(){
  const { data, error } = await sb.from('clients').select('id,prenom,actif').order('prenom');
  if(error) return erreur(error, 'chargement des clientes');
  S.clients = {};
  (data||[]).filter(c => c.actif !== false).forEach(c => {
    S.clients[c.id] = { id:c.id, nom:c.prenom, cibles:{}, microOverrides:{}, fodmapOverrides:{},
                        jours:{}, journal:{}, _charge:false };
  });
  const ids = Object.keys(S.clients);
  if(!curClient  || !S.clients[curClient])  curClient  = ids[0] || null;
  if(!viewClient || !S.clients[viewClient]) viewClient = ids[0] || null;
}

// cibles, personnalisations, types de jour, repas libres et journal d'une cliente
async function chargerCliente(id){
  const cl = S.clients[id];
  if(!cl || cl._charge) return;
  const depuis = addDays(todayStr(), -60);

  const [cib, cfg, jrs, libres, ents] = await Promise.all([
    sb.from('diete_cibles').select('*, diete_repas(*)').eq('client_id', id),
    sb.from('diete_client_config').select('*').eq('client_id', id).maybeSingle(),
    sb.from('diete_jours').select('*').eq('client_id', id),
    sb.from('diete_repas_libres').select('*').eq('client_id', id).gte('date', depuis),
    sb.from('diete_entrees').select('*').eq('client_id', id).gte('date', depuis)
  ]);

  cl.cibles = {};
  (cib.data||[]).forEach(c => {
    cl.cibles[c.jour_type] = { _id:c.id, kcal:+c.kcal, p:+c.prot, g:+c.gluc, l:+c.lip, f:+c.fibres,
      repas:(c.diete_repas||[]).sort((a,b)=>a.ordre-b.ordre)
        .map(r => ({ _id:r.id, nom:r.nom,
          kcal:nOuNull(r.kcal), p:nOuNull(r.prot), g:nOuNull(r.gluc), l:nOuNull(r.lip), f:nOuNull(r.fibres),
          // bornes basses des fourchettes ; null = cible unique
          kcalMin:nOuNull(r.kcal_min), pMin:nOuNull(r.prot_min), gMin:nOuNull(r.gluc_min),
          lMin:nOuNull(r.lip_min), fMin:nOuNull(r.fibres_min) })) };
  });
  if(!cl.cibles.defaut) await creerCiblesDefaut(id);

  cl.microOverrides  = (cfg.data && cfg.data.micro_overrides)  || {};
  cl.fodmapOverrides = (cfg.data && cfg.data.fodmap_overrides) || {};
  cl.jours = {}; (jrs.data||[]).forEach(j => cl.jours[j.date] = j.jour_type);

  cl.journal = {};
  (libres.data||[]).forEach(m => {
    const k = '_meals_' + m.date;
    (cl.journal[k] = cl.journal[k] || []).push({ id:m.id, nom:m.nom });
  });
  (ents.data||[]).forEach(e => {
    (cl.journal[e.date] = cl.journal[e.date] || []).push({
      id:e.id, meal:e.repas_ref, src:'base', ref:(e.aliment_id!=null && ID2IDX[e.aliment_id]!=null) ? ID2IDX[e.aliment_id] : -1,
      alimentId:e.aliment_id, nom:e.nom_snapshot, q:+e.quantite, mac:e.macros });
  });
  cl._charge = true;
}

async function creerCiblesDefaut(id){
  const d = S.defaults;
  const { data, error } = await sb.from('diete_cibles')
    .insert({ client_id:id, jour_type:'defaut', kcal:d.kcal, prot:d.p, gluc:d.g, lip:d.l, fibres:d.f })
    .select().single();
  if(error) return erreur(error, 'création des cibles');
  const repas = repas4(d.kcal, d.p, d.g, d.l, d.f);
  const { data:rr } = await sb.from('diete_repas')
    .insert(repas.map((r,i) => ({ cible_id:data.id, ordre:i, nom:r.nom, kcal:r.kcal, prot:r.p, gluc:r.g, lip:r.l, fibres:r.f })))
    .select();
  S.clients[id].cibles.defaut = { _id:data.id, kcal:d.kcal, p:d.p, g:d.g, l:d.l, f:d.f,
    repas:(rr||[]).sort((a,b)=>a.ordre-b.ordre).map(r=>({ _id:r.id, nom:r.nom, kcal:+r.kcal, p:+r.prot, g:+r.gluc, l:+r.lip, f:+r.fibres })) };
}

// mode 'cliente' : une seule cliente, celle de la session.
// mode 'coach'   : toutes les clientes, chargées à la demande.
async function boot(mode, clientId){
  S = { defaults:null, clients:{} };
  await chargerAliments();
  buildIndex();
  await chargerDefaults();
  await chargerClientes();
  if(mode==='cliente'){
    if(clientId && S.clients[clientId]){ viewClient=clientId; curClient=clientId; }
    if(viewClient) await chargerCliente(viewClient);
  } else {
    if(curClient) await chargerCliente(curClient);
  }
}
// L'état S reste en mémoire comme cache de lecture ; toutes les écritures partent
// vers Supabase via les fonctions db* ci-dessous. save() ne persiste plus rien
// localement : elle est conservée pour ne pas casser les appels existants.
function save(){}
async function resetAll(){
  if(!confirm('Recharger les données depuis Supabase ?'))return;
  await boot(); dtToast('Données rechargées');
}

function seedDemo(){}   // plus de données fictives : tout vient de Supabase

// ── ÉCRITURES ─────────────────────────────────────────────────
async function dbDefaults(){
  const d = S.defaults;
  const { error } = await sb.from('diete_defaults').update({
    ref_set:d.refSet, kcal:d.kcal, prot:d.p, gluc:d.g, lip:d.l, fibres:d.f,
    micro:d.micro, fodmap:d.fodmap, updated_at:new Date().toISOString()
  }).eq('id',1);
  if(error) erreur(error, 'enregistrement des cibles par défaut');
}
async function dbClientConfig(id){
  const cl = S.clients[id];
  const { error } = await sb.from('diete_client_config').upsert({
    client_id:id, micro_overrides:cl.microOverrides, fodmap_overrides:cl.fodmapOverrides,
    updated_at:new Date().toISOString()
  }, { onConflict:'client_id' });
  if(error) erreur(error, 'enregistrement des personnalisations');
}
async function dbCible(id, jourType){
  const c = S.clients[id].cibles[jourType];
  if(!c) return;
  if(c._id){
    await sb.from('diete_cibles').update({ kcal:c.kcal, prot:c.p, gluc:c.g, lip:c.l, fibres:c.f }).eq('id', c._id);
  } else {
    const { data, error } = await sb.from('diete_cibles')
      .insert({ client_id:id, jour_type:jourType, kcal:c.kcal, prot:c.p, gluc:c.g, lip:c.l, fibres:c.f })
      .select().single();
    if(error) return erreur(error, 'création du type de jour');
    c._id = data.id;
  }
  // les repas sont réécrits en bloc : peu de lignes, et ça évite toute désynchronisation
  await sb.from('diete_repas').delete().eq('cible_id', c._id);
  if(c.repas.length){
    const lignes = c.repas.map((r,i) => ({ cible_id:c._id, ordre:i, nom:r.nom,
      kcal:nOuNull(r.kcal), prot:nOuNull(r.p), gluc:nOuNull(r.g), lip:nOuNull(r.l), fibres:nOuNull(r.f),
      kcal_min:nOuNull(r.kcalMin), prot_min:nOuNull(r.pMin), gluc_min:nOuNull(r.gMin),
      lip_min:nOuNull(r.lMin), fibres_min:nOuNull(r.fMin) }));
    let { data:rr, error } = await sb.from('diete_repas').insert(lignes).select();
    if(error){
      // repli si les colonnes de fourchette n'existent pas encore en base
      const sansMin = lignes.map(({kcal_min,prot_min,gluc_min,lip_min,fibres_min,...reste}) => reste);
      ({ data:rr, error } = await sb.from('diete_repas').insert(sansMin).select());
      if(!error) console.warn('Fourchettes ignorées : exécute diete-fourchettes.sql dans Supabase.');
      else erreur(error, 'enregistrement des repas');
    }
    (rr||[]).sort((a,b)=>a.ordre-b.ordre).forEach((r,i)=>{ if(c.repas[i]) c.repas[i]._id = r.id; });
  }
}
async function dbDelCible(id, jourType){
  const c = S.clients[id].cibles[jourType];
  if(c && c._id) await sb.from('diete_cibles').delete().eq('id', c._id);
}
async function dbJour(id, date, jourType){
  if(!jourType || jourType === 'defaut'){
    await sb.from('diete_jours').delete().eq('client_id', id).eq('date', date);
  } else {
    await sb.from('diete_jours').upsert({ client_id:id, date, jour_type:jourType }, { onConflict:'client_id,date' });
  }
}
async function dbAddEntree(id, date, repasRef, idx, q, mac, nom){
  const { data, error } = await sb.from('diete_entrees').insert({
    client_id:id, date, repas_ref:repasRef,
    aliment_id: idx>=0 ? ALIM_IDS[idx] : null,
    nom_snapshot:nom, quantite:q, macros:mac
  }).select().single();
  if(error){ erreur(error, 'ajout de l\'aliment'); return null; }
  return data.id;
}
async function dbDelEntree(entreeId){
  const { error } = await sb.from('diete_entrees').delete().eq('id', entreeId);
  if(error) erreur(error, 'suppression');
}
async function dbAddRepasLibre(id, date, nom){
  const { data, error } = await sb.from('diete_repas_libres').insert({ client_id:id, date, nom }).select().single();
  if(error){ erreur(error, 'ajout du repas'); return null; }
  return data.id;
}
async function dbDelRepasLibre(repasId){
  await sb.from('diete_entrees').delete().eq('repas_ref', repasId);
  await sb.from('diete_repas_libres').delete().eq('id', repasId);
}
async function dbAddAlimentPerso(nom, kcal, p, g, l, f, parId){
  const { data, error } = await sb.from('aliments').insert({
    nom, nom_norm:norm(nom), source:'perso', statut:'en_attente', propose_par:parId,
    kcal, prot:p, gluc:g, lip:l, fibres:f
  }).select().single();
  if(error){ erreur(error, 'proposition de l\'aliment'); return null; }
  return data;
}
async function dbAlimentStatut(alimId, statut){
  const { error } = await sb.from('aliments').update({ statut }).eq('id', alimId);
  if(error) erreur(error, 'validation de l\'aliment');
}
async function dbAlimentSupprime(alimId){
  const { error } = await sb.from('aliments').delete().eq('id', alimId);
  if(error) erreur(error, 'suppression de l\'aliment');
}
async function dbFodmap(idx){
  const m = ALIM_META[idx];
  const { error } = await sb.from('aliments').update({
    fructanes_niveau:m.fct, gos_niveau:m.gos, fod_portion:m.portion
  }).eq('id', ALIM_IDS[idx]);
  if(error) erreur(error, 'enregistrement fructanes / GOS');
}

// ── calculs ──
// i >= 0 : valeur lue dans la table CIQUAL. i < 0 : fructanes / GOS, absents de CIQUAL,
// donc jamais figés dans l'entrée — recalculés à la volée depuis la table du coach,
// pour qu'un aliment renseigné après coup remonte dans l'historique déjà saisi.
// null dans la table = donnée non déterminée. On la propage telle quelle :
// la confondre avec zéro ferait dire à l'app « cet aliment n'en contient pas »,
// ce qui est faux et fausse tous les rapports.
function macrosFor(a,q){
  const r=q/100,o={};
  NUT.forEach(n=>{if(n.i>=0)o[n.k]=(a[n.i]==null?null:a[n.i]*r);});
  return o;
}
function foodKey(src,ref){return (src==='base'?'b':'c')+ref;}
// niveau (1/2/3) attribué par le coach à cet aliment, ou null si non renseigné
function manualOf(e){
  const m = e.ref>=0 ? ALIM_META[e.ref] : null;
  if(!m) return {fct:null,gos:null,portion:100};
  return {fct:m.fct==null?null:m.fct, gos:m.gos==null?null:m.gos, portion:m.portion||100};
}
// somme d'un nutriment sur une liste d'entrées.
// fct/gos : pas de grammes, on cumule un score pondéré par la quantité consommée.
function sumNut(ents,k){
  const manuel=NUTBY[k]&&NUTBY[k].manuel;
  if(!manuel){
    let v=0,inc=0;
    ents.forEach(e=>{const x=e.mac[k];if(x==null)inc++;else v+=x;});
    return {v:inc===ents.length&&ents.length?null:v, brut:v, inconnus:inc, total:ents.length, score:null};
  }
  let score=0,inc=0,pires=[];
  ents.forEach(e=>{
    const m=manualOf(e), lv=m[k];
    if(lv==null){inc++;return;}
    // le niveau est donné pour une portion de référence : l'ail se classe sur 5 g, pas sur 100 g
    score+=LVL[lv].poids*(e.q/(m.portion||100));
    pires.push({e,lv});
  });
  return {v:null,score,inconnus:inc,total:ents.length,pires};
}
// rapport fructose/glucose — on ne le calcule que sur les aliments qui ont RÉELLEMENT
// les deux valeurs. Un aliment non documenté est écarté du calcul et signalé, jamais
// compté comme zéro : sinon le rapport serait faux.
function ratioFG(ents){
  const util=ents.filter(e=>e.mac.fru!=null&&e.mac.glu!=null);
  const manquants=ents.length-util.length;
  if(!util.length)return {r:null,f:null,g:null,manquants,total:ents.length,cause:'aucune donnée'};
  const f=util.reduce((s,e)=>s+e.mac.fru,0), g=util.reduce((s,e)=>s+e.mac.glu,0);
  if(!g)return {r:null,f,g,manquants,total:ents.length,cause:'pas de glucose'};
  return {r:f/g,f,g,manquants,total:ents.length,cause:null};
}
function ratioFGStatus(ents){
  const o=ratioFG(ents), {r,f,g}=o;
  if(r===null)return Object.assign(o,{niv:0,col:'var(--text-dim)',
    txt:o.cause==='aucune donnée'?'donnée absente pour ces aliments':'pas de glucose mesuré sur ce repas'});
  if(r<=RATIO_FG_MAX)return Object.assign(o,{niv:1,col:'var(--success)',txt:'équilibré'});
  if(r<=1.5)         return Object.assign(o,{niv:2,col:'var(--warn)',txt:'fructose en excès'});
  return               Object.assign(o,{niv:3,col:'var(--danger)',txt:'fructose nettement en excès'});
}
// niveau 1/2/3 d'un nutriment SUR LE REPAS ENTIER — 0 si non évalué
function nivRepas(k,ents,cl){
  const x=NUTBY[k], d=DEF_FODMAP[k];
  if(d.info)return 0;
  const s=sumNut(ents,k);
  if(x.manuel){
    if(s.inconnus===s.total)return 0;
    return s.score>LVL_SEUIL_HAUT?3:(s.score>LVL_SEUIL_MOYEN?2:1);
  }
  const t=fodTarget(k,cl);
  if(!t||s.v===null)return 0;           // pas de seuil posé, ou aucune donnée → pas de jugement
  return s.v>t?3:(s.v>t/2?2:1);
}
// verdict du repas = le plus haut niveau atteint, rapport F/G inclus
function verdictRepas(ents,cl){
  const ks=NUT.filter(x=>x.grp==='fod'&&!DEF_FODMAP[x.k].info);
  let max=0,hauts=[],moyens=[],inc=0;
  ks.forEach(x=>{
    const n=nivRepas(x.k,ents,cl);
    if(n>max)max=n;
    if(n===3)hauts.push(x.n); else if(n===2)moyens.push(x.n);
  });
  const rs=ratioFGStatus(ents);
  if(rs.niv>max)max=rs.niv;
  if(rs.niv===3)hauts.push('rapport fructose/glucose'); else if(rs.niv===2)moyens.push('rapport fructose/glucose');
  NUT.filter(x=>x.manuel).forEach(x=>{inc+=sumNut(ents,x.k).inconnus;});
  return {niv:max,hauts,moyens,inconnus:inc};
}
function customToArr(c){const a=new Array(40).fill(0);a[0]=c.nom;a[1]=c.kcal;a[2]=c.p;a[3]=c.g;a[4]=c.l;a[5]=c.f;return a;}
function client(){return S.clients[curClient];}
function jourTypeFor(d,cl){cl=cl||client();const j=cl.jours[d];return (j&&cl.cibles[j])?j:'defaut';}
// filet de sécurité : si les cibles d'une cliente ne sont pas encore créées ou
// n'ont pas pu être chargées, on retombe sur les valeurs par défaut du coach
// plutôt que de laisser l'écran planter.
function ciblesVides(){
  const d=(S&&S.defaults)||{kcal:2000,p:140,g:190,l:65,f:30};
  return {kcal:d.kcal,p:d.p,g:d.g,l:d.l,f:d.f,repas:repas4(d.kcal,d.p,d.g,d.l,d.f),_provisoire:true};
}
function ciblesFor(d,cl){
  cl=cl||client();
  if(!cl) return ciblesVides();
  return cl.cibles[jourTypeFor(d,cl)] || cl.cibles.defaut || ciblesVides();
}
function microTarget(k,cl){cl=cl||client();return (cl.microOverrides&&cl.microOverrides[k]!==undefined)?cl.microOverrides[k]:S.defaults.micro[k];}
function isOverridden(k,cl){cl=cl||client();return cl.microOverrides&&cl.microOverrides[k]!==undefined;}
function entriesFor(d,cl){cl=cl||client();return cl.journal[d]||[];}
// totaux du jour + nombre d'aliments sans donnée par nutriment (pour ne pas afficher
// un déficit qui n'est qu'un trou dans la table)
function totalsFor(d,cl){
  const t={},manq={},ents=entriesFor(d,cl);
  NUT.forEach(n=>{t[n.k]=0;manq[n.k]=0;});
  ents.forEach(e=>NUT.forEach(n=>{const v=e.mac[n.k];if(v==null)manq[n.k]++;else t[n.k]+=v;}));
  t._manquants=manq; t._nbAliments=ents.length;
  return t;
}
function mealsFor(d,cl){
  cl=cl||client();
  const base=ciblesFor(d,cl).repas.map((r,i)=>({...r,idx:'c'+i,libre:false}));
  const extra=(cl.journal['_meals_'+d]||[]).map(m=>({nom:m.nom,kcal:0,p:0,g:0,l:0,f:0,idx:m.id,libre:true}));
  return base.concat(extra);
}

// ══ CLIENTE ══



// bloc FODMAP affiché DANS chaque repas — la tolérance se joue à la prise, pas sur la journée

// Carte repliée sous le repas : verdict seul. Le détail des six ne s'ouvre qu'au clic.







// ── micronutrition cliente ──
function nutStatus(k,val,cl){
  const d=DEF_MICRO[k]||{}, t=microTarget(k,cl), lim=d.lim, min=d.min;
  const pct=t?val/t*100:0;
  let col,txt;
  // « libre » : affiché sans jugement — ni cible à atteindre, ni plafond
  if(d.libre)return {t,pct,col:'var(--text)',txt:'information',libre:true};
  if(min!==undefined){ // fourchette : ni trop bas, ni trop haut
    if(val<min){ col='var(--warn)'; txt='sous la fourchette'; }
    else if(val<=t){ col='var(--success)'; txt='dans la fourchette'; }
    else { col='var(--warn)'; txt='au-dessus'; }
    return {t,min,pct,col,txt,range:true};
  }
  if(lim){ col = pct<=100?'var(--success)':(pct<=130?'var(--warn)':'var(--danger)');
           txt = pct<=100?'dans la limite':'au-dessus'; }
  else   { col = pct>=90?'var(--success)':(pct>=60?'var(--warn)':'var(--danger)');
           txt = pct>=90?'couvert':(pct>=60?'partiel':'faible'); }
  return {t,pct,col,txt,lim};
}








// ── recherche / ajout ──
// un aliment a-t-il ses sucres réellement mesurés dans la table ?
function sucresConnus(i){const a=ALIMENTS_BASE[i];return a[NUTBY.fru.i]!=null&&a[NUTBY.glu.i]!=null;}
// Aliments que la cliente enregistre le plus souvent, sur les 60 jours chargés.
// Calculé en mémoire : aucune requête supplémentaire.

function alimentVisible(i,clientId){
  const m=ALIM_META[i]; if(!m) return true;
  if(m.statut==='refuse') return false;
  if(m.statut==='en_attente') return m.propose_par===clientId;
  return true;
}
function estPerso(i){const m=ALIM_META[i];return m&&m.source==='perso';}
function enAttente(i){const m=ALIM_META[i];return m&&m.statut==='en_attente';}
















// ══ COACH ══




const FOD_NOTE='<div class="warn-box"><b>Aucun seuil n\'est posé par défaut, et c\'est volontaire.</b> Les seuils FODMAP publiés viennent de bases sous licence commerciale que je n\'ai pas pu vérifier. '
  +'Poser un chiffre non sourcé aurait donné une fausse impression de précision sur une question où la tolérance est de toute façon très individuelle. '
  +'Fructose, glucose, lactose et polyols sont donc affichés en grammes bruts issus de la table officielle, sans jugement.<br><br>'
  +'<b>Le seul indicateur évalué est le rapport fructose/glucose du repas</b>, avec une cible à 1 ou moins. Celui-là repose sur un mécanisme physiologique clair : '
  +'le glucose facilite l\'absorption intestinale du fructose, et c\'est l\'excès de fructose sur le glucose qui fermente, pas le fructose en valeur absolue.<br><br>'
  +'<b>Fructanes et GOS sont classés, pas mesurés</b> — faible, moyen ou haut, par toi, avec une portion de référence. Le niveau du repas combine ces classements en tenant compte des quantités. '
  +'Un aliment non classé reste « ? » et n\'est jamais compté comme zéro.<br><br>'
  +'Si tu as une raison de poser un seuil sur le lactose ou les polyols pour une cliente donnée — intolérance connue, protocole d\'éviction en cours — les deux champs ci-dessous te le permettent. '
  +'Laissés à zéro, ils n\'affichent aucun jugement.</div>';




const ANSES_NOTE='<div class="warn-box"><b>Référentiel PTC3, colonne femme, majoré pour la sportive.</b> '
  +'Huit nutriments sont relevés au-dessus de la RDA parce que le document documente explicitement un besoin sportif supérieur : '
  +'vitamine C, vitamine D, B12, calcium, fer, magnésium, zinc et sodium. Ils portent le tag orange « majoré sportive » — survole-le pour lire la justification.<br><br>'
  +'<b>Le sodium n\'est plus une limite mais une cible.</b> C\'est le changement le plus contre-intuitif du document : restreindre le sodium chez une sportive est plus risqué qu\'utile, '
  +'l\'optimum se situant entre 3 et 5 g par jour. Une séance de musculation en coûte déjà 1 à 2 g.<br><br>'
  +'Les points d\'attention sous certains nutriments signalent les situations où la valeur reste susceptible d\'être insuffisante. Ils sont visibles côté cliente aussi.</div>';

























// ── Reprendre un repas déjà enregistré un autre jour ──
let repriseMeal=null;












// aliments inscrits dans la table FODMAP : classés, ou explicitement ajoutés par le coach









// ══ utils ══
function dtEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function r1(n){return Math.round(n*10)/10;}
function fmt(n){if(n==null)return '—';if(n>=100)return String(Math.round(n));if(n>=10)return String(Math.round(n*10)/10);return String(Math.round(n*100)/100);}
function cap(s){return String(s).charAt(0).toUpperCase()+String(s).slice(1).replace(/_/g,' ');}
let toastT;
function dtToast(m){
  let t=document.getElementById('diete-toast');
  if(!t){
    t=document.createElement('div');
    t.id='diete-toast';
    t.style.cssText='position:fixed;bottom:26px;left:50%;transform:translateX(-50%) translateY(80px);'
      +'background:#111827;color:#fff;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:600;'
      +'z-index:9999;opacity:0;transition:.28s cubic-bezier(.4,0,.2,1);pointer-events:none;max-width:88vw;text-align:center';
    document.body.appendChild(t);
  }
  t.textContent=m;
  requestAnimationFrame(()=>{t.style.opacity='1';t.style.transform='translateX(-50%) translateY(0)';});
  clearTimeout(toastT);
  toastT=setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(-50%) translateY(80px)';},2200);
}


function renderAll(){renderCli();renderCoach();}


