/**
 * HYPE VAULT PAYMENT METHOD SELECTOR
 * Premium payment UI with UPI, Wallet, Card, and Netbanking options
 * 
 * FEATURES:
 * - Modern card-based selection UI
 * - Animated transitions between payment methods
 * - Payment security indicators
 * - Support for INR-based payments
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Smartphone,
  Wallet,
  Building2,
  Shield,
  ChevronRight,
  Check,
  Zap,
} from 'lucide-react'

const PAYMENT_METHODS = [
  {
    id: 'upi',
    name: 'UPI',
    description: 'Google Pay, PhonePe, Paytm',
    icon: Smartphone,
    color: 'from-blue-600 to-cyan-600',
    badge: 'INSTANT',
    features: ['Instant Payment', 'No Extra Charges'],
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, RuPay',
    icon: CreditCard,
    color: 'from-purple-600 to-pink-600',
    badge: 'SECURE',
    features: ['Secure Payment', 'Buyer Protection'],
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    description: 'All Indian Banks',
    icon: Building2,
    color: 'from-green-600 to-emerald-600',
    badge: 'SAFE',
    features: ['Multi-Bank Support', 'Direct Transfer'],
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    description: 'Amazon Pay, Airtel Pay',
    icon: Wallet,
    color: 'from-orange-600 to-yellow-600',
    badge: 'QUICK',
    features: ['Fast Checkout', 'Saved Cards'],
  },
]

/**
 * Payment method selector component
 * Emits onChange callback with selected method ID
 */
export const PaymentMethodSelector = ({ onSelect, selectedMethod = 'upi' }) => {
  const [selected, setSelected] = useState(selectedMethod)

  const handleSelect = (methodId) => {
    setSelected(methodId)
    onSelect?.(methodId)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">
        Choose Payment Method
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon
          const isSelected = selected === method.id

          return (
            <motion.button
              key={method.id}
              onClick={() => handleSelect(method.id)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-lg p-4 text-left transition-all duration-300 ${
                isSelected
                  ? 'ring-2 ring-white'
                  : 'border border-gray-700 hover:border-gray-600'
              }`}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, var(--tw-gradient-stops))`
                  : 'linear-gradient(135deg, rgba(30, 30, 30, 0.8), rgba(20, 20, 20, 0.8))',
              }}
            >
              {/* Background gradient */}
              {isSelected && (
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-10`}
                  layoutId="selectedBg"
                />
              )}

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected ? 'bg-white/20' : 'bg-gray-800'
                    }`}
                  >
                    <Icon
                      size={24}
                      className={isSelected ? 'text-white' : 'text-gray-400'}
                    />
                  </div>

                  {/* Badge */}
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}>
                    {method.badge}
                  </span>
                </div>

                <h4 className={`font-semibold ${
                  isSelected ? 'text-white' : 'text-gray-300'
                }`}>
                  {method.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {method.description}
                </p>

                {/* Features */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-white/10 space-y-1"
                  >
                    {method.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 text-xs text-gray-300"
                      >
                        <Check size={14} className="text-green-400" />
                        {feature}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  layoutId="selectedIndicator"
                  className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <Check size={16} className="text-black" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Security info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 space-y-3"
      >
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <Shield size={16} className="text-green-400" />
          <p className="text-xs text-green-300">
            All transactions are secured with 256-bit SSL encryption
          </p>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <Zap size={16} className="text-blue-400" />
          <p className="text-xs text-blue-300">
            <strong>DEMO MODE:</strong> Any reasonable input will be accepted for testing purposes.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Payment form component for the selected method
 * Renders different UI based on selected payment type
 */
export const PaymentForm = ({ method, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({})

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Basic Demo Validation: Just check if the primary field is present
    let isValid = false
    if (method === 'upi') isValid = !!formData.upiId
    else if (method === 'card') isValid = !!formData.cardNumber
    else if (method === 'netbanking') isValid = !!formData.bank
    else if (method === 'wallet') isValid = !!formData.wallet

    if (isValid) {
      onSubmit?.({ method, ...formData })
    } else {
      alert('HYPE VAULT DEMO: Please enter any value to proceed.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {method === 'upi' && (
        <UPIForm
          data={formData}
          onChange={handleChange}
          isLoading={isLoading}
        />
      )}

      {method === 'card' && (
        <CardForm
          data={formData}
          onChange={handleChange}
          isLoading={isLoading}
        />
      )}

      {method === 'netbanking' && (
        <NetbankingForm
          data={formData}
          onChange={handleChange}
          isLoading={isLoading}
        />
      )}

      {method === 'wallet' && (
        <WalletForm
          data={formData}
          onChange={handleChange}
          isLoading={isLoading}
        />
      )}

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Zap size={18} />
            Proceed to Payment
          </>
        )}
      </motion.button>
    </form>
  )
}

/**
 * UPI Payment Form
 */
const UPIForm = ({ data, onChange, isLoading }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          UPI ID
        </label>
        <input
          type="text"
          placeholder="yourname@upi"
          value={data.upiId || ''}
          onChange={(e) => onChange('upiId', e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
        />
      </div>
      <p className="text-xs text-gray-400">
        You'll receive a payment request on your UPI app
      </p>
    </div>
  )
}

/**
 * Card Payment Form
 */
const CardForm = ({ data, onChange, isLoading }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Card Number
        </label>
        <input
          type="text"
          placeholder="1234 5678 9012 3456"
          value={data.cardNumber || ''}
          onChange={(e) =>
            onChange(
              'cardNumber',
              e.target.value.replace(/\s/g, '').slice(0, 16)
            )
          }
          disabled={isLoading}
          maxLength="19"
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Expiry Date
          </label>
          <input
            type="text"
            placeholder="MM/YY"
            value={data.expiry || ''}
            onChange={(e) => onChange('expiry', e.target.value.slice(0, 5))}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            CVV
          </label>
          <input
            type="password"
            placeholder="123"
            value={data.cvv || ''}
            onChange={(e) => onChange('cvv', e.target.value.slice(0, 4))}
            disabled={isLoading}
            maxLength="4"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Netbanking Form
 */
const NetbankingForm = ({ data, onChange, isLoading }) => {
  const banks = [
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'SBI',
    'IDFC Bank',
    'Kotak Bank',
  ]

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select Your Bank
      </label>
      <select
        value={data.bank || ''}
        onChange={(e) => onChange('bank', e.target.value)}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
      >
        <option value="">Choose a bank...</option>
        {banks.map((bank) => (
          <option key={bank} value={bank}>
            {bank}
          </option>
        ))}
      </select>
    </div>
  )
}

/**
 * Wallet Form
 */
const WalletForm = ({ data, onChange, isLoading }) => {
  const wallets = [
    { id: 'amazonpay', name: 'Amazon Pay' },
    { id: 'airtel', name: 'Airtel Pay' },
    { id: 'paytm', name: 'Paytm Wallet' },
    { id: 'freecharge', name: 'FreeCharge' },
  ]

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select Digital Wallet
      </label>
      <select
        value={data.wallet || ''}
        onChange={(e) => onChange('wallet', e.target.value)}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
      >
        <option value="">Choose a wallet...</option>
        {wallets.map((wallet) => (
          <option key={wallet.id} value={wallet.id}>
            {wallet.name}
          </option>
        ))}
      </select>
    </div>
  )
}
