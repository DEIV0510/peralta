// Genera js/products.js desde master.json con curaduría de destacados/hero/categorías
const fs = require('fs');
const path = require('path');

const SCRATCH = __dirname;
const PROJECT = 'C:/Users/Lenovo/Desktop/PROYECTOS-CLAUDE/perfumes-peralta';
const master = JSON.parse(fs.readFileSync(path.join(SCRATCH, 'master.json'), 'utf8'));
const P = master.products;

const find = frag => P.find(p => p.image && p.name.toUpperCase().includes(frag));

// LOS FAVORITOS (referencias reconocidas del catálogo, 8)
const FEATURED = [
  'YARA CANDY', 'CLUB DE NUIT INTENSE', 'ASAD BOURBON', 'FAKHAR ROSE',
  '9 PM', 'ONE MILLION', 'INVICTUS', 'BLEU DE CHANEL',
];
let featOrder = 1;
for (const frag of FEATURED) {
  const p = find(frag);
  if (p) { p.feat = featOrder++; }
  else console.log('FEATURED NO ENCONTRADO:', frag);
}

// Héroe: 3 cutouts transparentes de colombia
const HERO = ['YARA CANDY', 'FAKHAR ROSE', 'CLUB DE NUIT INTENSE'];
HERO.forEach((frag, i) => {
  const p = P.find(x => x.source === 'colombia' && x.image && x.name.toUpperCase().includes(frag));
  if (p) p.hero = i + 1; else console.log('HERO NO ENCONTRADO:', frag);
});

// Imágenes para tarjetas de categoría (preferir cutouts de colombia)
const CATCARDS = {
  mujer: ['YARA ROSA', 'YARA MOI', 'FAKHAR ROSE'],
  hombre: ['ASAD NEGRO', '9 PM', 'CLUB DE NUIT'],
  arabe: ['KHAMRAH', 'AFEEF', 'ASAD ZANZIBAR'],
  disenador: ['ONE MILLION', 'INVICTUS', 'BLEU DE CHANEL'],
  vendidos: ['YARA CANDY'],
  novedades: ['ODYSSEY CANDEE', 'ODYSSEY MANDARIN SKY'],
};
const catImages = {};
for (const [k, frags] of Object.entries(CATCARDS)) {
  for (const f of frags) {
    const p = P.find(x => x.image && x.name.toUpperCase().includes(f) && (k === 'disenador' ? true : x.source === 'colombia'));
    if (p) { catImages[k] = { image: p.image, alt: p.name }; break; }
  }
  if (!catImages[k]) console.log('CATCARD SIN IMAGEN:', k);
}

// novedades: colección octubre 2025 (catálogo Capadocia)
P.forEach(p => { if (p.source === 'colombia') p.nuevo = true; });

// registro final limpio
const clean = P.map(p => ({
  id: p.id,
  name: p.name,
  brand: p.brand,
  gender: p.gender,           // 'mujer' | 'hombre' | 'unisex' | null
  category: p.category,       // 'arabe' | 'disenador'
  size: p.size,               // ml o null
  familyText: p.familyText,
  families: p.families,
  priceDetal: p.priceDetal,
  priceMayor: p.priceMayor,
  priceDistrib: p.priceDistrib,
  image: p.image,
  feat: p.feat || 0,
  hero: p.hero || 0,
  nuevo: !!p.nuevo,
  source: p.source,
}));

// orden base: destacados primero, luego con imagen+precio, alfabético
clean.sort((a, b) => (b.feat ? 1 : 0) - (a.feat ? 1 : 0) || a.name.localeCompare(b.name));

const banner = `// ============================================================
// CATÁLOGO #PERFUMES PERALTA — generado desde los catálogos PDF
// (Capadocia oct 2025, catálogo general, Le Perfum Sarae)
// ${clean.length} productos únicos. NO editar a mano salvo ajustes puntuales:
// los precios null se muestran como "Precio por consultar".
// ============================================================
`;
fs.writeFileSync(path.join(PROJECT, 'js', 'products.js'),
  banner +
  'window.PRODUCTS = ' + JSON.stringify(clean, null, 1) + ';\n' +
  'window.CAT_IMAGES = ' + JSON.stringify(catImages, null, 1) + ';\n',
  'utf8');

console.log('products.js:', clean.length, 'productos');
console.log('featured:', clean.filter(p => p.feat).map(p => p.name).join(' | '));
console.log('hero:', clean.filter(p => p.hero).sort((a, b) => a.hero - b.hero).map(p => p.name).join(' | '));
console.log('catImages:', JSON.stringify(catImages, null, 1));
