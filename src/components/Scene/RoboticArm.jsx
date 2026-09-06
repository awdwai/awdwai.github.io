import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/** Rest pose facing the conveyor (+Z). Joints: yaw Y, shoulder/elbow/tip pitch X. */
const IDLE = {
  baseYaw: 0.1,
  shoulder: 0.55,
  elbow: 1.55,
  wrist: 0,
  tip: 0.08,
  grip: 0,
}

// Upper link to elbow; lower link through wrist+tip to gripper tips
const L1 = 0.95
const L2 = 1.34
const SHOULDER_Y = 0.54
const ARM_ROOT = new THREE.Vector3(-1.2, -0.42, -0.35)
const MAX_REACH = L1 + L2 - 0.04
const MIN_REACH = Math.abs(L1 - L2) + 0.1
/** Comfortable folded reach — stretches toward MAX as cursor leaves screen center. */
const COMFORT_REACH = L1 * 0.92 + L2 * 0.42
/** Fixed station aim while indexing or panel open — no pointer/crate tracking. */
const STATION_READY = new THREE.Vector3(0.15, 0.6, 1.15)

const STRETCH_INNER = 0.18
const STRETCH_OUTER = 0.72

function useArmMaterials() {
  return useMemo(
    () => ({
      iron: new THREE.MeshStandardMaterial({
        color: '#6a717a',
        metalness: 0.92,
        roughness: 0.28,
      }),
      jet: new THREE.MeshStandardMaterial({
        color: '#121418',
        metalness: 0.88,
        roughness: 0.35,
      }),
      orange: new THREE.MeshStandardMaterial({
        color: '#e85d04',
        metalness: 0.65,
        roughness: 0.32,
        emissive: '#e85d04',
        emissiveIntensity: 0.22,
      }),
      bolt: new THREE.MeshStandardMaterial({
        color: '#9aa3ad',
        metalness: 0.95,
        roughness: 0.22,
      }),
    }),
    [],
  )
}

function Housing({ args, position, rotation, material, castShadow = true }) {
  return (
    <mesh
      castShadow={castShadow}
      receiveShadow
      position={position}
      rotation={rotation}
      material={material}
    >
      <boxGeometry args={args} />
    </mesh>
  )
}

function CylinderPart({ args, position, rotation, material, castShadow = true }) {
  return (
    <mesh
      castShadow={castShadow}
      receiveShadow
      position={position}
      rotation={rotation}
      material={material}
    >
      <cylinderGeometry args={args} />
    </mesh>
  )
}

/** Two-link IK aiming the gripper (full L2) at targetWorld. */
function solveReach(targetWorld, openGrip = false, screenDist = 0) {
  const local = targetWorld.clone().sub(ARM_ROOT)
  const yaw = Math.atan2(local.x, local.z)
  const horiz = Math.hypot(local.x, local.z)
  const vert = local.y - SHOULDER_Y

  let reach = Math.hypot(horiz, vert)
  reach = THREE.MathUtils.clamp(reach, MIN_REACH, MAX_REACH)

  const cosElbow = THREE.MathUtils.clamp(
    (L1 * L1 + L2 * L2 - reach * reach) / (2 * L1 * L2),
    -1,
    1,
  )
  const elbow = Math.PI - Math.acos(cosElbow)

  const cosAlpha = THREE.MathUtils.clamp(
    (L1 * L1 + reach * reach - L2 * L2) / (2 * L1 * reach),
    -1,
    1,
  )
  const alpha = Math.acos(cosAlpha)
  const fromUp = Math.atan2(horiz, vert)
  const shoulder = THREE.MathUtils.clamp(fromUp - alpha, -0.35, 1.85)
  const elbowClamped = THREE.MathUtils.clamp(elbow, 0.2, 2.5)

  // Reach-aligned tip, then cock the hand UP in the screen middle (negative tip.x).
  const tipAlign = shoulder + elbowClamped - fromUp
  const tipSoft = tipAlign * 0.28
  const midness = 1 - THREE.MathUtils.smoothstep(screenDist, 0.1, 0.55)
  const tipUp = -0.85 * midness
  const tip = openGrip
    ? THREE.MathUtils.clamp(tipSoft + tipUp + 0.1, -1.1, 0.9)
    : THREE.MathUtils.clamp(tipSoft + tipUp, -1.1, 0.9)

  return {
    baseYaw: THREE.MathUtils.clamp(yaw, -1.45, 1.45),
    shoulder,
    elbow: elbowClamped,
    wrist: THREE.MathUtils.clamp(-yaw * 0.4, -0.65, 0.65),
    tip,
    grip: openGrip ? 0.45 : 0.04,
  }
}

