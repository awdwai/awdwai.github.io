import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BOX = [0.55, 0.38, 0.42]

function fitPlaqueFont(ctx, text, maxWidth, maxSize = 58, minSize = 26) {
  let size = maxSize
  while (size > minSize) {
    ctx.font = `700 ${size}px "Barlow Condensed", "Arial Narrow", sans-serif`
    if (ctx.measureText(text).width <= maxWidth) break
    size -= 2
  }
  return size
}

/** Paint the section name into the crate's front-face texture. */
function makeCrateFaceTexture(text, { selected = false } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 384
  const ctx = canvas.getContext('2d')
  const label = String(text || '').toUpperCase()

  const body = selected ? '#2a2218' : '#1c1e22'
  ctx.fillStyle = body
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Subtle panel lines so the face reads as crate plating
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 3
  ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36)
  ctx.beginPath()
  ctx.moveTo(18, canvas.height * 0.62)
  ctx.lineTo(canvas.width - 18, canvas.height * 0.62)
  ctx.stroke()

  // Plaque inset on the front face
  const pw = 300
  const ph = 110
  const px = (canvas.width - pw) / 2
  const py = (canvas.height - ph) / 2 - 8
  ctx.fillStyle = '#cfd4da'
  ctx.fillRect(px, py, pw, ph)
  ctx.strokeStyle = '#8e959f'
  ctx.lineWidth = 5
  ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8)
  ctx.fillStyle = '#b8bec6'
  ctx.fillRect(px + 14, py + 14, pw - 28, ph - 28)

  const maxTextW = pw - 36
  const size = fitPlaqueFont(ctx, label, maxTextW)
  ctx.fillStyle = '#121418'
  ctx.font = `700 ${size}px "Barlow Condensed", "Arial Narrow", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, canvas.width / 2, canvas.height / 2 - 4)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

export default function Package({
  id,
  label,
  position,
  selected,
  hoveredId,
  onHover,
  onSelect,
  interactive,
}) {
  const mesh = useRef()
  const [localHover, setLocalHover] = useState(false)
  const hovered = hoveredId === id || localHover
  const accent = selected ? '#ff7a1a' : hovered ? '#e85d04' : '#4a5058'

  const faceTexture = useMemo(
    () => makeCrateFaceTexture(label, { selected }),
    [label, selected],
  )

  useEffect(() => () => faceTexture.dispose(), [faceTexture])

  const materials = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({
      color: selected ? '#2a2218' : '#1c1e22',
      metalness: 0.35,
      roughness: 0.55,
    })
    const front = new THREE.MeshStandardMaterial({
      map: faceTexture,
      metalness: 0.28,
      roughness: 0.58,
    })
    // Box face order: +x, -x, +y, -y, +z, -z
    return {
      box: [side, side.clone(), side.clone(), side.clone(), front, side.clone()],
      rim: new THREE.MeshStandardMaterial({
        color: accent,
        metalness: 0.7,
        roughness: 0.35,
        emissive: accent,
        emissiveIntensity: selected || hovered ? 0.35 : 0.08,
      }),
    }
  }, [accent, selected, hovered, faceTexture])

  useFrame((_, dt) => {
    if (!mesh.current) return
    const target = selected ? 0.12 : hovered ? 0.06 : 0
    mesh.current.position.y = THREE.MathUtils.damp(mesh.current.position.y, target, 8, dt)
  })

  return (
    <group position={position}>
      <group
        ref={mesh}
        onPointerOver={(e) => {
          e.stopPropagation()
          if (!interactive) return
          setLocalHover(true)
          onHover?.(id)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setLocalHover(false)
          onHover?.(null)
          document.body.style.cursor = 'auto'
        }}
        onClick={(e) => {
          e.stopPropagation()
          if (!interactive) return
          onSelect?.(id)
        }}
        onPointerDown={(e) => {
          e.stopPropagation()
        }}
      >
        {/* Hit volume ≈ visible crate so neighbors never steal picks while the belt moves */}
        <mesh visible={false} userData={{ packageHit: id }} position={[0, 0, 0]}>
          <boxGeometry args={[BOX[0] * 1.02, BOX[1] * 1.08, BOX[2] * 1.02]} />
        </mesh>
        <mesh castShadow receiveShadow material={materials.box}>
          <boxGeometry args={BOX} />
        </mesh>
        <mesh position={[0, BOX[1] / 2 + 0.02, 0]} material={materials.rim}>
          <boxGeometry args={[BOX[0] * 0.92, 0.04, BOX[2] * 0.92]} />
        </mesh>
      </group>
    </group>
  )
}
