import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://apiekiiatmchftgqopze.supabase.co',
  'sb_publishable_xHIaSvu3S1ymYfoN6tCphw_lxu5PPI_'
)

const data = [
  { name:'Sanitär Zenhäusern GmbH', category:'Idraulico / Sanitaire', city:'Naters', canton:'VS', zefix:true, google:true, rating:4.2, reviews:18, phone:'+41 27 923 45 67', website:'zenhaeusern-sanitaer.ch', uid:'CHE-112.345.678', since:'2008' },
  { name:'Électricité Bonnard Sàrl', category:'Elettricista / Électricien', city:'Sion', canton:'VS', zefix:true, google:true, rating:3.8, reviews:6, phone:'+41 27 456 78 90', website:null, uid:'CHE-234.567.890', since:'2015' },
  { name:'Imhof Heizung & Lüftung AG', category:'Termoidraulico / Chauffage', city:'Visp', canton:'VS', zefix:true, google:false, rating:null, reviews:0, phone:'+41 27 789 01 23', website:null, uid:'CHE-345.678.901', since:'1999' },
  { name:'Réparations Kuonen', category:'Riparazioni generali', city:'Brig', canton:'VS', zefix:true, google:false, rating:null, reviews:0, phone:'+41 79 234 56 78', website:null, uid:'CHE-456.789.012', since:'2019' },
  { name:'Pedretti Peinture & Rénovation', category:'Pittore / Peintre', city:'Martigny', canton:'VS', zefix:true, google:true, rating:4.8, reviews:41, phone:'+41 27 567 89 01', website:'pedretti-peinture.ch', uid:'CHE-567.890.123', since:'2011' },
  { name:'Alpenservice Müller', category:'Tuttofare / Handwerker', city:'Zermatt', canton:'VS', zefix:true, google:false, rating:null, reviews:0, phone:'+41 79 876 54 32', website:null, uid:'CHE-678.901.234', since:'2021' },
  { name:'Plomberie Tornay', category:'Idraulico / Sanitaire', city:'Martigny', canton:'VS', zefix:false, google:true, rating:4.5, reviews:23, phone:'+41 79 111 22 33', website:null, uid:null, since:null },
  { name:'Électro Sarbach', category:'Elettricista / Électricien', city:'Naters', canton:'VS', zefix:false, google:true, rating:3.9, reviews:8, phone:'+41 79 444 55 66', website:'electro-sarbach.ch', uid:null, since:null },
  { name:'Handyman Valais', category:'Tuttofare / Handwerker', city:'Sion', canton:'VS', zefix:false, google:true, rating:4.1, reviews:14, phone:'+41 79 777 88 99', website:null, uid:null, since:null },
]

const { error } = await supabase.from('artisans').insert(data)
if (error) console.error(error)
else console.log('Seed completato — 9 artigiani inseriti')
