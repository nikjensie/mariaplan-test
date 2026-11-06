# Upptäck Mariaplan – nytt förslag

Koncept för en ny version av [mariaplan.nu](https://mariaplan.nu), kvartersguiden för Mariaplan, Kungsladugård och Sandarna i Göteborg.

Statisk Astro-sida utan server. Den har en sökbar och filtrerbar lista, en interaktiv karta (Leaflet med OpenStreetMap/CARTO), hållplatser med linjer, Nu & då som tidslinje och ljust/mörkt läge.

## Kom igång

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # bygger till dist/
```

## Innehåll

Allt innehåll ligger i `src/data/`, ett ställe per rad:

- `places.json`: ställen. Fält: `id`, `name`, `cat`, `type`, `address`, `lat`, `lng` och `url` (valfri). Kategorier finns i `src/lib/cats.js`.
- `stops.json`: spårvagnshållplatser med linjer.
- `history.json`: Nu & då (`shops` med `from`/`to`) och byggår för husen (`houses`).

Ett ställe utan `lat`/`lng` visas i listan men inte på kartan.

## Miljövariabler (Vercel)

| Variabel | Vad den gör |
|---|---|
| `SITE_LOCK` | Sätt till `true` för att slå på lösenordsskyddet (Basic Auth i `middleware.js`). Av som standard, så att länken kan visas utan lösenord. Sidan har ändå noindex tills `SITE_PUBLIC` är `true`. |
| `SITE_PASSWORD` | Lösenordet som gäller när `SITE_LOCK=true`. Användarnamnet spelar ingen roll. |
| `SITE_PUBLIC` | Sätt till `true` vid lansering. Det tar bort lösenordet, noindex och konceptraden, och ger canonical och sitemap. |
| `SITE_URL` | Till exempel `https://mariaplan.nu`. Används för canonical, robots och sitemap. |

Ändra en variabel och gör sedan en **Redeploy**.

## Att stämma av med kunden

- **Innehållet är hämtat från mariaplan.nu i november 2026.** Kategorisidorna och WordPress-API:t gav 114 ställen. Sitemapen anger 123, så några kan saknas, bland annat dubbletter och ställen som bara finns i en annan kategori.
- **Mariaplans cykelservice** (Mariagatan 9) har inga koordinater i källan och syns inte på kartan.
- **Majornas blomsterhall** har sluggen `mariaplans-blomsterhall` på nuvarande sida. Vilket namn är rätt?
- **Godhemsgatan** finns två gånger som hållplats (linje 3 och linje 11). Det stämmer med källan, men bör kontrolleras.
- **Linjefärgerna** på brickorna (3, 9, 11) är valda för läsbarhet och är inte Västtrafiks officiella färger.
- **Nu & då** är ett urval av 26 butiker med årtal, plus byggår för några hus. Nuvarande sida har ~200 historiska poster, och de flesta saknar beskrivning. Ska allt med, och finns rätt att använda de historiska fotona (Göteborgs historiska museum m.fl.)?
- **Bilder** saknas med flit. Kundens bilder kan läggas in när vi har filerna och vet att vi får använda dem.
- **Kontakt:** knappen Skicka uppgifter pekar på nuvarande kontaktsida. Vilken e-postadress eller vilket formulär ska användas?
- **Logga:** ett enkelt husmärke används tills vidare. Byt till kundens logga om de vill behålla den.
- **Engelsk version** (/en/) finns på nuvarande sida men ingår inte i förslaget än.
- **Inloggning** för verksamheter (Login på nuvarande sida) ingår inte. Behövs det, eller räcker ett formulär?

## Gå live

1. Godkänn innehållet med kunden.
2. Ta skärmbild på alla DNS-poster (särskilt MX, SPF och DKIM) och sänk TTL.
3. Vercel → Settings → Domains: lägg till `mariaplan.nu` och `www.mariaplan.nu`. Låt den ena omdirigera till den andra.
4. Hos DNS-leverantören: ändra A för `@` och CNAME för `www` till de värden Vercel visar. Rör inte e-postposterna.
5. Sätt `SITE_PUBLIC=true` och `SITE_URL=https://mariaplan.nu` och gör en Redeploy.
6. Gamla adresser (/karta, /och-da, /kategori/… m.fl.) omdirigeras redan i `vercel.json`. Lägg till fler vid behov.
7. Kontrollera HTTPS på båda adresserna och lägg in sitemap i Search Console.
8. Säg upp WordPress-hostingen först efter en vecka, men inte domänen.
