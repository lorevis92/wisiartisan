import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
const GOOGLE_KEY = env.GOOGLE_PLACES_KEY

async function searchGooglePlaces(name, city) {
  const query = encodeURIComponent(`${name} ${city} Valais Switzerland`)
  const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=name,rating,user_ratings_total,place_id&key=${GOOGLE_KEY}`

  const findResponse = await fetch(findUrl)
  const findData = await findResponse.json()

  if (findData.status !== 'OK' || !findData.candidates?.length) return null

  const candidate = findData.candidates[0]
  const placeId = candidate.place_id

  const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website,reviews,url,photos&key=${GOOGLE_KEY}`

  const detailResponse = await fetch(detailUrl)
  const detailData = await detailResponse.json()

  const details = detailData.result || {}

  const phone = details.formatted_phone_number || null
  const isSwissPhone = !phone || phone.replace(/\s/g, '').match(/^(\+41|0041|027|024|026|028|079|078|077|076|075)/)
  if (!isSwissPhone) return null

  return {
    rating: candidate.rating || null,
    user_ratings_total: candidate.user_ratings_total || 0,
    formatted_phone_number: phone,
    website: details.website || null,
    google_place_id: placeId,
    google_reviews_data: details.reviews || null,
    photos: details.photos ? details.photos.slice(0, 5).map(p => p.photo_reference) : null,
  }
}

async function main() {
  console.log('Inizio arricchimento con Google Places...')

  const { data: artisans, error } = await supabase
    .from('artisans')
    .select('id, name, city')
    .eq('zefix', true)

  if (error) {
    console.error('Errore Supabase:', error)
    return
  }

  console.log(`Artigiani da processare: ${artisans.length}`)

  let enriched = 0
  let notFound = 0

  for (const artisan of artisans) {
    const place = await searchGooglePlaces(artisan.name, artisan.city || 'Valais')

    if (place) {
      const update = {
        google: true,
        rating: place.rating || null,
        reviews: place.user_ratings_total || 0,
        phone: place.formatted_phone_number || null,
        website: place.website || null,
        google_place_id: place.google_place_id,
        google_reviews_data: place.google_reviews_data,
        photos: place.photos || null,
      }

      const { error: updateError } = await supabase
        .from('artisans')
        .update(update)
        .eq('id', artisan.id)

      if (updateError) console.error(`Errore update ${artisan.name}:`, updateError)
      else {
        enriched++
        console.log(`✓ ${artisan.name} — rating: ${place.rating || 'n/a'}, tel: ${place.formatted_phone_number || 'n/a'}`)
      }
    } else {
      notFound++
      console.log(`✗ ${artisan.name} — non trovato su Google`)
    }

    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\nCompletato: ${enriched} arricchiti, ${notFound} non trovati`)
}

main()
