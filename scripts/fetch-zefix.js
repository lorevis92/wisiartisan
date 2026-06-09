import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
)

const credentials = Buffer.from(`${env.ZEFIX_USER}:${env.ZEFIX_PASS}`).toString('base64')
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

const SEARCHES = [
  { keyword: 'Sanitär', category: 'Idraulico / Sanitaire' },
  { keyword: 'Plomberie', category: 'Idraulico / Sanitaire' },
  { keyword: 'Plombier', category: 'Idraulico / Sanitaire' },
  { keyword: 'Elektro', category: 'Elettricista / Électricien' },
  { keyword: 'Électric', category: 'Elettricista / Électricien' },
  { keyword: 'Electric', category: 'Elettricista / Électricien' },
  { keyword: 'Heizung', category: 'Termoidraulico / Chauffage' },
  { keyword: 'Chauffage', category: 'Termoidraulico / Chauffage' },
  { keyword: 'Lüftung', category: 'Termoidraulico / Chauffage' },
  { keyword: 'Peinture', category: 'Pittore / Peintre' },
  { keyword: 'Malerei', category: 'Pittore / Peintre' },
  { keyword: 'Peintre', category: 'Pittore / Peintre' },
  { keyword: 'Menuiserie', category: 'Falegname / Menuisier' },
  { keyword: 'Schreinerei', category: 'Falegname / Menuisier' },
  { keyword: 'Charpente', category: 'Falegname / Menuisier' },
  { keyword: 'Toiture', category: 'Coperture / Toiture' },
  { keyword: 'Bedachung', category: 'Coperture / Toiture' },
  { keyword: 'Carrelage', category: 'Pavimentista / Carreleur' },
  { keyword: 'Bodenbelag', category: 'Pavimentista / Carreleur' },
  { keyword: 'Renovation', category: 'Riparazioni generali' },
  { keyword: 'Rénovation', category: 'Riparazioni generali' },
  { keyword: 'Handwerker', category: 'Tuttofare / Handwerker' },
  { keyword: 'Bauservice', category: 'Tuttofare / Handwerker' },
]

async function searchByKeyword(keyword, category) {
  const response = await fetch('https://www.zefix.admin.ch/ZefixPublicREST/api/v1/company/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`
    },
    body: JSON.stringify({
      canton: 'VS',
      activeOnly: true,
      name: keyword
    })
  })

  if (!response.ok) {
    const err = await response.text()
    console.error(`  Errore ${keyword}:`, response.status, err)
    return []
  }

  const list = await response.json()
  return list.map(c => ({
    name: c.name,
    category: category,
    city: c.legalSeat || null,
    canton: 'VS',
    zefix: true,
    google: false,
    rating: null,
    reviews: 0,
    phone: null,
    website: null,
    uid: c.uid || null,
    since: c.sogcDate ? c.sogcDate.substring(0, 4) : null,
  }))
}

async function main() {
  console.log('Inizio fetch Zefix — Canton VS...')

  const seen = new Set()
  let all = []

  for (const { keyword, category } of SEARCHES) {
    console.log(`Cercando: ${keyword}...`)
    const results = await searchByKeyword(keyword, category)

    let newCount = 0
    for (const r of results) {
      if (r.uid && !seen.has(r.uid)) {
        seen.add(r.uid)
        all.push(r)
        newCount++
      }
    }
    console.log(`  → ${results.length} trovate, ${newCount} nuove`)
    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`Totale aziende uniche: ${all.length}`)

  if (all.length === 0) {
    console.log('Nessuna azienda da inserire.')
    return
  }

  const { error } = await supabase.from('artisans').upsert(all, { onConflict: 'uid' })
  if (error) console.error('Errore Supabase:', error)
  else console.log('Inserimento completato!')
}

main()
