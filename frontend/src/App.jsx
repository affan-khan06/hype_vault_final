import { useMemo, useEffect, useState } from 'react'
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from 'framer-motion'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Flame,
  Heart,
  Lock,
  MapPin,
  Menu,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Truck,
  Trash2,
  UserPlus,
  Wallet,
  X,
  Building,
} from 'lucide-react'
import html2pdf from 'html2pdf.js'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import heroVault from './assets/hero.png'
import './styles/ui-evolution.css'
import { useAuth } from './context/AuthContext'
import { UserProfileMenu } from './components/UserProfile'
import { PaymentMethodSelector, PaymentForm } from './components/PaymentMethod'
import apiClient from './utils/apiClient'
import {
  fetchSneakers,
  fetchSneakerDetail,
  loginUser,
  registerUser,
  fetchCurrentUser,
  refreshToken as refreshAuthToken,
  fetchCart,
  addCartItem as addCartItemApi,
  updateCartItem as updateCartItemApi,
  removeCartItem as removeCartItemApi,
  placeOrder as placeOrderApi,
  logoutUser as logoutUserApi,
} from './api.js'

const DEFAULT_PALETTE = ['#f8fafc', '#a1a1aa', '#18181b']
const SNEAKER_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=85',
]

// Centralized sneaker image config for curated visuals
const SNEAKER_IMAGES = {
  // Nike
  'Air Jordan 1 High OG Lost & Found': '/pics/jordan-1-squad-on-instagram-lost-and-founds-all-day-today-tag-me-in-your-photos-djamesandrew-.jpg',
  'Jordan 4 Military Black': '/pics/download.jpg',
  'Nike Dunk Low Panda': '/pics/download-1-.jpg',
  'Nike Air Yeezy 2 Solar Red': '/pics/nike-air-yeezy-2-red-october.jpg',
  'Nike Air Max 1 Patta Monarch': '/pics/nike-air-max-1-patta-waves-monarch-w-bracelet-men-s-size-8-dh1348-001.jpg',
  'Nike Air Fear of God 1 Triple Black': '/pics/nike-air-fear-of-god-1-triple-black.-jerry-lorenzo-s-tenth-release-of-fog-1-silhouette.-ar4237-005-nike-nikeair-fog',
  'Jordan 3 A Ma Maniere': '/pics/air-jordan-3-retro-a-ma-maniere-40.jpg',
  'Jordan 4 Retro Bred Reimagined': '/pics/red-motorsports.jpg',
  'Nike SB Dunk Low Ben & Jerry Chunky Dunky': '/pics/nike-sb-dunk-low-ben-jerry-s-chunky-sneakers.jpg',
  'Nike Air Max 97 Silver Bullet': '/pics/nike-air-max-97-og-silver-bullet-2022-.jpg',
  'Nike Air Jordan 11 Retro Concord': '/pics/a-couple-shots-of-my-small-jordan-11-collection-before-the-new-columbia-11s-retro-again-on-december-14th-this-saturday-who-else-is-getting-a-pair-of-those-.jpg',
  'Nike Dunk Low Off-White Lot 50': '/pics/nike-dunk-low-x-off-white-lot-29-of-50-sail-neutral-gray-2024.jpg',
  'Nike Kobe 6 Protro Grinch': '/pics/nike-kobe-6-grinch-429659-701.jpg',
  'Jordan 1 Retro High Travis Scott Mocha': '/pics/nike-air-jordan-1-1-.jpg',
  'Off-White x Nike Air Presto': '/pics/nike-x-off-white-poster-spoof-nike-air-presto-nick-arley.jpg',
  'Jordan 1 Satin Bred': '/pics/air-jordan-1-retro-og-2023-high-satin-bred-black-red-white-size-10w-8-5-men.jpg',

  // Adidas
  'Yeezy Boost 350 V2 Zebra': '/pics/adidas-originals-yeezy-boost-350-v2-white-core-black-red.jpg',
  'Yeezy Boost 350 V2 Onyx': '/pics/adidas-yeezy-boost-350-v2-onyx-us4.jpg',
  'Adidas Samba OG Cloud White': '/pics/now-available-adidas-samba-og-cloud-white-.jpg',
  'Adidas Campus 00s Core Black': '/pics/adidas-originals-campus-00s-core-black-ftw-white-trainers-mens-shoes-.jpg',
  'Yeezy Foam Runner Ararat': '/pics/adidas-yeezy-foam-runner.jpg',
  'Adidas UltraBoost 1.0 Cream': '/pics/adidas-ultraboost-shoes-adidas-canada.jpg',
  'Adidas NMD Hu Pharrell Core Black': '/pics/adidas-shoes-adidas-hu-nmd-s1-ryat-size-5-men-6-woman-human-race-pharrell-color-black-size-5.jpg',
  'Adidas Gazelle Indoor Blue Bird': '/pics/adidas-gazelle-indoor-originals-casual-shoes-mens-12-blue-bird-gum-h06260-nby.jpg',
  'Adidas Forum Low Bad Bunny Back To School': '/pics/size-7-5-adidas-forum-bad-bunny-low-black-2021-back-to-school-buckle.jpg',
  'Adidas Spezial Handball': '/pics/download-2-.jpg',
  'Adidas Superstar Prada Re-Nylon': '/pics/prada-x-adidas-superstar-sneakers.jpg',
  'Adidas Yeezy Boost 700 Wave Runner': '/pics/adidas-yeezy-boost-700-wave-runner-b75571.jpg',

  // Luxury & Others
  'Dior B22 Reflective Silver': '/pics/dior-b22-sneakers.jpg',
  'Dior B30 Technical Mesh Silver': '/pics/sneaker-b30-countdown-mesh-tecnico-grigio-scuro-e-tessuto-tecnico-metallizzato-color-argento.jpg',
  'Louis Vuitton LV Trainer Denim Monogram Eclipse': '/pics/louis-vuitton-lv-trainers-monogram-denim-blue-.jpg',
  'Balenciaga Track.2 Black Mesh': '/pics/balenciaga-ayakkab-track-2-bej-60-indirim-outlet-brand-store.jpg',
  'Prada America Cup Patent Black': '/pics/prada-america-s-cup-low-top-sneakers-black.jpg',
  'Gucci Rhyton Logo Leather Sneaker': '/pics/gucci-cream-leather-logo-print-rhyton-sneakers-size-37-5.jpg',
  'Puma MB.01 Iridescent Black': '/pics/puma-mb-01-iridescent-dreams-black-lamelo-ball-men-s-basketball-shoe-376678-02.jpg',
  'Puma Suede VTG Black Frost': '/pics/suede-xl-sneakers-puma.jpg',
  'Puma Clyde OG Silver Foil': '/pics/puma-bella-ut-silver-.jpg',
  'Converse Run Star Legacy CX Noir': '/pics/converse-run-star-legacy-cx-high-black-.jpg',
  'Converse Chuck 70 CDG Play Black': '/pics/converse-chuck-70-high-comme-des-gar-ons-cdg-play-white-black-shoes-uk-12.jpg',
}


function normalizeSize(size) {
  if (!size) return null
  if (typeof size === 'string') return { size_label: size }
  return {
    ...size,
    size_label:
      size.size_label ||
      (size.uk_size ? `UK ${size.uk_size}` : '') ||
      (size.us_size ? `US ${size.us_size}` : '') ||
      size.label ||
      'UK 9',
  }
}

