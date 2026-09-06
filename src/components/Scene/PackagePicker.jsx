import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Direct canvas picking for packages only — bypasses arm/belt/HTML stealing R3F events.
 */
export default function PackagePicker({ ready, onSelectPackage }) {
  const { gl, camera, scene } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])

  useEffect(() => {
    const el = gl.domElement

    const pick = (clientX, clientY) => {
      if (!ready || !onSelectPackage) return null
      const rect = el.getBoundingClientRect()
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((clientY - rect.top) / rect.height) * 2 - 1
      raycaster.setFromCamera(ndc, camera)

      const targets = []
      scene.traverse((obj) => {
        if (obj.isMesh && obj.userData?.packageHit) targets.push(obj)
      })
      const hits = raycaster.intersectObjects(targets, false)
      return hits[0]?.object?.userData?.packageHit ?? null
    }

    const onPointerDown = (e) => {
      if (e.button !== 0) return
      const id = pick(e.clientX, e.clientY)
      if (id) {
        e.preventDefault()
        onSelectPackage(id)
      }
    }

    el.addEventListener('pointerdown', onPointerDown)
    return () => el.removeEventListener('pointerdown', onPointerDown)
  }, [gl, camera, scene, ready, onSelectPackage, raycaster, ndc])

  return null
}
