import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
const GOOGLE_KEY = env.GOOGLE_PLACES_KEY

const VALAIS_CITIES = ['Sion', 'Sierre', 'Martigny', 'Brig', 'Visp', 'Monthey', 'Naters', 'Brig-Glis', 'Zermatt', 'Crans-Montana', 'Verbier', 'Saas-Fee', 'Leuk', 'Leukerbad', 'Gampel', 'Steg', 'Raron', 'Mörel', 'Fiesch', 'Münster', 'Ulrichen', 'Oberwald', 'Conthey', 'Vétroz', 'Ardon', 'Chamoson', 'Riddes', 'Saxon', 'Fully', 'Charrat', 'Saillon', 'Leytron', 'Isérables', 'Nendaz', 'Vex', 'Evolène', 'Hérémence', 'Saint-Martin', 'Grône', 'Chalais', 'Chippis', 'Salgesch', 'Venthône', 'Miège', 'Randogne', 'Lens', 'Icogne', 'Chermignon', 'Montana', 'Mollens', 'Ayent', 'Anzère', 'Arbaz', 'Savièse', 'Grimisuat', 'Salins', 'Bramois', 'Bagnes', 'Sembrancher', 'Orsières', 'Liddes', 'Bourg-Saint-Pierre', 'Troistorrents', 'Val-d\'Illiez', 'Champéry', 'Collombey-Muraz', 'Massongex', 'Saint-Maurice', 'Vérossaz', 'Dorénaz', 'Evionnaz', 'Miéville', 'Vernayaz', 'Salvan', 'Finhaut', 'Trient', 'Stalden', 'Staldenried', 'Saas-Grund', 'Saas-Almagell', 'Saas-Balen', 'Täsch', 'Randa', 'Sankt Niklaus', 'Baltschieder', 'Lalden', 'Eggerberg', 'Niedergesteln', 'Guttet-Feschel', 'Albinen', 'Inden', 'Varen', 'Erschmatt', 'Bratsch', 'Ergisch', 'Agarn', 'Turtmann', 'Eischoll', 'Unterbäch', 'Bürchen', 'Zeneggen', 'Törbel', 'Embd', 'Grächen', 'Saint-Luc', 'Chandolin', 'Grimentz', 'Zinal', 'Ayer', 'Vissoie', 'Vercorin', 'Réchy', 'Anniviers', 'Euseigne', 'Mase', 'Loèche', 'Loèche-les-Bains']

const SEARCHES = [
  { query: 'idraulico Valais', category: 'Idraulico / Sanitaire' },
  { query: 'plombier Valais', category: 'Idraulico / Sanitaire' },
  { query: 'sanitaire Valais', category: 'Idraulico / Sanitaire' },
  { query: 'électricien Valais', category: 'Elettricista / Électricien' },
  { query: 'elektriker Wallis', category: 'Elettricista / Électricien' },
  { query: 'chauffagiste Valais', category: 'Termoidraulico / Chauffage' },
  { query: 'heizung Wallis', category: 'Termoidraulico / Chauffage' },
  { query: 'peintre Valais', category: 'Pittore / Peintre' },
  { query: 'maler Wallis', category: 'Pittore / Peintre' },
  { query: 'menuisier Valais', category: 'Falegname / Menuisier' },
  { query: 'schreiner Wallis', category: 'Falegname / Menuisier' },
  { query: 'toiture Valais', category: 'Coperture / Toiture' },
  { query: 'carreleur Valais', category: 'Pavimentista / Carreleur' },
  { query: 'renovation Valais', category: 'Riparazioni generali' },
  { query: 'handwerker Wallis', category: 'Tuttofare / Handwerker' },
  { query: 'maçon Valais', category: 'Muratore / Maçon' },
  { query: 'serrurier Valais', category: 'Fabbro / Serrurier' },
  { query: 'plâtrier Valais', category: 'Intonacatore / Plâtrier' },
  { query: 'peintre Zermatt', category: 'Pittore / Peintre' },
  { query: 'maler Zermatt', category: 'Pittore / Peintre' },
  { query: 'électricien Zermatt', category: 'Elettricista / Électricien' },
  { query: 'elektriker Zermatt', category: 'Elettricista / Électricien' },
  { query: 'plombier Zermatt', category: 'Idraulico / Sanitaire' },
  { query: 'sanitaire Zermatt', category: 'Idraulico / Sanitaire' },
  { query: 'renovation Zermatt', category: 'Riparazioni generali' },
  { query: 'handwerker Zermatt', category: 'Tuttofare / Handwerker' },
  { query: 'peintre Verbier', category: 'Pittore / Peintre' },
  { query: 'peintre Crans-Montana', category: 'Pittore / Peintre' },
  { query: 'peintre Saas-Fee', category: 'Pittore / Peintre' },
  { query: 'handwerker Saas-Fee', category: 'Tuttofare / Handwerker' },
  { query: 'renovation Verbier', category: 'Riparazioni generali' },
  { query: 'electricien Crans-Montana', category: 'Elettricista / Électricien' },
]

