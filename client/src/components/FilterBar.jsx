import React from 'react'
import { Filter, X, RotateCcw } from 'lucide-react'

const CATEGORIES = ['All', 'GEN', 'OBC', 'SC', 'ST']

export default function FilterBar({ filters, onChange, onReset }) {
  const handle = (key, value) => onChange({ ...filters, [key]: value })

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={16} className="text-primary-400" />
        <h3 className="text-sm font-semibold text-white/80">Filter & Sort</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Min CGPA */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50 font-medium">Min CGPA</label>
          <input
            id="filter-cgpa"
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={filters.minCGPA || ''}
            onChange={e => handle('minCGPA', e.target.value)}
            placeholder="e.g. 7.0"
            className="form-input py-2 text-sm"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50 font-medium">Category</label>
          <select
            id="filter-category"
            value={filters.category || ''}
            onChange={e => handle('category', e.target.value)}
            className="form-input py-2 text-sm appearance-none"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c === 'All' ? '' : c} className="bg-dark-800">
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Min GATE Score */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50 font-medium">Min GATE Score</label>
          <input
            id="filter-gate"
            type="number"
            min="0"
            value={filters.gateScore || ''}
            onChange={e => handle('gateScore', e.target.value)}
            placeholder="e.g. 400"
            className="form-input py-2 text-sm"
          />
        </div>

        {/* NBHM Eligible */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50 font-medium">NBHM Eligible</label>
          <select
            id="filter-nbhm"
            value={filters.nbhmEligible ?? ''}
            onChange={e => handle('nbhmEligible', e.target.value)}
            className="form-input py-2 text-sm appearance-none"
          >
            <option value="" className="bg-dark-800">All</option>
            <option value="true" className="bg-dark-800">Yes</option>
            <option value="false" className="bg-dark-800">No</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50 font-medium">Sort By</label>
          <select
            id="filter-sortBy"
            value={filters.sortBy || ''}
            onChange={e => handle('sortBy', e.target.value)}
            className="form-input py-2 text-sm appearance-none"
          >
            <option value="" className="bg-dark-800">Default</option>
            <option value="cgpa" className="bg-dark-800">CGPA</option>
            <option value="name" className="bg-dark-800">Name</option>
            <option value="created_at" className="bg-dark-800">Applied Date</option>
          </select>
        </div>

        {/* Order */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50 font-medium">Order</label>
          <div className="flex gap-2">
            <select
              id="filter-order"
              value={filters.order || 'desc'}
              onChange={e => handle('order', e.target.value)}
              className="form-input py-2 text-sm appearance-none flex-1"
            >
              <option value="desc" className="bg-dark-800">Desc</option>
              <option value="asc" className="bg-dark-800">Asc</option>
            </select>
            <button
              id="filter-reset"
              onClick={onReset}
              title="Reset filters"
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
