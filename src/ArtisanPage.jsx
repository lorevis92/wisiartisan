import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabase.js'
import { useLang, LangSwitcher } from './LangContext.jsx'

const T = {
  bg: '#FFFFFF', surface: '#F8F8F8', surfaceAlt: '#F0F0F0',
  border: '#E8E8E8', text: '#111111', textSecondary: '#666666',
  textMuted: '#AAAAAA', primary: '#E8352A',
  primaryLight: 'rgba(232,53,42,0.06)', primaryBorder: 'rgba(232,53,42,0.18)',
  green: '#00996A', yellow: '#B87000',
}

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_KEY

function getPhotoUrl(ref) {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${ref}&key=${GOOGLE_KEY}`
}

function stars(r) {
  let s = ''
  for (let i = 1; i <= 5; i++) s += i <= Math.round(r) ? '★' : '☆'
  return s
}

export default function ArtisanPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLang()
  const [pro, setPro] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('artisans').select('*').eq('id', id).single()
      setPro(data)
      setLoading(false)
    }
    fetch()
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '3px', color: T.textMuted, textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>{t('loading')}</div>
    </div>
  )

  if (!pro) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 13, color: T.textMuted, fontFamily: 'Syne, sans-serif' }}>{t('artisanNotFound')}</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', fontFamily: 'Syne, sans-serif', paddingBottom: 0, display: 'flex', flexDirection: 'column' }}>

      {/* NAVBAR */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: T.bg, borderBottom: `1px solid ${T.border}`, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, height: 52 }}>
        <button onClick={() => navigate(-1)} style={{ border: `1px solid ${T.border}`, borderRadius: 3, padding: '7px 10px', background: 'transparent', cursor: 'pointer', color: T.textSecondary, fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 700 }}>{t('back')}</button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src='/logo-wisi.png' alt='WisiFix' style={{ height: 28 }} />
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '1px', color: '#E8352A', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase' }}>FIX</span>
        </div>
        <LangSwitcher />
      </nav>
      <div style={{ flex: 1 }}>

      {/* FOTO */}
      {pro.photos && pro.photos.length > 0 && (
        <div style={{ position: 'relative', background: T.text, overflow: 'hidden' }}>
          <img src={getPhotoUrl(pro.photos[activePhoto])} alt={pro.name}
            style={{ width: '100%', height: 240, objectFit: 'cover', opacity: 0.85 }} />
          {pro.photos.length > 1 && (
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
              {pro.photos.map((_, i) => (
                <div key={i} onClick={() => setActivePhoto(i)}
                  style={{ width: 8, height: 8, borderRadius: '50%', background: i === activePhoto ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer' }} />
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 20px 0' }}>

        {/* HEADER */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 400, color: T.text, marginBottom: 6, lineHeight: 1.2 }}>{pro.name}</h1>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 10 }}>{pro.category} · {pro.city}</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
            {pro.zefix && <span style={{ background: '#F0FAF5', color: T.green, fontSize: 9, fontWeight: 700, letterSpacing: '1px', padding: '2px 7px', borderRadius: 3, border: '1px solid rgba(0,153,106,0.2)', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>{t('verifiedCH')}</span>}
            {!pro.zefix && <span style={{ background: T.surface, color: T.textMuted, fontSize: 9, fontWeight: 700, letterSpacing: '1px', padding: '2px 7px', borderRadius: 3, border: `1px solid ${T.border}`, textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>{t('notVerified')}</span>}
          </div>
          {pro.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: T.yellow, fontSize: 16, letterSpacing: 1 }}>{stars(pro.rating)}</span>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: T.text }}>{pro.rating.toFixed(1)}</span>
              <span style={{ fontSize: 12, color: T.textMuted }}>{pro.reviews} {t('reviewsCount')}</span>
            </div>
          )}
        </div>

        {/* INFO */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: '16px 18px', marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
            {pro.uid && <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: T.textMuted, marginBottom: 3 }}>{t('uid')}</div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: T.primary }}>{pro.uid}</div>
            </div>}
            {pro.since && <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: T.textMuted, marginBottom: 3 }}>{t('activeSince')}</div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: T.text }}>{pro.since}</div>
            </div>}
            {pro.phone && <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: T.textMuted, marginBottom: 3 }}>{t('phone')}</div>
              <div onClick={() => { navigator.clipboard.writeText(pro.phone) }}
                style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: T.text, cursor: 'pointer' }} title='Click to copy'>{pro.phone}</div>
            </div>}
            {pro.website && <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: T.textMuted, marginBottom: 3 }}>{t('website')}</div>
              <a href={pro.website.startsWith('http') ? pro.website : `https://${pro.website}`}
                target='_blank' rel='noopener noreferrer'
                style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: T.primary, textDecoration: 'none', wordBreak: 'break-all' }}>{pro.website}</a>
            </div>}
          </div>
        </div>

        {/* MAPPA */}
        {pro.lat && pro.lng && (
          <div style={{ marginBottom: 16, borderRadius: 6, overflow: 'hidden', border: `1px solid ${T.border}` }}>
            <iframe title={pro.name} width='100%' height='200' style={{ border: 'none', display: 'block' }} loading='lazy'
              src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_KEY}&q=${pro.lat},${pro.lng}&zoom=15`} />
          </div>
        )}

        {/* RECENSIONI */}
        {pro.google_reviews_data && pro.google_reviews_data.length > 0 && (
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: '16px 18px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: T.textMuted, marginBottom: 12 }}>{t('googleReviews')}</div>
            {[...pro.google_reviews_data].sort((a, b) => b.time - a.time).map((review, i) => (
              <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < pro.google_reviews_data.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{review.author_name}</span>
                  <span style={{ color: T.yellow, fontSize: 12, letterSpacing: 1 }}>{stars(review.rating)}</span>
                </div>
                {review.text && <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6 }}>{review.text}</div>}
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4, fontFamily: 'DM Mono, monospace' }}>{review.relative_time_description}</div>
              </div>
            ))}
          </div>
        )}

      </div>
      </div>

      {/* FOOTER */}
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
  )
}
