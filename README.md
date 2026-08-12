# #PERFUMES PERALTA — Tienda online

Landing page / tienda profesional de perfumería, orientada a conversión por WhatsApp.
**301 productos reales** extraídos de los 3 catálogos PDF (Capadocia oct 2025, catálogo
general de diseñador y Le Perfum Sarae), con buscador, filtros, fichas de producto y
compra al por mayor.

## Cómo ejecutar

```bash
node serve.js
```

Abre **http://localhost:5250**. No requiere dependencias.

## ⚙️ Configurar tus datos (IMPORTANTE)

Edita **`js/config.js`**:

| Campo | Ejemplo | Qué hace |
|---|---|---|
| `WHATSAPP_NUMBER` | `"573001112233"` | Todos los botones de WhatsApp escriben a este número. Mientras esté vacío, WhatsApp abre con el mensaje listo y el cliente elige el contacto. |
| `INSTAGRAM_URL` | `"https://instagram.com/…"` | Muestra la tarjeta y el ícono de Instagram. |
| `FACEBOOK_URL` | `"https://facebook.com/…"` | Ídem Facebook. |
| `CITY` / `ADDRESS` | `"Bogotá"` / `"Cra 0 # 00-00"` | Tarjeta de ubicación en Contacto. |

Ningún dato de contacto viene inventado: los campos vacíos simplemente no se muestran.

## Estructura

```
index.html          Página principal (todas las secciones)
privacidad.html     Política de privacidad (plantilla editable)
terminos.html       Términos y condiciones (plantilla editable)
css/styles.css      Sistema de diseño (rosa/magenta + dorado + champagne)
js/config.js        ← TUS DATOS AQUÍ
js/products.js      Catálogo (301 productos generados desde los PDF)
js/app.js           Lógica: buscador, filtros, modal, WhatsApp
img/brand/          Logo oficial procesado (webp, favicon, OG)
img/products/       301 fotos de producto (WebP, recortadas de los catálogos)
serve.js            Servidor estático local (puerto 5250)
```

## Editar el catálogo

`js/products.js` es generado, pero se puede retocar a mano:

- `priceDetal / priceMayor / priceDistrib`: en COP, `null` = "Precio por consultar".
- `gender`: `"mujer" | "hombre" | "unisex" | null` (null se muestra sin género).
- `feat`: número 1-8 = aparece en "Los favoritos" (orden ascendente).
- `families`: familias olfativas para los filtros (solo las de los catálogos).

## Notas de datos

- Los precios provienen **únicamente** del catálogo Capadocia (octubre 2025, perfumes
  árabes): Detal / Mayor (≥4 unid. surtidas) / Distribuidor (≥9 unid. surtidas).
- Los catálogos de diseñador no traen precios → se muestra "Precio por consultar".
- Los géneros/familias vienen de los catálogos; para referencias árabes muy conocidas
  (Yara, Asad, 9 PM…) se usó la clasificación pública estándar de la marca.
- 2 referencias quedaron sin marca identificada (Stallion 53, Liquid Brun) y se
  muestran sin línea de marca.