function reachRadiusFromPointer(ndcX, ndcY) {
  const fromCenter = Math.min(1.15, Math.hypot(ndcX, ndcY))
  const t = THREE.MathUtils.smoothstep(fromCenter, STRETCH_INNER, STRETCH_OUTER)
  return THREE.MathUtils.lerp(COMFORT_REACH, MAX_REACH, t)
}

function raySphereHits(ray, center, radius) {
  const oc = ray.origin.clone().sub(center)
  const a = ray.direction.dot(ray.direction)
  const b = 2 * oc.dot(ray.direction)
  const c = oc.dot(oc) - radius * radius
  const disc = b * b - 4 * a * c
  if (disc < 0 || a < 1e-12) return null
  const s = Math.sqrt(disc)
  const t0 = (-b - s) / (2 * a)
  const t1 = (-b + s) / (2 * a)
  const nearT = Math.min(t0, t1)
  const farT = Math.max(t0, t1)
  const near = nearT > 1e-4 ? ray.at(nearT, new THREE.Vector3()) : null
  const far = farT > 1e-4 ? ray.at(farT, new THREE.Vector3()) : null
  return { near, far }
}

function clampToReach(shoulderWorld, target, radius, out) {
  const world = target.clone()
  if (world.z < ARM_ROOT.z + 0.15) {
    world.z = ARM_ROOT.z + 0.15
  }
  const offset = world.sub(shoulderWorld)
  const len = offset.length()
  if (len < 1e-6) {
    out.copy(shoulderWorld).add(new THREE.Vector3(0, 0.2, radius))
    return
  }
  out.copy(shoulderWorld).addScaledVector(offset.multiplyScalar(1 / len), Math.min(len, radius))
}

/**
 * Camera ray → reachable aim point.
 * Prefer on-ray hits in front of the arm; near screen center, aim higher so the arm folds up.
 */
function rayToReachTarget(ray, shoulderWorld, out, radius, screenDist = 0) {
  const midness = 1 - THREE.MathUtils.smoothstep(screenDist, 0.1, 0.55)
  const workY = THREE.MathUtils.lerp(0.55, 1.25, midness)
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -workY)
  const planeHit = new THREE.Vector3()
  const hitPlane = ray.intersectPlane(plane, planeHit)

  const hits = raySphereHits(ray, shoulderWorld, radius)

  if (hitPlane && planeHit.z > ARM_ROOT.z + 0.05) {
    clampToReach(shoulderWorld, planeHit, radius, out)
    return
  }

  if (hits?.near && hits.near.z > ARM_ROOT.z + 0.05) {
    out.copy(hits.near)
    return
  }

  const tAim = Math.max(0.5, ray.origin.clone().sub(shoulderWorld).length() * 0.72)
  const onRay = ray.at(tAim, new THREE.Vector3())
  clampToReach(shoulderWorld, onRay, radius, out)
}

