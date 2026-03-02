import { create } from 'zustand'
import * as THREE from 'three'
import type {
  Frame,
  FrameTransform,
  TransformState,
  EulerOrderOption,
  RotationRepresentation,
} from '../types'

const defaultTransform = (): FrameTransform => ({
  position: [0, 0, 0],
  quaternion: [0, 0, 0, 1],
  eulerOrder: 'XYZ',
})

const nextFrameName = (frames: Record<string, Frame>): string => {
  const names = Object.values(frames).map((f) => f.name)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let i = 0; i < letters.length; i++) {
    const name = `Frame ${letters[i]}`
    if (!names.includes(name)) return name
  }
  return `Frame ${Object.keys(frames).length + 1}`
}

export const useTransformStore = create<TransformState & {
  addFrame: (parentId: string | null) => string
  removeFrame: (id: string) => void
  updateFrameTransform: (id: string, transform: Partial<FrameTransform>) => void
  setFrameFromMatrix4: (id: string, m: THREE.Matrix4) => void
  setSelectedFrame: (id: string | null) => void
  setRotationRepresentation: (r: RotationRepresentation) => void
  setIntrinsicRotation: (v: boolean) => void
  setTransformControlMode: (m: 'translate' | 'rotate' | 'scale') => void
  resetFrameToIdentity: (id: string) => void
  setFrameName: (id: string, name: string) => void
  setEulerOrder: (id: string, order: EulerOrderOption) => void
}>((set, get) => ({
  frames: {},
  rootFrameIds: [],
  selectedFrameId: null,
  rotationRepresentation: 'euler',
  intrinsicRotation: true,
  transformControlMode: 'translate',

  addFrame: (parentId) => {
    const { frames, rootFrameIds } = get()
    const id = `frame-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const name = nextFrameName(frames)
    const newFrame: Frame = {
      id,
      name,
      parentId,
      transform: defaultTransform(),
    }
    const newFrames = { ...frames, [id]: newFrame }
    const newRootIds = parentId == null ? [...rootFrameIds, id] : rootFrameIds
    set({ frames: newFrames, rootFrameIds: newRootIds, selectedFrameId: id })
    return id
  },

  removeFrame: (id) => {
    const { frames, rootFrameIds, selectedFrameId } = get()
    const children = Object.values(frames).filter((f) => f.parentId === id)
    children.forEach((c) => get().removeFrame(c.id))
    const { [id]: _, ...rest } = frames
    const newRootIds = rootFrameIds.filter((x) => x !== id)
    set({
      frames: rest,
      rootFrameIds: newRootIds,
      selectedFrameId: selectedFrameId === id ? null : selectedFrameId,
    })
  },

  updateFrameTransform: (id, partial) => {
    const { frames } = get()
    const frame = frames[id]
    if (!frame) return
    const transform: FrameTransform = {
      ...frame.transform,
      ...partial,
    }
    set({
      frames: {
        ...frames,
        [id]: { ...frame, transform },
      },
    })
  },

  setFrameFromMatrix4: (id, m) => {
    const { frames } = get()
    const frame = frames[id]
    if (!frame) return
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    m.decompose(position, quaternion, scale)
    const transform: FrameTransform = {
      ...frame.transform,
      position: [position.x, position.y, position.z],
      quaternion: [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
    }
    set({
      frames: {
        ...frames,
        [id]: { ...frame, transform },
      },
    })
  },

  setSelectedFrame: (id) => set({ selectedFrameId: id }),

  setRotationRepresentation: (r) => set({ rotationRepresentation: r }),

  setIntrinsicRotation: (v) => set({ intrinsicRotation: v }),

  setTransformControlMode: (m) => set({ transformControlMode: m }),

  resetFrameToIdentity: (id) => {
    const { frames } = get()
    const frame = frames[id]
    if (!frame) return
    set({
      frames: {
        ...frames,
        [id]: {
          ...frame,
          transform: defaultTransform(),
        },
      },
    })
  },

  setFrameName: (id, name) => {
    const { frames } = get()
    const frame = frames[id]
    if (!frame) return
    set({
      frames: {
        ...frames,
        [id]: { ...frame, name: name.trim() || frame.name },
      },
    })
  },

  setEulerOrder: (id, order) => {
    const { frames } = get()
    const frame = frames[id]
    if (!frame) return
    set({
      frames: {
        ...frames,
        [id]: {
          ...frame,
          transform: { ...frame.transform, eulerOrder: order },
        },
      },
    })
  },
}))
