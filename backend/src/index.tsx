import React, {useRef} from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  registerRoot,
  useCurrentFrame,
} from "remotion";
import {Canvas, useFrame} from "@react-three/fiber";
import {Text} from "@react-three/drei";
import * as THREE from "three";

/* ============================================
   GEAR
============================================ */

const Gear = ({
  position,
  scale = 1,
  speed = 1,
}: {
  position: [number, number, number];
  scale?: number;
  speed?: number;
}) => {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const frame = state.clock.elapsedTime * 30;

    if (ref.current) {
      ref.current.rotation.z = frame * 0.04 * speed;
    }
  });

  const teeth = [];

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;

    teeth.push(
      <mesh
        key={i}
        position={[
          Math.cos(angle) * 0.8,
          Math.sin(angle) * 0.8,
          0,
        ]}
        rotation={[0, 0, angle]}
      >
        <boxGeometry args={[0.32, 0.22, 0.25]} />

        <meshStandardMaterial
          color="#777777"
          metalness={1}
          roughness={0.25}
        />
      </mesh>
    );
  }

  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <torusGeometry args={[0.55, 0.18, 16, 50]} />

        <meshStandardMaterial
          color="#777777"
          metalness={1}
          roughness={0.25}
        />
      </mesh>

      {teeth}

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.4, 32]} />

        <meshStandardMaterial
          color="#333333"
          metalness={1}
        />
      </mesh>
    </group>
  );
};

/* ============================================
   PISTON
============================================ */

const Piston = ({
  position,
  delay,
}: {
  position: [number, number, number];
  delay: number;
}) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const frame = state.clock.elapsedTime * 30;

    if (ref.current) {
      ref.current.position.y =
        position[1] +
        Math.sin((frame + delay) * 0.12) * 0.35;
    }
  });

  return (
    <>
      <mesh position={position}>
        <cylinderGeometry args={[0.18, 0.18, 1.7, 32]} />

        <meshStandardMaterial
          color="#292929"
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>

      <mesh ref={ref} position={position}>
        <cylinderGeometry args={[0.28, 0.28, 0.5, 32]} />

        <meshStandardMaterial
          color="#aaaaaa"
          metalness={1}
          roughness={0.15}
        />
      </mesh>
    </>
  );
};

/* ============================================
   MACHINE
============================================ */

