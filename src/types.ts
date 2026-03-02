export type RotationRepresentation = 'euler' | 'quaternion' | 'matrix'
export type EulerOrderOption = 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX'

export interface FrameTransform {
  position: [number, number, number]
  quaternion: [number, number, number, number]
  eulerOrder: EulerOrderOption
}

export interface Frame {
  id: string
  name: string
  parentId: string | null
  transform: FrameTransform
}

export interface TransformState {
  frames: Record<string, Frame>
  rootFrameIds: string[]
  selectedFrameId: string | null
  rotationRepresentation: RotationRepresentation
  intrinsicRotation: boolean
  transformControlMode: 'translate' | 'rotate' | 'scale'
}