async function searchGooglePlaces(query) {
  const encoded = encodeURIComponent(query)
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encoded}&locationrestriction=rectangle:45.8,6.8|46.7,8.5&key=${GOOGLE_KEY}`

  const response = await fetch(url)
  const data = await response.json()

  if (data.status !== 'OK') return []
  return data.results || []
}

async function getDetails(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_phone_number,website,rating,user_ratings_total,reviews,formatted_address&key=${GOOGLE_KEY}`
  const response = await fetch(url)
  const data = await response.json()
  return data.result || null
}

async function main() {
  console.log('Inizio fetch Google-only businesses...')

  const { data: existing } = await supabase.from('artisans').select('google_place_id').not('google_place_id', 'is', null)
  const existingPlaceIds = new Set(existing.map(r => r.google_place_id))
  console.log(`Place IDs già in DB: ${existingPlaceIds.size}`)

  const seen = new Set(existingPlaceIds)
  let added = 0

  for (const { query, category } of SEARCHES) {
    console.log(`Cercando: ${query}...`)
    const results = await searchGooglePlaces(query)
    console.log(`  → ${results.length} risultati`)

    for (const place of results) {
      if (seen.has(place.place_id)) continue
      seen.add(place.place_id)

      const details = await getDetails(place.place_id)
      if (!details) continue

      const phone = details.formatted_phone_number || null
      const isSwissPhone = !phone || phone.replace(/\s/g, '').match(/^(\+41|0041|027|024|026|028|079|078|077|076|075)/)
      if (phone && !isSwissPhone) {
        console.log(`  ✗ ${place.name} — numero non svizzero, skip`)
        continue
      }

      let city = null
      if (details.formatted_address) {
        const parts = details.formatted_address.split(',')
        const cityPart = parts.find(p => /\d{4}/.test(p))
        if (cityPart) {
          city = cityPart.replace(/\d{4}/, '').trim()
        } else {
          city = parts[0].trim()
        }
      }

      const isValais = VALAIS_CITIES.some(c => city && city.toLowerCase().includes(c.toLowerCase()))
      if (!isValais) {
        console.log(`  ✗ ${details.name || place.name} — città ${city} non è nel Vallese, skip`)
        continue
      }

      const artisan = {
        name: details.name || place.name,
        category: category,
        city: city,
        canton: 'VS',
        zefix: false,
        google: true,
        rating: details.rating || null,
        reviews: details.user_ratings_total || 0,
        phone: phone,
        website: details.website || null,
        uid: null,
        since: null,
        google_place_id: place.place_id,
        google_reviews_data: details.reviews || null,
      }

      const { error } = await supabase.from('artisans').insert(artisan)
      if (error) {
        console.log(`  ✗ ${artisan.name} — errore: ${error.message}`)
      } else {
        added++
        console.log(`  ✓ ${artisan.name} — rating: ${artisan.rating || 'n/a'}, tel: ${artisan.phone || 'n/a'}`)
      }

      await new Promise(r => setTimeout(r, 200))
    }

    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`\nCompletato: ${added} nuove aziende Google-only aggiunte`)
}

main()
