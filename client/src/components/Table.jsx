import React from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

const CATEGORY_COLORS = {
  GEN: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  OBC: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  SC:  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  ST:  'bg-green-500/20 text-green-300 border-green-500/30',
}

function SortIcon({ column, sortBy, order }) {
  if (sortBy !== column) return <ChevronsUpDown size={12} className="text-white/20" />
  return order === 'asc'
    ? <ChevronUp size={12} className="text-primary-400" />
    : <ChevronDown size={12} className="text-primary-400" />
}

export default function ApplicantsTable({ data, loading, sortBy, order, onSort }) {
  if (loading) {
    return (
      <div className="glass-card p-12 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <p className="text-white/40 text-sm">Loading applicants...</p>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-white/40 text-lg">No applicants found matching the filters.</p>
      </div>
    )
  }

  const sortableCol = (col, label) => (
    <th
      className="px-4 py-3 font-semibold tracking-wider cursor-pointer hover:text-white/80 select-none"
      onClick={() => onSort(col)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <SortIcon column={col} sortBy={sortBy} order={order} />
      </div>
    </th>
  )

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="px-4 py-3 font-semibold tracking-wider">#</th>
              {sortableCol('name', 'Name')}
              <th className="px-4 py-3 font-semibold tracking-wider">Category</th>
              {sortableCol('cgpa', 'CGPA')}
              <th className="px-4 py-3 font-semibold tracking-wider">10th %</th>
              <th className="px-4 py-3 font-semibold tracking-wider">12th %</th>
              <th className="px-4 py-3 font-semibold tracking-wider">Grad %</th>
              <th className="px-4 py-3 font-semibold tracking-wider">PG %</th>
              <th className="px-4 py-3 font-semibold tracking-wider">GATE</th>
              <th className="px-4 py-3 font-semibold tracking-wider">CSIR</th>
              <th className="px-4 py-3 font-semibold tracking-wider">NBHM</th>
              <th className="px-4 py-3 font-semibold tracking-wider">Applied</th>
            </tr>
          </thead>
          <tbody>
            {data.map((app, idx) => (
              <tr key={app.id}>
                <td className="px-4 py-3 text-white/40 text-xs">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-white">{app.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">{app.email || '—'}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge border ${CATEGORY_COLORS[app.category] || 'bg-white/10 text-white/60 border-white/10'}`}>
                    {app.category || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono font-medium text-primary-300">
                  {app.cgpa != null ? app.cgpa.toFixed(2) : '—'}
                </td>
                <td className="px-4 py-3 text-white/70">{app.pct_10th != null ? `${app.pct_10th}%` : '—'}</td>
                <td className="px-4 py-3 text-white/70">{app.pct_12th != null ? `${app.pct_12th}%` : '—'}</td>
                <td className="px-4 py-3 text-white/70">{app.pct_grad != null ? `${app.pct_grad}%` : '—'}</td>
                <td className="px-4 py-3 text-white/70">{app.pct_pg != null ? `${app.pct_pg}%` : '—'}</td>
                <td className="px-4 py-3 font-mono text-accent-400">{app.gate_score ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-accent-400">{app.csir_score ?? '—'}</td>
                <td className="px-4 py-3">
                  {app.nbhm_eligible
                    ? <span className="badge bg-success-500/20 text-success-500 border border-success-500/30">Yes</span>
                    : <span className="badge bg-white/5 text-white/40 border border-white/10">No</span>}
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">
                  {app.created_at ? new Date(app.created_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
