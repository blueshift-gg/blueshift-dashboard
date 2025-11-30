"use client";

import React, {
  Suspense,
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { extend } from "@react-three/fiber";
import { courseColors, CourseDifficulty } from "@/app/utils/course";
import { Text } from "@react-three/drei";
import { useWindowSize } from "usehooks-ts";
import { CourseLanguages } from "@/app/utils/course";
import classNames from "classnames";
import { resolveColorVar } from "@/app/utils/color-helper";

// Custom shader material that combines all effects
const NFTMaterial = shaderMaterial(
  {
    // Uniforms
    matcap1: null,
    matcap3: null,
    time: 0,
    gradientColor: new THREE.Vector3(0.0, 1.0, 1.0),
    referenceCameraZ: 7.5,
  },
  // Vertex shader
  `
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    varying vec3 vViewNormal;
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    varying vec3 vLocalPosition;
    
    void main() {
      vLocalPosition = position;
      
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      
      vec4 viewPosition = viewMatrix * worldPosition;
      vViewPosition = -viewPosition.xyz;
      
      vNormal = normalize(normalMatrix * normal);
      vViewNormal = normalize((viewMatrix * modelMatrix * vec4(normal, 0.0)).xyz);
      
      gl_Position = projectionMatrix * viewPosition;
    }
  `,
  // Fragment shader
  `
    uniform sampler2D matcap1;
    uniform sampler2D matcap3;
    uniform float time;
    uniform vec3 gradientColor;
    uniform float referenceCameraZ;
    
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    varying vec3 vViewNormal;
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    varying vec3 vLocalPosition;
    
    vec2 getMatcapUV(vec3 viewNormal) {
      // Standard Three.js matcap UV calculation
      vec3 n = normalize(viewNormal);
      
      // This is the proven approach used in Three.js MeshMatcapMaterial
      vec3 viewPos = normalize(vViewPosition);
      vec3 x = normalize(vec3(viewPos.z, 0.0, -viewPos.x));
      vec3 y = cross(viewPos, x);
      vec2 uv = vec2(dot(x, n), dot(y, n)) * 0.495 + 0.5;
      
      return uv;
    }
    
    // Rotate UV coordinates by angle in radians
    vec2 rotateUV(vec2 uv, float angle) {
      float cos_angle = cos(angle);
      float sin_angle = sin(angle);
      
      // Center UV at origin
      uv -= 0.5;
      
      // Apply rotation matrix
      vec2 rotated = vec2(
        uv.x * cos_angle - uv.y * sin_angle,
        uv.x * sin_angle + uv.y * cos_angle
      );
      
      // Return to 0-1 range
      return rotated + 0.5;
    }
    
    // Helper for random number generation (white noise)
    // Used for dithering to break up gradient banding
    float random(vec2 p) {
      // Uses gl_FragCoord.xy which provides screen-space pixel coordinates
      return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    // Top to bottom gradient based on local Y position (unaffected by rotation)
    float getTopToBottomGradient() {
      // Use local position Y to get true top-to-bottom gradient
      // Card height is 10.0, ranging from -5.0 to +5.0
      float normalizedY = (vLocalPosition.y + 5.0) / 10.0;
      
      // Clamp to ensure we stay within bounds
      normalizedY = clamp(normalizedY, 0.0, 1.0);

      // Add a small amount of dither to break up banding artifacts.
      float ditherStrength = 0.05;
      normalizedY += (random(gl_FragCoord.xy) - 0.5) * ditherStrength; // Apply centered noise
      normalizedY = clamp(normalizedY, 0.0, 1.0); // Re-clamp after adding noise to prevent out-of-bounds values
      
      // Use a smoother curve for better gradient transitions
      // Apply smoothstep twice for even smoother interpolation
      float smoothGradient = smoothstep(0.0, 1.0, normalizedY);
      smoothGradient = smoothstep(0.0, 1.0, smoothGradient);
      
      return smoothGradient;
    }
    
    // Edge-based rim lighting that only affects borders - rotation independent
    float getEdgeRimLighting() {
      // Card dimensions: 7.5 x 10 with 0.5 radius corners
      float cardWidth = 7.5;
      float cardHeight = 10.0;
      float cornerRadius = 0.5;
      
      // Get absolute local position for edge detection
      vec2 absPos = abs(vLocalPosition.xy);
      
      // Calculate distance from edges
      float edgeDistanceX = cardWidth * 0.5 - absPos.x;
      float edgeDistanceY = cardHeight * 0.5 - absPos.y;
      
      // Handle rounded corners
      vec2 cornerOffset = max(absPos - vec2(cardWidth * 0.5 - cornerRadius, cardHeight * 0.5 - cornerRadius), 0.0);
      float cornerDistance = length(cornerOffset);
      
      // Distance from edge (accounting for corners)
      float edgeDistance;
      if (cornerOffset.x > 0.0 || cornerOffset.y > 0.0) {
        // In corner region
        edgeDistance = cornerRadius - cornerDistance;
      } else {
        // In straight edge region
        edgeDistance = min(edgeDistanceX, edgeDistanceY);
      }
      
      // EXCLUDE BEVELS: Check if we're on the front/back face (not on beveled edges)
      // Front and back faces have normals close to (0,0,±1)
      vec3 localNormal = normalize(vViewNormal);
      float faceAlignment = abs(localNormal.z); // How aligned the normal is with Z-axis
      float bevelMask = smoothstep(0.05, 0.05, faceAlignment); // Only apply to faces, not bevels
      
      // Create rim effect - only activate near edges
      float rimWidth = 0.02; // Slightly increased for better visibility
      float rimFalloff = 0.01; // Increased for sharper metallic edge
      
      // Create smooth rim that's strongest at edges and fades inward
      float rim = 1.0 - smoothstep(0.0, rimWidth, edgeDistance);
      rim = pow(rim, rimFalloff);
      
      // Apply bevel mask to exclude beveled areas
      rim *= bevelMask;
      
      // Enhanced metallic fresnel for view-dependent enhancement
      vec3 cameraWorldPos = (inverse(viewMatrix) * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
      cameraWorldPos.z = referenceCameraZ;
      vec3 viewDirection = normalize(cameraWorldPos - vWorldPosition);
      vec3 worldNormal = normalize(vWorldNormal);
      float fresnel = 1.0 - abs(dot(viewDirection, worldNormal));
      
      // More pronounced metallic fresnel curve
      fresnel = pow(fresnel, 2.5); // Reduced from 4.0 for broader metallic reflection
      
      // Combine edge-based rim with enhanced metallic fresnel
      return rim * (0.4 + 0.8 * fresnel); // Increased fresnel contribution for more metallic look
    }
    
    void main() {
      vec2 matcapUV = getMatcapUV(normalize(vViewNormal));
      
      // Sample matcap textures with rotations
      vec3 matcap1Color = texture2D(matcap1, rotateUV(matcapUV, 4.2)).rgb;
      vec3 matcap3Color = texture2D(matcap3, rotateUV(matcapUV, 3.21)).rgb; // 180 degrees
      
      // Top to bottom gradient using course color
      float gradientMask = getTopToBottomGradient();
      vec3 gradientColorFinal = gradientColor * gradientMask;
      
      // Start with base color
      vec3 finalColor = vec3(0.0);
      
      // Add matcap1 with additive blending (shiny base)
      finalColor += matcap1Color;
      
      // Add matcap3 with multiply blending (enhanced rainbow effect)
      finalColor *= mix(vec3(1.0), matcap3Color, 0.99); // Increased from 0.4 to 0.7
      
      finalColor += gradientColorFinal * 0.08;
      
      // Apply edge-based rim lighting instead of global fresnel
      float edgeRim = getEdgeRimLighting();
      // Apply rim lighting with screen blending for more natural metallic look
      vec3 metallicColor = vec3(1.0, 1.0, 1.0); // Cool metallic silver-blue
      vec3 rimHighlight = metallicColor * edgeRim * 0.2; // Reduced intensity for screen blending
      
      // Screen blending: 1 - (1 - base) * (1 - highlight)
      finalColor = vec3(1.0) - (vec3(1.0) - finalColor) * (vec3(1.0) - rimHighlight);
      
      // Enhance overall brightness slightly
      finalColor *= 1.4;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

// Extend the material so we can use it as JSX
extend({ NFTMaterial });

// Custom shader material for iridescent SVG effect
const IridescentSVGMaterial = shaderMaterial(
  {
    // Uniforms
    map: null,
    matcap1: null,
    matcap3: null,
    time: 0,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vViewNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      
      vec4 viewPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
      vViewPosition = -viewPosition.xyz;
      vViewNormal = normalize((viewMatrix * modelMatrix * vec4(normal, 0.0)).xyz);
      
      gl_Position = projectionMatrix * viewPosition;
    }
  `,
  // Fragment shader
  `
    uniform sampler2D map;
    uniform sampler2D matcap1;
    uniform sampler2D matcap3;
    uniform float time;
    
    varying vec2 vUv;
    varying vec3 vViewNormal;
    varying vec3 vViewPosition;
    
    vec2 getMatcapUV(vec3 viewNormal) {
      vec3 n = normalize(viewNormal);
      vec3 viewPos = normalize(vViewPosition);
      vec3 x = normalize(vec3(viewPos.z, 0.0, -viewPos.x));
      vec3 y = cross(viewPos, x);
      vec2 uv = vec2(dot(x, n), dot(y, n)) * 0.495 + 0.5;
      return uv;
    }
    
    vec2 rotateUV(vec2 uv, float angle) {
      float cos_angle = cos(angle);
      float sin_angle = sin(angle);
      uv -= 0.5;
      vec2 rotated = vec2(
        uv.x * cos_angle - uv.y * sin_angle,
        uv.x * sin_angle + uv.y * cos_angle
      );
      return rotated + 0.5;
    }
    
    // Blur function for matcap sampling
    vec3 sampleMatcapBlurred(sampler2D matcapTexture, vec2 uv, float blurRadius) {
      vec3 color = vec3(0.0);
      float total = 0.0;
      
      // Sample multiple points in a circle pattern for blur effect
      for (int i = 0; i < 8; i++) {
        float angle = float(i) * 3.14159265 * 2.0 / 8.0;
        vec2 offset = vec2(cos(angle), sin(angle)) * blurRadius;
        
        // Sample the texture at the offset position
        color += texture2D(matcapTexture, uv + offset).rgb;
        total += 1.0;
      }
      
      // Add center sample with higher weight
      color += texture2D(matcapTexture, uv).rgb * 2.0;
      total += 2.0;
      
      return color / total;
    }
    
    void main() {
      // Sample the base texture
      vec4 baseColor = texture2D(map, vUv);
      
      // Skip processing for transparent areas
      if (baseColor.a < 0.1) {
        discard;
      }
      
      // Get matcap UV
      vec2 matcapUV = getMatcapUV(normalize(vViewNormal));
      
      // Define blur radius (adjust this value to control blur amount)
      float blurRadius = 0.015; // Increase for more blur, decrease for less
      
      // Sample matcap textures with blur and animated rotation
      vec3 matcap1Color = sampleMatcapBlurred(matcap1, rotateUV(matcapUV, time * 0.5), blurRadius);
      vec3 matcap3Color = sampleMatcapBlurred(matcap3, rotateUV(matcapUV, time * 0.3 + 3.14159), blurRadius);
      
      // Combine base texture with iridescent effects
      vec3 finalColor = baseColor.rgb;
      
      // Add iridescent matcap effects
      finalColor *= mix(vec3(1.0), matcap1Color, 0.6);
      finalColor *= mix(vec3(1.0), matcap3Color, 0.8);
      
      // Enhance brightness for more reflective look
      finalColor *= 1.5;
      
      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `
);

// Extend the iridescent material
extend({ IridescentSVGMaterial });

// Enhanced mesh component that updates lighting uniforms
function NFTMesh({
  geometry,
  challengeLanguage,
}: {
  geometry: THREE.ExtrudeGeometry;
  challengeLanguage: string;
  challengeDifficulty: number;
}) {
  const materialRef = useRef<any>(null);

  // Load matcap textures
  const [matcap1, matcap3] = useTexture([
    "/textures/blur.webp",
    "/textures/holographic.webp",
  ]);

  // Calculate gradient color from course colors
  const gradientColor = useMemo(() => {
    const colorString =
      courseColors[
        challengeLanguage.toLowerCase() as keyof typeof courseColors
      ] || courseColors.Typescript.toLowerCase();
    const [r, g, b] = resolveColorVar(colorString);
    return new THREE.Vector3(r / 255, g / 255, b / 255);
  }, [challengeLanguage]);

  return (
    <mesh position={[0, 0, 0]} geometry={geometry}>
      {React.createElement("nFTMaterial", {
        ref: materialRef,
        matcap1: matcap1,
        matcap3: matcap3,
        gradientColor: gradientColor,
        referenceCameraZ: 7.5,
      })}
    </mesh>
  );
}

// Enhanced SVG component with optional iridescent effect
function SVGImage({
  src,
  position = [0, 0, 0],
  scale = [1, 1, 1],
  useIridescent = false,
}: {
  src: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  useIridescent?: boolean;
}) {
  const texture = useTexture(src);
  const materialRef = useRef<any>(null);
  const { gl } = useThree();

  // Load matcap textures for iridescent effect
  const [matcap1, matcap3] = useTexture([
    "/textures/blur.webp",
    "/textures/holographic.webp",
  ]);

  // Enable anisotropic filtering if available for better quality at angles
  const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
  texture.anisotropy = Math.min(16, maxAnisotropy);

  // Animate the iridescent effect
  useFrame((state) => {
    if (materialRef.current && useIridescent) {
      materialRef.current.time = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      {useIridescent ? (
        React.createElement("iridescentSVGMaterial", {
          ref: materialRef,
          map: texture,
          matcap1: matcap1,
          matcap3: matcap3,
          transparent: true,
          side: THREE.DoubleSide,
        })
      ) : (
        <meshBasicMaterial
          map={texture}
          transparent={true}
          alphaTest={0}
          side={THREE.DoubleSide}
        />
      )}
    </mesh>
  );
}

// Scene component that contains the 3D content
function Scene({
  challengeName,
  challengeLanguage,
  challengeDifficulty,
  useAnimation = true,
  onScreenshot,
  showBackground = true,
}: {
  challengeName: string;
  challengeLanguage: string;
  challengeDifficulty: number;
  useAnimation: boolean;
  onScreenshot?: () => void;
  showBackground?: boolean;
}) {
  const orbitControlsRef = useRef<any>(null);
  const meshRef = useRef<any>(null);
  const light = useRef<any>(null);
  const { gl, scene, camera } = useThree();

  // Animation state for the entire group
  const [isInteracting, setIsInteracting] = useState(false);
  const animationStateRef = useRef({
    time: 0,
    isAnimating: true,
    lastInteractionTime: 0,
    resumeDelay: 0, // 500ms delay before resuming
    specialAnimation: {
      isRunning: false,
      startTime: 0,
      duration: 8, // 8 seconds for the animation
      startRotation: 0,
      targetRotation: 0,
    },
  });

  // Screenshot function
  const takeScreenshot = useCallback(
    (useTransparentBackground = false) => {
      if (!gl || !scene || !camera) return;

      // Create a temporary high-quality renderer for screenshots
      const screenshotRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
        precision: "highp",
        premultipliedAlpha: false,
        stencil: false,
        depth: true,
      });

      // Create a temporary canvas for high-quality downsampling
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d", {
        alpha: true,
        willReadFrequently: false,
      });
      if (!tempCtx) return;

      // More reasonable quality settings that work reliably
      const targetSize = 1600;
      const supersampleFactor = 4; // Good balance of quality vs performance
      const renderSize = targetSize * supersampleFactor;

      // Configure the screenshot renderer
      screenshotRenderer.setPixelRatio(1);
      screenshotRenderer.setSize(renderSize, renderSize);
      screenshotRenderer.outputColorSpace = THREE.SRGBColorSpace;
      screenshotRenderer.toneMapping = THREE.NoToneMapping;
      screenshotRenderer.toneMappingExposure = 1.0;

      // Enable quality settings
      screenshotRenderer.shadowMap.enabled = false;
      screenshotRenderer.sortObjects = true;
      screenshotRenderer.localClippingEnabled = false;

      // Store original camera settings
      const originalAspect = (camera as THREE.PerspectiveCamera).aspect;
      const originalNear = (camera as THREE.PerspectiveCamera).near;
      const originalFar = (camera as THREE.PerspectiveCamera).far;

      // Set optimal camera settings for screenshot
      (camera as THREE.PerspectiveCamera).aspect = 1;
      (camera as THREE.PerspectiveCamera).near = 0.1;
      (camera as THREE.PerspectiveCamera).far = 1000;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

      try {
        // Simple high-quality single-pass render
        screenshotRenderer.render(scene, camera);

        // Set up final canvas
        tempCanvas.width = targetSize;
        tempCanvas.height = targetSize;

        // Enable high-quality downsampling
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = "high";

        // Fill with background only if not using transparent background
        if (!useTransparentBackground) {
          tempCtx.fillStyle = "#000000";
          tempCtx.fillRect(0, 0, targetSize, targetSize);
        }

        // Get the rendered canvas
        const renderedCanvas = screenshotRenderer.domElement;

        // Calculate center crop area
        const sourceSize = Math.min(
          renderedCanvas.width,
          renderedCanvas.height
        );
        const sourceX = (renderedCanvas.width - sourceSize) / 2;
        const sourceY = (renderedCanvas.height - sourceSize) / 2;

        // Two-step downsampling for better quality
        if (supersampleFactor > 3) {
          // First step: downsample to intermediate size
          const intermediateSize = targetSize * 2;
          const intermediateCanvas = document.createElement("canvas");
          intermediateCanvas.width = intermediateSize;
          intermediateCanvas.height = intermediateSize;
          const intermediateCtx = intermediateCanvas.getContext("2d");

          if (intermediateCtx) {
            intermediateCtx.imageSmoothingEnabled = true;
            intermediateCtx.imageSmoothingQuality = "high";

            // First downsampling pass
            intermediateCtx.drawImage(
              renderedCanvas,
              sourceX,
              sourceY,
              sourceSize,
              sourceSize,
              0,
              0,
              intermediateSize,
              intermediateSize
            );

            // Final downsampling pass
            tempCtx.drawImage(
              intermediateCanvas,
              0,
              0,
              intermediateSize,
              intermediateSize,
              0,
              0,
              targetSize,
              targetSize
            );
          } else {
            // Fallback to direct downsampling
            tempCtx.drawImage(
              renderedCanvas,
              sourceX,
              sourceY,
              sourceSize,
              sourceSize,
              0,
              0,
              targetSize,
              targetSize
            );
          }
        } else {
          // Direct downsampling for smaller supersample factors
          tempCtx.drawImage(
            renderedCanvas,
            sourceX,
            sourceY,
            sourceSize,
            sourceSize,
            0,
            0,
            targetSize,
            targetSize
          );
        }

        // Create download link
        const dataUrl = tempCanvas.toDataURL("image/png", 1.0);
        const link = document.createElement("a");
        const backgroundSuffix = useTransparentBackground ? "-transparent" : "";
        link.download = `nft-${challengeName.replace(/\s+/g, "-").toLowerCase()}-${challengeLanguage.toLowerCase()}-difficulty-${challengeDifficulty}${backgroundSuffix}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Screenshot failed:", error);

        // Fallback: simpler screenshot approach
        try {
          screenshotRenderer.setSize(targetSize * 2, targetSize * 2);
          screenshotRenderer.render(scene, camera);

          const dataUrl = screenshotRenderer.domElement.toDataURL(
            "image/png",
            1.0
          );
          const link = document.createElement("a");
          const backgroundSuffix = useTransparentBackground
            ? "-transparent"
            : "";
          link.download = `nft-fallback-${challengeName.replace(/\s+/g, "-").toLowerCase()}${backgroundSuffix}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (fallbackError) {
          console.error("Fallback screenshot also failed:", fallbackError);
          alert("Screenshot failed. Please try again.");
        }
      } finally {
        // Clean up
        screenshotRenderer.dispose();

        // Restore original camera settings
        (camera as THREE.PerspectiveCamera).aspect = originalAspect;
        (camera as THREE.PerspectiveCamera).near = originalNear;
        (camera as THREE.PerspectiveCamera).far = originalFar;
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      }
    },
    [gl, scene, camera, challengeName, challengeLanguage, challengeDifficulty]
  );

  // Start 1080-degree rotation animation
  const startSpinAnimation = useCallback(() => {
    if (meshRef.current) {
      const currentRotationY = meshRef.current.rotation.y;
      const targetRotation = currentRotationY + (1080 * Math.PI) / 180; // 1080 degrees in radians

      animationStateRef.current.specialAnimation = {
        isRunning: true,
        startTime: Date.now(),
        duration: 8, // 8 seconds
        startRotation: currentRotationY,
        targetRotation: targetRotation,
      };

      // Pause regular animation while special animation is running
      animationStateRef.current.isAnimating = false;
    }
  }, []);

  // Reset rotation function
  const resetRotation = useCallback(() => {
    if (orbitControlsRef.current && camera) {
      // Temporarily disable damping to prevent continued motion
      const originalDamping = orbitControlsRef.current.enableDamping;
      orbitControlsRef.current.enableDamping = false;

      // Reset mesh rotation and animation state
      if (meshRef.current) {
        meshRef.current.rotation.set(0, Math.PI / 6.5, Math.PI / 72); // Reset to base rotation
      }

      // Reset animation state
      animationStateRef.current.time = 0;
      animationStateRef.current.isAnimating = useAnimation;
      animationStateRef.current.lastInteractionTime = 0;
      animationStateRef.current.specialAnimation.isRunning = false;

      // Manually set camera position and target to exact initial values
      camera.position.set(0, 0, 17.5);
      orbitControlsRef.current.target.set(0, 0, 0);

      // Update camera matrix
      camera.updateMatrixWorld();

      // Force controls to update to the new position
      orbitControlsRef.current.update();

      // Re-enable damping after a short delay
      setTimeout(() => {
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enableDamping = originalDamping;
        }
      }, 10);
    }
  }, [camera, useAnimation]);

  // Expose screenshot, reset, and spin animation functions
  useEffect(() => {
    if (onScreenshot) {
      // Store the function references with background state
      (window as any).__nftSceneScreenshot = () =>
        takeScreenshot(!showBackground);
      (window as any).__nftSceneResetRotation = resetRotation;
      (window as any).__nftSceneStartSpinAnimation = startSpinAnimation;
    }
  }, [
    takeScreenshot,
    resetRotation,
    startSpinAnimation,
    onScreenshot,
    showBackground,
  ]);

  // Handle OrbitControls interaction events
  const handleControlsStart = useCallback(() => {
    setIsInteracting(true);
    animationStateRef.current.isAnimating = false;
  }, []);

  const handleControlsEnd = useCallback(() => {
    setIsInteracting(false);
    animationStateRef.current.lastInteractionTime = Date.now();
  }, []);

  // EaseInOut function for smooth damping effect
  const easeInOut = useCallback((t: number) => {
    return Math.sin(t * Math.PI);
  }, []);

  // Ease-out cubic function for smooth deceleration
  const easeOutCubic = useCallback((t: number) => {
    return 1 - Math.pow(1 - t, 3);
  }, []);

  // Animation loop for the entire group
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const currentTime = Date.now();

    // Handle special 1080-degree spin animation
    if (animationStateRef.current.specialAnimation.isRunning) {
      const elapsed =
        currentTime - animationStateRef.current.specialAnimation.startTime;
      const progress = Math.min(
        elapsed / (animationStateRef.current.specialAnimation.duration * 1000),
        1
      );

      // Use ease-out cubic for smooth deceleration
      const easedProgress = easeOutCubic(progress);

      // Interpolate rotation
      const startRot = animationStateRef.current.specialAnimation.startRotation;
      const targetRot =
        animationStateRef.current.specialAnimation.targetRotation;
      const currentRotation = startRot + (targetRot - startRot) * easedProgress;

      meshRef.current.rotation.y = currentRotation;

      // Check if animation is complete
      if (progress >= 1) {
        animationStateRef.current.specialAnimation.isRunning = false;
        // Resume regular animation if it was enabled
        if (useAnimation) {
          animationStateRef.current.isAnimating = true;
        }
      }

      return; // Exit early to not run regular animation
    }

    // Regular animation logic
    if (!useAnimation) return;

    const timeSinceLastInteraction =
      currentTime - animationStateRef.current.lastInteractionTime;

    // Resume animation after delay if not interacting
    if (
      !isInteracting &&
      !animationStateRef.current.isAnimating &&
      timeSinceLastInteraction > animationStateRef.current.resumeDelay
    ) {
      animationStateRef.current.isAnimating = true;
    }

    // Only animate if animation is enabled
    if (animationStateRef.current.isAnimating) {
      // Update animation time
      animationStateRef.current.time += delta * 0.3; // Slow down the animation speed

      // Create oscillating value between -1 and 1
      const oscillation = Math.sin(animationStateRef.current.time);

      // Apply strong easeInOut for damping effect
      const easedValue =
        easeInOut(Math.abs(oscillation)) * Math.sign(oscillation);

      // Convert to rotation angle (±10 degrees in radians)
      const rotationAngle = (easedValue * 10 * Math.PI) / 180;

      // Apply rotation to the entire group (keeping base rotation + animation)
      meshRef.current.rotation.y = Math.PI / 6.5 + rotationAngle;
    }
  });

  // Create the beveled rectangle geometry
  const beveledRectGeometry = useMemo(() => {
    // Create a rounded rectangle shape
    const shape = new THREE.Shape();
    const width = 7.5;
    const height = 10;
    const radius = 0.5;

    // Start from bottom-left, going clockwise
    shape.moveTo(-width / 2 + radius, -height / 2);
    shape.lineTo(width / 2 - radius, -height / 2);
    shape.quadraticCurveTo(
      width / 2,
      -height / 2,
      width / 2,
      -height / 2 + radius
    );
    shape.lineTo(width / 2, height / 2 - radius);
    shape.quadraticCurveTo(
      width / 2,
      height / 2,
      width / 2 - radius,
      height / 2
    );
    shape.lineTo(-width / 2 + radius, height / 2);
    shape.quadraticCurveTo(
      -width / 2,
      height / 2,
      -width / 2,
      height / 2 - radius
    );
    shape.lineTo(-width / 2, -height / 2 + radius);
    shape.quadraticCurveTo(
      -width / 2,
      -height / 2,
      -width / 2 + radius,
      -height / 2
    );

    // Extrude settings for proper beveling
    const extrudeSettings = {
      depth: 0.2, // 24 points of extrusion
      bevelEnabled: true,
      bevelThickness: 0.02, // 5 bevel thickness
      bevelSize: 0.08, // 5 bevel size
      bevelSegments: 2, // Increased from 2 to 3 for smoother bevels
      curveSegments: 100,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Ensure normals are computed properly for all surfaces
    geometry.computeVertexNormals();

    return geometry;
  }, []);

  return (
    <>
      {/* Enhanced mesh with lighting integration and animation */}
      <group
        ref={meshRef}
        rotation={[0, Math.PI / 6.5, Math.PI / 72]} // Base rotation applied to the entire group
      >
        <NFTMesh
          challengeDifficulty={challengeDifficulty}
          geometry={beveledRectGeometry}
          challengeLanguage={challengeLanguage}
        />

        {/* SVG Icons using texture on planes - more reliable approach */}
        <SVGImage
          src={`/textures/language-${challengeLanguage.toLowerCase()}.svg`}
          position={[0, 0, 0.225]}
          scale={[7.5, 10, 1]}
        />

        <SVGImage
          src={`/textures/difficulty-${challengeDifficulty}.svg`}
          position={[0, 0, 0.225]}
          scale={[7.5, 10, 1]}
        />

        <SVGImage
          src="/textures/qualified-text.svg"
          position={[0, 0, 0.225]}
          scale={[7.5, 10, 1]}
        />

        {/* Move card-back to the back of the card with iridescent effect */}
        <SVGImage
          src="/textures/card-back.svg"
          position={[0, 0, -0.025]}
          scale={[-7.5, 10, 1]}
          useIridescent={true}
        />

        <Text
          position={[-3.15, 1.1, 0.226]}
          color="white"
          fontSize={0.68}
          lineHeight={1.1}
          font="/fonts/FunnelDisplay-Medium.ttf"
          anchorX="left"
          anchorY="top-baseline"
          maxWidth={6}
        >
          {challengeName}
        </Text>
      </group>

      <OrbitControls
        ref={orbitControlsRef}
        enableDamping
        dampingFactor={0.005}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        onStart={handleControlsStart}
        onEnd={handleControlsEnd}
      />
    </>
  );
}