const Machine = () => {
  const frame = useCurrentFrame();

  const startup = interpolate(
    frame,
    [0, 60],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <group position={[0, -0.3, 0]}>

      {/* MAIN BODY */}

      <mesh>
        <boxGeometry args={[6, 4.5, 3]} />

        <meshStandardMaterial
          color="#15181c"
          metalness={0.9}
          roughness={0.32}
        />
      </mesh>

      {/* LEFT PANEL */}

      <mesh position={[-3.05, 0, 0]}>
        <boxGeometry args={[0.15, 3.8, 2.6]} />

        <meshStandardMaterial
          color="#24282d"
          metalness={1}
        />
      </mesh>

      {/* RIGHT PANEL */}

      <mesh position={[3.05, 0, 0]}>
        <boxGeometry args={[0.15, 3.8, 2.6]} />

        <meshStandardMaterial
          color="#24282d"
          metalness={1}
        />
      </mesh>

      {/* SCREEN BORDER */}

      <mesh position={[0, 0.8, 1.56]}>
        <boxGeometry args={[3.8, 1.8, 0.1]} />

        <meshStandardMaterial
          color="#050505"
          metalness={0.8}
        />
      </mesh>

      {/* SCREEN */}

      <mesh position={[0, 0.8, 1.63]}>
        <boxGeometry args={[3.4, 1.4, 0.05]} />

        <meshStandardMaterial
          color="#00140c"
          emissive="#00ff88"
          emissiveIntensity={startup}
        />
      </mesh>

      {/* HELLO WORLD */}

      {frame > 120 && (
        <Text
          position={[0, 0.8, 1.7]}
          fontSize={0.42}
          color="#00ff88"
          anchorX="center"
          anchorY="middle"
        >
          HELLO WORLD
        </Text>
      )}

      {/* CURSOR */}

      {frame > 120 && frame % 30 < 18 && (
        <Text
          position={[1.5, 0.8, 1.71]}
          fontSize={0.4}
          color="#00ff88"
        >
          _
        </Text>
      )}

      {/* GEARS */}

      <Gear
        position={[-1.6, -1.1, 1.7]}
        scale={0.8}
        speed={1}
      />

      <Gear
        position={[-0.2, -1.25, 1.7]}
        scale={0.55}
        speed={-1.4}
      />

      <Gear
        position={[1.1, -1.15, 1.7]}
        scale={0.7}
        speed={1.2}
      />

      {/* PISTONS */}

      <Piston
        position={[2.1, -0.8, 1.7]}
        delay={0}
      />

      <Piston
        position={[2.6, -0.8, 1.7]}
        delay={15}
      />

      {/* STATUS LIGHTS */}

      {[-1, 0, 1].map((x, index) => (
        <mesh
          key={index}
          position={[x * 0.35, -1.85, 1.62]}
        >
          <sphereGeometry args={[0.09, 20, 20]} />

          <meshStandardMaterial
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={
              Math.sin(frame * 0.15 + index) > 0
                ? 5
                : 0.4
            }
          />
        </mesh>
      ))}

      {/* MACHINE FEET */}

      {[-2.3, 2.3].map((x) =>
        [-1, 1].map((z) => (
          <mesh
            key={`${x}-${z}`}
            position={[x, -2.5, z]}
          >
            <boxGeometry args={[0.6, 0.5, 0.6]} />

            <meshStandardMaterial
              color="#090909"
              metalness={0.8}
            />
          </mesh>
        ))
      )}
    </group>
  );
};

/* ============================================
   CAMERA
============================================ */

const CameraRig = () => {
  const frame = useCurrentFrame();

  useFrame((state) => {
    const progress = frame / 300;

    state.camera.position.x =
      Math.sin(progress * Math.PI * 0.8) * 3;

    state.camera.position.y =
      1.8 +
      Math.sin(progress * Math.PI) * 0.5;

    state.camera.position.z =
      10 - progress * 1.5;

    state.camera.lookAt(0, 0, 0);
  });

  return null;
};

/* ============================================
   3D SCENE
============================================ */

const Scene = () => {
  const frame = useCurrentFrame();

  const startupLight = interpolate(
    frame,
    [0, 50],
    [0, 4],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <>
      <CameraRig />

      {/* LIGHTING */}

      <ambientLight intensity={0.35} />

      <directionalLight
        position={[4, 8, 6]}
        intensity={3}
      />

      <pointLight
        position={[-4, 2, 5]}
        intensity={startupLight}
        color="#00ff88"
      />

      <pointLight
        position={[4, 1, 4]}
        intensity={3}
        color="#3377ff"
      />

      {/* MACHINE */}

      <Machine />

      {/* FLOOR */}

      <mesh
        position={[0, -2.8, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[40, 40]} />

        <meshStandardMaterial
          color="#080808"
          metalness={0.3}
          roughness={0.8}
        />
      </mesh>
    </>
  );
};

/* ============================================
   VIDEO
============================================ */

const MachineVideo = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at center, #111820 0%, #030405 70%)",
        opacity,
      }}
    >
      <Canvas
        camera={{
          position: [0, 2, 10],
          fov: 42,
        }}
        gl={{
          antialias: true,
        }}
      >
        <fog
          attach="fog"
          args={["#030405", 10, 28]}
        />

        <Scene />
      </Canvas>
    </AbsoluteFill>
  );
};

/* ============================================
   REMOTION ROOT
============================================ */

const RemotionRoot = () => {
  return (
    <Composition
      id="Machine"
      component={MachineVideo}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};

registerRoot(RemotionRoot);