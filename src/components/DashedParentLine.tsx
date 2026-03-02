import { useRef, useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'

/** Dashed line from parent origin (0,0,0) in parent space to child origin. Render as child of parent; end point is this frame's position. */
export function DashedParentLine({
  end,
}: {
  end: [number, number, number]
}) {
  const ref = useRef<THREE.LineSegments>(null)
  const geometry = useMemo(
    () =>
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(end[0], end[1], end[2]),
      ]),
    []
  )

  useLayoutEffect(() => {
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(
        [0, 0, 0, end[0], end[1], end[2]],
        3
      )
    )
    geometry.attributes.position.needsUpdate = true
    const line = ref.current
    if (line) {
      ;(line as THREE.LineSegments).computeLineDistances()
    }
  }, [end, geometry])

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineDashedMaterial
        color="#94a3b8"
        dashSize={0.15}
        gapSize={0.1}
        linewidth={1}
      />
    </lineSegments>
  )
}
