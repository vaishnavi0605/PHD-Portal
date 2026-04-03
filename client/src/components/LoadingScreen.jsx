import React from 'react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative mx-auto w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-primary-600/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
        </div>
        <p className="text-white/50 font-medium">Loading...</p>
      </div>
    </div>
  )
}
