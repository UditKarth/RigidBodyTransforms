import { useMemo } from 'react'
import * as THREE from 'three'
import { formatMatrix4 } from '../utils/math'

interface Matrix4DisplayProps {
  matrix: THREE.Matrix4
  title: string
  className?: string
}

export function Matrix4Display({ matrix, title, className = '' }: Matrix4DisplayProps) {
  const grid = useMemo(() => formatMatrix4(matrix), [matrix])

  return (
    <div className={className}>
      <div className="text-xs font-medium text-slate-400 mb-1">{title}</div>
      <div className="font-mono text-[11px] bg-slate-800/80 rounded p-2 border border-slate-700 inline-block">
        <div className="text-slate-500 mb-1">4×4 T</div>
        <div
          className="grid gap-x-2 gap-y-0.5"
          style={{ gridTemplateColumns: 'repeat(4, 4.5ch)' }}
        >
          {grid.flat().map((cell, idx) => (
            <span
              key={idx}
              className="tabular-nums text-right text-slate-300"
            >
              {typeof cell === 'number'
                ? cell >= 0
                  ? ` ${cell.toFixed(3)}`
                  : cell.toFixed(3)
                : String(cell)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
