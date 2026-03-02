import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useTransformStore } from '../store/transformStore'
import { FrameAxes } from './FrameAxes'
import { DashedParentLine } from './DashedParentLine'
import type { Frame } from '../types'

interface FrameNodeProps {
  frame: Frame
  childIds: string[]
  onRef: (id: string, group: THREE.Group | null) => void
}

export function FrameNode({ frame, childIds, onRef }: FrameNodeProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { frames } = useTransformStore.getState()

  useEffect(() => {
    onRef(frame.id, groupRef.current)
    return () => onRef(frame.id, null)
  }, [frame.id, onRef])

  const { position, quaternion } = frame.transform

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
      quaternion={[quaternion[0], quaternion[1], quaternion[2], quaternion[3]]}
    >
      {childIds.map((cid) => {
        const childFrame = frames[cid]
        if (!childFrame) return null
        const p = childFrame.transform.position
        return <DashedParentLine key={cid} end={[p[0], p[1], p[2]]} />
      })}
      <FrameAxes />
      {childIds.map((id) => {
        const child = frames[id]
        return child ? (
          <FrameNode
            key={id}
            frame={child}
            childIds={Object.values(frames)
              .filter((f) => f.parentId === id)
              .map((f) => f.id)}
            onRef={onRef}
          />
        ) : null
      })}
    </group>
  )
}