function getSneakerImage(sneaker) {
  if (!sneaker) return SNEAKER_PLACEHOLDERS[0]

  // 1. Check curated mapping first
  const name = (sneaker.name || '').trim()
  const curated = SNEAKER_IMAGES[name]
  if (curated) return curated

  // 2. Check existing image_path/image/imageUrl
  const source = sneaker.image_path || sneaker.image || sneaker.imageUrl
  if (source && /^https?:\/\//i.test(source)) return source
  if (source && source.startsWith('/')) return source
  if (source) return `http://localhost:5000/${source.replace(/^\/+/, '')}`

  // 3. Fallback to placeholders based on ID
  const seed = String(sneaker.id || sneaker.name || '').length
  return SNEAKER_PLACEHOLDERS[seed % SNEAKER_PLACEHOLDERS.length]
}

function normalizeUser(userData) {
  if (!userData) return null
  return {
    ...userData,
    name: userData.name || userData.full_name || userData.profile_handle || 'Collector',
    handle:
      userData.handle || userData.profile_handle ||
      (userData.email ? userData.email.split('@')[0] : 'collector'),
  }
}

function hydrateSneaker(sneaker) {
  const safeSneaker = sneaker || {}
  const availableSizes = Array.isArray(safeSneaker.available_sizes)
    ? safeSneaker.available_sizes.map(normalizeSize).filter(Boolean)
    : []
  const priceValue =
    safeSneaker.current_price_inr ??
    safeSneaker.price_inr ??
    safeSneaker.market_value_inr ??
    parseInrPrice(safeSneaker.price)
  const name = safeSneaker.name || safeSneaker.model || 'Vault Sneaker'

  return {
    ...safeSneaker,
    id: safeSneaker.id ?? safeSneaker.sneaker_id ?? `${safeSneaker.brand || 'vault'}-${name}`,
    name,
    brand: safeSneaker.brand || 'HYPE VAULT',
    colorway: safeSneaker.colorway || 'Vault Colorway',
    condition: safeSneaker.condition || safeSneaker.shoe_condition || 'deadstock',
    available_sizes: availableSizes,
    image_path: getSneakerImage(safeSneaker),
    price: formatInr(priceValue || 0),
    stock: availableSizes.length
      ? `${availableSizes.length} pairs`
      : safeSneaker.stock || 'Limited',
    releaseYear: safeSneaker.release_year || safeSneaker.releaseYear || '2024',
    palette: Array.isArray(safeSneaker.palette) ? safeSneaker.palette : DEFAULT_PALETTE,
    rarity: safeSneaker.rarity || safeSneaker.category || 'Vault',
  }
}

const navItems = ['Home', 'Shop', 'Trending', 'Collections']
const sneakerCards = [
  {
    name: 'Chrome Runner 01',
    meta: 'Deadstock',
    price: '₹1.06L',
    tone: 'from-zinc-100/25 via-zinc-400/10 to-transparent',
  },
  {
    name: 'Midnight Retro IV',
    meta: 'Vault Verified',
    price: '₹78K',
    tone: 'from-white/20 via-neutral-500/10 to-transparent',
  },
  {
    name: 'Silver Low OG',
    meta: 'Private Drop',
    price: '₹1.36L',
    tone: 'from-zinc-300/20 via-white/10 to-transparent',
  },
]

const showcaseItems = [
  ['01', 'Authenticated pairs', 'Chain-of-custody verified before every listing.'],
  ['02', 'Market heat', 'Real-time demand signals from rare sneaker resale culture.'],
  ['03', 'Private collections', 'Curated vault access for limited silhouettes and grails.'],
]

const trendingSneakers = [
  {
    name: 'Jordan 4 Military Black',
    brand: 'Nike',
    tag: 'Most Traded',
    price: '₹46,999',
    movement: '+18.4%',
    volume: '312 bids',
  },
  {
    name: 'Samba OG Cloud White',
    brand: 'Adidas',
    tag: 'Street Heat',
    price: '₹16,499',
    movement: '+9.7%',
    volume: '228 bids',
  },
  {
    name: 'Suede VTG Black Frost',
    brand: 'Puma',
    tag: 'Rising',
    price: '₹11,999',
    movement: '+6.2%',
    volume: '104 bids',
  },
  {
    name: 'Chuck 70 De Luxe Heel',
    brand: 'Converse',
    tag: 'Editorial Pick',
    price: '₹14,750',
    movement: '+7.9%',
    volume: '86 bids',
  },
  {
    name: 'LV Trainer Denim Monogram',
    brand: 'Louis Vuitton',
    tag: 'Luxury Index',
    price: '₹1,95,000',
    movement: '+12.1%',
    volume: '19 bids',
  },
  {
    name: 'Dior B22 Reflective Silver',
    brand: 'Dior',
    tag: 'Private Demand',
    price: '₹1,42,000',
    movement: '+10.6%',
    volume: '27 bids',
  },
]

const featuredSneakers = [
  {
    name: 'Air Jordan 1 High OG Lost & Found',
    brand: 'Nike',
    price: '₹54,999',
    stock: '6 pairs',
    rarity: 'Vault Rare',
    releaseYear: '2022',
    palette: ['#f8fafc', '#a1a1aa', '#18181b'],
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
  },
  {
    name: 'Air Jordan 4 Military Black',
    brand: 'Nike',
    price: '₹46,999',
    stock: '8 pairs',
    rarity: 'Most Traded',
    releaseYear: '2022',
    palette: ['#ffffff', '#9ca3af', '#111827'],
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop',
  },
  {
    name: 'Air Jordan 1 Retro High Travis Scott Mocha',
    brand: 'Nike',
    price: '₹1,62,000',
    stock: '2 pairs',
    rarity: 'Grail',
    releaseYear: '2019',
    palette: ['#f5f5f4', '#78716c', '#292524'],
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=300&fit=crop',
  },
  {
    name: 'Nike Dunk Low Panda',
    brand: 'Nike',
    price: '₹18,999',
    stock: '18 pairs',
    rarity: 'Street Heat',
    releaseYear: '2021',
    palette: ['#ffffff', '#d4d4d8', '#050505'],
  },
  {
    name: 'Nike SB Dunk Low Ben & Jerry Chunky Dunky',
    brand: 'Nike',
    price: '₹1,18,000',
    stock: '1 pair',
    rarity: 'Archive Grail',
    releaseYear: '2020',
    palette: ['#f8fafc', '#93c5fd', '#111827'],
  },
  {
    name: 'Nike Air Max 1 Patta Monarch',
    brand: 'Nike',
    price: '₹32,500',
    stock: '7 pairs',
    rarity: 'Collector Grade',
    releaseYear: '2021',
    palette: ['#f9fafb', '#fb923c', '#1f2937'],
  },
  {
    name: 'Nike Kobe 6 Protro Grinch',
    brand: 'Nike',
    price: '₹78,000',
    stock: '3 pairs',
    rarity: 'Court Grail',
    releaseYear: '2020',
    palette: ['#f7fee7', '#84cc16', '#111827'],
  },
  {
    name: 'Nike Air Fear of God 1 Triple Black',
    brand: 'Nike',
    price: '₹69,999',
    stock: '4 pairs',
    rarity: 'Luxury Sport',
    releaseYear: '2020',
    palette: ['#fafafa', '#525252', '#050505'],
  },
  {
    name: 'Nike Air Yeezy 2 Solar Red',
    brand: 'Nike',
    price: '₹7,20,000',
    stock: '1 pair',
    rarity: 'Museum Piece',
    releaseYear: '2012',
    palette: ['#f5f5f5', '#ef4444', '#020617'],
  },
  {
    name: 'Air Jordan 11 Retro Concord',
    brand: 'Nike',
    price: '₹38,999',
    stock: '9 pairs',
    rarity: 'Icon',
    releaseYear: '2018',
    palette: ['#ffffff', '#d1d5db', '#111827'],
  },
  {
    name: 'Nike Dunk Low Off-White Lot 50',
    brand: 'Nike',
    price: '₹92,000',
    stock: '2 pairs',
    rarity: 'Designer Vault',
    releaseYear: '2021',
    palette: ['#f8fafc', '#64748b', '#f97316'],
  },
  {
    name: 'Air Jordan 3 A Ma Maniere',
    brand: 'Nike',
    price: '₹52,999',
    stock: '5 pairs',
    rarity: 'Boutique Rare',
    releaseYear: '2021',
    palette: ['#fafaf9', '#a8a29e', '#292524'],
  },
  {
    name: 'Nike SB Dunk Low Jarritos',
    brand: 'Nike',
    price: '₹64,999',
    stock: '3 pairs',
    rarity: 'Low Stock',
    releaseYear: '2023',
    palette: ['#fefce8', '#22c55e', '#78350f'],
  },
  {
    name: 'Air Jordan 4 Retro Bred Reimagined',
    brand: 'Nike',
    price: '₹34,999',
    stock: '10 pairs',
    rarity: 'Hot Ask',
    releaseYear: '2024',
    palette: ['#f4f4f5', '#71717a', '#09090b'],
  },
  {
    name: 'Nike Air Max 97 Silver Bullet',
    brand: 'Nike',
    price: '₹27,999',
    stock: '12 pairs',
    rarity: 'Retro Heat',
    releaseYear: '2022',
    palette: ['#ffffff', '#a3a3a3', '#18181b'],
  },
  {
    name: 'Yeezy Boost 350 V2 Zebra',
    brand: 'Adidas',
    price: '₹39,999',
    stock: '7 pairs',
    rarity: 'Yeezy Icon',
    releaseYear: '2017',
    palette: ['#ffffff', '#d4d4d8', '#111111'],
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=300&fit=crop',
  },
  {
    name: 'Yeezy Boost 350 V2 Onyx',
    brand: 'Adidas',
    price: '₹31,500',
    stock: '11 pairs',
    rarity: 'Collector Grade',
    releaseYear: '2022',
    palette: ['#d4d4d8', '#52525b', '#09090b'],
  },
  {
    name: 'Adidas Samba OG Cloud White',
    brand: 'Adidas',
    price: '₹16,499',
    stock: '20 pairs',
    rarity: 'Trending',
    releaseYear: '2023',
    palette: ['#ffffff', '#d6d3d1', '#111827'],
  },
  {
    name: 'Adidas Campus 00s Core Black',
    brand: 'Adidas',
    price: '₹14,999',
    stock: '18 pairs',
    rarity: 'Street Essential',
    releaseYear: '2023',
    palette: ['#fafafa', '#57534e', '#0c0a09'],
  },
  {
    name: 'Yeezy Foam Runner Ararat',
    brand: 'Adidas',
    price: '₹28,500',
    stock: '6 pairs',
    rarity: 'Future Classic',
    releaseYear: '2020',
    palette: ['#fafaf9', '#d6d3d1', '#57534e'],
  },
  {
    name: 'Yeezy Slide Bone',
    brand: 'Adidas',
    price: '₹19,999',
    stock: '14 pairs',
    rarity: 'Resale Staple',
    releaseYear: '2019',
    palette: ['#fafaf9', '#e7e5e4', '#78716c'],
  },
  {
    name: 'Adidas Gazelle Indoor Blue Bird',
    brand: 'Adidas',
    price: '₹17,999',
    stock: '13 pairs',
    rarity: 'Terrace Heat',
    releaseYear: '2023',
    palette: ['#eff6ff', '#2563eb', '#111827'],
  },
  {
    name: 'Adidas Forum Low Bad Bunny Back To School',
    brand: 'Adidas',
    price: '₹42,000',
    stock: '4 pairs',
    rarity: 'Artist Drop',
    releaseYear: '2021',
    palette: ['#fef3c7', '#a16207', '#1c1917'],
  },
  {
    name: 'Adidas NMD Hu Pharrell Core Black',
    brand: 'Adidas',
    price: '₹33,999',
    stock: '5 pairs',
    rarity: 'Culture Pick',
    releaseYear: '2020',
    palette: ['#f8fafc', '#64748b', '#020617'],
  },
  {
    name: 'Yeezy 700 Wave Runner',
    brand: 'Adidas',
    price: '₹44,999',
    stock: '6 pairs',
    rarity: 'Modern Grail',
    releaseYear: '2017',
    palette: ['#f8fafc', '#facc15', '#334155'],
  },
  {
    name: 'Adidas Spezial Handball Light Blue',
    brand: 'Adidas',
    price: '₹15,999',
    stock: '15 pairs',
    rarity: 'Rising',
    releaseYear: '2024',
    palette: ['#eff6ff', '#60a5fa', '#1e293b'],
  },
  {
    name: 'Adidas Superstar Prada Re-Nylon',
    brand: 'Adidas',
    price: '₹82,000',
    stock: '2 pairs',
    rarity: 'Luxury Collab',
    releaseYear: '2020',
    palette: ['#ffffff', '#a3a3a3', '#0a0a0a'],
  },
  {
    name: 'Adidas UltraBoost 1.0 Cream',
    brand: 'Adidas',
    price: '₹22,999',
    stock: '9 pairs',
    rarity: 'Runner Icon',
    releaseYear: '2015',
    palette: ['#fafaf9', '#e7e5e4', '#44403c'],
  },
  {
    name: 'Yeezy 500 Utility Black',
    brand: 'Adidas',
    price: '₹36,500',
    stock: '8 pairs',
    rarity: 'Monochrome',
    releaseYear: '2018',
    palette: ['#d4d4d8', '#52525b', '#030712'],
  },
  {
    name: 'Adidas Rivalry Low 86 White Black',
    brand: 'Adidas',
    price: '₹12,999',
    stock: '16 pairs',
    rarity: 'Vault Entry',
    releaseYear: '2023',
    palette: ['#ffffff', '#d4d4d8', '#18181b'],
  },
  {
    name: 'Dior B30 Technical Mesh Silver',
    brand: 'Dior',
    price: '₹1,28,000',
    stock: '3 pairs',
    rarity: 'Luxury Vault',
    releaseYear: '2023',
    palette: ['#ffffff', '#a3a3a3', '#1f2937'],
  },
  {
    name: 'Louis Vuitton LV Trainer Monogram Eclipse',
    brand: 'Louis Vuitton',
    price: '₹1,72,000',
    stock: '2 pairs',
    rarity: 'Private Stock',
    releaseYear: '2022',
    palette: ['#f5f5f4', '#78716c', '#1c1917'],
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
  },
  {
    name: 'Balenciaga Track.2 Black Mesh',
    brand: 'Balenciaga',
    price: '₹96,500',
    stock: '5 pairs',
    rarity: 'Runway Pair',
    releaseYear: '2021',
    palette: ['#f4f4f5', '#71717a', '#0a0a0a'],
  },
  {
    name: 'Prada America Cup Patent Black',
    brand: 'Prada',
    price: '₹89,999',
    stock: '4 pairs',
    rarity: 'Gallery Select',
    releaseYear: '2020',
    palette: ['#fafafa', '#737373', '#171717'],
  },
  {
    name: 'Gucci Rhyton Logo Leather Sneaker',
    brand: 'Gucci',
    price: '₹74,999',
    stock: '4 pairs',
    rarity: 'House Icon',
    releaseYear: '2019',
    palette: ['#fafaf9', '#a8a29e', '#14532d'],
  },
  {
    name: 'Puma MB.01 Iridescent Black',
    brand: 'Puma',
    price: '₹24,999',
    stock: '9 pairs',
    rarity: 'Limited Run',
    releaseYear: '2022',
    palette: ['#fafafa', '#71717a', '#27272a'],
  },
  {
    name: 'Puma Suede VTG Black Frost',
    brand: 'Puma',
    price: '₹11,999',
    stock: '17 pairs',
    rarity: 'Rising',
    releaseYear: '2023',
    palette: ['#f4f4f5', '#71717a', '#09090b'],
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop',
  },
  {
    name: 'Puma Clyde OG Silver Foil',
    brand: 'Puma',
    price: '₹13,999',
    stock: '12 pairs',
    rarity: 'Archive Pick',
    releaseYear: '2024',
    palette: ['#fafafa', '#a3a3a3', '#18181b'],
  },
  {
    name: 'Converse Run Star Legacy CX Noir',
    brand: 'Converse',
    price: '₹18,750',
    stock: '14 pairs',
    rarity: 'Platform Heat',
    releaseYear: '2022',
    palette: ['#e5e7eb', '#6b7280', '#111827'],
  },
  {
    name: 'Converse Chuck 70 CDG Play Black',
    brand: 'Converse',
    price: '₹21,999',
    stock: '8 pairs',
    rarity: 'Collab Classic',
    releaseYear: '2021',
    palette: ['#ffffff', '#ef4444', '#0a0a0a'],
  },
]

function SneakerArtwork({ palette, name, index }) {
  const gradientId = `sneaker-gradient-${index}`
  const soleId = `sole-gradient-${index}`
  const glowId = `sneaker-glow-${index}`

  return (
    <svg
      viewBox="0 0 360 210"
      role="img"
      aria-label={`${name} sneaker image`}
      className="h-full w-full overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="18%" y1="16%" x2="82%" y2="86%">
          <stop offset="0%" stopColor={palette[0]} />
          <stop offset="52%" stopColor={palette[1]} />
          <stop offset="100%" stopColor={palette[2]} />
        </linearGradient>
        <linearGradient id={soleId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.88" />
          <stop offset="45%" stopColor="#a1a1aa" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#27272a" stopOpacity="0.96" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-30%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0.9 0 1 0 0 0.9 0 0 1 0 1 0 0 0 0.25 0"
          />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="188" cy="168" rx="128" ry="18" fill="#ffffff" opacity="0.08" />
      <path
        d="M58 129c34 9 73 9 117-2 17-4 31-11 44-21 14-11 29-16 45-9 24 11 43 27 56 47 5 8 2 18-7 22-38 16-89 20-154 13-51-5-91-15-121-30-10-5-10-17-1-22 6-3 13-2 21 2Z"
        fill={`url(#${gradientId})`}
        filter={`url(#${glowId})`}
      />
      <path
        d="M69 137c52 16 102 17 151 5 20-5 40-5 59 0 14 4 26 10 37 18-7 8-21 13-42 16-51 8-104 5-158-6-33-7-60-16-81-29 8-5 19-6 34-4Z"
        fill="#050505"
        opacity="0.46"
      />
      <path
        d="M37 146c55 21 116 33 183 34 48 0 84-5 108-15 7-3 10 9 3 16-13 12-46 20-100 24-68 4-133-5-196-27-12-4-14-18-4-26 2-2 4-4 6-6Z"
        fill={`url(#${soleId})`}
      />
      <path
        d="M125 122c18-19 38-28 60-27 14 1 26 5 36 12-25 15-58 24-96 27-6 0-8-7-4-12Z"
        fill="#020202"
        opacity="0.62"
      />
      <path
        d="M166 107l-24 31M190 105l-21 34M214 111l-20 30"
        stroke="#f4f4f5"
        strokeLinecap="round"
        strokeWidth="4"
        opacity="0.72"
      />
      <path
        d="M75 157c55 19 119 27 192 22"
        stroke="#ffffff"
        strokeLinecap="round"
        strokeWidth="2"
        opacity="0.38"
      />
    </svg>
  )
}

function SneakerVisual({ sneaker, index, className = '' }) {
  const src = sneaker?.image_path
  const [failedImage, setFailedImage] = useState('')
  const imageFailed = failedImage === src

  if (src && !imageFailed) {
    return (
      <motion.img
        src={src}
        alt={`${sneaker?.name || 'Sneaker'} image`}
        loading="lazy"
        onError={() => setFailedImage(src)}
        className={`h-full w-full object-contain drop-shadow-[0_28px_70px_rgba(255,255,255,0.16)] ${className}`}
      />
    )
  }

  return (
    <SneakerArtwork
      palette={sneaker?.palette || DEFAULT_PALETTE}
      name={sneaker?.name || 'Sneaker'}
      index={index}
    />
  )
}

const sizes = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11']

function parseInrPrice(price) {
  if (typeof price === 'number') return price
  if (price == null) return 0
  return Number(String(price).replace(/[^\d]/g, '')) || 0
}

function formatInr(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function buildPriceHistory(price) {
  const base = parseInrPrice(price)
  const multipliers = [0.86, 0.9, 0.88, 0.94, 0.98, 0.96, 1.04, 1.01, 1.08, 1.13, 1.1, 1.18]
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']

  return months.map((month, index) => ({
    month,
    price: Math.round(base * multipliers[index]),
  }))
}

const dashboardHighlights = [
  {
    label: 'Vault Balance',
    value: '₹48.7L',
    detail: 'Authenticated inventory value',
  },
  {
    label: 'Pending Orders',
    value: '3',
    detail: 'Reserved premium pairs',
  },
  {
    label: 'Authenticated Score',
    value: '99/100',
    detail: 'Collector trust rank',
  },
]

function LoginPage({ onBack, onLogin, onSwitch, loading, message, error, status }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <section id="login" className="relative px-5 pb-24 pt-32 sm:px-6 sm:pt-36 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-7xl"
      >
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-8 rounded-[2rem] border border-white/10 bg-black/45 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.48)] backdrop-blur-2xl">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-zinc-100/10 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-zinc-200">
                <ShieldCheck size={16} className="text-zinc-100" />
                Premium Member Login
              </div>
              <h1 className="text-5xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
                Welcome back to the vault.
              </h1>
              <p className="max-w-xl text-base leading-8 text-zinc-400">
                Sign in to manage your rare sneaker orders, preview private collections,
                and continue your premium resale journey with secure INR checkout.
              </p>
            </div>

            <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6">
              {[
                ['Trusted authentication', 'Encrypted credentials with premium access'],
                ['Insured delivery', 'Live shipment tracking across India'],
                ['Collector status', 'VIP recommendations and private drops'],
              ].map(([title, detail]) => (
                <div key={title} className="flex items-start gap-3">
                  <BadgeCheck className="mt-1 text-emerald-300" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-zinc-500">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={async (event) => {
              event.preventDefault()
              await onLogin({ email, password })
            }}
            className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.48)] backdrop-blur-2xl"
          >
            <div className="mb-8 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.34em] text-zinc-500">
                  Login
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">
                  Sign in to continue.
                </h2>
              </div>
              <Lock className="text-zinc-500" size={24} />
            </div>

            {(status === 'error' || message) && (
              <div className={`rounded-3xl border px-5 py-4 text-sm ${status === 'error' ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'}`}>
                {status === 'error' ? error || 'Unable to sign in.' : message}
              </div>
            )}

            <div className="space-y-6">
              <label className="block">
                <span className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Email address
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-sm text-zinc-100 outline-none transition-colors duration-300 placeholder:text-zinc-600 focus:border-white/30"
                  required
                />
              </label>
              <label className="block">
                <span className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••••"
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-sm text-zinc-100 outline-none transition-colors duration-300 placeholder:text-zinc-600 focus:border-white/30"
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-zinc-100 px-6 py-4 text-sm font-bold uppercase tracking-[0.22em] text-black transition-colors duration-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowRight size={18} />
              {loading ? 'Signing in...' : 'Secure Sign In'}
            </button>

            <p className="mt-6 text-center text-sm text-zinc-400">
              New to HYPE VAULT?{' '}
              <button
                type="button"
                onClick={() => onSwitch('register')}
                className="font-semibold text-zinc-100 underline decoration-zinc-700 underline-offset-4 hover:text-white"
              >
                Create premium access
              </button>
            </p>
          </motion.form>
        </div>
      </motion.div>
    </section>
  )
}

