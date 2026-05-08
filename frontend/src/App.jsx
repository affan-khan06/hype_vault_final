import { useMemo, useState } from 'react'
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
  MapPin,
  Menu,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Trash2,
  X,
} from 'lucide-react'
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
  },
  {
    name: 'Air Jordan 4 Military Black',
    brand: 'Nike',
    price: '₹46,999',
    stock: '8 pairs',
    rarity: 'Most Traded',
    releaseYear: '2022',
    palette: ['#ffffff', '#9ca3af', '#111827'],
  },
  {
    name: 'Air Jordan 1 Retro High Travis Scott Mocha',
    brand: 'Nike',
    price: '₹1,62,000',
    stock: '2 pairs',
    rarity: 'Grail',
    releaseYear: '2019',
    palette: ['#f5f5f4', '#78716c', '#292524'],
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

const sizes = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11']

function parseInrPrice(price) {
  return Number(price.replace(/[^\d]/g, '')) || 0
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

function ProductDetail({ sneaker, onBack, onAddToCart }) {
  const [activeImage, setActiveImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(sizes[2])
  const stockCount = Number(sneaker.stock.match(/\d+/)?.[0] || 1)
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
                <SneakerArtwork
                  palette={sneaker.palette}
                  name={sneaker.name}
                  index={`detail-${activeImage}`}
                />
              </motion.div>
            </div>

            <div className="relative mt-5 grid grid-cols-3 gap-3">
              {gallery.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`rounded-2xl border p-3 text-left backdrop-blur-xl transition-colors duration-300 ${
                    activeImage === index
                      ? 'border-white/35 bg-white/[0.12] text-white'
                      : 'border-white/10 bg-black/35 text-zinc-500 hover:border-white/25 hover:text-zinc-200'
                  }`}
                >
                  <div className="h-20">
                    <SneakerArtwork
                      palette={sneaker.palette}
                      name={`${sneaker.name} ${item.label}`}
                      index={`thumb-${index}`}
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
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors duration-300 ${
                      selectedSize === size
                        ? 'border-white/35 bg-white text-black'
                        : 'border-white/10 bg-white/[0.045] text-zinc-400 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-zinc-500">Rarity Score</p>
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
                ['Condition', 'Deadstock / verified'],
                ['Selected Size', selectedSize],
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
      className={`rounded-full border px-3 py-2 text-[0.66rem] font-bold uppercase tracking-[0.18em] transition-colors duration-300 ${
        active
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
                            <SneakerArtwork
                              palette={item.palette}
                              name={item.name}
                              index={`cart-${item.id}`}
                            />
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

function CheckoutPage({ cartItems, onBack }) {
  const [activeStep, setActiveStep] = useState(1)
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
                  className={`relative overflow-hidden rounded-[1.15rem] border px-4 py-4 text-left transition-colors duration-300 ${
                    isActive || isComplete
                      ? 'border-white/25 bg-white/[0.1] text-white'
                      : 'border-white/10 bg-black/30 text-zinc-500 hover:border-white/20 hover:text-zinc-200'
                  }`}
                >
                  <motion.div
                    layout
                    className={`absolute inset-x-0 bottom-0 h-0.5 ${
                      isActive || isComplete ? 'bg-zinc-100' : 'bg-transparent'
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
                <MapPin className="hidden text-zinc-500 sm:block" size={28} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ['Full Name', 'Aarav Mehta'],
                  ['Phone', '+91 98765 43210'],
                  ['Email', 'collector@hypevault.in'],
                  ['Pincode', '400001'],
                  ['City', 'Mumbai'],
                  ['State', 'Maharashtra'],
                ].map(([label, placeholder]) => (
                  <label key={label} className="block">
                    <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-zinc-600">
                      {label}
                    </span>
                    <input
                      type="text"
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
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.32em] text-zinc-500">
                    Payment
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">
                    Encrypted payment details.
                  </h2>
                </div>
                <CreditCard className="hidden text-zinc-500 sm:block" size={28} />
              </div>

              <div className="mb-5 grid gap-3 sm:grid-cols-3">
                {['Card', 'UPI', 'Netbanking'].map((method, index) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className={`rounded-2xl border px-4 py-4 text-sm font-bold uppercase tracking-[0.18em] transition-colors duration-300 ${
                      index === 0
                        ? 'border-white/30 bg-zinc-100 text-black'
                        : 'border-white/10 bg-black/35 text-zinc-500 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-zinc-600">
                    Card Number
                  </span>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    onFocus={() => setActiveStep(2)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-sm text-zinc-100 outline-none transition-colors duration-300 placeholder:text-zinc-700 focus:border-white/30"
                  />
                </label>
                <label className="block">
                  <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-zinc-600">
                    Expiry
                  </span>
                  <input
                    type="text"
                    placeholder="08 / 29"
                    onFocus={() => setActiveStep(2)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-sm text-zinc-100 outline-none transition-colors duration-300 placeholder:text-zinc-700 focus:border-white/30"
                  />
                </label>
                <label className="block">
                  <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-zinc-600">
                    CVV
                  </span>
                  <input
                    type="password"
                    placeholder="***"
                    onFocus={() => setActiveStep(2)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-sm text-zinc-100 outline-none transition-colors duration-300 placeholder:text-zinc-700 focus:border-white/30"
                  />
                </label>
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
                      <SneakerArtwork
                        palette={item.palette}
                        name={item.name}
                        index={`checkout-${item.id}`}
                      />
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

            <motion.button
              type="button"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              disabled={cartItems.length === 0}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-zinc-100 px-6 py-4 text-sm font-bold uppercase tracking-[0.22em] text-black transition-colors duration-300 hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              Place Secure Order
              <ShieldCheck size={18} />
            </motion.button>
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
  const [cartItems, setCartItems] = useState([])
  const [filters, setFilters] = useState({
    brands: [],
    sizes: [],
    maxPrice: maxMarketplacePrice,
    rarity: [],
    years: [],
    colorways: [],
  })
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 700], [0, 110])
  const cardsY = useTransform(scrollY, [0, 700], [0, -80])
  const glowY = useTransform(scrollY, [0, 700], [0, 160])
  const openProduct = (sneaker) => {
    setIsCheckoutOpen(false)
    setSelectedSneaker(sneaker)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const openCheckout = () => {
    setIsCartOpen(false)
    setSelectedSneaker(null)
    setIsCheckoutOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const cartQuantity = cartItems.reduce((count, item) => count + item.quantity, 0)
  const addToCart = (sneaker, size) => {
    const id = `${sneaker.brand}-${sneaker.name}-${size}`
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
          size,
          quantity: 1,
        },
      ]
    })
    setIsCartOpen(true)
  }
  const increaseCartItem = (id) => {
    setCartItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    )
  }
  const decreaseCartItem = (id) => {
    setCartItems((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }
  const removeCartItem = (id) => {
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
      featuredSneakers.filter((sneaker) => {
        const price = parseInrPrice(sneaker.price)
        const brandMatch = filters.brands.length === 0 || filters.brands.includes(sneaker.brand)
        const sizeMatch = filters.sizes.length === 0 || filters.sizes.some((size) => hasSize(sneaker, size))
        const rarityMatch = filters.rarity.length === 0 || filters.rarity.includes(getRarityGroup(sneaker.rarity))
        const yearMatch = filters.years.length === 0 || filters.years.includes(getReleaseYearGroup(sneaker.releaseYear))
        const colorwayMatch = filters.colorways.length === 0 || filters.colorways.includes(getColorwayGroup(sneaker))

        return brandMatch && sizeMatch && rarityMatch && yearMatch && colorwayMatch && price <= filters.maxPrice
      }),
    [filters],
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
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 + index * 0.06, duration: 0.45 }}
                whileHover={{ y: -1 }}
                className="relative rounded-full px-5 py-2.5 text-sm font-medium uppercase tracking-[0.2em] text-zinc-400 transition-colors duration-300 hover:text-white"
              >
                <span className="relative z-10">{item}</span>
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-300 hover:opacity-100" />
              </motion.a>
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
            <motion.a
              href="#login"
              whileHover={{ y: -2, boxShadow: '0 16px 40px rgba(255,255,255,0.12)' }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full border border-white/15 bg-white/[0.08] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-100 backdrop-blur-xl transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.13]"
            >
              Login
            </motion.a>
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
              {[...navItems, 'Login'].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  whileHover={{ x: 4 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-300 transition-colors duration-300 hover:bg-white/[0.07] hover:text-white"
                >
                  {item}
                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-zinc-400" />
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

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
        />
      ) : selectedSneaker ? (
        <ProductDetail
          sneaker={selectedSneaker}
          onBack={() => setSelectedSneaker(null)}
          onAddToCart={addToCart}
        />
      ) : (
        <>
      <section
        id="home"
        className="relative px-5 pb-20 pt-32 sm:px-6 sm:pt-36 lg:px-10"
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
                      <div className="relative h-12 w-44">
                        <div className="absolute bottom-1 left-0 h-8 w-44 rounded-[999px_999px_24px_24px] bg-gradient-to-r from-zinc-900 via-zinc-100 to-zinc-700 shadow-[0_14px_40px_rgba(255,255,255,0.16)]" />
                        <div className="absolute bottom-7 left-20 h-8 w-20 skew-x-[-24deg] rounded-t-2xl bg-gradient-to-r from-zinc-300 to-zinc-700 opacity-90" />
                        <div className="absolute bottom-2 left-10 h-1 w-28 rounded-full bg-white/40" />
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

      <section id="shop" className="relative px-5 pb-24 sm:px-6 lg:px-10">
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

      <section id="collections" className="relative px-5 pb-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
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
                  {filteredSneakers.length} / {featuredSneakers.length} Pairs
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
                      <SneakerArtwork
                        palette={sneaker.palette}
                        name={sneaker.name}
                        index={index}
                      />
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
