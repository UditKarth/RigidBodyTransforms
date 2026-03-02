import { useRef, useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, TransformControls, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { useTransformStore } from '../store/transformStore'
import { FrameNode } from './FrameNode'

function SceneContent() {
  const {
    frames,
    rootFrameIds,
    selectedFrameId,
    setFrameFromMatrix4,
    transformControlMode,
  } = useTransformStore()
  const [frameObjects, setFrameObjects] = useState<
    Record<string, THREE.Group>
  >({})
  const orbitRef = useRef<React.ComponentRef<typeof OrbitControls>>(null)
  const transformRef = useRef<React.ComponentRef<typeof TransformControls>>(null)

  useEffect(() => {
    const transform = transformRef.current as unknown as { addEventListener: (a: string, b: (e: { value: boolean }) => void) => void; removeEventListener: (a: string, b: (e: { value: boolean }) => void) => void }
    const orbit = orbitRef.current
    if (!transform || !orbit) return
    const callback = (e: { value: boolean }) => {
      orbit.enabled = !e.value
    }
    transform.addEventListener('dragging-changed', callback)
    return () => transform.removeEventListener('dragging-changed', callback)
  }, [selectedFrameId])

  const onFrameRef = useCallback((id: string, group: THREE.Group | null) => {
    setFrameObjects((prev) => {
      if (group == null) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: group }
    })
  }, [])

  const selectedObject =
    selectedFrameId != null ? frameObjects[selectedFrameId] ?? null : null

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Grid
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#334155"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#475569"
        fadeDistance={20}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />
      <OrbitControls ref={orbitRef} makeDefault />
      {rootFrameIds.map((id) => {
        const frame = frames[id]
        if (!frame) return null
        const childIds = Object.values(frames)
          .filter((f) => f.parentId === id)
          .map((f) => f.id)
        return (
          <FrameNode
            key={id}
            frame={frame}
            childIds={childIds}
            onRef={onFrameRef}
          />
        )
      })}
      {selectedObject != null && (
        <TransformControls
          ref={transformRef}
          mode={transformControlMode}
          object={selectedObject}
          space={useTransformStore.getState().intrinsicRotation ? 'local' : 'world'}
          onObjectChange={(e) => {
            if (!e?.target || !selectedFrameId) return
            const obj = e.target as THREE.Object3D
            const m = new THREE.Matrix4().compose(
              obj.position.clone(),
              obj.quaternion.clone(),
              obj.scale.clone()
            )
            setFrameFromMatrix4(selectedFrameId, m)
          }}
        />
      )}
    </>
  )
}

export function Scene3D() {
  return (
    <div className="w-full h-full min-h-0">
      <Canvas
        camera={{ position: [4, 3, 4], fov: 50 }}
        gl={{ antialias: true }}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
