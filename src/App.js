import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Preload, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import styles from './App.module.css';
import ChatbotUI from './ChatbotUI.js'; // We'll create this component next

// 3D Model Component 

// Paste this code into your App.js file

const Robot = () => {
    const robot = useRef();
    useFrame((state, delta) => {
        if(robot.current) robot.current.rotation.y += delta * 0.3;
    });

    return (
        <group ref={robot} dispose={null} scale={2.5} position={[0, -1.5, 0]}>
            {/* Main material for the robot */}
            <meshStandardMaterial color="#095774ff" />

            {/* Geometries for the robot parts */}
            <mesh position={[0, 1, 0]}>
                <boxGeometry args={[0.6, 0.6, 0.6]} />
            </mesh>
            <mesh position={[0, 0.4, 0]}>
                <boxGeometry args={[1, 1, 0.7]} />
            </mesh>
            <mesh position={[-0.7, 0.4, 0]}>
                <boxGeometry args={[0.2, 0.8, 0.2]} />
            </mesh>
            <mesh position={[0.7, 0.4, 0]}>
                <boxGeometry args={[0.2, 0.8, 0.2]} />
            </mesh>
            <mesh position={[-0.3, -0.4, 0]}>
                <boxGeometry args={[0.3, 0.8, 0.3]} />
            </mesh>
            <mesh position={[0.3, -0.4, 0]}>
                <boxGeometry args={[0.3, 0.8, 0.3]} />
            </mesh>

            {/* Eyes with a slightly darker blue for definition */}
            <mesh position={[-0.15, 1.1, 0.3]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="#095774ff" />
            </mesh>
            <mesh position={[0.15, 1.1, 0.3]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="#095774ff" />
            </mesh>
        </group>
    );
};

const CanvasLoader = () => <Html center><div className={styles.loaderText}>Loading 3D Model...</div></Html>;

const RobotCanvas = () => (
    <Canvas frameloop="demand" shadows camera={{ position: [10, 3, 5], fov: 35 }} gl={{ preserveDrawingBuffer: true }} className={styles.canvas}>
        <Suspense fallback={<CanvasLoader />}>
            <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2} />
            <hemisphereLight intensity={0.5} groundColor="black" />
            <spotLight position={[-20, 50, 10]} angle={0.12} penumbra={1} intensity={1} castShadow shadow-mapSize={1024} />
            <pointLight intensity={1.5} />
            <Robot />
        </Suspense>
        <Preload all />
    </Canvas>
);

// Main App Component
export default function App() {
  return (
    <main className={styles.main}>
        <div className={styles.backgroundGradient}></div>
        <div className={styles.contentLayout}>
            <motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className={styles.leftColumn}>
                <div className={styles.titleContainer}>
                    <h1 className={styles.mainTitle}>AI & <span className={styles.titleHighlight}>Robotics</span></h1>
                    <p className={styles.subtitle}>Your Intelligent Automation Partner</p>
                </div>
                <div className={styles.canvasContainer}>
                    <RobotCanvas />
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} className={styles.rightColumn}>
                <ChatbotUI />
            </motion.div>
        </div>
    </main>
  );
}