# Robotics Transform Visualizer

A React + Three.js app for visualizing rigid body transformations (SE(3)) with frame chaining, interactive gizmos, and multiple rotation representations.

## Run

```bash
npm install
npm run dev
```

Then open the URL shown (e.g. http://localhost:5173).

## Features

- **Frame chaining**: Add root frames and child frames; each frame is a child of the previous in the scene graph (nested transforms).
- **Compose transforms**: For each frame, set **translation** (x, y, z) and **rotation** via:
  - **Euler angles** with configurable axis order (XYZ, ZYX, etc.)
  - **Quaternion** (x, y, z, w)
  - **3×3 rotation matrix** (read-only display)
- **Interactive gizmos**: Use **TransformControls** (translate / rotate / scale) in the 3D view; sidebar inputs update in real time.
- **Visual aids**:
  - RGB axes per frame (X=Red, Y=Green, Z=Blue)
  - Dashed lines from parent origin to child origin
  - **Local** and **global** 4×4 transformation matrices for the selected frame
- **Robotics context**: Toggle **Intrinsic** vs **Extrinsic** rotation (gizmo and interpretation).
- **Reset to identity** per frame; **Gimbal lock** warning when the middle Euler angle is near ±90° (e.g. XYZ with Y ≈ ±90°).

## Stack

- **React** + **Vite** + **TypeScript**
- **Three.js** + **@react-three/fiber** + **@react-three/drei** (OrbitControls, TransformControls, Grid)
- **Zustand** for state (frame tree, selection, UI options)
- **Tailwind CSS** for the dark sidebar UI

## Project structure

- `src/store/transformStore.ts` — Zustand store (frames, selection, actions)
- `src/components/Scene3D.tsx` — Canvas, frame hierarchy, TransformControls, Grid
- `src/components/FrameNode.tsx` — Single frame (group + axes + dashed lines + children)
- `src/components/Sidebar.tsx` — Frame list, transform inputs, matrices, gimbal lock note
- `src/components/FrameAxes.tsx` — RGB axis meshes
- `src/components/Matrix4Display.tsx` — 4×4 matrix grid
- `src/utils/math.ts` — Euler/quaternion/matrix conversions