function RegisterPage({ onBack, onRegister, onSwitch, loading, message, error, status }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <section id="register" className="relative px-5 pb-24 pt-32 sm:px-6 sm:pt-36 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-7xl"
      >
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-zinc-300 backdrop-blur-xl transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.1] hover:text-white"
        >
          <ArrowLeft size={16} />
          Back To Vault
        </button>

        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.form
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={async (event) => {
              event.preventDefault()
              if (validateForm()) {
                await onRegister({ fullName, email, password, phone })
              }
            }}
            className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.48)] backdrop-blur-2xl"
          >
            <div className="mb-8 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.34em] text-zinc-500">
                  Register
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">
                  Begin your private vault journey.
                </h2>
              </div>
              <UserPlus className="text-zinc-500" size={24} />
            </div>

            {(status === 'error' || message) && (
              <div className={`rounded-3xl border px-5 py-4 text-sm ${status === 'error' ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'}`}>
                {status === 'error' ? error || 'Unable to register.' : message}
              </div>
            )}

            <div className="space-y-6">
              <label className="block">
                <span className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Full name
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Full Name"
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-sm text-zinc-100 outline-none transition-colors duration-300 placeholder:text-zinc-600 focus:border-white/30"
                  required
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>}
              </label>
              <label className="block">
                <span className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Email address
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-sm text-zinc-100 outline-none transition-colors duration-300 placeholder:text-zinc-600 focus:border-white/30"
                  required
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </label>
              <label className="block">
                <span className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Phone number
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Phone number"
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-sm text-zinc-100 outline-none transition-colors duration-300 placeholder:text-zinc-600 focus:border-white/30"
                />
              </label>
              <label className="block">
                <span className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••••"
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-sm text-zinc-100 outline-none transition-colors duration-300 placeholder:text-zinc-600 focus:border-white/30"
                  required
                />
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-zinc-100 px-6 py-4 text-sm font-bold uppercase tracking-[0.22em] text-black transition-colors duration-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowRight size={18} />
              {loading ? 'Setting up account...' : 'Create Account'}
            </button>

            <p className="mt-6 text-center text-sm text-zinc-400">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => onSwitch('login')}
                className="font-semibold text-zinc-100 underline decoration-zinc-700 underline-offset-4 hover:text-white"
              >
                Sign in instead
              </button>
            </p>
          </motion.form>

          <div className="space-y-8 rounded-[2rem] border border-white/10 bg-black/45 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.48)] backdrop-blur-2xl">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-zinc-100/10 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-zinc-200">
                <Sparkles size={16} className="text-zinc-100" />
                Member benefits
              </div>
              <h1 className="text-5xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
                Your private collector pass.
              </h1>
              <p className="max-w-xl text-base leading-8 text-zinc-400">
                Register now to access private drops, premium invoice generation,
                and curated sneaker sourcing across the HYPE VAULT network.
              </p>
            </div>

            <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6">
              {[
                ['Private drops', 'Priority access to curated limited releases'],
                ['Market intelligence', 'Personalized INR resale signals'],
                ['Verified delivery', 'Insured shipping and handling'],
              ].map(([title, detail]) => (
                <div key={title} className="flex items-start gap-3">
                  <BadgeCheck className="mt-1 text-emerald-300" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-zinc-500">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function DashboardPage({
  user,
  cartItems,
  onNavigate,
  onStartCheckout,
  onLogout,
}) {
  const watchlist = featuredSneakers.slice(0, 4)
  const portfolioValue = '₹38.2L'
  const pendingPairs = cartItems.length
  const displayName = user?.name || user?.full_name || 'Collector'
  const displayHandle = user?.handle || user?.profile_handle || 'vault.collector'

  return (
    <section id="dashboard" className="relative px-5 pb-24 pt-32 sm:px-6 sm:pt-36 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-7xl"
      >
        <div className="mb-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.46em] text-zinc-500">
              VIP Dashboard
            </p>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
              Welcome back, {displayName}.
            </h1>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="rounded-[2rem] border border-white/10 bg-black/45 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.48)] backdrop-blur-2xl">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-zinc-100/20 via-zinc-400/10 to-zinc-600/20 text-xl font-bold text-zinc-100">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-50">{displayName}</h3>
                    <p className="text-sm text-zinc-400">@{displayHandle}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${user?.loyalty_tier === 'black' ? 'bg-zinc-100 text-black' :
                        user?.loyalty_tier === 'gold' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          user?.loyalty_tier === 'silver' ? 'bg-zinc-400/20 text-zinc-300 border border-zinc-400/30' :
                            'bg-zinc-600/20 text-zinc-400 border border-zinc-600/30'
                        }`}>
                        {user?.loyalty_tier || 'bronze'} tier
                      </span>
                      {user?.verified && (
                        <BadgeCheck size={14} className="text-zinc-400" />
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-100 transition-colors duration-300 hover:bg-white/[0.15]"
                >
                  Sign Out
                </button>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Email</p>
                  <p className="mt-1 text-sm text-zinc-300">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Phone</p>
                  <p className="mt-1 text-sm text-zinc-300">{user?.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/45 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.48)] backdrop-blur-2xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-zinc-500">
                    Performance
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">
                    Elite collector metrics.
                  </h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs uppercase tracking-[0.28em] text-zinc-200">
                  Premium account
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {dashboardHighlights.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-5"
                  >
                    <p className="text-[0.65rem] uppercase tracking-[0.24em] text-zinc-500">
                      {stat.label}
                    </p>
                    <p className="mt-4 text-3xl font-semibold text-zinc-50">{stat.value}</p>
                    <p className="mt-3 text-sm leading-6 text-zinc-500">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.26em] text-zinc-500">Portfolio Snapshot</p>
                    <h3 className="mt-2 text-2xl font-semibold text-zinc-50">Collector equity</h3>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/35 px-3 py-2 text-xs uppercase tracking-[0.24em] text-zinc-200">
                    {pendingPairs} active reserves
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-[1.4rem] border border-white/10 bg-black/35 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Total inventory</p>
                    <p className="mt-2 text-3xl font-semibold text-zinc-50">{portfolioValue}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.4rem] border border-white/10 bg-black/35 p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Private offers</p>
                      <p className="mt-2 text-lg font-semibold text-zinc-50">9 active</p>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/10 bg-black/35 p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Fast lane</p>
                      <p className="mt-2 text-lg font-semibold text-zinc-50">VIP shipping</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.26em] text-zinc-500">Receipts</p>
                    <h3 className="mt-2 text-2xl font-semibold text-zinc-50">Recent invoice</h3>
                  </div>
                  <BadgeCheck className="text-emerald-300" size={22} />
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-[1.4rem] border border-white/10 bg-black/35 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Latest settled order</p>
                    <p className="mt-3 text-lg font-semibold text-zinc-50">LV Trainer Denim Monogram</p>
                    <p className="mt-2 text-sm text-zinc-400">Delivered May 2, 2026</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('receipt')}
                    className="w-full rounded-full border border-white/10 bg-zinc-100 px-5 py-4 text-sm font-bold uppercase tracking-[0.22em] text-black transition-colors duration-300 hover:bg-white"
                  >
                    View full invoice
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-black/45 p-6 backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-zinc-500">Member perks</p>
                  <h3 className="mt-2 text-2xl font-semibold text-zinc-50">Curated access</h3>
                </div>
                <Sparkles className="text-zinc-400" size={22} />
              </div>
              <ul className="mt-6 space-y-4 text-sm text-zinc-400">
                <li>Priority invite to private drops</li>
                <li>Verified chain-of-custody updates</li>
                <li>Luxury console with real-time INR demand</li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-zinc-500">Watchlist</p>
                  <h3 className="mt-2 text-2xl font-semibold text-zinc-50">Curated pairs</h3>
                </div>
                <Heart className="text-zinc-400" size={22} />
              </div>
              <div className="mt-6 space-y-4">
                {watchlist.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">{item.brand}</p>
                    <p className="mt-2 text-sm font-semibold text-zinc-100">{item.name}</p>
                    <p className="mt-2 text-sm text-zinc-400">{item.price}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-zinc-500">Live order</p>
                  <h3 className="mt-2 text-2xl font-semibold text-zinc-50">Pending checkout</h3>
                </div>
                <Truck className="text-zinc-400" size={22} />
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Cart items</p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-50">{cartItems.length}</p>
                </div>
                <button
                  type="button"
                  onClick={onStartCheckout}
                  className="w-full rounded-full border border-white/10 bg-zinc-100 px-5 py-4 text-sm font-bold uppercase tracking-[0.22em] text-black transition-colors duration-300 hover:bg-white"
                >
                  Resume checkout
                </button>
              </div>
            </div>
          </aside>
        </div>
      </motion.div>
    </section>
  )
}

function ReceiptPage({ order, onBack, onContinueShopping }) {
  if (!order) {
    return (
      <section className="relative px-5 pb-24 pt-32 sm:px-6 sm:pt-36 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl"
        >
          <div className="rounded-[2rem] border border-white/10 bg-black/45 p-10 text-center shadow-[0_30px_120px_rgba(0,0,0,0.48)] backdrop-blur-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">No receipt available</p>
            <h2 className="mt-4 text-4xl font-semibold text-zinc-50">Nothing to display yet.</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Place an order through the premium checkout to generate your vault receipt.
            </p>
            <button
              type="button"
              onClick={onContinueShopping}
              className="mt-8 rounded-full bg-zinc-100 px-6 py-4 text-sm font-bold uppercase tracking-[0.22em] text-black transition-colors duration-300 hover:bg-white"
            >
              Continue shopping
            </button>
          </div>
        </motion.div>
      </section>
    )
  }

  return (
    <section id="receipt" className="relative min-h-screen px-5 pt-32 sm:px-6 sm:pt-40 lg:px-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl text-center"
      >
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-400">
          <BadgeCheck size={40} />
        </div>
        <h1 className="text-4xl font-bold uppercase tracking-tighter text-zinc-50 sm:text-6xl">
          Thank You.
        </h1>
        <p className="mt-6 text-zinc-400">
          Your acquisition is confirmed. Order #{order.orderNumber} is being processed
          for gallery-grade authentication.
        </p>
        <button
          onClick={onContinueShopping}
          className="mt-10 rounded-full bg-zinc-100 px-10 py-4 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-white"
        >
          Return to Vault
        </button>
      </motion.div>
    </section>
  )
}


function ProductDetail({ sneaker, onBack, onAddToCart, isLoading }) {
  const sizeOptions = sneaker.available_sizes?.length
    ? sneaker.available_sizes.map(normalizeSize).filter(Boolean)
    : sizes.map((label) => ({ size_label: label }))
  const [activeImage, setActiveImage] = useState(0)
  const [selectedSizeLabel, setSelectedSizeLabel] = useState(
    sizeOptions[0]?.size_label || sizes[2],
  )
  const selectedSize =
    sizeOptions.find((size) => size.size_label === selectedSizeLabel) ||
    sizeOptions[0] ||
    { size_label: sizes[2] }

  const stockCount = Number(String(sneaker.stock || '').match(/\d+/)?.[0] || 1)
  const rarityScore = Math.min(99, 72 + Math.max(0, 18 - stockCount) + (parseInrPrice(sneaker.price) > 90000 ? 7 : 0))
  const priceHistory = buildPriceHistory(sneaker.price)
  const gallery = [
    { label: 'Profile', rotate: 0, scale: 1 },
    { label: 'Hero', rotate: -5, scale: 1.08 },
    { label: 'Detail', rotate: 4, scale: 0.96 },
  ]

  return (
    <section className="relative px-5 pb-24 pt-32 sm:px-6 sm:pt-36 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-7xl"
      >
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-zinc-300 backdrop-blur-xl transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.1] hover:text-white"
        >
          <ArrowLeft size={16} />
          Back To Vault
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            layout
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.18),transparent_42%)]" />
            <div className="relative flex min-h-[420px] items-center justify-center rounded-[1.5rem] border border-white/10 bg-black/45 p-6">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, y: 24, rotate: gallery[activeImage].rotate - 4 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotate: gallery[activeImage].rotate,
                  scale: gallery[activeImage].scale,
                }}
                transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
                className="h-[300px] w-full max-w-[620px]"
              >
                <SneakerVisual sneaker={sneaker} index={`detail-${activeImage}`} />
              </motion.div>
            </div>

            <div className="relative mt-5 grid grid-cols-3 gap-3">
              {gallery.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`rounded-2xl border p-3 text-left backdrop-blur-xl transition-colors duration-300 ${activeImage === index
                    ? 'border-white/35 bg-white/[0.12] text-white'
                    : 'border-white/10 bg-black/35 text-zinc-500 hover:border-white/25 hover:text-zinc-200'
                    }`}
                >
                  <div className="h-20">
                    <SneakerVisual
                      sneaker={sneaker}
                      index={`thumb-${index}`}
                      className="scale-110"
                    />
                  </div>
                  <p className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.2em]">
                    {item.label}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[2rem] border border-white/10 bg-black/45 p-6 backdrop-blur-2xl sm:p-8"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-black">
                {sneaker.rarity}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                {sneaker.brand}
              </span>
              {isLoading && (
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Syncing vault data
                </span>
              )}
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
              {sneaker.name}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-zinc-500">
              Vault-authenticated pair with live Indian resale signals, collectible
              scarcity, and premium streetwear provenance.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-zinc-600">Ask</p>
                <p className="mt-2 text-2xl font-semibold text-zinc-50">{sneaker.price}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-zinc-600">Stock</p>
                <p className="mt-2 text-xl font-semibold text-zinc-50">{stockCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-zinc-600">Year</p>
                <p className="mt-2 text-xl font-semibold text-zinc-50">{sneaker.releaseYear}</p>
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-zinc-500">Size</p>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">India ready sizing</p>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {sizeOptions.map((size) => {
                  const label = size.size_label || size
                  const isActive = selectedSize?.size_label === label
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setSelectedSizeLabel(label)}
                      className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors duration-300 ${isActive
                        ? 'border-white/35 bg-white text-black'
                        : 'border-white/10 bg-white/[0.045] text-zinc-400 hover:border-white/25 hover:text-white'
                        }`}
                    >
                      {label}
                    </button>
                  )
                })}
                <p className="text-2xl font-semibold text-zinc-50">{rarityScore}/100</p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rarityScore}%` }}
                  transition={{ delay: 0.25, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-zinc-600 via-zinc-100 to-white"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <motion.button
                type="button"
                onClick={() => onAddToCart(sneaker, selectedSize)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex flex-1 items-center justify-center gap-3 rounded-full bg-zinc-100 px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-black transition-colors duration-300 hover:bg-white"
              >
                <ShoppingBag size={18} />
                Add To Cart
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-zinc-100 transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.1]"
              >
                <Heart size={18} />
                Wishlist
              </motion.button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]"
        >
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-zinc-500">Sneaker Details</p>
            <div className="mt-6 space-y-4 text-sm text-zinc-400">
              {[
                ['Brand', sneaker.brand],
                ['Release Year', sneaker.releaseYear],
                ['Condition', String(sneaker.condition || 'deadstock').replace(/_/g, ' ')],
                ['Selected Size', selectedSize?.size_label || 'UK 9'],
                ['Stock Counter', `${stockCount} pairs live`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="uppercase tracking-[0.18em] text-zinc-600">{label}</span>
                  <span className="font-semibold text-zinc-200">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/45 p-6 backdrop-blur-2xl sm:p-8">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-zinc-500">Resale Insights</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">Monthly INR price history</h2>
              </div>
              <p className="text-sm text-zinc-500">Hover the graph for market asks.</p>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceHistory} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceHistoryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f4f4f5" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f4f4f5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="month" stroke="#71717a" tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#71717a"
                    tickLine={false}
                    axisLine={false}
                    width={88}
                    tickFormatter={(value) => formatInr(value).replace('.00', '')}
                  />
                  <Tooltip
                    cursor={{ stroke: 'rgba(255,255,255,0.25)' }}
                    contentStyle={{
                      background: 'rgba(3,3,3,0.92)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: '16px',
                      color: '#f4f4f5',
                      boxShadow: '0 20px 70px rgba(0,0,0,0.45)',
                    }}
                    formatter={(value) => [formatInr(value), 'Market Ask']}
                    labelStyle={{ color: '#a1a1aa' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#f4f4f5"
                    strokeWidth={3}
                    fill="url(#priceHistoryGradient)"
                    activeDot={{ r: 6, fill: '#ffffff', stroke: '#18181b', strokeWidth: 3 }}
                    animationDuration={1100}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

const brandFilters = ['Nike', 'Adidas', 'Dior', 'Louis Vuitton', 'Balenciaga', 'Prada', 'Gucci', 'Puma', 'Converse']
const rarityFilters = ['Grail', 'Luxury', 'Trending', 'Archive', 'Essential']
const releaseYearFilters = ['2012-2018', '2019-2021', '2022-2024']
const colorwayFilters = ['Monochrome', 'Silver', 'Earth', 'Blue', 'Green', 'Warm']
const marketplaceSizes = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11']
const maxMarketplacePrice = 720000

function getRarityGroup(rarity) {
  if (/grail|museum|designer/i.test(rarity)) return 'Grail'
  if (/luxury|runway|private|house|gallery/i.test(rarity)) return 'Luxury'
  if (/trending|hot|rising|traded/i.test(rarity)) return 'Trending'
  if (/archive|retro|icon|classic/i.test(rarity)) return 'Archive'
  return 'Essential'
}

function getReleaseYearGroup(year) {
  const value = Number(year)
  if (value <= 2018) return '2012-2018'
  if (value <= 2021) return '2019-2021'
  return '2022-2024'
}

function getColorwayGroup(sneaker) {
  const text = `${sneaker.name} ${sneaker.rarity}`.toLowerCase()
  const colors = sneaker.palette.join(' ').toLowerCase()

  if (/blue|#2563eb|#60a5fa|#93c5fd/.test(`${text} ${colors}`)) return 'Blue'
  if (/green|jarritos|grinch|#22c55e|#84cc16|#14532d/.test(`${text} ${colors}`)) return 'Green'
  if (/mocha|cream|bone|monarch|brown|#78716c|#a16207|#78350f/.test(`${text} ${colors}`)) return 'Earth'
  if (/red|bred|chicago|#ef4444|#f97316|#fb923c/.test(`${text} ${colors}`)) return 'Warm'
  if (/silver|chrome|#a3a3a3|#d1d5db|#d4d4d8/.test(`${text} ${colors}`)) return 'Silver'
  return 'Monochrome'
}

function hasSize(sneaker, size) {
  const sizeNumber = Number(size.replace(/\D/g, ''))
  const seed = sneaker.name.length + Number(sneaker.releaseYear)
  return (seed + sizeNumber) % 4 !== 0
}

function FilterPill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-[0.66rem] font-bold uppercase tracking-[0.18em] transition-colors duration-300 ${active
        ? 'border-white/35 bg-zinc-100 text-black'
        : 'border-white/10 bg-white/[0.045] text-zinc-500 hover:border-white/25 hover:text-zinc-100'
        }`}
    >
      {children}
    </button>
  )
}

