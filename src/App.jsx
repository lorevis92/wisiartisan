import { useEffect, useState, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './supabase.js';
import ArtisanPage from './ArtisanPage.jsx';
import { LangProvider, useLang, LangSwitcher } from './LangContext.jsx';

const VALAIS_CITIES = ['Sion', 'Sierre', 'Martigny', 'Brig', 'Visp', 'Monthey', 'Naters', 'Brig-Glis', 'Zermatt', 'Crans-Montana', 'Verbier', 'Saas-Fee', 'Leuk', 'Leukerbad', 'Gampel', 'Steg', 'Raron', 'Mörel', 'Fiesch', 'Münster', 'Ulrichen', 'Oberwald', 'Conthey', 'Vétroz', 'Ardon', 'Chamoson', 'Riddes', 'Saxon', 'Fully', 'Charrat', 'Saillon', 'Leytron', 'Isérables', 'Nendaz', 'Vex', 'Evolène', 'Hérémence', 'Saint-Martin', 'Grône', 'Chalais', 'Chippis', 'Salgesch', 'Venthône', 'Miège', 'Randogne', 'Lens', 'Icogne', 'Chermignon', 'Montana', 'Mollens', 'Ayent', 'Anzère', 'Arbaz', 'Savièse', 'Grimisuat', 'Salins', 'Bramois', 'Bagnes', 'Sembrancher', 'Orsières', 'Liddes', 'Bourg-Saint-Pierre', 'Troistorrents', 'Val-d\'Illiez', 'Champéry', 'Collombey-Muraz', 'Massongex', 'Saint-Maurice', 'Vérossaz', 'Dorénaz', 'Evionnaz', 'Miéville', 'Vernayaz', 'Salvan', 'Finhaut', 'Trient', 'Stalden', 'Staldenried', 'Saas-Grund', 'Saas-Almagell', 'Saas-Balen', 'Täsch', 'Randa', 'Sankt Niklaus', 'Baltschieder', 'Lalden', 'Eggerberg', 'Niedergesteln', 'Guttet-Feschel', 'Albinen', 'Inden', 'Varen', 'Erschmatt', 'Bratsch', 'Ergisch', 'Agarn', 'Turtmann', 'Eischoll', 'Unterbäch', 'Bürchen', 'Zeneggen', 'Törbel', 'Embd', 'Grächen', 'Saint-Luc', 'Chandolin', 'Grimentz', 'Zinal', 'Ayer', 'Vissoie', 'Vercorin', 'Réchy', 'Anniviers', 'Euseigne', 'Mase', 'Loèche', 'Loèche-les-Bains']

const T = {
  bg: '#FFFFFF', surface: '#F8F8F8', surfaceAlt: '#F0F0F0',
  border: '#E8E8E8', text: '#111111', textSecondary: '#666666',
  textMuted: '#AAAAAA', primary: '#E8352A',
  primaryLight: 'rgba(232,53,42,0.06)', primaryBorder: 'rgba(232,53,42,0.18)',
  green: '#00996A', yellow: '#B87000',
};

function getPhotoUrl(photoReference, maxWidth = 400) {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${import.meta.env.VITE_GOOGLE_KEY}`
}

function Card({ pro }) {
  const { t } = useLang()
  const firstPhoto = pro.photos && pro.photos.length > 0 ? pro.photos[0] : null
  const photoUrl = firstPhoto ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${firstPhoto}&key=${import.meta.env.VITE_GOOGLE_KEY}` : null
  const isHighlight = pro.zefix && pro.google

  return (
    <a href={`/artigiano/${pro.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 10 }}>
      <div style={{ background: '#FFFFFF', border: `1px solid ${isHighlight ? 'rgba(232,53,42,0.18)' : '#E8E8E8'}`, borderLeft: `3px solid ${isHighlight ? '#E8352A' : pro.zefix && !pro.google ? '#B87000' : '#E8E8E8'}`, borderRadius: 6, overflow: 'hidden', display: 'flex', minHeight: 110, transition: 'box-shadow 0.15s', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >
        {/* FOTO */}
        <div style={{ width: 130, flexShrink: 0, background: '#F0F0F0', position: 'relative', overflow: 'hidden' }}>
          {photoUrl
            ? <img src={photoUrl} alt={pro.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F0F0F0', gap: 4 }}>
                <div style={{ fontSize: 22 }}>
                  {pro.category.includes('Idraulico') ? '🚿' :
                   pro.category.includes('Elettricista') ? '⚡' :
                   pro.category.includes('Pittore') ? '🎨' :
                   pro.category.includes('Falegname') ? '🪵' :
                   pro.category.includes('Termoidraulico') ? '🔥' :
                   pro.category.includes('Muratore') ? '🧱' :
                   pro.category.includes('Coperture') ? '🏠' :
                   pro.category.includes('Pavimentista') ? '🪟' :
                   pro.category.includes('Fabbro') ? '🔑' :
                   pro.category.includes('Tuttofare') ? '🔧' : '🏗️'}
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#AAAAAA', fontFamily: 'Syne, sans-serif', textAlign: 'center', padding: '0 4px' }}>{t('noPhoto')}</div>
              </div>
          }
        </div>

        {/* CONTENUTO */}
        <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#111111', marginBottom: 2, lineHeight: 1.3 }}>{pro.name}</div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', color: '#AAAAAA', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>{pro.category} · {pro.city}</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {pro.zefix && <span style={{ background: '#F0FAF5', color: '#00996A', fontSize: 9, fontWeight: 700, letterSpacing: '1px', padding: '2px 7px', borderRadius: 3, border: '1px solid rgba(0,153,106,0.2)', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>{t('verifiedCH')}</span>}
              {!pro.zefix && <span style={{ background: '#F8F8F8', color: '#AAAAAA', fontSize: 9, fontWeight: 700, letterSpacing: '1px', padding: '2px 7px', borderRadius: 3, border: '1px solid #E8E8E8', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>{t('notVerified')}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <div style={{ fontSize: 11, color: '#666666', fontFamily: 'DM Mono, monospace' }}>
              {pro.phone || ''}
            </div>
            {pro.rating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#B87000', fontSize: 12, letterSpacing: 1 }}>{'★'.repeat(Math.round(pro.rating))}{'☆'.repeat(5 - Math.round(pro.rating))}</span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#AAAAAA' }}>{pro.rating.toFixed(1)} · {pro.reviews} {t('reviews')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </a>
  )
}

function MapView({ artisans }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!mapRef.current || !window.google) return

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 46.2044, lng: 7.3600 },
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy',
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER,
        },
      })
    }

    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    const bounds = new window.google.maps.LatLngBounds()
    let hasPoints = false

    artisans.forEach(a => {
      if (!a.lat || !a.lng) return
      const color = a.zefix && a.google ? '#E8352A' : a.zefix && !a.google ? '#B87000' : '#666666'
      const marker = new window.google.maps.Marker({
        position: { lat: a.lat, lng: a.lng },
        map: mapInstanceRef.current,
        title: a.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 1.5,
        }
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style='font-family:sans-serif;padding:4px 2px;min-width:160px'>
          <div style='font-weight:700;font-size:13px;margin-bottom:3px'>${a.name}</div>
          <div style='font-size:11px;color:#666;margin-bottom:3px'>${a.category} · ${a.city || ''}</div>
          ${a.rating ? `<div style='font-size:11px;color:#B87000'>${'★'.repeat(Math.round(a.rating))} ${a.rating.toFixed(1)}</div>` : ''}
          ${a.phone ? `<div style='font-size:11px;margin-top:3px'>${a.phone}</div>` : ''}
        </div>`
      })

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker)
      })

      markersRef.current.push(marker)
      bounds.extend({ lat: a.lat, lng: a.lng })
      hasPoints = true
    })

    if (hasPoints) {
      mapInstanceRef.current.fitBounds(bounds, { padding: 40 })
    }
  }, [artisans])

  return <div ref={mapRef} style={{ width: '100%', height: 'calc(100vh - 52px)' }} />
}

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function Directory({ initialTab = 'lista' }) {
  const { t } = useLang()
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('__all__');
  const [city, setCity] = useState('__all__');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [userLocation, setUserLocation] = useState(null);
  const [maxDistance, setMaxDistance] = useState(30);
  const [locating, setLocating] = useState(false);

  function locateMe() {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        alert(t('locationError'))
        setLocating(false)
      }
    )
  }

  useEffect(() => {
    (async () => {
      const { data: rows } = await supabase.from('artisans').select('*');
      if (rows) setData(rows);
      setLoading(false);
    })();
  }, []);

  const CATEGORIES = [...new Set(data.map(d => d.category))];
  const CITIES = [...VALAIS_CITIES.filter(c => data.some(d => d.city && d.city.toLowerCase().includes(c.toLowerCase()))).sort()];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: 'Syne, sans-serif' }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: T.primary, textTransform: 'uppercase' }}>WiSiArtisan</div>
      <div style={{ fontSize: 13, color: T.textMuted, letterSpacing: '1px' }}>{t('loading')}</div>
    </div>
  );

  const SYNONYMS = {
    'idraulico': ['sanitaire', 'sanitär', 'plombier', 'plomberie', 'idraulica'],
    'elettricista': ['électricien', 'electricien', 'elektro', 'électricité', 'electricite'],
    'falegname': ['menuiserie', 'menuisier', 'schreinerei', 'schreiner', 'charpente', 'charpentier'],
    'pittore': ['peinture', 'peintre', 'malerei', 'maler'],
    'termoidraulico': ['chauffage', 'heizung', 'lüftung', 'sanitaire'],
    'muratore': ['maçon', 'maconnerie', 'maurerei', 'maurer'],
    'coperture': ['toiture', 'bedachung', 'couvreur', 'tetto'],
    'pavimenti': ['carrelage', 'carreleur', 'bodenbelag', 'parquet'],
    'fabbro': ['serrurier', 'schlosserei'],
    'intonacatore': ['plâtrier', 'platrerie', 'gipser', 'gipserei'],
    'tuttofare': ['handwerker', 'handwerkerei', 'renovation', 'rénovation'],
    'riparazioni': ['renovation', 'rénovation', 'reparatur'],
    'carpenter': ['menuiserie', 'schreinerei', 'charpente'],
    'plumber': ['sanitaire', 'plomberie', 'sanitär'],
    'electrician': ['électricien', 'elektro'],
    'painter': ['peinture', 'malerei'],
  }

  const filtered = data.filter(p => {
    const words = search.toLowerCase().split(/\s+/).filter(w => w.length > 0)
    const mS = words.length === 0 || words.every(word => {
      const synonyms = SYNONYMS[word] || []
      const allTerms = [word, ...synonyms]
      return allTerms.some(term =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.city && p.city.toLowerCase().includes(term))
      )
    })
    const mC = category === '__all__' || p.category === category;
    const mCi = city === '__all__' || p.city === city;
    const mDist = !userLocation || !p.lat || !p.lng ? true :
      getDistanceKm(userLocation.lat, userLocation.lng, p.lat, p.lng) <= maxDistance;
    return mS && mC && mCi && mDist;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', fontFamily: 'Syne, sans-serif', paddingBottom: 0, display: 'flex', flexDirection: 'column' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: T.bg, borderBottom: '1px solid #E8E8E8', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, height: 52 }}>
        <button style={{ border: '1px solid #E8E8E8', borderRadius: 3, padding: '7px 10px', background: 'transparent', cursor: 'pointer', color: T.textSecondary }}>☰</button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src='/logo-wisi.png' alt='WisiFix' style={{ height: 28 }} />
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '1px', color: '#E8352A', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase' }}>FIX</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setActiveTab('lista')} style={{ background: activeTab === 'lista' ? '#E8352A' : '#F8F8F8', border: '1px solid #E8E8E8', borderRadius: 3, padding: '5px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: activeTab === 'lista' ? '#fff' : '#666', cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}>{t('navValais')}</button>
          <button onClick={() => setActiveTab('mappa')} style={{ background: activeTab === 'mappa' ? '#E8352A' : '#F8F8F8', border: '1px solid #E8E8E8', borderRadius: 3, padding: '5px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: activeTab === 'mappa' ? '#fff' : '#666', cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}>{t('navMap')}</button>
        </div>
        <LangSwitcher />
      </nav>
      <div style={{ flex: 1 }}>
      {activeTab === 'lista' && <div>

      {/* HERO */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '48px 20px 80px', minHeight: 320 }}>
        <img src='/hero.png' alt='WisiFix' style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 100%)' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '3px', color: '#AAAAAA', textTransform: 'uppercase', marginBottom: 14, fontFamily: 'Syne, sans-serif' }}>WisiFix · Canton Valais</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 400, color: '#FFFFFF', lineHeight: 1.25, margin: '0 0 10px' }}>
            Il professionista <span style={{ background: '#E8352A', color: '#fff', padding: '0 8px' }}>verificato</span><br />proprio dove ti serve
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0, fontFamily: 'Syne, sans-serif' }}>Idraulici, elettricisti, falegnami e altri professionisti del Vallese — verificati nel Registro Commerciale Svizzero</p>
        </div>
      </div>

      {/* SEARCH CARD sovrapposta */}
      <div style={{ maxWidth: 640, margin: '-48px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        <div style={{ background: '#FFFFFF', border: `1px solid ${T.border}`, borderRadius: 6, padding: '18px 18px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
          <input type='text' placeholder={t('searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 3, border: '1px solid #E8E8E8', fontSize: 14, fontFamily: 'Syne, sans-serif', color: '#111111', background: '#FFFFFF', outline: 'none', marginBottom: 10, boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor='#E8352A'} onBlur={e => e.target.style.borderColor='#E8E8E8'} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 1, minWidth: 140, padding: '8px 10px', borderRadius: 3, border: '1px solid #E8E8E8', fontSize: 11, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: T.textSecondary, background: T.bg, outline: 'none' }}>
              <option value='__all__'>{t('allCategories')}</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={city} onChange={e => setCity(e.target.value)} style={{ flex: 1, minWidth: 140, padding: '8px 10px', borderRadius: 3, border: '1px solid #E8E8E8', fontSize: 11, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: T.textSecondary, background: T.bg, outline: 'none' }}>
              <option value='__all__'>{t('allCities')}</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={locateMe} style={{ background: T.primary, color: '#fff', border: 'none', borderRadius: 3, padding: '8px 14px', fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Syne, sans-serif', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {locating ? t('locating') : userLocation ? t('locationActive') : t('nearMe')}
            </button>
          </div>
          {userLocation && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <input type='range' min={1} max={100} value={maxDistance} onChange={e => setMaxDistance(Number(e.target.value))} style={{ flex: 1, accentColor: T.primary }} />
              <input type='number' min={1} max={100} value={maxDistance} onChange={e => setMaxDistance(Number(e.target.value))} style={{ width: 52, padding: '5px 8px', borderRadius: 3, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: 'DM Mono, monospace', color: T.text, background: T.bg, outline: 'none', textAlign: 'center' }} />
              <span style={{ fontSize: 11, color: T.textMuted, fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>{t('km')}</span>
              <button onClick={() => setUserLocation(null)} style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 3, padding: '5px 8px', fontSize: 10, color: T.textMuted, cursor: 'pointer', fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>✕</button>
            </div>
          )}
        </div>
      </div>

      {/* CONTATORE */}
      <div style={{ maxWidth: 640, margin: '14px auto 0', padding: '0 16px', fontSize: 11, color: T.textMuted, fontFamily: 'Syne, sans-serif', letterSpacing: '0.5px' }}>
        {filtered.length} {t('resultsFound')}
      </div>

      {/* LISTA */}
      <div style={{ maxWidth: 640, margin: '8px auto 0', padding: '0 16px' }}>
        {filtered.length === 0
          ? <div style={{ textAlign: 'center', color: T.textMuted, padding: '40px 0', fontSize: 13 }}>{t('noResults')}</div>
          : filtered.map(p => <Card key={p.id} pro={p} />)
        }
      </div>

      {/* LEGENDA */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ marginTop: 20, padding: '14px 16px', background: T.surface, border: '1px solid #E8E8E8', borderRadius: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: T.textSecondary, marginBottom: 8 }}>{t('legend')}</div>
          <div style={{ fontSize: 11, color: T.textSecondary, lineHeight: 2 }}>
            <span style={{ display: 'inline-block', background: '#F0FAF5', color: '#00996A', fontSize: 9, fontWeight: 700, letterSpacing: '1px', padding: '2px 7px', borderRadius: 3, border: '1px solid rgba(0,153,106,0.2)', textTransform: 'uppercase', marginRight: 6 }}>✓ Zefix CH</span>{t('legendZefix')}<br />
            <span style={{ display: 'inline-block', background: '#F8F8F8', color: '#AAAAAA', fontSize: 9, fontWeight: 700, letterSpacing: '1px', padding: '2px 7px', borderRadius: 3, border: '1px solid #E8E8E8', textTransform: 'uppercase', marginRight: 6 }}>—</span>{t('legendUnverified')}
          </div>
        </div>
        <div style={{ marginTop: 12, marginBottom: 24, textAlign: 'center', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase' }}>{t('dataMock')}</div>
      </div>

      </div>}
      {activeTab === 'mappa' && <MapView artisans={filtered} />}
      </div>
      <div style={{ borderTop: '1px solid #E8E8E8', background: '#F8F8F8', padding: '20px', marginTop: 'auto' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#666666', fontFamily: 'Syne, sans-serif' }}>
            Part of the
            <img src='/logo-wisiverse.png' alt='WiSiVERSE' style={{ height: 20, verticalAlign: 'middle' }} />
            ecosystem
          </div>
          <a href='https://wisiverse.com' style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#E8352A', textDecoration: 'none', fontFamily: 'Syne, sans-serif' }}>wisiverse.com →</a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <Routes>
        <Route path='/' element={<Directory />} />
        <Route path='/mappa' element={<Directory initialTab='mappa' />} />
        <Route path='/artigiano/:id' element={<ArtisanPage />} />
      </Routes>
    </LangProvider>
  )
}