// GUI Controls Component
function GUIControls({
  challengeName,
  challengeLanguage,
  challengeDifficulty,
  useAnimation,
  onChallengeNameChange,
  onChallengeLanguageChange,
  onChallengeDifficultyChange,
  onUseAnimationChange,
  showBackground,
  onShowBackgroundChange,
}: {
  challengeName: string;
  challengeLanguage: string;
  challengeDifficulty: number;
  useAnimation: boolean;
  onChallengeNameChange: (value: string) => void;
  onChallengeLanguageChange: (value: string) => void;
  onChallengeDifficultyChange: (value: number) => void;
  onUseAnimationChange: (value: boolean) => void;
  showBackground: boolean;
  onShowBackgroundChange: (value: boolean) => void;
}) {
  const guiRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);

  // Initialize GUI once on mount
  useEffect(() => {
    // Dynamically import dat.gui only on client side
    const initializeGUI = async () => {
      const dat = await import("dat.gui");

      // Create GUI
      const gui = new dat.GUI({
        name: "NFT Scene Controls",
        width: 300,
      });
      guiRef.current = gui;

      // Control object for dat.gui
      const controls = {
        challengeName: challengeName,
        challengeLanguage: challengeLanguage,
        challengeDifficulty: challengeDifficulty,
        useAnimation: useAnimation,
        takeScreenshot: () => {
          // Call the screenshot function exposed on window
          if ((window as any).__nftSceneScreenshot) {
            (window as any).__nftSceneScreenshot();
          }
        },
        resetRotation: () => {
          // Call the reset rotation function exposed on window
          if ((window as any).__nftSceneResetRotation) {
            (window as any).__nftSceneResetRotation();
          }
        },
        startAnimation: () => {
          // Call the spin animation function exposed on window
          if ((window as any).__nftSceneStartSpinAnimation) {
            (window as any).__nftSceneStartSpinAnimation();
          }
        },
        showBackground: showBackground,
      };

      controlsRef.current = controls;

      // Add controls
      gui
        .add(controls, "challengeName")
        .name("Challenge Name")
        .onChange((value: string) => {
          onChallengeNameChange(value);
        });

      gui
        .add(controls, "challengeLanguage", [
          "Anchor",
          "Rust",
          "Typescript",
          "Assembly",
        ])
        .name("Language")
        .onChange((value: string) => {
          onChallengeLanguageChange(value);
        });

      gui
        .add(controls, "challengeDifficulty", {
          Beginner: 1,
          Intermediate: 2,
          Advanced: 3,
          Expert: 4,
        })
        .name("Difficulty")
        .onChange((value: number) => {
          onChallengeDifficultyChange(value);
        });

      gui
        .add(controls, "useAnimation")
        .name("Enable Animation")
        .onChange((value: boolean) => {
          onUseAnimationChange(value);
        });

      gui
        .add(controls, "showBackground")
        .name("Show Background")
        .onChange((value: boolean) => {
          onShowBackgroundChange(value);
        });

      // Add screenshot button
      gui
        .add(controls, "takeScreenshot")
        .name("📸 Take Screenshot (1600x1600)");

      // Add reset rotation button
      gui.add(controls, "resetRotation").name("🔄 Reset Rotation");

      // Add start animation button
      gui.add(controls, "startAnimation").name("🌀 Start Animation (1080°)");
    };

    initializeGUI().catch(console.error);

    // Cleanup function
    return () => {
      if (guiRef.current) {
        guiRef.current.destroy();
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  // Update GUI controls when props change (without recreating the GUI)
  useEffect(() => {
    if (controlsRef.current) {
      // Update the control object values to sync with props
      controlsRef.current.challengeName = challengeName;
      controlsRef.current.challengeLanguage = challengeLanguage;
      controlsRef.current.challengeDifficulty = challengeDifficulty;
      controlsRef.current.useAnimation = useAnimation;
      controlsRef.current.showBackground = showBackground;

      // Update GUI display to reflect the new values
      if (guiRef.current) {
        // Update each controller's displayed value
        guiRef.current.__controllers.forEach((controller: any) => {
          controller.updateDisplay();
        });
      }
    }
  }, [
    challengeName,
    challengeLanguage,
    challengeDifficulty,
    useAnimation,
    showBackground,
  ]);

  return null;
}

// Main NFT Scene React component
export default function NFTScene({
  challengeName: initialChallengeName,
  challengeLanguage: initialChallengeLanguage,
  challengeDifficulty: initialChallengeDifficulty,
  isAnimationComplete = false,
  useAnimation: initialUseAnimation = true,
  showControls = false,
  showBackground = true,
}: {
  challengeName: string;
  challengeLanguage: CourseLanguages;
  challengeDifficulty: CourseDifficulty;
  isAnimationComplete: boolean;
  useAnimation: boolean;
  showControls?: boolean;
  showBackground?: boolean;
}) {
  const { width } = useWindowSize();

  // State for controllable parameters
  const [challengeName, setChallengeName] = useState(initialChallengeName);
  const [challengeLanguage, setChallengeLanguage] = useState(
    initialChallengeLanguage
  );
  const [challengeDifficulty, setChallengeDifficulty] = useState(
    initialChallengeDifficulty
  );
  const [useAnimation, setUseAnimation] = useState(initialUseAnimation);
  const [showBackgroundValue, setShowBackgroundValue] =
    useState(showBackground);
  // Properly typed callback functions
  const handleChallengeNameChange = useCallback((value: string) => {
    setChallengeName(value);
  }, []);

  const handleChallengeLanguageChange = useCallback((value: string) => {
    setChallengeLanguage(value as CourseLanguages);
  }, []);

  const handleChallengeDifficultyChange = useCallback((value: number) => {
    setChallengeDifficulty(value as CourseDifficulty);
  }, []);

  const handleUseAnimationChange = useCallback((value: boolean) => {
    setUseAnimation(value);
  }, []);

  const handleShowBackgroundChange = useCallback((value: boolean) => {
    setShowBackgroundValue(value);
  }, []);

  return (
    <div
      className={classNames(
        "h-full w-full overflow-hidden",
        showBackgroundValue && "bg-gradient-to-b from-[#0D0E14] to-black"
      )}
    >
      {showControls && (
        <GUIControls
          challengeName={challengeName}
          challengeLanguage={challengeLanguage}
          challengeDifficulty={challengeDifficulty}
          useAnimation={useAnimation}
          onChallengeNameChange={handleChallengeNameChange}
          onChallengeLanguageChange={handleChallengeLanguageChange}
          onChallengeDifficultyChange={handleChallengeDifficultyChange}
          onUseAnimationChange={handleUseAnimationChange}
          showBackground={showBackgroundValue}
          onShowBackgroundChange={handleShowBackgroundChange}
        />
      )}
      {isAnimationComplete && (
        <Canvas
          dpr={[1.5, 2]}
          shadows
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.NoToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
            powerPreference: "high-performance",
            preserveDrawingBuffer: false, // Set to false for better performance during interaction
            stencil: false,
            depth: true,
          }}
          camera={{
            position: [0, 0, 17.5],
            rotation: [0, 0, 0],
            near: 0.1,
            far: 1000,
            fov: 45,
          }}
        >
          <Suspense fallback={null}>
            <Scene
              challengeName={challengeName}
              challengeLanguage={challengeLanguage}
              challengeDifficulty={challengeDifficulty}
              useAnimation={useAnimation}
              onScreenshot={showControls ? () => {} : undefined}
              showBackground={showBackgroundValue}
            />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
