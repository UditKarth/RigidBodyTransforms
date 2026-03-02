import { useMemo } from 'react'
import { useTransformStore } from '../store/transformStore'
import { Matrix4Display } from './Matrix4Display'
import {
  eulerFromQuaternion,
  quaternionFromEuler,
  rotationMatrix3FromQuaternion,
  matrix4FromTransform,
} from '../utils/math'
import * as THREE from 'three'
import type { EulerOrderOption, Frame, RotationRepresentation } from '../types'

const EULER_ORDERS: EulerOrderOption[] = [
  'XYZ',
  'XZY',
  'YXZ',
  'YZX',
  'ZXY',
  'ZYX',
]

function useGimbalLockWarning(
  eulerOrder: EulerOrderOption,
  quaternion: [number, number, number, number]
): boolean {
  const euler = eulerFromQuaternion(quaternion, eulerOrder)
  const y = euler[1]
  const nearHalfPi = Math.abs(Math.abs(y) - Math.PI / 2) < 0.1
  const isXYZ = eulerOrder === 'XYZ'
  return isXYZ && nearHalfPi
}

export function Sidebar() {
  const {
    frames,
    selectedFrameId,
    rotationRepresentation,
    intrinsicRotation,
    transformControlMode,
    addFrame,
    removeFrame,
    updateFrameTransform,
    setSelectedFrame,
    setRotationRepresentation,
    setIntrinsicRotation,
    setTransformControlMode,
    resetFrameToIdentity,
    setFrameName,
    setEulerOrder,
  } = useTransformStore()

  const selectedFrame =
    selectedFrameId != null ? frames[selectedFrameId] : null
  const frameList = Object.values(frames)

  const gimbalLock =
    selectedFrame != null
      ? useGimbalLockWarning(
          selectedFrame.transform.eulerOrder,
          selectedFrame.transform.quaternion
        )
      : false

  const localMatrix =
    selectedFrame != null
      ? matrix4FromTransform(
          selectedFrame.transform.position,
          selectedFrame.transform.quaternion
        )
      : null

  const globalMatrix = useMemo(() => {
    const m = new THREE.Matrix4().identity()
    if (selectedFrameId == null) return m
    let id: string | null = selectedFrameId
    const stack: THREE.Matrix4[] = []
    while (id != null) {
      const f: Frame | undefined = frames[id]
      if (!f) break
      stack.push(
        matrix4FromTransform(f.transform.position, f.transform.quaternion)
      )
      id = f.parentId
    }
    stack.reverse()
    stack.forEach((mat) => m.multiply(mat))
    return m
  }, [selectedFrameId, frames])

  return (
    <aside className="w-80 flex-shrink-0 bg-slate-900 border-l border-slate-700 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-slate-200">
          Robotics Transform Visualizer
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">SE(3) frame chaining</p>
      </div>

      <div className="p-3 border-b border-slate-700 flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addFrame(null)}
            className="flex-1 px-3 py-1.5 text-xs font-medium rounded bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            + Add root frame
          </button>
        </div>
        {selectedFrameId != null && (
          <button
            type="button"
            onClick={() => addFrame(selectedFrameId)}
            className="w-full px-3 py-1.5 text-xs font-medium rounded bg-slate-600 hover:bg-slate-500 text-slate-200"
          >
            + Add child frame
          </button>
        )}
      </div>

      <div className="p-3 border-b border-slate-700">
        <div className="text-xs font-medium text-slate-400 mb-2">Frames</div>
        <ul className="space-y-1 max-h-32 overflow-y-auto">
          {frameList.map((f: Frame) => (
            <li key={f.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedFrame(f.id)}
                className={`flex-1 text-left px-2 py-1 rounded text-xs truncate ${
                  selectedFrameId === f.id
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {f.name}
              </button>
              <button
                type="button"
                onClick={() => removeFrame(f.id)}
                className="p-1 text-slate-500 hover:text-red-400 text-xs"
                title="Remove frame"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selectedFrame != null && (
        <>
          <div className="p-3 border-b border-slate-700 space-y-3">
            <div className="text-xs font-medium text-slate-400">
              Frame: {selectedFrame.name}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Name</label>
              <input
                type="text"
                value={selectedFrame.name}
                onChange={(e) => setFrameName(selectedFrame.id, e.target.value)}
                className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-600 text-slate-200 text-sm"
              />
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1">Translation (x, y, z)</div>
              <div className="grid grid-cols-3 gap-1">
                {(['x', 'y', 'z'] as const).map((axis, i) => (
                  <input
                    key={axis}
                    type="number"
                    step={0.1}
                    value={selectedFrame.transform.position[i]}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      const pos = [...selectedFrame.transform.position]
                      pos[i] = v
                      updateFrameTransform(selectedFrame.id, { position: pos as [number, number, number] })
                    }}
                    className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-600 text-slate-200 text-sm"
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1">Rotation</div>
              <div className="flex gap-1 mb-2">
                {(['euler', 'quaternion', 'matrix'] as RotationRepresentation[]).map(
                  (mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setRotationRepresentation(mode)}
                      className={`px-2 py-1 rounded text-xs ${
                        rotationRepresentation === mode
                          ? 'bg-slate-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {mode === 'euler' ? 'Euler' : mode === 'quaternion' ? 'Quat' : '3×3'}
                    </button>
                  )
                )}
              </div>

              {rotationRepresentation === 'euler' && (
                <>
                  <div className="mb-1">
                    <span className="text-xs text-slate-500">Order </span>
                    <select
                      value={selectedFrame.transform.eulerOrder}
                      onChange={(e) =>
                        setEulerOrder(
                          selectedFrame.id,
                          e.target.value as EulerOrderOption
                        )
                      }
                      className="ml-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-600 text-slate-200 text-xs"
                    >
                      {EULER_ORDERS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['x', 'y', 'z'] as const).map((axis, i) => {
                      const euler = eulerFromQuaternion(
                        selectedFrame.transform.quaternion,
                        selectedFrame.transform.eulerOrder
                      )
                      const rad = euler[i]
                      return (
                        <input
                          key={axis}
                          type="number"
                          step={0.01}
                          value={Number((rad * (180 / Math.PI)).toFixed(2))}
                          onChange={(e) => {
                            const deg = Number(e.target.value)
                            const rad = (deg * Math.PI) / 180
                            const newEuler = [...euler] as [number, number, number]
                            newEuler[i] = rad
                            const q = quaternionFromEuler(
                              newEuler[0],
                              newEuler[1],
                              newEuler[2],
                              selectedFrame.transform.eulerOrder
                            )
                            updateFrameTransform(selectedFrame.id, {
                              quaternion: q,
                            })
                          }}
                          className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-600 text-slate-200 text-sm"
                        />
                      )
                    })}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Euler angles (deg)
                  </div>
                </>
              )}

              {rotationRepresentation === 'quaternion' && (
                <div className="grid grid-cols-4 gap-1">
                  {(['x', 'y', 'z', 'w'] as const).map((axis, i) => (
                    <input
                      key={axis}
                      type="number"
                      step={0.01}
                      value={Number(selectedFrame.transform.quaternion[i].toFixed(3))}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        const q = [...selectedFrame.transform.quaternion] as [
                          number,
                          number,
                          number,
                          number,
                        ]
                        q[i] = v
                        const len = Math.sqrt(q.reduce((s, x) => s + x * x, 0))
                        if (len > 1e-6) {
                          q[0] /= len
                          q[1] /= len
                          q[2] /= len
                          q[3] /= len
                        }
                        updateFrameTransform(selectedFrame.id, { quaternion: q })
                      }}
                      className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-600 text-slate-200 text-sm"
                    />
                  ))}
                </div>
              )}

              {rotationRepresentation === 'matrix' && (
                <div className="font-mono text-[10px] bg-slate-800/80 rounded p-2 border border-slate-700">
                  {rotationMatrix3FromQuaternion(
                    selectedFrame.transform.quaternion
                  ).map((row, i) => (
                    <div key={i} className="flex gap-2">
                      {row.map((cell, j) => (
                        <span key={j} className="tabular-nums text-slate-300 w-14 text-right">
                          {cell.toFixed(3)}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1">Gizmo</div>
              <div className="flex gap-1">
                {(
                  [
                    'translate',
                    'rotate',
                    'scale',
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTransformControlMode(mode)}
                    className={`px-2 py-1 rounded text-xs capitalize ${
                      transformControlMode === mode
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Rotation convention</span>
              <button
                type="button"
                onClick={() => setIntrinsicRotation(!intrinsicRotation)}
                className={`px-2 py-1 rounded text-xs ${
                  intrinsicRotation ? 'bg-slate-600' : 'bg-slate-700'
                } text-slate-200`}
              >
                {intrinsicRotation ? 'Intrinsic' : 'Extrinsic'}
              </button>
            </div>

            {gimbalLock && (
              <div className="text-xs text-amber-400 bg-amber-900/30 rounded p-2 border border-amber-700">
                Gimbal lock: middle angle (Y for XYZ) near ±90°. Rotation loses one degree of freedom.
              </div>
            )}

            <button
              type="button"
              onClick={() => resetFrameToIdentity(selectedFrame.id)}
              className="w-full px-3 py-1.5 text-xs font-medium rounded bg-slate-600 hover:bg-slate-500 text-slate-200"
            >
              Reset to identity
            </button>
          </div>

          <div className="p-3 flex-1 overflow-auto space-y-3">
            <Matrix4Display
              matrix={localMatrix!}
              title="Local matrix (w.r.t. parent)"
            />
            <Matrix4Display
              matrix={globalMatrix}
              title="Global matrix (world)"
            />
          </div>
        </>
      )}

      {selectedFrame == null && frameList.length > 0 && (
        <div className="p-3 text-xs text-slate-500">
          Select a frame to edit transform.
        </div>
      )}
    </aside>
  )
}
