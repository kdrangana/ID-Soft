import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from "react-dom/client";
import { GoogleGenAI, Type } from "@google/genai";
import JsBarcode from 'jsbarcode';
import { 
    X as CloseIcon, 
    Trash2 as TrashIcon, 
    Plus as PlusIcon, 
    GripHorizontal as DragHandleIcon, 
    ArrowDown as SendBackwardIcon, 
    ArrowUp as BringForwardIcon, 
    Crop as CropIcon, 
    Ban as NoColorIcon, 
    FlipHorizontal as FlipHorizontalIcon, 
    FlipVertical as FlipVerticalIcon, 
    Search as SearchIcon, 
    Upload as UploadIcon, 
    Download as DownloadIcon, 
    Sparkles as SparklesIcon, 
    Save as SaveIcon, 
    Settings as SettingsIcon, 
    Barcode as BarcodeIcon, 
    Palette as PaletteIcon, 
    Type as TextIcon, 
    Image as ImageIcon, 
    Square as SquareIcon, 
    Circle as CircleIcon, 
    Star as StarIcon, 
    Minus as LineIcon, 
    CreditCard as ViewFrontIcon, 
    Smartphone as ViewBackIcon, 
    Columns as ViewBothIcon, 
    ZoomOut as ZoomOutIcon, 
    ZoomIn as ZoomInIcon, 
    Lock as LockIcon, 
    Unlock as UnlockIcon,
    Eye as EyeIcon,
    Printer as PrinterIcon,
    FileText as FilePdfIcon,
    RotateCw as RotateIcon,
    Ratio as RatioIcon,
    Maximize as FitIcon,
    RefreshCw as ResetIcon,
    Grid3x3 as GridIcon,
    RotateCcw as RotateLeftIcon,
    Move as MoveIcon
} from 'lucide-react';

interface TextStyle {
    fontFamily?: string;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    caps?: 'none' | 'all' | 'small';
    script?: 'none' | 'super' | 'sub';
    color?: string;
    opacity?: number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    letterSpacing?: number;
    lineHeight?: number;
    strokeWidth?: number;
    strokeColor?: string;
}

interface CustomElement extends TextStyle {
    id: string;
    type: 'text' | 'image' | 'shape';
    side?: 'front' | 'back'; 
    x: number;
    y: number;
    zIndex?: number; 
    
    // --- Text Specific ---
    text?: string;
    // (Styles inherited from TextStyle)

    // --- Image Specific ---
    src?: string;
    width?: number; // width in px
    height?: number; // for shapes
    aspectRatio?: number;
    rotation?: number; // degrees
    flipX?: boolean;
    flipY?: boolean;

    // --- Shape Specific ---
    shapeType?: 'rectangle' | 'circle' | 'star' | 'line';
    fillColor?: string; 
    strokeColor?: string;
}

interface DesignationConfig {
    id: string;
    title: string;
    color: string; 
    textColor: string; 
}

interface GradeConfig {
    id: string;
    title: string;
    textColor: string;
}

interface BarcodeConfig {
    lineColor: string;
    width: number;
    height: number;
    displayValue: boolean;
    textPosition: "top" | "bottom";
    fontSize: number;
}

interface ProfileConfig {
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    scale: number;
    yOffset: number;
}

interface IdCardData {
    id?: string;
    nameWithInitials: string;
    fullName: string;
    designation: string;
    grade: string;
    nic: string;
    dateOfIssue: string;
    slPostFileNo: string;
}