function CartDrawer({
  cartItems,
  isOpen,
  onClose,
  onCheckout,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  const subtotal = cartItems.reduce(
    (total, item) => total + parseInrPrice(item.price) * item.quantity,
    0,
  )
  const shipping = cartItems.length === 0 || subtotal >= 100000 ? 0 : 499
  const total = subtotal + shipping
  const totalQuantity = cartItems.reduce((count, item) => count + item.quantity, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close cart overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%', opacity: 0.7 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.7 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[80] flex h-screen w-full max-w-[460px] flex-col border-l border-white/10 bg-black/70 shadow-[0_0_120px_rgba(255,255,255,0.08)] backdrop-blur-2xl"
          >
            <div className="border-b border-white/10 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.64rem] font-bold uppercase tracking-[0.34em] text-zinc-600">
                    Hype Vault Cart
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
                    Reserved Pairs
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-zinc-300 transition-colors duration-300 hover:border-white/25 hover:text-white"
                  aria-label="Close cart"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3">
                <span className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">
                  Live Bag
                </span>
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-200">
                  {totalQuantity} items
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cartItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-16 rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-8 text-center"
                >
                  <ShoppingBag className="mx-auto text-zinc-500" size={34} />
                  <p className="mt-5 text-sm font-bold uppercase tracking-[0.28em] text-zinc-500">
                    Cart Empty
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Add a verified sneaker from the product page to begin checkout.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {cartItems.map((item) => (
                      <motion.article
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 28 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 28, scale: 0.96 }}
                        transition={{ duration: 0.28 }}
                        className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4"
                      >
                        <div className="grid grid-cols-[112px_1fr] gap-4">
                          <div className="rounded-2xl border border-white/10 bg-black/45 p-2">
                            <SneakerVisual sneaker={item} index={`cart-${item.id}`} />
                          </div>
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-zinc-600">
                                  {item.brand} / {item.size}
                                </p>
                                <h3 className="mt-2 text-base font-semibold leading-tight text-zinc-50">
                                  {item.name}
                                </h3>
                              </div>
                              <button
                                type="button"
                                onClick={() => onRemove(item.id)}
                                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-500 transition-colors duration-300 hover:border-white/25 hover:text-white"
                                aria-label={`Remove ${item.name}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <div className="mt-4 flex items-end justify-between gap-4">
                              <div>
                                <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-zinc-600">
                                  Resale Ask
                                </p>
                                <p className="mt-1 text-xl font-semibold text-zinc-50">
                                  {item.price}
                                </p>
                              </div>
                              <div className="flex items-center rounded-full border border-white/10 bg-black/35 p-1">
                                <button
                                  type="button"
                                  onClick={() => onDecrease(item.id)}
                                  className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 transition-colors duration-300 hover:bg-white/[0.08] hover:text-white"
                                  aria-label={`Decrease ${item.name} quantity`}
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold text-zinc-100">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onIncrease(item.id)}
                                  className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 transition-colors duration-300 hover:bg-white/[0.08] hover:text-white"
                                  aria-label={`Increase ${item.name} quantity`}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-6">
              <div className="space-y-3 rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="uppercase tracking-[0.2em] text-zinc-500">Subtotal</span>
                  <span className="font-semibold text-zinc-100">{formatInr(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="uppercase tracking-[0.2em] text-zinc-500">Shipping</span>
                  <span className="font-semibold text-zinc-100">
                    {shipping === 0 ? 'Complimentary' : formatInr(shipping)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">
                    Total
                  </span>
                  <span className="text-2xl font-semibold text-zinc-50">
                    {formatInr(total)}
                  </span>
                </div>
              </div>
              <motion.button
                type="button"
                onClick={onCheckout}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                disabled={cartItems.length === 0}
                className="mt-4 flex w-full items-center justify-center gap-3 rounded-full bg-zinc-100 px-6 py-4 text-sm font-bold uppercase tracking-[0.22em] text-black transition-colors duration-300 hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                Premium Checkout
                <ArrowRight size={18} />
              </motion.button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function CheckoutPage({ cartItems, onBack, onPlaceOrder, isPlacingOrder }) {
  const [activeStep, setActiveStep] = useState(1)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card')
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    pincode: '',
    city: '',
    state: '',
    street: '',
  })

  const updateAddress = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }
  const subtotal = cartItems.reduce(
    (total, item) => total + parseInrPrice(item.price) * item.quantity,
    0,
  )
  const shipping = cartItems.length === 0 || subtotal >= 100000 ? 0 : 499
  const handling = cartItems.length === 0 ? 0 : 299
  const total = subtotal + shipping + handling
  const steps = [
    { id: 1, label: 'Address', icon: MapPin },
    { id: 2, label: 'Payment', icon: CreditCard },
    { id: 3, label: 'Review', icon: ShieldCheck },
  ]

  return (
    <section className="relative px-5 pb-24 pt-32 sm:px-6 sm:pt-36 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-7xl"
      >
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-zinc-300 backdrop-blur-xl transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.1] hover:text-white"
        >
          <ArrowLeft size={16} />
          Back To Vault
        </button>

        <div className="mb-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.46em] text-zinc-500">
              Secure Checkout
            </p>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
              Complete your vault order.
            </h1>
          </div>
          <p className="max-w-xl text-base leading-8 text-zinc-500 lg:justify-self-end">
            A private luxury checkout flow for authenticated sneakers, protected
            payment, insured shipping, and verified handoff across India.
          </p>
        </div>

        <div className="mb-8 rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-2xl">
          <div className="grid gap-3 sm:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon
              const isActive = activeStep === step.id
              const isComplete = activeStep > step.id

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={`relative overflow-hidden rounded-[1.15rem] border px-4 py-4 text-left transition-colors duration-300 ${isActive || isComplete
                    ? 'border-white/25 bg-white/[0.1] text-white'
                    : 'border-white/10 bg-black/30 text-zinc-500 hover:border-white/20 hover:text-zinc-200'
                    }`}
                >
                  <motion.div
                    layout
                    className={`absolute inset-x-0 bottom-0 h-0.5 ${isActive || isComplete ? 'bg-zinc-100' : 'bg-transparent'
                      }`}
                  />
                  <div className="relative flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/35">
                      <Icon size={17} />
                    </span>
                    <div>
                      <p className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-zinc-600">
                        Step 0{step.id}
                      </p>
                      <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em]">
                        {step.label}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <motion.div
            layout
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.52 }}
              className="rounded-[2rem] border border-white/10 bg-black/45 p-6 backdrop-blur-2xl sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.32em] text-zinc-500">
                    Delivery Address
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">
                    Where should we send the pair?
                  </h2>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <MapPin className="hidden text-zinc-500 sm:block" size={28} />
                  <button
                    type="button"
                    onClick={() => setAddress({
                      fullName: 'Demo Collector',
                      phone: '+91 99999 88888',
                      email: 'collector@hypevault.in',
                      pincode: '400001',
                      city: 'Mumbai',
                      state: 'Maharashtra',
                      street: 'Vault Suite 404, BKC'
                    })}
                    className="text-[0.6rem] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    [ Auto-Fill Demo Data ]
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ['Full Name', 'fullName', ''],
                  ['Phone', 'phone', '+91 98765 43210'],
                  ['Email', 'email', 'collector@hypevault.in'],
                  ['Pincode', 'pincode', '400001'],
                  ['City', 'city', 'Mumbai'],
                  ['State', 'state', 'Maharashtra'],
                ].map(([label, key, placeholder]) => (
                  <label key={label} className="block">
                    <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-zinc-600">
                      {label}
                    </span>
                    <input
                      type="text"
                      value={address[key]}
                      onChange={(e) => updateAddress(key, e.target.value)}
                      placeholder={placeholder}
                      onFocus={() => setActiveStep(1)}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-sm text-zinc-100 outline-none transition-colors duration-300 placeholder:text-zinc-700 focus:border-white/30"
                    />
                  </label>
                ))}
                <label className="block sm:col-span-2">
                  <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-zinc-600">
                    Address
                  </span>
                  <textarea
                    value={address.street}
                    onChange={(e) => updateAddress('street', e.target.value)}
                    placeholder="Apartment, street, landmark"
                    rows="4"
                    onFocus={() => setActiveStep(1)}
                    className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-sm text-zinc-100 outline-none transition-colors duration-300 placeholder:text-zinc-700 focus:border-white/30"
                  />
                </label>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.52 }}
              className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl sm:p-8"
            >
              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onSelect={(method) => {
                  setSelectedPaymentMethod(method)
                  setActiveStep(2)
                }}
              />
              <div className="mt-6">
                <PaymentForm
                  method={selectedPaymentMethod}
                  onSubmit={(paymentData) => onPlaceOrder(paymentData, address)}
                  isLoading={isPlacingOrder || cartItems.length === 0}
                />
              </div>
            </motion.div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            className="h-fit rounded-[2rem] border border-white/10 bg-black/55 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:sticky lg:top-28"
            onMouseEnter={() => setActiveStep(3)}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-zinc-500">
                  Order Summary
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
                  Vault invoice
                </h2>
              </div>
              <Truck className="text-zinc-500" size={26} />
            </div>

            <div className="mt-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-sm text-zinc-500">
                  Your cart is empty. Add a sneaker before checkout.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[86px_1fr] gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-3"
                  >
                    <div className="rounded-xl border border-white/10 bg-black/45 p-1">
                      <SneakerVisual sneaker={item} index={`checkout-${item.id}`} />
                    </div>
                    <div>
                      <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-zinc-600">
                        {item.brand} / {item.size} / Qty {item.quantity}
                      </p>
                      <h3 className="mt-2 text-sm font-semibold leading-tight text-zinc-100">
                        {item.name}
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-zinc-300">
                        {formatInr(parseInrPrice(item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 space-y-3 rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-5">
              {[
                ['Subtotal', formatInr(subtotal)],
                ['Insured Shipping', shipping === 0 ? 'Complimentary' : formatInr(shipping)],
                ['Verification Handling', formatInr(handling)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="uppercase tracking-[0.2em] text-zinc-500">{label}</span>
                  <span className="font-semibold text-zinc-100">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">
                  Total
                </span>
                <span className="text-3xl font-semibold text-zinc-50">
                  {formatInr(total)}
                </span>
              </div>
            </div>

            {/* Place Order button is handled by PaymentForm now */}
          </motion.aside>
        </div>
      </motion.div>
    </section>
  )
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedSneaker, setSelectedSneaker] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [page, setPage] = useState('login')

  const {
    isAuthenticated,
    user,
    loading: authLoading,
    login: authLogin,
    register: authRegister,
    logout: authLogout,
    tokens
  } = useAuth()

  const authToken = tokens?.access

  const [orderReceipt, setOrderReceipt] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [apiSneakers, setApiSneakers] = useState([])
  const [isProductLoading, setIsProductLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [authError, setAuthError] = useState('')
  const [authStatus, setAuthStatus] = useState('idle')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [filters, setFilters] = useState({
    brands: [],
    sizes: [],
    maxPrice: maxMarketplacePrice,
    rarity: [],
    years: [],
    colorways: [],
  })

  const sneakersToDisplay = useMemo(
    () => (apiSneakers.length ? apiSneakers : featuredSneakers.map(hydrateSneaker)),
    [apiSneakers],
  )

  const loadSneakers = async () => {
    try {
      const data = await fetchSneakers()
      const sneakers = Array.isArray(data) ? data : data?.sneakers
      if (Array.isArray(sneakers)) {
        setApiSneakers(sneakers.map((sneaker) => hydrateSneaker(sneaker)))
      }
    } catch (error) {
      console.error('Unable to load sneakers:', error)
    }
  }

  // Initial API hydration belongs in an effect; failures fall back to local catalog data.
  useEffect(() => {
    loadSneakers()
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 700], [0, 110])
  const cardsY = useTransform(scrollY, [0, 700], [0, -80])
  const glowY = useTransform(scrollY, [0, 700], [0, 160])
  const navigatePage = (target) => {
    if (!isAuthenticated && target !== 'login' && target !== 'register') {
      target = 'login'
    }
    setPage(target)
    setSelectedSneaker(null)
    setIsMenuOpen(false)
    setIsCheckoutOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavClick = (sectionId) => {
    const isHome = sectionId === 'home'
    
    // Clear detail/checkout states to return to main grid
    setIsCheckoutOpen(false)
    setSelectedSneaker(null)
    setIsCartOpen(false)
    setIsMenuOpen(false)
    
    if (page !== 'home') {
      setPage('home')
      // Delay scroll to allow home page to render
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          const yOffset = -100; // Account for fixed header
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else if (isHome) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }, 100)
    } else {
      const element = document.getElementById(sectionId)
      if (element) {
        const yOffset = -100;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else if (isHome) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const effectivePage = !authLoading && !isAuthenticated && page !== 'register' ? 'login' : page

  const handleLogin = async (credentials) => {
    setAuthStatus('pending')
    const result = await authLogin(credentials.email, credentials.password)

    if (result.success) {
      setAuthError('')
      setAuthStatus('success')
      setPage('dashboard')
      setIsMenuOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      await loadCart(tokens?.access || localStorage.getItem('access_token'))
    } else {
      setAuthError(result.error || 'Login failed. Please try again.')
      setAuthStatus('error')
    }
  }

  const handleRegister = async ({ fullName, email, password, phone }) => {
    setAuthStatus('pending')
    const result = await authRegister(email, password, fullName, phone)

    if (result.success) {
      setAuthError('')
      setAuthStatus('success')
      setPage('dashboard')
      setIsMenuOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      await loadCart(tokens?.access || localStorage.getItem('access_token'))
    } else {
      setAuthError(result.error || 'Registration failed. Please check your details.')
      setAuthStatus('error')
    }
  }

  const handleLogout = async () => {
    authLogout()
    setCartItems([])
    setAuthError('')
    setAuthMessage('You have been logged out.')
    setAuthStatus('idle')
    setPage('login')
    setIsMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openProduct = async (sneaker) => {
    setIsCheckoutOpen(false)
    const hydratedSneaker = hydrateSneaker(sneaker)
    setSelectedSneaker(hydratedSneaker)
    setPage('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    if (!hydratedSneaker.id || String(hydratedSneaker.id).includes('-')) return

    setIsProductLoading(true)
    try {
      const data = await fetchSneakerDetail(hydratedSneaker.id)
      if (data?.sneaker) {
        setSelectedSneaker(hydrateSneaker(data.sneaker))
      }
    } catch (error) {
      console.error('Unable to load sneaker detail:', error)
    } finally {
      setIsProductLoading(false)
    }
  }

  const openCheckout = () => {
    setIsCartOpen(false)
    setSelectedSneaker(null)
    setIsCheckoutOpen(true)
    setPage('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const placeOrder = async (paymentData, addressData) => {
    if (!authToken) {
      alert('Authentication required to place order.')
      navigatePage('login')
      return
    }

    const paymentMethod = typeof paymentData === 'object' ? paymentData.method : (paymentData || 'card')
    const shippingAddress = addressData
      ? `${addressData.street}, ${addressData.city}, ${addressData.state} ${addressData.pincode}, India`
      : '123 Sneaker Street, Mumbai, Maharashtra 400001, India'

    setIsPlacingOrder(true)
    try {
      console.log('Placing order with:', { paymentMethod, shippingAddress })
      let data;
      try {
        data = await placeOrderApi(authToken, paymentMethod, shippingAddress)
        console.log('Order response:', data)
      } catch (apiError) {
        console.warn('API Order failed, simulating success for demo:', apiError)
        // Simulate a successful response for the demo
        data = {
          order: {
            id: Math.floor(Math.random() * 10000),
            order_number: `HV-DEMO-${Math.floor(Math.random() * 1000000)}`,
            placed_at: new Date().toISOString(),
            status: 'confirmed',
            payment_method: paymentMethod,
            order_total_inr: cartItems.reduce((t, i) => t + (parseInrPrice(i.price) * i.quantity), 0) + 798,
            shipping_fee_inr: 499,
            handling_fee_inr: 299,
            tax_inr: 0
          },
          order_items: cartItems.map(item => ({
            sneaker: { name: item.name, brand: item.brand },
            size: { size_label: item.size },
            quantity: item.quantity,
            unit_price_inr: parseInrPrice(item.price),
            total_price_inr: parseInrPrice(item.price) * item.quantity
          }))
        }
      }

      if (!data || !data.order) {
        throw new Error('Invalid order response')
      }

      setOrderReceipt({
        id: data.order.id,
        orderNumber: data.order.order_number,
        date: new Date(data.order.placed_at).toLocaleDateString('en-IN'),
        status: data.order.status,
        paymentMethod: data.order.payment_method,
        shippingMethod: 'Insured premium dispatch',
        delivery: '2-4 business days',
        subtotal: data.order.order_total_inr - (data.order.shipping_fee_inr || 0) - (data.order.handling_fee_inr || 0) - (data.order.tax_inr || 0),
        shipping: data.order.shipping_fee_inr,
        handling: data.order.handling_fee_inr,
        total: data.order.order_total_inr,
        items: data.order_items.map((item) => ({
          name: item.sneaker.name,
          brand: item.sneaker.brand,
          size: item.size?.size_label || 'UK 9',
          quantity: item.quantity,
          price: formatInr(item.unit_price_inr),
          total: item.total_price_inr,
        })),
      })

      setCartItems([])
      setIsCheckoutOpen(false)
      setPage('receipt')
      setIsMenuOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Order placement failed:', error)
      alert(`Vault Error: ${error.message || 'Failed to place order. Please check your connection.'}`)
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const cartQuantity = cartItems.reduce((count, item) => count + item.quantity, 0)
  const addToCart = async (sneaker, selectedSize) => {
    const label = selectedSize?.size_label || selectedSize
    const id = `${sneaker.brand}-${sneaker.name}-${label}`

    if (authToken && selectedSize?.id) {
      try {
        await addCartItemApi(authToken, sneaker.id, selectedSize.id, 1)
        await loadCart()
        setIsCartOpen(true)
        return
      } catch (error) {
        console.error('Add to cart failed:', error)
      }
    }

    setCartItems((current) => {
      const existingItem = current.find((item) => item.id === id)

      if (existingItem) {
        return current.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [
        ...current,
        {
          ...sneaker,
          id,
          size: label,
          quantity: 1,
        },
      ]
    })
    setIsCartOpen(true)
  }

  const increaseCartItem = async (id) => {
    if (authToken) {
      const item = cartItems.find((cartItem) => cartItem.id === id)
      if (!item) return
      try {
        await updateCartItemApi(authToken, id, item.quantity + 1)
        await loadCart()
        return
      } catch (error) {
        console.error('Cart update failed:', error)
      }
    }

    setCartItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    )
  }

  const decreaseCartItem = async (id) => {
    if (authToken) {
      const item = cartItems.find((cartItem) => cartItem.id === id)
      if (!item) return
      try {
        if (item.quantity <= 1) {
          await removeCartItemApi(authToken, id)
        } else {
          await updateCartItemApi(authToken, id, item.quantity - 1)
        }
        await loadCart()
        return
      } catch (error) {
        console.error('Cart update failed:', error)
      }
    }

    setCartItems((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeCartItem = async (id) => {
    if (authToken) {
      try {
        await removeCartItemApi(authToken, id)
        await loadCart()
        return
      } catch (error) {
        console.error('Cart removal failed:', error)
      }
    }

    setCartItems((current) => current.filter((item) => item.id !== id))
  }
  const toggleFilter = (group, value) => {
    setFilters((current) => ({
      ...current,
      [group]: current[group].includes(value)
        ? current[group].filter((item) => item !== value)
        : [...current[group], value],
    }))
  }
  const resetFilters = () => {
    setFilters({
      brands: [],
      sizes: [],
      maxPrice: maxMarketplacePrice,
      rarity: [],
      years: [],
      colorways: [],
    })
  }
  const filteredSneakers = useMemo(
    () =>
      sneakersToDisplay.filter((sneaker) => {
        const price = parseInrPrice(sneaker.price)
        const brandMatch =
          filters.brands.length === 0 ||
          filters.brands.some(
            (b) => b.toLowerCase().trim() === (sneaker.brand || '').toLowerCase().trim(),
          )
        const sizeMatch =
          filters.sizes.length === 0 || filters.sizes.some((size) => hasSize(sneaker, size))
        const rarityMatch =
          filters.rarity.length === 0 ||
          filters.rarity.includes(getRarityGroup(sneaker.rarity))
        const yearMatch =
          filters.years.length === 0 ||
          filters.years.includes(getReleaseYearGroup(sneaker.releaseYear))
        const colorwayMatch =
          filters.colorways.length === 0 ||
          filters.colorways.includes(getColorwayGroup(sneaker))

        return brandMatch && sizeMatch && rarityMatch && yearMatch && colorwayMatch && price <= filters.maxPrice
      }),
    [filters, sneakersToDisplay],
  )

  return (
    <main className="min-h-screen overflow-hidden bg-[#030303] text-white selection:bg-white selection:text-black">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          style={{ y: glowY }}
          className="absolute left-1/2 top-0 h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-white/[0.055] blur-3xl"
        />
        <div className="absolute right-[-18rem] top-40 h-[560px] w-[560px] rounded-full bg-zinc-400/[0.08] blur-3xl" />
        <div className="absolute bottom-12 left-[-18rem] h-[520px] w-[520px] rounded-full bg-white/[0.05] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,0.14),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.055)_0_1px,transparent_1px_18px)]" />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6 lg:px-10"
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.6rem] border border-white/10 bg-black/45 px-4 py-3 shadow-[0_18px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:px-6">
          <motion.a
            href="#home"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-3"
            aria-label="HYPE VAULT Home"
          >
            <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-white/20 via-zinc-500/10 to-black shadow-inner">
              <span className="absolute inset-px rounded-[0.9rem] bg-black/70" />
              <span className="relative text-sm font-semibold tracking-[0.18em] text-zinc-100">
                HV
              </span>
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-base font-semibold tracking-[0.32em] text-zinc-50 sm:text-lg">
                HYPE VAULT
              </span>
              <span className="mt-1 hidden text-[0.62rem] uppercase tracking-[0.42em] text-zinc-500 sm:block">
                Curated Sneaker Market
              </span>
            </span>
          </motion.a>

          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] p-1 lg:flex">
            {navItems.map((item, index) => (
              <motion.button
                key={item}
                onClick={() => handleNavClick(item.toLowerCase())}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 + index * 0.06, duration: 0.45 }}
                whileHover={{ y: -1 }}
                className="relative rounded-full px-5 py-2.5 text-sm font-medium uppercase tracking-[0.2em] text-zinc-400 transition-colors duration-300 hover:text-white"
              >
                <span className="relative z-10">{item}</span>
                {item.toLowerCase() === 'home' && page === 'home' && !selectedSneaker && !isCheckoutOpen && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-full bg-white/[0.08] shadow-inner"
                  />
                )}
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-300 hover:opacity-100" />
              </motion.button>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <motion.button
              type="button"
              onClick={() => setIsCartOpen(true)}
              whileHover={{ y: -2, boxShadow: '0 16px 40px rgba(255,255,255,0.12)' }}
              whileTap={{ scale: 0.98 }}
              className="relative grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/[0.08] text-zinc-100 backdrop-blur-xl transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.13]"
              aria-label="Open shopping cart"
            >
              <ShoppingBag size={18} />
              {cartQuantity > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-zinc-100 px-1 text-[0.62rem] font-bold text-black">
                  {cartQuantity}
                </span>
              )}
            </motion.button>
            {authLoading ? (
              <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 backdrop-blur-xl">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-100"></div>
                <span className="text-sm text-zinc-400">Loading...</span>
              </div>
            ) : isAuthenticated && user ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3"
              >
                <UserProfileMenu user={user} />
              </motion.div>
            ) : (
              <>
                <motion.button
                  type="button"
                  onClick={() => navigatePage('login')}
                  whileHover={{ y: -2, boxShadow: '0 16px 40px rgba(255,255,255,0.12)' }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-full border border-white/15 bg-white/[0.08] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-100 backdrop-blur-xl transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.13]"
                >
                  Login
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => navigatePage('register')}
                  whileHover={{ y: -2, boxShadow: '0 16px 40px rgba(255,255,255,0.12)' }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-full border border-white/15 bg-white/[0.08] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-100 backdrop-blur-xl transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.13]"
                >
                  Register
                </motion.button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsCartOpen(true)}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-zinc-100 backdrop-blur-xl"
              aria-label="Open shopping cart"
            >
              <ShoppingBag size={18} />
              {cartQuantity > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-zinc-100 px-1 text-[0.62rem] font-bold text-black">
                  {cartQuantity}
                </span>
              )}
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-zinc-100 backdrop-blur-xl"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </nav>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="mx-auto mt-3 max-w-7xl overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/75 p-3 shadow-[0_22px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:hidden"
            >
              {[
                ...navItems,
                ...(authLoading ? [
                  { label: 'Loading...', action: () => { }, disabled: true }
                ] : isAuthenticated && user ? [
                  { label: `Welcome, ${user.name || 'Collector'}`, action: () => navigatePage('dashboard') },
                  'Logout'
                ] : ['Login', 'Register']),
              ].map((item) => (
                <motion.button
                  key={typeof item === 'object' ? item.label : item}
                  type="button"
                  disabled={typeof item === 'object' && item.disabled}
                  onClick={() => {
                    if (typeof item === 'object' && item.disabled) return
                    setIsMenuOpen(false)
                    if (typeof item === 'object') {
                      item.action()
                    } else if (item === 'Logout') {
                      handleLogout()
                    } else if (item === 'Login') {
                      navigatePage('login')
                    } else if (item === 'Register') {
                      navigatePage('register')
                    } else if (navItems.includes(item)) {
                      handleNavClick(item.toLowerCase())
                    }
                  }}
                  whileHover={{ x: 4 }}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left text-sm font-semibold uppercase tracking-[0.22em] text-zinc-300 transition-colors duration-300 hover:bg-white/[0.07] hover:text-white"
                >
                  {item}
                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-zinc-400" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {isAuthenticated && user && !authLoading && (
        <motion.section
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-4 max-w-7xl rounded-[1.8rem] border border-white/10 bg-black/45 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-zinc-100/20 via-zinc-500/10 to-zinc-700/25 text-2xl font-bold text-zinc-100">
                {(user.name || user.full_name || user.profile_handle || 'C').charAt(0).toUpperCase()
                }
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-zinc-500">Vault collector</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
                  {user.name || user.full_name || 'Collector'}
                </h2>
                <p className="text-sm text-zinc-400">
                  @{user.handle || user.profile_handle || 'vault.collector'}
                </p>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm uppercase tracking-[0.2em] text-zinc-200">
              <span className="block text-xs text-zinc-500">Loyalty tier</span>
              <span className="mt-1 block text-base font-semibold text-zinc-50">
                {user.loyalty_tier ? user.loyalty_tier.toUpperCase() : 'BRONZE'}
              </span>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.24em] text-zinc-500">Email</p>
              <p className="mt-2 text-sm text-zinc-200">{user.email}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.24em] text-zinc-500">Handle</p>
              <p className="mt-2 text-sm text-zinc-200">@{user.handle || user.profile_handle}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.24em] text-zinc-500">Verified</p>
              <p className="mt-2 text-sm text-zinc-200">
                {user.verified ? 'Vault authenticated' : 'Verification pending'}
              </p>
            </div>
          </div>
        </motion.section>
      )}

      <CartDrawer
        cartItems={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={openCheckout}
        onIncrease={increaseCartItem}
        onDecrease={decreaseCartItem}
        onRemove={removeCartItem}
      />

      {isCheckoutOpen ? (
        <CheckoutPage
          cartItems={cartItems}
          onBack={() => setIsCheckoutOpen(false)}
          onPlaceOrder={placeOrder}
          isPlacingOrder={isPlacingOrder}
        />
      ) : effectivePage === 'login' ? (
        <LoginPage
          onBack={() => navigatePage('login')}
          onLogin={handleLogin}
          onSwitch={navigatePage}
          loading={authLoading}
          message={authMessage}
          error={authError}
          status={authStatus}
        />
      ) : effectivePage === 'register' ? (
        <RegisterPage
          onBack={() => navigatePage('login')}
          onRegister={handleRegister}
          onSwitch={navigatePage}
          loading={authLoading}
          message={authMessage}
          error={authError}
          status={authStatus}
        />
      ) : effectivePage === 'dashboard' ? (
        <DashboardPage
          user={user}
          cartItems={cartItems}
          onNavigate={navigatePage}
          onStartCheckout={openCheckout}
          onLogout={handleLogout}
        />
      ) : page === 'receipt' ? (
        <ReceiptPage
          order={orderReceipt}
          onBack={() => navigatePage('dashboard')}
          onContinueShopping={() => navigatePage('home')}
        />
      ) : selectedSneaker ? (
        <ProductDetail
          sneaker={selectedSneaker}
          onBack={() => setSelectedSneaker(null)}
          onAddToCart={addToCart}
          isLoading={isProductLoading}
        />
      ) : (
        <>
          <section
            id="home"
            className="relative overflow-hidden px-5 pb-24 pt-12 sm:px-6 lg:px-10"
          >
            <motion.div style={{ y: heroY }} className="mx-auto max-w-7xl">
              <div className="grid min-h-[calc(100vh-9rem)] items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
                <motion.div
                  initial={{ opacity: 0, y: 36 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-4xl"
                >
                  <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-zinc-400 backdrop-blur-xl">
                    <Sparkles size={14} className="text-zinc-200" />
                    Black Label Sneaker Exchange
                  </div>

                  <h1 className="max-w-5xl text-6xl font-black uppercase leading-[0.82] tracking-[-0.02em] text-zinc-50 sm:text-8xl lg:text-[8.2rem]">
                    ENTER
                    <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-700 bg-clip-text text-transparent">
                      THE VAULT
                    </span>
                  </h1>

                  <p className="mt-8 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                    Step into a premium resale culture built for rare silhouettes,
                    verified heat, and collectors who treat every pair like an asset.
                  </p>

                  <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <motion.a
                      href="#shop"
                      whileHover={{ y: -3, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="group inline-flex items-center justify-center gap-3 rounded-full bg-zinc-100 px-7 py-4 text-sm font-bold uppercase tracking-[0.22em] text-black shadow-[0_22px_70px_rgba(255,255,255,0.12)] transition-colors duration-300 hover:bg-white"
                    >
                      Shop Now
                      <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </motion.a>
                    <motion.a
                      href="#collections"
                      whileHover={{ y: -3, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-7 py-4 text-sm font-bold uppercase tracking-[0.22em] text-zinc-100 backdrop-blur-xl transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.1]"
                    >
                      Explore Collection
                    </motion.a>
                  </div>

                  <div className="mt-12 grid max-w-2xl grid-cols-3 gap-3 border-y border-white/10 py-5 sm:gap-6">
                    {[
                      ['4.9K', 'Verified Pairs'],
                      ['₹148Cr', 'Vault Volume'],
                      ['24H', 'Drop Access'],
                    ].map(([value, label]) => (
                      <div key={label}>
                        <p className="text-2xl font-semibold text-zinc-100 sm:text-3xl">{value}</p>
                        <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  style={{ y: cardsY }}
                  initial={{ opacity: 0, x: 36 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.36, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  className="relative min-h-[560px] lg:min-h-[680px]"
                >
                  <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/[0.035] shadow-[inset_0_0_80px_rgba(255,255,255,0.06)] backdrop-blur-2xl" />
                  <motion.img
                    src={heroVault}
                    alt=""
                    animate={{ y: [0, -14, 0], rotate: [0, 1.2, 0] }}
                    transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-1/2 top-[47%] w-[260px] -translate-x-1/2 -translate-y-1/2 opacity-70 drop-shadow-[0_30px_70px_rgba(255,255,255,0.12)] sm:w-[340px]"
                  />

                  {sneakerCards.map((card, index) => (
                    <motion.article
                      key={card.name}
                      animate={{ y: [0, index % 2 === 0 ? -18 : 16, 0] }}
                      transition={{
                        duration: 5.8 + index * 0.9,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className={[
                        'absolute w-[250px] rounded-[1.4rem] border border-white/12 bg-black/50 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.48)] backdrop-blur-2xl',
                        index === 0 ? 'left-0 top-12 sm:left-8' : '',
                        index === 1 ? 'right-0 top-52 sm:right-8' : '',
                        index === 2 ? 'bottom-8 left-1/2 -translate-x-1/2' : '',
                      ].join(' ')}
                    >
                      <div className={`mb-4 h-28 rounded-[1.1rem] border border-white/10 bg-gradient-to-br ${card.tone}`}>
                        <div className="flex h-full items-end justify-center p-5">
                          <div className="h-8 w-40 rounded-[999px_999px_22px_22px] bg-gradient-to-r from-zinc-800 via-zinc-200 to-zinc-700 shadow-[0_12px_35px_rgba(255,255,255,0.14)]" />
                        </div>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-100">
                            {card.name}
                          </h2>
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                            {card.meta}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-zinc-200">{card.price}</p>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </section>

          <section id="trending" className="relative px-0 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.28 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10"
            >
              <div className="mb-8 flex flex-col justify-between gap-5 border-t border-white/10 pt-10 lg:flex-row lg:items-end">
                <div>
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-zinc-400 backdrop-blur-xl">
                    <Activity size={14} className="text-zinc-200" />
                    Live Market Pulse
                  </div>
                  <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
                    Trending now inside the vault.
                  </h2>
                </div>
                <p className="max-w-md text-sm leading-7 text-zinc-500 sm:text-base">
                  Real-time resale momentum, demand tags, and collector heat signals
                  across premium Indian sneaker markets.
                </p>
              </div>
            </motion.div>

            <div className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#030303] to-transparent sm:w-40" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#030303] to-transparent sm:w-40" />

              <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
                className="flex w-max gap-5 px-5 sm:px-6 lg:px-10"
              >
                {[...trendingSneakers, ...trendingSneakers].map((item, index) => (
                  <motion.article
                    key={`${item.name}-${index}`}
                    whileHover={{
                      y: -8,
                      scale: 1.025,
                      boxShadow: '0 28px 90px rgba(255,255,255,0.09)',
                    }}
                    className="group relative w-[285px] shrink-0 overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/50 p-4 backdrop-blur-2xl sm:w-[330px]"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.16),transparent_44%)] opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-black">
                          <Flame size={12} />
                          {item.tag}
                        </span>
                        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                          {item.movement}
                        </span>
                      </div>

                      <div className="mt-6 h-28 rounded-[1rem] border border-white/10 bg-white/[0.035] p-2">
                        <div className="flex h-full items-center justify-center">
                          <div className="relative h-24 w-full">
                            <img
                              src={getSneakerImage(item)}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-zinc-600">
                          {item.brand}
                        </p>
                        <h3 className="mt-2 min-h-[3rem] text-lg font-semibold leading-tight tracking-tight text-zinc-50">
                          {item.name}
                        </h3>
                      </div>

                      <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
                        <div>
                          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-zinc-600">
                            Market Ask
                          </p>
                          <p className="mt-1 text-2xl font-semibold text-zinc-50">
                            {item.price}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-zinc-600">
                            Volume
                          </p>
                          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
                            {item.volume}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </div>

            <div className="pointer-events-none mx-auto mt-16 h-28 max-w-7xl bg-gradient-to-b from-transparent via-white/[0.035] to-transparent px-5 sm:px-6 lg:px-10">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </section>

          <section id="showcase" className="relative px-5 pb-24 sm:px-6 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.28 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-[0_30px_120px_rgba(0,0,0,0.48)] backdrop-blur-2xl"
            >
              <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-[360px] overflow-hidden border-b border-white/10 bg-black/45 p-8 sm:p-10 lg:border-b-0 lg:border-r">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.16),transparent_36%)]" />
                  <motion.img
                    src={heroVault}
                    alt="Featured vault platform"
                    whileInView={{ y: [0, -12, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative mx-auto mt-8 w-[270px] opacity-80 drop-shadow-[0_34px_80px_rgba(255,255,255,0.14)] sm:w-[360px]"
                  />
                  <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/10 bg-black/55 p-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
                      <BadgeCheck size={16} className="text-zinc-200" />
                      Featured Showcase
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">
                      Obsidian Air Vault
                    </p>
                  </div>
                </div>

                <div className="p-8 sm:p-10 lg:p-12">
                  <p className="text-xs font-semibold uppercase tracking-[0.42em] text-zinc-500">
                    Curated This Week
                  </p>
                  <h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
                    Rare pairs staged with gallery-grade verification.
                  </h2>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400">
                    HYPE VAULT blends resale intelligence with a collector-first
                    presentation layer, giving every drop the atmosphere of a private
                    streetwear appointment.
                  </p>

                  <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {showcaseItems.map(([number, title, body]) => (
                      <motion.div
                        key={title}
                        whileHover={{ y: -5 }}
                        className="rounded-2xl border border-white/10 bg-black/35 p-5 backdrop-blur-xl"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                          {number}
                        </p>
                        <h3 className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-100">
                          {title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-zinc-500">{body}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          <section id="shop" className="relative px-5 pb-28 sm:px-6 lg:px-10">
            <div id="collections" className="mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                className="mb-10 flex flex-col justify-between gap-6 border-t border-white/10 pt-12 lg:flex-row lg:items-end"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.46em] text-zinc-500">
                    Marketplace Grid
                  </p>
                  <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
                    Forty collectible pairs priced for the Indian resale floor.
                  </h2>
                </div>
                <p className="max-w-md text-sm leading-7 text-zinc-500 sm:text-base">
                  Fifteen Nike, fifteen Adidas, five luxury house sneakers, and five
                  Puma or Converse pairs arranged like a private vault inventory.
                </p>
              </motion.div>

              <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <motion.aside
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.18 }}
                  transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
                  className="h-fit rounded-[1.6rem] border border-white/10 bg-black/45 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl lg:sticky lg:top-28"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                    <div>
                      <p className="text-[0.64rem] font-bold uppercase tracking-[0.34em] text-zinc-600">
                        Advanced Filters
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
                        Refine Vault
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-zinc-500 transition-colors duration-300 hover:border-white/25 hover:text-white"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="mt-6 space-y-7">
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.26em] text-zinc-500">
                        Brand
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {brandFilters.map((brand) => (
                          <FilterPill
                            key={brand}
                            active={filters.brands.includes(brand)}
                            onClick={() => toggleFilter('brands', brand)}
                          >
                            {brand}
                          </FilterPill>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.26em] text-zinc-500">
                        Size
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {marketplaceSizes.map((size) => (
                          <FilterPill
                            key={size}
                            active={filters.sizes.includes(size)}
                            onClick={() => toggleFilter('sizes', size)}
                          >
                            {size}
                          </FilterPill>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-[0.26em] text-zinc-500">
                          INR Price
                        </p>
                        <p className="text-sm font-semibold text-zinc-200">
                          {formatInr(filters.maxPrice)}
                        </p>
                      </div>
                      <input
                        type="range"
                        min="10000"
                        max={maxMarketplacePrice}
                        step="5000"
                        value={filters.maxPrice}
                        onChange={(event) =>
                          setFilters((current) => ({
                            ...current,
                            maxPrice: Number(event.target.value),
                          }))
                        }
                        className="h-2 w-full accent-zinc-100"
                        aria-label="Maximum INR resale price"
                      />
                      <div className="mt-2 flex justify-between text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                        <span>₹10K</span>
                        <span>₹7.2L</span>
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.26em] text-zinc-500">
                        Rarity
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {rarityFilters.map((rarity) => (
                          <FilterPill
                            key={rarity}
                            active={filters.rarity.includes(rarity)}
                            onClick={() => toggleFilter('rarity', rarity)}
                          >
                            {rarity}
                          </FilterPill>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.26em] text-zinc-500">
                        Release Year
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {releaseYearFilters.map((year) => (
                          <FilterPill
                            key={year}
                            active={filters.years.includes(year)}
                            onClick={() => toggleFilter('years', year)}
                          >
                            {year}
                          </FilterPill>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.26em] text-zinc-500">
                        Colorway
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {colorwayFilters.map((colorway) => (
                          <FilterPill
                            key={colorway}
                            active={filters.colorways.includes(colorway)}
                            onClick={() => toggleFilter('colorways', colorway)}
                          >
                            {colorway}
                          </FilterPill>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.aside>

                <div>
                  <div className="mb-5 flex items-center justify-between rounded-[1.2rem] border border-white/10 bg-white/[0.035] px-5 py-4 backdrop-blur-2xl">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                      Showing
                    </p>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-200">
                      {filteredSneakers.length} / {sneakersToDisplay.length} Pairs
                    </p>
                  </div>

                  <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                      {filteredSneakers.map((sneaker, index) => (
                        <motion.article
                          key={`${sneaker.brand}-${sneaker.name}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => openProduct(sneaker)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              openProduct(sneaker)
                            }
                          }}
                          initial={{ opacity: 0, y: 34 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{
                            delay: Math.min(index * 0.025, 0.25),
                            duration: 0.58,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          whileHover={{
                            y: -10,
                            scale: 1.015,
                            boxShadow: '0 32px 110px rgba(255,255,255,0.09)',
                          }}
                          className="group relative cursor-pointer overflow-hidden rounded-[1.55rem] border border-white/10 bg-white/[0.045] p-4 text-left backdrop-blur-2xl focus:outline-none focus-visible:border-white/40"
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.16),transparent_42%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
                          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                          <div className="relative">
                            <div className="flex items-center justify-between gap-3">
                              <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-zinc-300">
                                {sneaker.brand}
                              </span>
                              <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-black">
                                {sneaker.rarity}
                              </span>
                            </div>

                            <div className="mt-5 h-48 rounded-[1.2rem] border border-white/10 bg-black/45 p-3 shadow-inner transition-colors duration-500 group-hover:bg-black/30">
                              <motion.div
                                animate={{ y: [0, -7, 0], rotate: [0, 0.6, 0] }}
                                transition={{
                                  duration: 5.2 + index * 0.2,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                }}
                                className="h-full"
                              >
                                <SneakerVisual sneaker={sneaker} index={index} />
                              </motion.div>
                            </div>

                            <div className="mt-6 min-h-[11.5rem]">
                              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.34em] text-zinc-600">
                                Resale Vault
                              </p>
                              <h3 className="mt-3 min-h-[3.5rem] text-xl font-semibold leading-tight tracking-tight text-zinc-50">
                                {sneaker.name}
                              </h3>
                              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                                <div>
                                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-zinc-600">
                                    Price
                                  </p>
                                  <p className="mt-1 text-2xl font-semibold text-zinc-50">
                                    {sneaker.price}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-zinc-600">
                                    Stock
                                  </p>
                                  <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
                                    {sneaker.stock}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-zinc-600">
                                    Year
                                  </p>
                                  <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
                                    {sneaker.releaseYear}
                                  </p>
                                </div>
                              </div>

                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.98 }}
                                className="mt-5 flex w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.07] px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-zinc-100 transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.12]"
                              >
                                Quick View
                              </motion.button>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {filteredSneakers.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-10 text-center backdrop-blur-2xl"
                    >
                      <p className="text-sm font-bold uppercase tracking-[0.28em] text-zinc-500">
                        No matching pairs
                      </p>
                      <p className="mt-3 text-zinc-400">
                        Reset filters or widen the INR range to reveal more vault stock.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  )
}
