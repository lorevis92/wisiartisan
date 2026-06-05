import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map(s => s.trim()))
)
const ZEFIX_USER = env.ZEFIX_USER
const ZEFIX_PASS = env.ZEFIX_PASS
const credentials = Buffer.from(`${ZEFIX_USER}:${ZEFIX_PASS}`).toString('base64')
console.log('Auth header:', `Basic ${credentials.substring(0, 20)}...`)

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const NOGA_CODES = ['4321', '4322', '4329', '4331', '4332', '4333', '4334', '4339', '4391', '4399']

function mapCategory(nogaCode) {
  const map = {
    '4321': 'Elettricista / Électricien',
    '4322': 'Termoidraulico / Chauffage',
    '4329': 'Installatore / Installateur',
    '4331': 'Intonacatore / Plâtrier',
    '4332': 'Falegname / Menuisier',
    '4333': 'Pavimentista / Parqueteur',
    '4334': 'Pittore / Peintre',
    '4339': 'Rifinitura / Finition',
    '4391': 'Coperture / Toiture',
    '4399': 'Tuttofare / Handwerker',
  }
  return map[nogaCode] || 'Altro'
}

async function fetchByNoga(nogaCode) {
  const response = await fetch('https://www.zefix.admin.ch/ZefixPublicREST/api/v1/company/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`
    },
    body: JSON.stringify({
      canton: 'VS',
      activeOnly: true,
      nogaCode: nogaCode,
      maxEntries: 500
    })
  })
  if (!response.ok) {
    console.error(`Errore NOGA ${nogaCode}:`, response.status)
    return []
  }
  const data = await response.json()
  return data.list || []
}

async function main() {
  console.log('Inizio fetch Zefix — Canton VS...')
  let all = []
  for (const noga of NOGA_CODES) {
    console.log(`Fetching NOGA ${noga}...`)
    const companies = await fetchByNoga(noga)
    console.log(`  → ${companies.length} aziende trovate`)
    const mapped = companies.map(c => ({
      name: c.name,
      category: mapCategory(noga),
      city: c.town || null,
      canton: 'VS',
      zefix: true,
      google: false,
      rating: null,
      reviews: 0,
      phone: null,
      website: null,
      uid: c.uid ? `CHE-${String(c.uid.uidOrganisationId).replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3')}` : null,
      since: c.registrationDate ? c.registrationDate.substring(0, 4) : null,
    }))
    all = [...all, ...mapped]
    await new Promise(r => setTimeout(r, 500))
  }
  console.log(`Totale aziende: ${all.length}`)
  const { error } = await supabase.from('artisans').upsert(all, { onConflict: 'uid' })
  if (error) console.error('Errore Supabase:', error)
  else console.log('Inserimento completato!')
}

main()
