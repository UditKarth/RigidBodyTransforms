import * as THREE from 'three'
import type { EulerOrderOption } from '../types'

const orderMap: Record<EulerOrderOption, THREE.EulerOrder> = {
  XYZ: 'XYZ',
  XZY: 'XZY',
  YXZ: 'YXZ',
  YZX: 'YZX',
  ZXY: 'ZXY',
  ZYX: 'ZYX',
}

export function eulerFromQuaternion(
  q: [number, number, number, number],
  order: EulerOrderOption
): [number, number, number] {
  const e = new THREE.Euler().setFromQuaternion(
    new THREE.Quaternion(q[0], q[1], q[2], q[3]),
    orderMap[order]
  )
  return [e.x, e.y, e.z]
}

export function quaternionFromEuler(
  x: number,
  y: number,
  z: number,
  order: EulerOrderOption
): [number, number, number, number] {
  const e = new THREE.Euler(x, y, z, orderMap[order])
  const q = new THREE.Quaternion().setFromEuler(e)
  return [q.x, q.y, q.z, q.w]
}

export function rotationMatrix3FromQuaternion(
  q: [number, number, number, number]
): number[][] {
  const m = new THREE.Matrix4().makeRotationFromQuaternion(
    new THREE.Quaternion(q[0], q[1], q[2], q[3])
  )
  const el = m.elements
  return [
    [el[0], el[4], el[8]],
    [el[1], el[5], el[9]],
    [el[2], el[6], el[10]],
  ]
}

export function matrix4FromTransform(
  position: [number, number, number],
  quaternion: [number, number, number, number]
): THREE.Matrix4 {
  const m = new THREE.Matrix4()
  m.compose(
    new THREE.Vector3(position[0], position[1], position[2]),
    new THREE.Quaternion(quaternion[0], quaternion[1], quaternion[2], quaternion[3]),
    new THREE.Vector3(1, 1, 1)
  )
  return m
}

export function formatMatrix4(m: THREE.Matrix4): number[][] {
  const el = m.elements
  return [
    [el[0], el[4], el[8], el[12]],
    [el[1], el[5], el[9], el[13]],
    [el[2], el[6], el[10], el[14]],
    [el[3], el[7], el[11], el[15]],
  ]
}
