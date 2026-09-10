import { useEffect, useRef, useState } from 'react';

// 1. Explicitly interface the component parameters
interface CameraScannerProps {
  onCapture?: (base64Image: string) => void;
}

export default function CameraScanner({ onCapture }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // UI and Error States (Strictly typed)
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMirrored, setIsMirrored] = useState<boolean>(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;
    
    // Animation line tracking variables (scoped to the effect loop)
    let lineY = 0;
    let direction = 1; // 1 = down, -1 = up
    const speed = 4;   // Pixels moved per frame

    async function startCamera() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Safe cross-platform constraints: Try rear camera on mobile, fallback to default on PC
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Critical parameters for mobile web browser sandbox execution
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.muted = true;
          
          await videoRef.current.play();
          setIsLoading(false);
          
          // Begin the frame rendering loop
          animationFrameId = requestAnimationFrame(scanFrame);
        }
      } catch (err: unknown) { // 2. Caught exceptions are typed as 'unknown' in modern TS
        setIsLoading(false);
        if (err instanceof Error && err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions in your browser.');
        } else {
          setError('Could not locate or connect to a camera source.');
        }
      }
    }

    function scanFrame() {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Check if video metadata has resolved dimensions
      if (video.videoWidth > 0 && video.videoHeight > 0 && ctx) {
        
        // Dynamically align internal canvas buffer sizing to matching video source
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // 1. Snapshot current camera frame on canvas matrix
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 2. Define standard Target Box Matrix (centered 60% zone)
        const boxWidth = canvas.width * 0.6;
        const boxHeight = canvas.height * 0.6;
        const boxX = (canvas.width - boxWidth) / 2;
        const boxY = (canvas.height - boxHeight) / 2;

        // 3. Draw semi-opaque viewfinder target frame
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 3;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // 4. Calculate Laser Loop Positions
        lineY += speed * direction;
        if (lineY >= boxHeight || lineY <= 0) {
          direction *= -1; // Reverse course at target boundaries
        }

        // 5. Draw Cyberpunk/Neon Glowing Sweep Line
        const absoluteLineY = boxY + lineY;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffcc'; // Cyan laser glow
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.moveTo(boxX, absoluteLineY);
        ctx.lineTo(boxX + boxWidth, absoluteLineY);
        ctx.stroke();

        // Standard Canvas hygiene: Wipe shadow mapping calculations for downstream frames
        ctx.shadowBlur = 0;
      }

      // Loop continuously matching monitor refresh rates
      animationFrameId = requestAnimationFrame(scanFrame);
    }

    startCamera();

    // Cleanup: Shut off hardware sensors and break loops when component unmounts
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!canvasRef.current) return;

    // 1. Capture image data URL directly from active rendering canvas
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
    
    // 2. Safely extract base64 payload string part after the comma index
    const base64Parts = dataUrl.split(',');
    const cleanBase64 = base64Parts.length > 1 ? base64Parts[1] : '';

    // 3. Emit clean string safely up into wrapper components
    if (onCapture && cleanBase64) {
      onCapture(cleanBase64);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'sans-serif',
      gap: '16px'
    }}>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: '640px',
        background: '#1a1a1a',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        {/* Hidden internal native hardware text/stream feed */}
        <video ref={videoRef} playsInline muted style={{ display: 'none' }} />

        {/* User Facing Interactive Canvas UI layer */}
        <canvas 
          ref={canvasRef} 
          style={{ 
            width: '100%', 
            display: 'block',
            // Mirrors the UI container globally if the client toggles it on PC
            transform: isMirrored ? 'scaleX(-1)' : 'none' 
          }} 
        />

        {/* Overlay States for Hardware Initializations */}
        {(isLoading || error) && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            padding: '20px',
            textAlign: 'center'
          }}>
            {isLoading && <p style={{ fontSize: '1.1rem' }}>Initializing Camera Engine...</p>}
            {error && <p style={{ color: '#ff6b6b', fontWeight: 'bold' }}>{error}</p>}
          </div>
        )}
      </div>

      {/* Local Controls */}
      {!isLoading && !error && (
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleCapture}
            style={{
              padding: '12px 24px',
              background: '#00ffcc',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            ⚡ Capture Matrix Frame
          </button>

          <button 
            onClick={() => setIsMirrored(prev => !prev)}
            style={{
              padding: '12px 20px',
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {isMirrored ? '🔄 Standard View' : '🔄 Mirror Video'}
          </button>
        </div>
      )}
    </div>
  );
}