/** Site-built 6-axis industrial arm: iron / jet-black body with orange accents. */
export default function RoboticArm({
  ready,
  armPhase,
  onModelReady,
}) {
  const mats = useArmMaterials()
  const { camera } = useThree()
  const rootRef = useRef()
  const baseYaw = useRef()
  const shoulder = useRef()
  const elbow = useRef()
  const wrist = useRef()
  const tip = useRef()
  const gripL = useRef()
  const gripR = useRef()
  const joints = { baseYaw, shoulder, elbow, wrist, tip, gripL, gripR }

  const targets = useRef({ ...IDLE })
  const pointer = useRef({ x: 0, y: 0 })
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const shoulderWorld = useMemo(
    () => new THREE.Vector3(ARM_ROOT.x, ARM_ROOT.y + SHOULDER_Y, ARM_ROOT.z),
    [],
  )
  const cursorTarget = useRef(new THREE.Vector3(0.2, 0.9, 1.2))
  const reachRadius = useRef(COMFORT_REACH)

  useEffect(() => {
    rootRef.current?.traverse((obj) => {
      if (obj.isMesh) obj.raycast = () => {}
    })
    onModelReady?.()
  }, [onModelReady])

  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((_, dt) => {
    if (!ready) {
      targets.current = { ...IDLE }
    } else if (armPhase === 'reaching') {
      // Station-ready while belt indexes — ignore pointer.
      targets.current = solveReach(STATION_READY, false, 0)
    } else if (armPhase === 'open') {
      // Panel open: same ready pose, gripper open — no pointer or crate tracking.
      targets.current = solveReach(STATION_READY, true, 0)
    } else {
      // Idle only: pointer-aim.
      ndc.set(pointer.current.x, pointer.current.y)
      raycaster.setFromCamera(ndc, camera)
      const screenDist = Math.min(1, Math.hypot(pointer.current.x, pointer.current.y))
      reachRadius.current = reachRadiusFromPointer(pointer.current.x, pointer.current.y)
      rayToReachTarget(
        raycaster.ray,
        shoulderWorld,
        cursorTarget.current,
        reachRadius.current,
        screenDist,
      )
      targets.current = solveReach(cursorTarget.current, false, screenDist)
    }

    const t = targets.current
    const damp = (ref, axis, value) => {
      const node = ref.current
      if (!node) return
      node.rotation[axis] = THREE.MathUtils.damp(node.rotation[axis], value, 7.5, dt)
    }

    damp(joints.baseYaw, 'y', t.baseYaw)
    damp(joints.shoulder, 'x', t.shoulder)
    damp(joints.elbow, 'x', t.elbow)
    damp(joints.wrist, 'y', t.wrist)
    damp(joints.tip, 'x', t.tip)

    if (joints.gripL.current) {
      joints.gripL.current.rotation.z = THREE.MathUtils.damp(
        joints.gripL.current.rotation.z,
        t.grip,
        5,
        dt,
      )
    }
    if (joints.gripR.current) {
      joints.gripR.current.rotation.z = THREE.MathUtils.damp(
        joints.gripR.current.rotation.z,
        -t.grip,
        5,
        dt,
      )
    }
  })

  return (
    <group ref={rootRef} position={ARM_ROOT.toArray()} rotation={[0, 0, 0]}>
      <CylinderPart
        args={[0.42, 0.48, 0.08, 24]}
        position={[0, 0.04, 0]}
        material={mats.jet}
      />
      <CylinderPart
        args={[0.32, 0.34, 0.06, 24]}
        position={[0, 0.1, 0]}
        material={mats.iron}
      />
      <CylinderPart
        args={[0.36, 0.36, 0.035, 32]}
        position={[0, 0.135, 0]}
        material={mats.orange}
        castShadow={false}
      />

      <group ref={joints.baseYaw} position={[0, 0.16, 0]}>
        <CylinderPart args={[0.22, 0.24, 0.28, 20]} position={[0, 0.14, 0]} material={mats.iron} />
        <Housing args={[0.38, 0.14, 0.28]} position={[0, 0.32, 0]} material={mats.jet} />
        <CylinderPart
          args={[0.07, 0.07, 0.36, 16]}
          position={[0.2, 0.32, 0]}
          rotation={[0, 0, Math.PI / 2]}
          material={mats.bolt}
        />

        <group ref={joints.shoulder} position={[0, 0.38, 0]}>
          <CylinderPart
            args={[0.11, 0.11, 0.34, 16]}
            position={[0, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            material={mats.orange}
          />
          <Housing args={[0.16, 0.9, 0.2]} position={[0, 0.48, 0]} material={mats.iron} />
          <Housing args={[0.06, 0.72, 0.22]} position={[0.1, 0.48, 0]} material={mats.jet} />
          <Housing args={[0.18, 0.08, 0.22]} position={[0, 0.9, 0]} material={mats.orange} />

          <group ref={joints.elbow} position={[0, 0.95, 0]}>
            <CylinderPart
              args={[0.09, 0.09, 0.28, 16]}
              rotation={[0, 0, Math.PI / 2]}
              material={mats.orange}
            />
            <Housing args={[0.14, 0.72, 0.16]} position={[0, 0.4, 0]} material={mats.iron} />
            <Housing args={[0.05, 0.58, 0.18]} position={[-0.08, 0.4, 0]} material={mats.jet} />

            <group ref={joints.wrist} position={[0, 0.78, 0]}>
              <CylinderPart args={[0.08, 0.08, 0.14, 16]} material={mats.jet} />
              <Housing args={[0.12, 0.22, 0.12]} position={[0, 0.16, 0]} material={mats.iron} />

              <group ref={joints.tip} position={[0, 0.28, 0]}>
                <CylinderPart
                  args={[0.06, 0.06, 0.18, 14]}
                  rotation={[0, 0, Math.PI / 2]}
                  material={mats.orange}
                />
                <Housing args={[0.1, 0.16, 0.1]} position={[0, 0.12, 0]} material={mats.jet} />
                <CylinderPart
                  args={[0.07, 0.05, 0.08, 12]}
                  position={[0, 0.22, 0]}
                  material={mats.iron}
                />
                <group position={[0, 0.28, 0]}>
                  <group ref={joints.gripL} position={[0.04, 0, 0]}>
                    <Housing args={[0.03, 0.14, 0.05]} position={[0.02, 0.06, 0]} material={mats.orange} />
                    <Housing args={[0.02, 0.08, 0.04]} position={[0.035, 0.14, 0]} material={mats.bolt} />
                  </group>
                  <group ref={joints.gripR} position={[-0.04, 0, 0]}>
                    <Housing args={[0.03, 0.14, 0.05]} position={[-0.02, 0.06, 0]} material={mats.orange} />
                    <Housing args={[0.02, 0.08, 0.04]} position={[-0.035, 0.14, 0]} material={mats.bolt} />
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
