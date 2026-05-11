/**
 * HYPE VAULT USER PROFILE DISPLAY
 * Avatar, profile menu, and user info components
 * 
 * FEATURES:
 * - Dynamic avatar with initials
 * - Loyalty tier badge
 * - Profile quick menu
 * - Mobile responsive profile menu
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  User, 
  LogOut, 
  Settings, 
  Heart,
  Package,
  Crown
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Loyalty tier colors and names
const LOYALTY_TIERS = {
  bronze: { color: '#CD7F32', label: 'Bronze Collector', icon: '◆' },
  silver: { color: '#C0C0C0', label: 'Silver Vault', icon: '◈' },
  gold: { color: '#FFD700', label: 'Gold Elite', icon: '◉' },
  black: { color: '#1F2937', label: 'Black Insider', icon: '▪' },
}

/**
 * Avatar component with user initials
 */
export const UserAvatar = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('')
  }

  const tier = LOYALTY_TIERS[user?.loyalty_tier || 'bronze']

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white backdrop-blur-md relative overflow-hidden`}
        style={{
          background: `linear-gradient(135deg, ${tier.color}22, ${tier.color}11)`,
          borderColor: tier.color,
          borderWidth: '1.5px',
        }}
      >
        {getInitials(user?.full_name || 'VU')}
      </div>
      {/* Loyalty tier indicator dot */}
      <div
        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border border-black"
        style={{ backgroundColor: tier.color }}
        title={tier.label}
      />
    </div>
  )
}

/**
 * User profile dropdown menu
 * Shows user info and quick actions
 */
export const UserProfileMenu = ({ user, onNavigate }) => {
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const tier = LOYALTY_TIERS[user?.loyalty_tier || 'bronze']

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <div className="relative">
      {/* Profile button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        <UserAvatar user={user} size="sm" />
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-black border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50"
          >
            {/* User info section */}
            <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-black">
              <div className="flex items-start gap-3">
                <UserAvatar user={user} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    @{user?.profile_handle}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span
                      style={{ color: tier.color }}
                      className="text-xs font-bold"
                    >
                      {tier.icon} {tier.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Email info */}
            <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-800">
              <p>{user?.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <MenuItem
                icon={<User size={16} />}
                label="My Profile"
                href="#dashboard"
                onClick={() => {
                  setIsOpen(false)
                  onNavigate?.('dashboard')
                }}
              />
              <MenuItem
                icon={<Package size={16} />}
                label="My Orders"
                href="#orders"
                onClick={() => {
                  setIsOpen(false)
                  onNavigate?.('orders')
                }}
              />
              <MenuItem
                icon={<Heart size={16} />}
                label="Wishlist"
                href="/wishlist"
                onClick={() => setIsOpen(false)}
              />
              <MenuItem
                icon={<Settings size={16} />}
                label="Settings"
                href="/settings"
                onClick={() => setIsOpen(false)}
              />
            </div>

            {/* Logout button */}
            <div className="p-2 border-t border-gray-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-400/10 rounded transition-colors text-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close menu on outside click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

/**
 * Individual menu item component
 */
const MenuItem = ({ icon, label, href, onClick }) => {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault()
        onClick?.()
        window.location.href = href
      }}
      className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800/50 text-sm transition-colors"
    >
      {icon}
      {label}
    </a>
  )
}

/**
 * Profile card - shows full profile info
 * Usage: <ProfileCard user={user} />
 */
export const ProfileCard = ({ user }) => {
  const tier = LOYALTY_TIERS[user?.loyalty_tier || 'bronze']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-gray-700 bg-gradient-to-br from-gray-900 to-black p-6"
    >
      {/* Background gradient accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: tier.color }}
      />

      <div className="relative z-10 flex items-start gap-4">
        {/* Avatar */}
        <div>
          <UserAvatar user={user} size="lg" />
        </div>

        {/* Profile info */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">
            {user?.full_name}
          </h3>
          <p className="text-gray-400 text-sm">@{user?.profile_handle}</p>

          {/* Loyalty tier badge */}
          <div className="flex items-center gap-2 mt-3">
            <Crown size={16} style={{ color: tier.color }} />
            <span
              style={{ color: tier.color }}
              className="text-sm font-semibold"
            >
              {tier.label}
            </span>
          </div>

          {/* Member since */}
          <p className="text-xs text-gray-500 mt-3">
            Member since{' '}
            {new Date(user?.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Contact info */}
      <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
        <div className="text-sm">
          <p className="text-gray-500">Email</p>
          <p className="text-gray-200">{user?.email}</p>
        </div>
        {user?.phone && (
          <div className="text-sm">
            <p className="text-gray-500">Phone</p>
            <p className="text-gray-200">{user?.phone}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
