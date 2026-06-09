import { useEffect, useState, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './supabase.js';
import ArtisanPage from './ArtisanPage.jsx';

const VALAIS_CITIES = ['Sion', 'Sierre', 'Martigny', 'Brig', 'Visp', 'Monthey', 'Naters', 'Brig-Glis', 'Zermatt', 'Crans-Montana', 'Verbier', 'Saas-Fee', 'Leuk', 'Leukerbad', 'Gampel', 'Steg', 'Raron', 'Mörel', 'Fiesch', 'Münster', 'Ulrichen', 'Oberwald', 'Conthey', 'Vétroz', 'Ardon', 'Chamoson', 'Riddes', 'Saxon', 'Fully', 'Charrat', 'Saillon', 'Leytron', 'Isérables', 'Nendaz', 'Vex', 'Evolène', 'Hérémence', 'Saint-Martin', 'Grône', 'Chalais', 'Chippis', 'Salgesch', 'Venthône', 'Miège', 'Randogne', 'Lens', 'Icogne', 'Chermignon', 'Montana', 'Mollens', 'Ayent', 'Anzère', 'Arbaz', 'Savièse', 'Grimisuat', 'Salins', 'Bramois', 'Bagnes', 'Sembrancher', 'Orsières', 'Liddes', 'Bourg-Saint-Pierre', 'Troistorrents', 'Val-d\'Illiez', 'Champéry', 'Collombey-Muraz', 'Massongex', 'Saint-Maurice', 'Vérossaz', 'Dorénaz', 'Evionnaz', 'Miéville', 'Vernayaz', 'Salvan', 'Finhaut', 'Trient', 'Stalden', 'Staldenried', 'Saas-Grund', 'Saas-Almagell', 'Saas-Balen', 'Täsch', 'Randa', 'Sankt Niklaus', 'Baltschieder', 'Lalden', 'Eggerberg', 'Niedergesteln', 'Guttet-Feschel', 'Albinen', 'Inden', 'Varen', 'Erschmatt', 'Bratsch', 'Ergisch', 'Agarn', 'Turtmann', 'Eischoll', 'Unterbäch', 'Bürchen', 'Zeneggen', 'Törbel', 'Embd', 'Grächen', 'Saint-Luc', 'Chandolin', 'Grimentz', 'Zinal', 'Ayer', 'Vissoie', 'Vercorin', 'Réchy', 'Anniviers', 'Euseigne', 'Mase', 'Loèche', 'Loèche-les-Bains']

const T = {
  bg: '#FFFFFF', surface: '#F8F8F8', surfaceAlt: '#F0F0F0',
  border: '#E8E8E8', text: '#111111', textSecondary: '#666666',
  textMuted: '#AAAAAA', primary: '#E8352A',
  primaryLight: 'rgba(232,53,42,0.06)', primaryBorder: 'rgba(232,53,42,0.18)',
  green: '#00996A', yellow: '#B87000',
};

function stars(r) {
  let s = '';
  for (let i = 1; i <= 5; i++) s += i <= Math.round(r) ? '★' : '☆';
  return s;
}

function BadgeZefix() {
  return <span style={{ background: T.text, color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '1.2px', padding: '2px 7px', borderRadius: 3, textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>✓ Zefix CH</span>;
}
function BadgeGoogle() {
  return <span style={{ background: T.surfaceAlt, color: T.textSecondary, fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', padding: '2px 7px', borderRadius: 3, border: `1px solid ${T.border}`, textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>Google</span>;
}
function BadgeInvisible() {
  return <span style={{ background: '#FFF8E6', color: T.yellow, fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', padding: '2px 7px', borderRadius: 3, border: `1px solid rgba(184,112,0,0.25)`, textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>◎ Solo offline</span>;
}
function BadgeUnverified() {
  return <span style={{ background: T.surface, color: T.textSecondary, fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', padding: '2px 7px', borderRadius: 3, border: `1px solid ${T.border}`, textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>⚠ Non verificato CH</span>;
}

function getPhotoUrl(photoReference, maxWidth = 400) {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=AIzaSyAsPSA5TM1Wis0-qJUp5cuEbLQ_zMkpyic`
}

function Card({ pro }) {
  const [expanded, setExpanded] = useState(false);
  const isHighlight = pro.zefix && pro.google;
  return (
    <div onClick={() => setExpanded(!expanded)} style={{ background: T.bg, border: `1px solid ${isHighlight ? T.primaryBorder : T.border}`, borderLeft: `3px solid ${isHighlight ? T.primary : pro.zefix && !pro.google ? T.yellow : T.border}`, borderRadius: 6, padding: '16px 18px', cursor: 'pointer', marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: T.text, marginBottom: 3 }}>{pro.name}</div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>{pro.category} · {pro.city}</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {pro.zefix && <BadgeZefix />}
            {pro.google && <BadgeGoogle />}
            {pro.zefix && !pro.google && <BadgeInvisible />}
            {!pro.zefix && pro.google && <BadgeUnverified />}
          </div>
        </div>
        {pro.google && pro.rating && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ color: T.yellow, fontSize: 13, letterSpacing: 1 }}>{stars(pro.rating)}</div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: T.textMuted, marginTop: 2 }}>{pro.rating.toFixed(1)} · {pro.reviews} recensioni</div>
          </div>
        )}
      </div>
      {expanded && (
        <div onClick={e => e.stopPropagation()} style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 12, color: T.textSecondary, fontFamily: 'Syne, sans-serif' }}>
          {pro.photos && pro.photos.length > 0 && (
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 8, borderBottom: `1px solid ${T.border}` }}>
              {pro.photos.map((ref, i) => (
                <img key={i} src={getPhotoUrl(ref)} alt={pro.name}
                  style={{ height: 120, width: 160, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
              ))}
            </div>
          )}
          {pro.lat && pro.lng && (
            <div style={{ gridColumn: '1/-1', marginBottom: 8 }}>
              <iframe
                title={pro.name}
                width='100%'
                height='160'
                style={{ border: 'none', borderRadius: 4 }}
                loading='lazy'
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAsPSA5TM1Wis0-qJUp5cuEbLQ_zMkpyic&q=${pro.lat},${pro.lng}&zoom=15`}
              />
            </div>
          )}
          <div><span style={{ color: T.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>UID</span><br /><span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: T.primary }}>{pro.uid || '—'}</span></div>
          <div><span style={{ color: T.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Dal</span><br /><span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{pro.since || '—'}</span></div>
          <div><span style={{ color: T.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Tel.</span><br /><span onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(pro.phone); e.target.textContent = 'Copiato!'; setTimeout(() => { e.target.textContent = pro.phone }, 1500) }} style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, cursor: 'pointer', color: T.text }} title='Clicca per copiare'>{pro.phone}</span></div>
          <div><span style={{ color: T.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Web</span><br />{pro.website ? <a href={pro.website.startsWith('http') ? pro.website : `https://${pro.website}`} target='_blank' rel='noopener noreferrer' onClick={e => e.stopPropagation()} style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: T.primary, textDecoration: 'none', wordBreak: 'break-all' }}>{pro.website}</a> : <span style={{ fontSize: 11, color: T.textMuted, fontStyle: 'italic' }}>Nessun sito web</span>}</div>
          {pro.since && (
            <div style={{ gridColumn: '1/-1', marginBottom: 4 }}>
              <span style={{ background: T.primaryLight, border: `1px solid ${T.primaryBorder}`, borderRadius: 3, padding: '3px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: T.primary, fontFamily: 'Syne, sans-serif' }}>
                Attivo dal {pro.since}
              </span>
            </div>
          )}
          {pro.google_reviews_data && pro.google_reviews_data.length > 0 && (
            <div style={{ gridColumn: '1/-1', marginTop: 8, borderTop: `1px solid ${T.border}`, paddingTop: 12, maxHeight: 320, overflowY: 'auto' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: T.textMuted, marginBottom: 8 }}>Recensioni Google</div>
              {[...pro.google_reviews_data].sort((a, b) => b.time - a.time).map((review, i) => (
                <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < 2 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.text, fontFamily: 'Syne, sans-serif' }}>{review.author_name}</span>
                    <span style={{ color: T.yellow, fontSize: 11, letterSpacing: 1 }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  </div>
                  {review.text && <div style={{ fontSize: 11, color: T.textSecondary, lineHeight: 1.5, fontFamily: 'Syne, sans-serif' }}>{review.text}</div>}
                  <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3, fontFamily: 'DM Mono, monospace' }}>{review.relative_time_description}</div>
                </div>
              ))}
            </div>
          )}
          {pro.zefix && !pro.google && <div style={{ gridColumn: '1/-1', marginTop: 4 }}><span style={{ background: 'rgba(184,112,0,0.08)', color: T.yellow, fontSize: 11, padding: '5px 10px', borderRadius: 3, border: '1px solid rgba(184,112,0,0.2)', display: 'block', fontFamily: 'Syne, sans-serif' }}>⚡ Opportunità: nessuna presenza online — iscrizione gratuita disponibile</span></div>}
          {!pro.zefix && pro.google && <div style={{ gridColumn: '1/-1', marginTop: 4 }}><span style={{ background: T.surface, color: T.textSecondary, fontSize: 11, padding: '5px 10px', borderRadius: 3, border: `1px solid ${T.border}`, display: 'block', fontFamily: 'Syne, sans-serif' }}>⚠ Non trovato nel Registro Commerciale svizzero — verifica consigliata</span></div>}
          <div style={{ gridColumn: '1/-1', marginTop: 8 }}>
            <a href={`/artigiano/${pro.id}`} style={{ display: 'inline-block', background: T.primary, color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '7px 14px', borderRadius: 3, textDecoration: 'none', fontFamily: 'Syne, sans-serif' }} onClick={e => e.stopPropagation()}>Vedi profilo completo →</a>
          </div>
        </div>
      )}
    </div>
  );
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
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tutte');
  const [city, setCity] = useState('Tutte');
  const [filter, setFilter] = useState('tutti');
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
        alert('Impossibile ottenere la posizione')
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

  const CATEGORIES = ['Tutte', ...new Set(data.map(d => d.category))];
  const CITIES = ['Tutte', ...VALAIS_CITIES.filter(c => data.some(d => d.city && d.city.toLowerCase().includes(c.toLowerCase()))).sort()];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: 'Syne, sans-serif' }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: T.primary, textTransform: 'uppercase' }}>WiSiArtisan</div>
      <div style={{ fontSize: 13, color: T.textMuted, letterSpacing: '1px' }}>Caricamento…</div>
    </div>
  );

  const filtered = data.filter(p => {
    const mS = p.name.toLowerCase().includes(search.toLowerCase());
    const mC = category === 'Tutte' || p.category === category;
    const mCi = city === 'Tutte' || p.city === city;
    const mF = filter === 'tutti' ||
      (filter === 'verificati' && p.zefix && p.google) ||
      (filter === 'invisibili' && p.zefix && !p.google) ||
      (filter === 'nonverificati' && !p.zefix && p.google);
    const mDist = !userLocation || !p.lat || !p.lng ? true :
      getDistanceKm(userLocation.lat, userLocation.lng, p.lat, p.lng) <= maxDistance;
    return mS && mC && mCi && mF && mDist;
  });

  const stats = {
    total: data.length,
    zefix: data.filter(p => p.zefix).length,
    invisible: data.filter(p => p.zefix && !p.google).length,
    unverified: data.filter(p => !p.zefix && p.google).length,
  };

  const PILLS = [
    { key: 'tutti', label: 'Tutti' },
    { key: 'verificati', label: '✓ Zefix + Google' },
    { key: 'invisibili', label: '◎ Solo offline' },
    { key: 'nonverificati', label: '⚠ Non verificati' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: 'Syne, sans-serif', paddingBottom: 40 }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: T.bg, borderBottom: '1px solid #E8E8E8', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, height: 52 }}>
        <button style={{ border: '1px solid #E8E8E8', borderRadius: 3, padding: '7px 10px', background: 'transparent', cursor: 'pointer', color: T.textSecondary }}>☰</button>
        <span onClick={() => navigate('/')} style={{ flex: 1, fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: T.primary, textTransform: 'uppercase', cursor: 'pointer' }}>WiSiArtisan</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setActiveTab('lista')} style={{ background: activeTab === 'lista' ? '#E8352A' : '#F8F8F8', border: '1px solid #E8E8E8', borderRadius: 3, padding: '5px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: activeTab === 'lista' ? '#fff' : '#666', cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}>Vallese</button>
          <button onClick={() => setActiveTab('mappa')} style={{ background: activeTab === 'mappa' ? '#E8352A' : '#F8F8F8', border: '1px solid #E8E8E8', borderRadius: 3, padding: '5px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: activeTab === 'mappa' ? '#fff' : '#666', cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}>Mappa</button>
        </div>
      </nav>
      {activeTab === 'lista' && <div>
      <div style={{ background: T.text, padding: '32px 20px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '3px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 10 }}>Prototipo · Canton Vallese</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 400, color: T.bg, lineHeight: 1.2, marginBottom: 8 }}>Artigiani verificati<br />nel Registro Commerciale</h1>
          <p style={{ fontSize: 12, color: T.textMuted, letterSpacing: '0.3px', margin: 0 }}>Zefix CH · Google Places · Canton Valais</p>
        </div>
      </div>
      <div style={{ background: T.surface, borderBottom: '1px solid #E8E8E8', padding: '14px 20px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex' }}>
          {[
            { label: 'Totale', value: stats.total, color: T.text, key: 'tutti' },
            { label: '✓ Zefix', value: stats.zefix, color: T.text, key: 'verificati' },
            { label: 'Solo offline', value: stats.invisible, color: T.yellow, key: 'invisibili' },
            { label: '⚠ Non verif.', value: stats.unverified, color: T.textSecondary, key: 'nonverificati' },
          ].map(s => (
            <div key={s.key} onClick={() => setFilter(s.key)} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 20, fontWeight: 500, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: T.textMuted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px 20px 0' }}>
        <input type='text' placeholder='Cerca per nome…' value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 3, border: '1px solid #E8E8E8', fontSize: 13, fontFamily: 'Syne, sans-serif', color: T.text, background: T.bg, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 1, padding: '8px 10px', borderRadius: 3, border: '1px solid #E8E8E8', fontSize: 11, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: T.textSecondary, background: T.bg, outline: 'none' }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={city} onChange={e => setCity(e.target.value)} style={{ flex: 1, padding: '8px 10px', borderRadius: 3, border: '1px solid #E8E8E8', fontSize: 11, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: T.textSecondary, background: T.bg, outline: 'none' }}>
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {PILLS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: '5px 13px', borderRadius: 3, border: filter === f.key ? 'none' : '1px solid #E8E8E8', background: filter === f.key ? T.primary : T.surface, color: filter === f.key ? '#fff' : T.textSecondary, fontSize: 10, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>{f.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 14px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4 }}>
          <button onClick={locateMe} style={{ background: userLocation ? T.primary : T.text, color: '#fff', border: 'none', borderRadius: 3, padding: '6px 12px', fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>
            {locating ? '...' : userLocation ? '📍 Posizione attiva' : '📍 Vicino a me'}
          </button>
          {userLocation && (
            <>
              <input
                type='range'
                min={1}
                max={100}
                value={maxDistance}
                onChange={e => setMaxDistance(Number(e.target.value))}
                style={{ flex: 1, accentColor: T.primary }}
              />
              <input
                type='number'
                min={1}
                max={100}
                value={maxDistance}
                onChange={e => setMaxDistance(Number(e.target.value))}
                style={{ width: 52, padding: '5px 8px', borderRadius: 3, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: 'DM Mono, monospace', color: T.text, background: T.bg, outline: 'none', textAlign: 'center' }}
              />
              <span style={{ fontSize: 11, color: T.textMuted, fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>km</span>
              <button onClick={() => setUserLocation(null)} style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 3, padding: '5px 8px', fontSize: 10, color: T.textMuted, cursor: 'pointer', fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>✕</button>
            </>
          )}
        </div>
        <div>{filtered.length === 0 ? <div style={{ textAlign: 'center', color: T.textMuted, padding: '40px 0', fontSize: 13 }}>Nessun risultato trovato</div> : filtered.map(p => <Card key={p.id} pro={p} />)}</div>
        <div style={{ marginTop: 20, padding: '14px 16px', background: T.surface, border: '1px solid #E8E8E8', borderRadius: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: T.textSecondary, marginBottom: 8 }}>Legenda</div>
          <div style={{ fontSize: 11, color: T.textSecondary, lineHeight: 2 }}>
            <span style={{ display: 'inline-block', background: T.text, color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '1px', padding: '2px 7px', borderRadius: 3, textTransform: 'uppercase', marginRight: 6 }}>✓ Zefix CH</span>Iscritto al Registro Commerciale svizzero<br />
            <span style={{ display: 'inline-block', background: T.surfaceAlt, color: T.textSecondary, fontSize: 9, fontWeight: 700, letterSpacing: '1px', padding: '2px 7px', borderRadius: 3, border: '1px solid #E8E8E8', textTransform: 'uppercase', marginRight: 6 }}>Google</span>Presente su Google Maps / Business<br />
            <span style={{ display: 'inline-block', background: '#FFF8E6', color: T.yellow, fontSize: 9, fontWeight: 700, letterSpacing: '1px', padding: '2px 7px', borderRadius: 3, border: '1px solid rgba(184,112,0,0.2)', textTransform: 'uppercase', marginRight: 6 }}>◎ Solo offline</span>Zefix ma nessuna presenza digitale<br />
            <span style={{ display: 'inline-block', background: T.surface, color: T.textSecondary, fontSize: 9, fontWeight: 700, letterSpacing: '1px', padding: '2px 7px', borderRadius: 3, border: '1px solid #E8E8E8', textTransform: 'uppercase', marginRight: 6 }}>⚠ Non verificato</span>Su Google, non trovato in Zefix
          </div>
        </div>
        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase' }}>Dati mock — Prototipo concettuale · Zefix.admin.ch + Google Places</div>
      </div>
      </div>}
      {activeTab === 'mappa' && <MapView artisans={filtered} />}
      <div style={{ borderTop: '1px solid #E8E8E8', background: T.surface, padding: 20, marginTop: 40 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, background: T.primary, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>W</span>
            </div>
            <span style={{ fontSize: 11, color: T.textSecondary }}>Part of the WiSiVERSE ecosystem</span>
          </div>
          <a href='https://wisiverse.com' style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: T.primary, textDecoration: 'none' }}>wisiverse.com →</a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<Directory />} />
      <Route path='/mappa' element={<Directory initialTab='mappa' />} />
      <Route path='/artigiano/:id' element={<ArtisanPage />} />
    </Routes>
  )
}
