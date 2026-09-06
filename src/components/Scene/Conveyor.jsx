import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { site } from '../../data/site'
import Package from './Package'

const BELT_LEN = 7.2
const BELT_W = 1.15
const SPEED = 0.55
const PICKUP_X = 0.15

export default function Conveyor({
  selectedId,
  paused,
  ready,
  onSelectPackage,
  packageWorldRefs,
}) {
  const beltRef = useRef()
  const groupRefs = useRef({})
  const offsets = useMemo(
    () => site.packages.map((_, i) => (i / site.packages.length) * BELT_LEN - BELT_LEN / 2),
    [],
  )
  const phase = useRef(0)
  const [hoveredId, setHoveredId] = useState(null)

  const iron = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3a3f46',
        metalness: 0.85,
        roughness: 0.35,
      }),
    [],
  )
  const darkIron = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a1c20',
        metalness: 0.9,
        roughness: 0.4,
      }),
    [],
  )
  const orange = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e85d04',
        metalness: 0.55,
        roughness: 0.4,
        emissive: '#e85d04',
        emissiveIntensity: 0.15,
      }),
    [],
  )

  useFrame((_, dt) => {
    if (!paused && ready) {
      phase.current = (phase.current + dt * SPEED) % BELT_LEN
    }

    site.packages.forEach((pkg, i) => {
      const g = groupRefs.current[pkg.id]
      if (!g) return

      let x
      if (selectedId === pkg.id) {
        x = THREE.MathUtils.damp(g.position.x, PICKUP_X, 4, dt)
      } else {
        const raw = offsets[i] + phase.current
        x = ((raw + BELT_LEN / 2) % BELT_LEN) - BELT_LEN / 2
      }

      g.position.set(x, 0.42, 0)

      if (packageWorldRefs?.current) {
        const world = new THREE.Vector3()
        g.getWorldPosition(world)
        packageWorldRefs.current[pkg.id] = world.clone()
      }
    })
  })

  const rollers = useMemo(() => {
    const count = 10
    return Array.from({ length: count }, (_, i) => {
      const x = -BELT_LEN / 2 + 0.4 + (i / (count - 1)) * (BELT_LEN - 0.8)
      return x
    })
  }, [])

  return (
    <group position={[0, 0, 1.15]}>
      {/* Structure is visual-only so it never blocks package picks */}
      <group
        ref={(el) => {
          if (!el) return
          el.traverse((obj) => {
            if (obj.isMesh) obj.raycast = () => {}
          })
        }}
      >
        <mesh position={[0, 0.18, 0]} material={darkIron} receiveShadow castShadow>
          <boxGeometry args={[BELT_LEN + 0.35, 0.28, BELT_W + 0.25]} />
        </mesh>
        <mesh position={[-BELT_LEN / 2 - 0.12, 0.32, 0]} material={iron} castShadow>
          <boxGeometry args={[0.18, 0.55, BELT_W + 0.3]} />
        </mesh>
        <mesh position={[BELT_LEN / 2 + 0.12, 0.32, 0]} material={iron} castShadow>
          <boxGeometry args={[0.18, 0.55, BELT_W + 0.3]} />
        </mesh>

        <mesh ref={beltRef} position={[0, 0.34, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={iron}>
          <planeGeometry args={[BELT_LEN, BELT_W]} />
        </mesh>

        <mesh position={[0, 0.36, -BELT_W / 2 - 0.02]} material={orange}>
          <boxGeometry args={[BELT_LEN, 0.04, 0.04]} />
        </mesh>
        <mesh position={[0, 0.36, BELT_W / 2 + 0.02]} material={orange}>
          <boxGeometry args={[BELT_LEN, 0.04, 0.04]} />
        </mesh>

        {rollers.map((x) => (
          <mesh key={x} position={[x, 0.22, 0]} rotation={[0, 0, Math.PI / 2]} material={darkIron} castShadow>
            <cylinderGeometry args={[0.07, 0.07, BELT_W * 0.95, 12]} />
          </mesh>
        ))}

        {[-2.6, 0, 2.6].map((x) => (
          <group key={x}>
            <mesh position={[x, -0.15, BELT_W / 2 + 0.05]} material={darkIron} castShadow>
              <boxGeometry args={[0.12, 0.55, 0.12]} />
            </mesh>
            <mesh position={[x, -0.15, -BELT_W / 2 - 0.05]} material={darkIron} castShadow>
              <boxGeometry args={[0.12, 0.55, 0.12]} />
            </mesh>
          </group>
        ))}
      </group>

      {site.packages.map((pkg) => (
        <group
          key={pkg.id}
          ref={(el) => {
            if (el) groupRefs.current[pkg.id] = el
          }}
        >
          <Package
            id={pkg.id}
            label={pkg.label}
            short={pkg.short}
            position={[0, 0, 0]}
            selected={selectedId === pkg.id}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onSelect={onSelectPackage}
            interactive={ready}
          />
        </group>
      ))}
    </group>
  )
}