const FONT_OPTIONS = [
    { label: 'Inter', value: '"Inter", sans-serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Times New Roman', value: '"Times New Roman", serif' },
    { label: 'Courier New', value: '"Courier New", monospace' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
    { label: 'Impact', value: 'Impact, sans-serif' },
    { label: 'Brush Script', value: '"Brush Script MT", cursive' },
];

const INITIAL_CUSTOM_ELEMENTS: CustomElement[] = [
    { 
        id: '1', 
        type: 'text', 
        text: 'Additional Text Layer', 
        side: 'front',
        bold: false, 
        italic: false, 
        fontSize: 10, 
        color: '#000000', 
        x: 20, 
        y: 200,
        fontFamily: '"Inter", sans-serif',
        opacity: 100,
        textAlign: 'left',
        zIndex: 30
    }
];

const ImageCropper = ({ imageSrc, onCancel, onSave }: { imageSrc: string, onCancel: () => void, onSave: (img: string) => void }) => {
    // Standard ID Card aspect ratios
    const [aspectRatio, setAspectRatio] = useState(3/4); 
    
    // Transform State: x, y are offsets from center. scale 1 = fit to box. rotate in degrees.
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1, rotate: 0 });
    
    // Image intrinsic size
    const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
    
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    // Constants for Viewport
    const VIEWPORT_HEIGHT = 400;
    const viewportWidth = VIEWPORT_HEIGHT * aspectRatio;

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        setImgSize({ w: naturalWidth, h: naturalHeight });
        // Initial Center Fit logic happens via CSS/Render automatically if x/y are 0
    };

    // --- Interactions ---

    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        const delta = -Math.sign(e.deltaY) * 0.05;
        setTransform(prev => ({
            ...prev,
            scale: Math.max(0.1, Math.min(5, prev.scale + delta))
        }));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            e.preventDefault();
            const dx = e.clientX - lastPos.current.x;
            const dy = e.clientY - lastPos.current.y;
            lastPos.current = { x: e.clientX, y: e.clientY };

            setTransform(prev => ({
                ...prev,
                x: prev.x + dx,
                y: prev.y + dy
            }));
        };

        const handleMouseUp = () => {
            isDragging.current = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // --- Snap Grid Logic ---
    // Snaps the image edges to the viewport edges
    const handleSnap = (pos: number) => {
        if (imgSize.w === 0) return;
        
        // Calculate current visual dimensions of the image
        // To keep it simple, we snap based on 0-rotation logic. 
        // If rotated, we reset rotation for snap or snap center.
        
        // For ID cards, images are usually upright.
        // We want to calculate the X/Y translation needed to align edges.
        
        // The image is rendered centered, then translated.
        // At x=0, y=0, scale=1: Image Center is at Viewport Center.
        // Let's assume 'Scale 1' means the image 'covers' the viewport fully or fits? 
        // Actually in my render logic below, I'll make Scale 1 = "Contain" or "Cover" base?
        // Let's simply say: 
        // Visual Width = imgSize.w * transform.scale * (fitRatio)
        
        // Let's refine the render scale first:
        // We will render the image so that at scale=1, it fits naturally?
        // Let's just use raw pixels for simplicity in logic, mapped to viewport.
        
        // Better: We are translating the image div directly in pixels relative to viewport center.
        // Viewport dimensions: viewportWidth x VIEWPORT_HEIGHT
        
        // To make snapping robust:
        // Image Visual Width (approx) = imgSize.w * displayScale * transform.scale
        // We don't easily know 'displayScale' without ref.
        // Simplification: Reset to Center (Pos 4) is most important.
        
        if (pos === 4) { // Center
             setTransform(t => ({ ...t, x: 0, y: 0 }));
             return;
        }

        // For edge snapping, we really need the computed rendered size.
        // Let's stick to a robust Center snap + preset movements if needed, 
        // BUT the user asked for 9-box. 
        // We can approximate if we know the 'base scale' that makes image fit.
        // Let's rely on visual adjustment for edges (Manual Drag) and use Grid for "Zones".
        
        // Actually, let's implement true Snap by using a multiplier:
        const moveStepX = viewportWidth / 3;
        const moveStepY = VIEWPORT_HEIGHT / 3;
        
        // Grid: 0 1 2
        //       3 4 5
        //       6 7 8
        
        const row = Math.floor(pos / 3);
        const col = pos % 3;
        
        // Map 0->-1, 1->0, 2->1
        const xMult = col - 1; 
        const yMult = row - 1;
        
        // Move by 33% of viewport size
        setTransform(t => ({
             ...t,
             x: xMult * (viewportWidth / 2.5), // Not exact edge snap, but 'zone' snap
             y: yMult * (VIEWPORT_HEIGHT / 2.5)
        }));
    };

    const handleSave = () => {
        if (!imgRef.current) return;
        
        // Create high-res canvas
        const canvas = document.createElement('canvas');
        const scaleFactor = 4; // High Res Multiplier
        
        const finalWidth = viewportWidth * scaleFactor;
        const finalHeight = VIEWPORT_HEIGHT * scaleFactor;
        
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Fill background (optional, for transparency safety)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, finalWidth, finalHeight);

        // We need to replicate the CSS transform on Canvas
        // Origin is center of canvas
        ctx.translate(finalWidth / 2, finalHeight / 2);
        
        // Apply user transforms
        // Translate (scaled)
        ctx.translate(transform.x * scaleFactor, transform.y * scaleFactor);
        // Rotate
        ctx.rotate((transform.rotate * Math.PI) / 180);
        // Scale
        ctx.scale(transform.scale, transform.scale);
        
        // Draw Image Centered
        // We need to calculate the scale that makes the image appear 'natural' in the viewport initially
        // In the CSS below, I simply put <img src> centered. 
        // If image is larger than viewport, it might spill out (hidden by overflow).
        // Standard <img> without CSS width/height displays at natural size.
        // So we draw at natural size, centered.
        
        ctx.drawImage(
            imgRef.current,
            -imgSize.w / 2,
            -imgSize.h / 2,
            imgSize.w,
            imgSize.h
        );

        onSave(canvas.toDataURL('image/png', 1.0));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-200 select-none">
             <div className="bg-[#1e1e1e] rounded-xl overflow-hidden max-w-6xl w-full h-[95vh] flex flex-col shadow-2xl border border-gray-800">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-[#252525]">
                    <h3 className="font-bold text-gray-200 flex items-center gap-2">
                        <CropIcon className="w-5 h-5 text-blue-500" />
                        Adjust Photo
                    </h3>
                    <div className="flex items-center gap-2">
                        {/* Aspect Ratio Toggles */}
                        <div className="flex bg-black/30 rounded-lg p-1 mr-4 border border-gray-700">
                            <button 
                                onClick={() => setAspectRatio(1)}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${aspectRatio === 1 ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                1:1
                            </button>
                            <button 
                                onClick={() => setAspectRatio(3/4)}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${aspectRatio === 3/4 ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                3:4
                            </button>
                             <button 
                                onClick={() => setAspectRatio(4/3)}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${aspectRatio === 4/3 ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                4:3
                            </button>
                        </div>
                        <button onClick={onCancel} className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors">
                            <CloseIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
                
                {/* Main Workspace */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Canvas Area */}
                    <div 
                        className="flex-1 bg-[#121212] relative flex items-center justify-center overflow-hidden cursor-move"
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        ref={containerRef}
                    >
                        {/* Background Grid Pattern */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        {/* Viewport Mask Container */}
                        <div 
                            style={{ 
                                width: viewportWidth, 
                                height: VIEWPORT_HEIGHT,
                                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.85)' // Darkens everything outside
                            }}
                            className="relative z-10 border-2 border-white/30 pointer-events-none shadow-2xl"
                        >
                            {/* Guidelines */}
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-1/3 left-0 right-0 h-px bg-white"></div>
                                <div className="absolute top-2/3 left-0 right-0 h-px bg-white"></div>
                                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white"></div>
                                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white"></div>
                                {/* Center Crosshair */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-l border-t border-white/50"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-r border-b border-white/50"></div>
                            </div>
                        </div>

                        {/* The Image (Rendered Behind Mask) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                             {/* We use a wrapper to handle the transforms naturally from center */}
                             <div style={{
                                 transform: `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotate}deg) scale(${transform.scale})`,
                                 transformOrigin: 'center center',
                                 transition: isDragging.current ? 'none' : 'transform 0.1s ease-out',
                                 willChange: 'transform'
                             }}>
                                <img 
                                    ref={imgRef}
                                    src={imageSrc}
                                    onLoad={handleImageLoad}
                                    className="max-w-none block" 
                                    style={{ pointerEvents: 'none' }} // Ensure image doesn't capture events
                                    alt="Edit Target"
                                />
                             </div>
                        </div>
                    </div>

                    {/* Sidebar Controls */}
                    <div className="w-80 bg-[#1e1e1e] border-l border-gray-800 p-6 flex flex-col gap-8 z-20 shadow-xl">
                        
                        {/* Snap Grid */}
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                <GridIcon className="w-4 h-4" /> Alignment Grid
                            </div>
                            <div className="grid grid-cols-3 gap-2 p-2 bg-black/20 rounded-xl border border-gray-800">
                                {[0,1,2,3,4,5,6,7,8].map(i => (
                                    <button 
                                        key={i}
                                        onClick={() => handleSnap(i)}
                                        className={`h-10 rounded hover:bg-blue-600/20 hover:border-blue-500/50 border border-transparent transition-all flex items-center justify-center group relative
                                            ${i === 4 ? 'bg-white/5 border-white/10' : 'bg-white/5'}
                                        `}
                                        title={i === 4 ? "Reset to Center" : "Snap Zone"}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${i===4 ? 'bg-blue-500' : 'bg-gray-600 group-hover:bg-blue-400'}`}></div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rotation */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                    <RotateIcon className="w-4 h-4" /> Rotation
                                </div>
                                <div className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
                                    {transform.rotate.toFixed(1)}°
                                </div>
                            </div>
                            <input 
                                type="range" 
                                min="-45" 
                                max="45" 
                                step="0.5"
                                value={transform.rotate}
                                onChange={(e) => setTransform(p => ({ ...p, rotate: parseFloat(e.target.value) }))}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                            />
                            <div className="flex justify-between mt-2">
                                <button onClick={() => setTransform(p => ({ ...p, rotate: p.rotate - 90 }))} className="p-2 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white" title="Rotate -90"><RotateLeftIcon className="w-4 h-4"/></button>
                                <button onClick={() => setTransform(p => ({ ...p, rotate: 0 }))} className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white">Reset</button>
                                <button onClick={() => setTransform(p => ({ ...p, rotate: p.rotate + 90 }))} className="p-2 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white" title="Rotate +90"><RotateIcon className="w-4 h-4"/></button>
                            </div>
                        </div>

                        {/* Zoom */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                    <ZoomInIcon className="w-4 h-4" /> Zoom
                                </div>
                                <div className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
                                    {Math.round(transform.scale * 100)}%
                                </div>
                            </div>
                            <input 
                                type="range" 
                                min="0.1" 
                                max="3" 
                                step="0.05"
                                value={transform.scale}
                                onChange={(e) => setTransform(p => ({ ...p, scale: parseFloat(e.target.value) }))}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                            />
                        </div>

                        <div className="mt-auto">
                            <button 
                                onClick={handleSave} 
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <CropIcon className="w-4 h-4" /> Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
};

const BarcodeGenerator = ({ value, config }: { value: string, config: BarcodeConfig }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
