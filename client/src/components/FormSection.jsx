import React from 'react'

export default function FormSection({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="section-header">
        {Icon && (
          <div className="section-header-icon">
            <Icon size={18} />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold font-heading text-white">{title}</h3>
          {subtitle && <p className="text-sm text-white/50 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  )
}

export function FieldWrapper({ label, required, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="form-label">
        {label}
        {required && <span className="text-danger-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
