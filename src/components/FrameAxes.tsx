import { useRef } from 'react'
import * as THREE from 'three'

const AXIS_LENGTH = 0.5
const AXIS_RADIUS = 0.02

export function FrameAxes() {
  const group = useRef<THREE.Group>(null)

  return (
    <group ref={group}>
      <mesh position={[AXIS_LENGTH / 2, 0, 0]}>
        <cylinderGeometry args={[AXIS_RADIUS, AXIS_RADIUS, AXIS_LENGTH, 8]} />
        <meshStandardMaterial color="#e11d48" />
      </mesh>
      <mesh position={[0, AXIS_LENGTH / 2, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[AXIS_RADIUS, AXIS_RADIUS, AXIS_LENGTH, 8]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      <mesh position={[0, 0, AXIS_LENGTH / 2]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[AXIS_RADIUS, AXIS_RADIUS, AXIS_LENGTH, 8]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
    </group>
  )
}
