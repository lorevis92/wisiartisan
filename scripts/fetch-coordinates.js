import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
const GOOGLE_KEY = env.GOOGLE_PLACES_KEY

async function getCoordsByPlaceId(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_KEY}`
  const response = await fetch(url)
  const data = await response.json()
  if (data.status !== 'OK' || !data.result?.geometry) return null
  return {
    lat: data.result.geometry.location.lat,
    lng: data.result.geometry.location.lng,
  }
}

async function getCoordsByAddress(name, city) {
  const query = encodeURIComponent(`${name} ${city} Valais Switzerland`)
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${GOOGLE_KEY}`
  const response = await fetch(url)
  const data = await response.json()
  if (data.status !== 'OK' || !data.results?.length) return null
  return {
    lat: data.results[0].geometry.location.lat,
    lng: data.results[0].geometry.location.lng,
  }
}

async function main() {
  console.log('Inizio fetch coordinate...')

  const { data: artisans } = await supabase
    .from('artisans')
    .select('id, name, city, google_place_id')
    .is('lat', null)

  console.log(`Artigiani senza coordinate: ${artisans.length}`)

  let success = 0
  let failed = 0

  for (const a of artisans) {
    let coords = null

    if (a.google_place_id) {
      coords = await getCoordsByPlaceId(a.google_place_id)
    }

    if (!coords) {
      coords = await getCoordsByAddress(a.name, a.city || 'Valais')
    }

    if (coords) {
      await supabase.from('artisans').update({ lat: coords.lat, lng: coords.lng }).eq('id', a.id)
      success++
      if (success % 20 === 0) console.log(`  ${success} coordinate aggiunte...`)
    } else {
      failed++
    }

    await new Promise(r => setTimeout(r, 150))
  }

  console.log(`Completato: ${success} coordinate aggiunte, ${failed} falliti`)
}

main()
