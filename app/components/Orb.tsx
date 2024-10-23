import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { useVapiContext } from "~/contexts/VapiContext";
import { CALL_STATUS } from "~/hooks/useVapi";
import { getVapi, startVapiCall } from "~/lib/vapi.sdk";

const Orb: React.FC = () => {
    const { state, dispatch } = useVapiContext();
    const { callStatus, audioLevel } = state;
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const ballRef = useRef<THREE.Mesh | null>(null);
    const originalPositionsRef = useRef<Float32Array | null>(null);
    const noise = createNoise3D();
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (containerRef.current) {
            setSize({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight
            });
        }
    }, []);

    useEffect(() => {
        if (size.width > 0 && size.height > 0) {
            initViz();
        }
    }, [size]);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleResize = () => {
        if (containerRef.current) {
            setSize({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight
            });
        }
    };

    useEffect(() => {
        if (callStatus === CALL_STATUS.ACTIVE && ballRef.current) {
            updateBallMorph(ballRef.current, audioLevel);
        } else if (callStatus !== CALL_STATUS.ACTIVE && ballRef.current && originalPositionsRef.current) {
            resetBallMorph(ballRef.current, originalPositionsRef.current);
        }
    }, [audioLevel, callStatus]);

    const initViz = () => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
        camera.position.z = 20;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(size.width, size.height);
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(renderer.domElement);

        const geometry = new THREE.IcosahedronGeometry(10, 4);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            wireframe: true,
        });

        const ball = new THREE.Mesh(geometry, material);
        scene.add(ball);

        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(0, 0, 20);
        scene.add(light);

        originalPositionsRef.current = geometry.attributes.position.array.slice() as Float32Array;

        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        ballRef.current = ball;

        const animate = () => {
            requestAnimationFrame(animate);
            ball.rotation.x += 0.01;
            ball.rotation.y += 0.01;
            renderer.render(scene, camera);
        };
        animate();
    };

    const updateBallMorph = (mesh: THREE.Mesh, volume: number) => {
        const geometry = mesh.geometry as THREE.BufferGeometry;
        const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
        const originalPositions = originalPositionsRef.current;
        if (!originalPositions) return;

        for (let i = 0; i < positionAttribute.count; i++) {
            const offset = 10;
            const amp = 7;
            const time = Date.now();
            const vertex = new THREE.Vector3(
                originalPositions[i * 3],
                originalPositions[i * 3 + 1],
                originalPositions[i * 3 + 2]
            );
            vertex.normalize();
            const distance = offset + noise(
                vertex.x + time * 0.0005,
                vertex.y + time * 0.0003,
                vertex.z + time * 0.0008
            ) * amp * volume;
            vertex.multiplyScalar(distance);
            positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        positionAttribute.needsUpdate = true;
    };

    const resetBallMorph = (mesh: THREE.Mesh, originalPositions: Float32Array) => {
        const geometry = mesh.geometry as THREE.BufferGeometry;
        const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;

        for (let i = 0; i < positionAttribute.count; i++) {
            positionAttribute.setXYZ(
                i,
                originalPositions[i * 3],
                originalPositions[i * 3 + 1],
                originalPositions[i * 3 + 2]
            );
        }
        positionAttribute.needsUpdate = true;
    };

    const toggleCall = async () => {
        const vapi = getVapi();
        if (callStatus === CALL_STATUS.ACTIVE) {
            dispatch({ type: 'SET_CALL_STATUS', payload: CALL_STATUS.INACTIVE });
            vapi?.stop();
        } else {
            dispatch({ type: 'SET_CALL_STATUS', payload: CALL_STATUS.LOADING });
            try {
                await startVapiCall();
            } catch (error) {
                console.error("Failed to start call:", error);
                dispatch({ type: 'SET_CALL_STATUS', payload: CALL_STATUS.INACTIVE });
                alert("Failed to start call. Please check your microphone permissions and try again.");
            }
        }
    };

    const handleClick = useCallback(() => {
        if (callStatus === CALL_STATUS.INACTIVE) {
            startVapiCall();
        } else if (callStatus === CALL_STATUS.ACTIVE) {
            stop();
        }
    }, [callStatus, stop]);

    return (
        <div ref={containerRef} onClick={handleClick} style={{ width: '100%', height: '100%', cursor: 'pointer' }} />
    );
};

export default Orb;
