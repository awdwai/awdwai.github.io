import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import Conveyor from './Conveyor'
import RoboticArm from './RoboticArm'
import PackagePicker from './PackagePicker'
import './Scene.css'

const CAM_POS = [3.2, 2.35, 4.6]
const CAM_TARGET = [-0.35, 0.55, 0.55]

function CameraLookAt({ target = CAM_TARGET }) {
  const { camera } = useThree()
  useLayoutEffect(() => {
    camera.position.set(...CAM_POS)
    camera.lookAt(...target)
    camera.updateProjectionMatrix()
  }, [camera, target])
  return null
}

function Floor() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.42, 0]}
      receiveShadow
      raycast={() => {}}
    >
      <planeGeometry args={[28, 28]} />
      <meshStandardMaterial color="#121418" metalness={0.55} roughness={0.65} />
    </mesh>
  )
}

function GridMarks() {
  const ref = useRef()
  useEffect(() => {
    ref.current?.traverse((o) => {
      if (o.raycast) o.raycast = () => {}
    })
  }, [])
  return (
    <gridHelper
      ref={ref}
      args={[24, 36, '#2a2d32', '#1a1c20']}
      position={[0, -0.41, 0]}
    />
  )
}

function ReadyPulse({ onReady }) {
  const frames = useRef(0)
  useFrame(() => {
    frames.current += 1
    if (frames.current === 2) onReady?.()
  })
  return null
}

function FactoryScene({
  ready,
  selectedId,
  armPhase,
  onSelectPackage,
  onReached,
  onSceneReady,
  packageWorldRefs,
}) {
  const modelReady = useRef(false)
  const frameReady = useRef(false)

  const maybeReady = () => {
    if (modelReady.current && frameReady.current) onSceneReady?.()
  }

  return (
    <>
      <ReadyPulse
        onReady={() => {
          frameReady.current = true
          maybeReady()
        }}
      />
      <color attach="background" args={['#0a0a0b']} />
      <fog attach="fog" args={['#0a0a0b', 8, 22]} />

      {/* Position/orientation set in CameraLookAt so lookAt is not overwritten */}
      <PerspectiveCamera makeDefault fov={40} near={0.1} far={60} />
      <CameraLookAt />

      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        position={[4.5, 7, 3]}
        intensity={1.35}
        color="#fff2e6"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={24}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <directionalLight position={[-4, 3, -2]} intensity={0.45} color="#8ab0ff" />
      <pointLight position={[0.4, 2.2, 1.2]} intensity={1.1} color="#e85d04" distance={8} />
      <spotLight
        position={[-2, 5, 2]}
        angle={0.45}
        penumbra={0.5}
        intensity={0.7}
        color="#ffb070"
        castShadow
      />

      <Floor />
      <GridMarks />

      <Suspense fallback={null}>
        <Environment preset="warehouse" environmentIntensity={0.55} />
        <RoboticArm
          ready={ready}
          selectedId={selectedId}
          armPhase={armPhase}
          packageWorldRefs={packageWorldRefs}
          onModelReady={() => {
            modelReady.current = true
            maybeReady()
          }}
        />
      </Suspense>

      <Conveyor
        selectedId={selectedId}
        indexing={armPhase === 'reaching'}
        ready={ready}
        onSelectPackage={onSelectPackage}
        onIndexed={onReached}
        packageWorldRefs={packageWorldRefs}
      />

      <PackagePicker ready={ready} onSelectPackage={onSelectPackage} />

      <ContactShadows
        position={[0, -0.41, 0]}
        opacity={0.55}
        scale={14}
        blur={2.4}
        far={8}
        color="#000000"
        frames={1}
      />
    </>
  )
}

export default function SceneCanvas({
  ready,
  onSceneReady,
  selectedId,
  armPhase,
  onSelectPackage,
  onReached,
}) {
  const packageWorldRefs = useRef({})

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [])

  return (
    <div className="scene-canvas">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <FactoryScene
          ready={ready}
          selectedId={selectedId}
          armPhase={armPhase}
          onSelectPackage={onSelectPackage}
          onReached={onReached}
          onSceneReady={onSceneReady}
          packageWorldRefs={packageWorldRefs}
        />
      </Canvas>
    </div>
  )
}
