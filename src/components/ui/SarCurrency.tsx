'use client'

import React from 'react'

interface CurrencyProps {
  amount: number
  className?: string
  showSymbol?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function SarCurrency({ amount, className = '', showSymbol = true, size = 'md' }: CurrencyProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {showSymbol && (
        <img 
          src="/logos/sar-symbol.svg" 
          alt="SAR" 
          className={iconSizes[size]}
          style={{ filter: 'brightness(0) invert(0)' }}
        />
      )}
      <span className={sizeClasses[size]}>{amount.toLocaleString()}</span>
      <span className={sizeClasses[size]}>ريال</span>
    </span>
  )
}

export function SarCurrencyCompact({ amount, className = '' }: { amount: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      <img 
        src="/logos/sar-symbol.svg" 
        alt="SAR" 
        className="h-3 w-3"
        style={{ filter: 'brightness(0) invert(0)' }}
      />
      <span>{amount.toLocaleString()}</span>
    </span>
  )
}
