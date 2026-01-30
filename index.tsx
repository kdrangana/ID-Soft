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
    Move as MoveIcon, 
    RotateCcw as FactoryResetIcon,
    Pencil as EditIcon
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

interface SignatureConfig {
    scale: number;
    xOffset: number;
    yOffset: number;
    opacity: number;
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
    officialAddress: string;
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

// --- INITIAL STATE CONSTANTS (THE BASE MODEL) ---

const INITIAL_DATA: IdCardData = {
    nameWithInitials: "K.A.D. Rangana",
    fullName: "Kasthuri Arachchige Don Rangana",
    designation: "Postal Service Officer",
    grade: "Grade II",
    nic: "861100219V",
    dateOfIssue: "2026-01-24",
    slPostFileNo: "01/2026",
    officialAddress: "Postal Head Quarters, D.R. Wijewardena Mawatha,\nColombo 11."
};

const INITIAL_IMAGES = {
    profile: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    signature: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png",
    postmasterSignature: "",
    frontBg: "https://img.freepik.com/free-vector/abstract-blue-geometric-shapes-background_1035-17545.jpg?w=1380&t=st=1706000000~exp=1706000600~hmac=xyz", 
    backBg: ""
};

const INITIAL_DESIGNATIONS: DesignationConfig[] = [
    { id: '1', title: 'Postal Service Officer', color: '#2563eb', textColor: '#1e3a8a' }, 
    { id: '2', title: 'Deputy Postmaster General', color: '#dc2626', textColor: '#991b1b' }, 
    { id: '3', title: 'Postmaster', color: '#16a34a', textColor: '#14532d' }, 
    { id: '4', title: 'Assistant', color: '#4b5563', textColor: '#1f2937' }, 
];

const INITIAL_GRADES: GradeConfig[] = [
    { id: '1', title: 'Grade I', textColor: '#1e3a8a' },
    { id: '2', title: 'Grade II', textColor: '#1e3a8a' },
    { id: '3', title: 'Grade III', textColor: '#1e3a8a' },
];

const INITIAL_BARCODE_CONFIG: BarcodeConfig = {
    lineColor: '#1e293b',
    width: 1.8,
    height: 40,
    displayValue: true,
    textPosition: 'bottom',
    fontSize: 12
};

const INITIAL_PROFILE_CONFIG: ProfileConfig = {
    borderColor: '#ffffff',
    borderWidth: 4,
    borderRadius: 2, 
    scale: 1,
    yOffset: 0,
};

const INITIAL_SIGNATURE_CONFIG: SignatureConfig = {
    scale: 1,
    xOffset: 0,
    yOffset: 0,
    opacity: 80
};

const INITIAL_PMG_SIGNATURE_CONFIG: SignatureConfig = {
    scale: 1,
    xOffset: 0,
    yOffset: 0,
    opacity: 90
};

const INITIAL_CUSTOM_ELEMENTS: CustomElement[] = [
    { 
        id: 'header-1', 
        type: 'text', 
        text: 'Department of Posts', 
        side: 'front',
        bold: true, 
        italic: false, 
        fontSize: 12, 
        color: '#1f2937', 
        x: 10, 
        y: 20,
        width: 300,
        fontFamily: '"Inter", sans-serif',
        opacity: 100,
        textAlign: 'center',
        caps: 'all',
        letterSpacing: 1,
        lineHeight: 1,
        zIndex: 40
    },
    { 
        id: 'header-2', 
        type: 'text', 
        text: 'Sri Lanka', 
        side: 'front',
        bold: true, 
        italic: false, 
        fontSize: 10, 
        color: '#4b5563', 
        x: 60, 
        y: 38,
        width: 200,
        fontFamily: '"Inter", sans-serif',
        opacity: 100,
        textAlign: 'center',
        caps: 'all',
        letterSpacing: 0.5,
        lineHeight: 1.2,
        zIndex: 40
    },
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
        y: 250,
        width: 150,
        fontFamily: '"Inter", sans-serif',
        opacity: 100,
        textAlign: 'left',
        zIndex: 30
    }
];

const INITIAL_GENERATED_CARDS: IdCardData[] = [
    { id: '1', nameWithInitials: 'K.A.D. Rangana', fullName: '', designation: 'Postal Service Officer', grade: 'Grade I', nic: '861100219V', dateOfIssue: '2026-01-23', slPostFileNo: '01/2026', officialAddress: "Postal Head Quarters, D.R. Wijewardena Mawatha,\nColombo 11." },
    { id: '2', nameWithInitials: 'K.A.D. Rangana', fullName: '', designation: 'Deputy Postmaster General', grade: 'Grade II', nic: '861100219V', dateOfIssue: '2026-01-19', slPostFileNo: '01/2026', officialAddress: "Postal Head Quarters, D.R. Wijewardena Mawatha,\nColombo 11." },
    { id: '3', nameWithInitials: 'K.A.D. Rangana', fullName: '', designation: 'Postal Service Officer', grade: 'Grade II', nic: '861100219V', dateOfIssue: '2026-01-24', slPostFileNo: '01/2026', officialAddress: "Postal Head Quarters, D.R. Wijewardena Mawatha,\nColombo 11." },
];

const BarcodeGenerator = ({ value, config }: { value: string, config: BarcodeConfig }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current && value) {
            try {
                JsBarcode(canvasRef.current, value, {
                    format: "CODE128",
                    lineColor: config.lineColor,
                    width: config.width,
                    height: config.height,
                    displayValue: config.displayValue,
                    textPosition: config.textPosition,
                    fontSize: config.fontSize,
                    margin: 0,
                    background: 'transparent'
                });
            } catch (e) {
                console.error("Barcode generation failed", e);
            }
        }
    }, [value, config]);

    return <canvas ref={canvasRef} className="max-w-full" />;
};

const TextStyleControls = ({ 
    style, 
    onUpdate, 
    title = "Text Style" 
}: { 
    style: Partial<TextStyle>, 
    onUpdate: (updates: Partial<TextStyle>) => void,
    title?: string
}) => {
    return (
        <div className="space-y-3 p-3 bg-gray-50 rounded border border-gray-200">
            {title && <h4 className="text-xs font-bold text-gray-700 uppercase">{title}</h4>}
            
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Font</label>
                    <select 
                        value={style.fontFamily || '"Inter", sans-serif'}
                        onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                        className="w-full text-xs border border-gray-300 rounded p-1"
                    >
                        {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Size (px)</label>
                    <input 
                        type="number" 
                        value={style.fontSize || 12}
                        onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                        className="w-full text-xs border border-gray-300 rounded p-1"
                    />
                </div>
            </div>

            <div className="flex justify-between bg-white border border-gray-200 rounded p-1">
                <button onClick={() => onUpdate({ bold: !style.bold })} className={`p-1.5 rounded hover:bg-gray-100 ${style.bold ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`} title="Bold"><span className="font-bold text-xs">B</span></button>
                <button onClick={() => onUpdate({ italic: !style.italic })} className={`p-1.5 rounded hover:bg-gray-100 ${style.italic ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`} title="Italic"><span className="italic text-xs font-serif">I</span></button>
                <button onClick={() => onUpdate({ underline: !style.underline })} className={`p-1.5 rounded hover:bg-gray-100 ${style.underline ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`} title="Underline"><span className="underline text-xs">U</span></button>
                <button onClick={() => onUpdate({ strikethrough: !style.strikethrough })} className={`p-1.5 rounded hover:bg-gray-100 ${style.strikethrough ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`} title="Strikethrough"><span className="line-through text-xs">S</span></button>
            </div>
            
             <div className="flex justify-between items-center">
                <label className="block text-[10px] text-gray-500">Color</label>
                <input type="color" className="w-8 h-8 p-0 rounded cursor-pointer border border-gray-300" value={style.color || '#000000'} onChange={(e) => onUpdate({ color: e.target.value })} />
            </div>
        </div>
    );
};

const DesignationManager = ({ isOpen, onClose, designations, setDesignations }: { isOpen: boolean, onClose: () => void, designations: DesignationConfig[], setDesignations: React.Dispatch<React.SetStateAction<DesignationConfig[]>> }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-lg w-[500px] max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Manage Designations</h2>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="space-y-3">
                    {designations.map((d, idx) => (
                        <div key={d.id} className="flex gap-2 items-center border p-2 rounded">
                            <input type="text" value={d.title} onChange={(e) => {
                                const newD = [...designations];
                                newD[idx].title = e.target.value;
                                setDesignations(newD);
                            }} className="border p-1 text-sm flex-1 rounded" />
                            <input type="color" value={d.color} onChange={(e) => {
                                const newD = [...designations];
                                newD[idx].color = e.target.value;
                                setDesignations(newD);
                            }} title="Stripe Color" className="cursor-pointer h-8 w-8 p-0 border-0" />
                            <input type="color" value={d.textColor} onChange={(e) => {
                                const newD = [...designations];
                                newD[idx].textColor = e.target.value;
                                setDesignations(newD);
                            }} title="Text Color" className="cursor-pointer h-8 w-8 p-0 border-0" />
                            <button onClick={() => setDesignations(designations.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 p-1 rounded"><TrashIcon /></button>
                        </div>
                    ))}
                    <button onClick={() => setDesignations([...designations, { id: Date.now().toString(), title: 'New Designation', color: '#000000', textColor: '#000000' }])} className="w-full py-2 border border-dashed text-gray-500 rounded hover:bg-gray-50 flex items-center justify-center gap-2"><PlusIcon /> Add Designation</button>
                </div>
                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Done</button>
                </div>
            </div>
        </div>
    );
};

const GradeManager = ({ isOpen, onClose, grades, setGrades }: { isOpen: boolean, onClose: () => void, grades: GradeConfig[], setGrades: React.Dispatch<React.SetStateAction<GradeConfig[]>> }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-lg w-[400px] max-h-[80vh] overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Manage Grades</h2>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="space-y-3">
                    {grades.map((g, idx) => (
                        <div key={g.id} className="flex gap-2 items-center border p-2 rounded">
                             <input type="text" value={g.title} onChange={(e) => {
                                const newG = [...grades];
                                newG[idx].title = e.target.value;
                                setGrades(newG);
                            }} className="border p-1 text-sm flex-1 rounded" />
                            <input type="color" value={g.textColor} onChange={(e) => {
                                const newG = [...grades];
                                newG[idx].textColor = e.target.value;
                                setGrades(newG);
                            }} title="Text Color" className="cursor-pointer h-8 w-8 p-0 border-0" />
                             <button onClick={() => setGrades(grades.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 p-1 rounded"><TrashIcon /></button>
                        </div>
                    ))}
                    <button onClick={() => setGrades([...grades, { id: Date.now().toString(), title: 'New Grade', textColor: '#000000' }])} className="w-full py-2 border border-dashed text-gray-500 rounded hover:bg-gray-50 flex items-center justify-center gap-2"><PlusIcon /> Add Grade</button>
                </div>
                 <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Done</button>
                </div>
            </div>
        </div>
    );
};

const BarcodeManager = ({ isOpen, onClose, config, setConfig }: { isOpen: boolean, onClose: () => void, config: BarcodeConfig, setConfig: React.Dispatch<React.SetStateAction<BarcodeConfig>> }) => {
    if (!isOpen) return null;
     const handleChange = (key: keyof BarcodeConfig, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-lg w-[400px]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Barcode Settings</h2>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold mb-1">Bar Width</label>
                        <input type="number" step="0.1" value={config.width} onChange={(e) => handleChange('width', parseFloat(e.target.value))} className="w-full border rounded p-1 text-sm" />
                    </div>
                     <div>
                        <label className="block text-xs font-bold mb-1">Height</label>
                        <input type="number" value={config.height} onChange={(e) => handleChange('height', parseInt(e.target.value))} className="w-full border rounded p-1 text-sm" />
                    </div>
                     <div>
                        <label className="block text-xs font-bold mb-1">Color</label>
                        <input type="color" value={config.lineColor} onChange={(e) => handleChange('lineColor', e.target.value)} className="w-full h-8 cursor-pointer border rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={config.displayValue} onChange={(e) => handleChange('displayValue', e.target.checked)} id="displayValue" />
                        <label htmlFor="displayValue" className="text-sm">Display Value Text</label>
                    </div>
                </div>
                 <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Done</button>
                </div>
            </div>
        </div>
    );
};

const ProfileStyleManager = ({ isOpen, onClose, config, setConfig }: { isOpen: boolean, onClose: () => void, config: ProfileConfig, setConfig: React.Dispatch<React.SetStateAction<ProfileConfig>> }) => {
    if (!isOpen) return null;
    const handleChange = (key: keyof ProfileConfig, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-lg w-[400px]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Profile Photo Style</h2>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold mb-1">Border Width (px)</label>
                        <input type="number" value={config.borderWidth} onChange={(e) => handleChange('borderWidth', parseInt(e.target.value))} className="w-full border rounded p-1 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1">Border Color</label>
                        <input type="color" value={config.borderColor} onChange={(e) => handleChange('borderColor', e.target.value)} className="w-full h-8 cursor-pointer border rounded" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1">Roundness (%)</label>
                        <input type="range" min="0" max="50" value={config.borderRadius} onChange={(e) => handleChange('borderRadius', parseInt(e.target.value))} className="w-full" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1">Scale</label>
                        <input type="range" min="0.5" max="2" step="0.1" value={config.scale} onChange={(e) => handleChange('scale', parseFloat(e.target.value))} className="w-full" />
                    </div>
                     <div>
                        <label className="block text-xs font-bold mb-1">Vertical Offset (Y)</label>
                        <input type="range" min="-50" max="50" value={config.yOffset} onChange={(e) => handleChange('yOffset', parseInt(e.target.value))} className="w-full" />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Done</button>
                </div>
            </div>
        </div>
    );
};

const SignatureStyleManager = ({ isOpen, onClose, config, setConfig, title }: { isOpen: boolean, onClose: () => void, config: SignatureConfig, setConfig: React.Dispatch<React.SetStateAction<SignatureConfig>>, title: string }) => {
    if (!isOpen) return null;
    const handleChange = (key: keyof SignatureConfig, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-lg w-[400px]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">{title}</h2>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold mb-1">Scale</label>
                        <input type="range" min="0.5" max="3" step="0.1" value={config.scale} onChange={(e) => handleChange('scale', parseFloat(e.target.value))} className="w-full" />
                    </div>
                     <div>
                        <label className="block text-xs font-bold mb-1">Vertical Offset (Y)</label>
                        <input type="range" min="-50" max="50" value={config.yOffset} onChange={(e) => handleChange('yOffset', parseInt(e.target.value))} className="w-full" />
                    </div>
                     <div>
                        <label className="block text-xs font-bold mb-1">Horizontal Offset (X)</label>
                        <input type="range" min="-50" max="50" value={config.xOffset} onChange={(e) => handleChange('xOffset', parseInt(e.target.value))} className="w-full" />
                    </div>
                     <div>
                        <label className="block text-xs font-bold mb-1">Opacity (%)</label>
                        <input type="range" min="10" max="100" value={config.opacity} onChange={(e) => handleChange('opacity', parseInt(e.target.value))} className="w-full" />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Done</button>
                </div>
            </div>
        </div>
    );
};

const GeneratedRecordsTable = ({ cards, onEdit, onPrint, onDelete }: { cards: IdCardData[], onEdit: (card: IdCardData) => void, onPrint: (card: IdCardData) => void, onDelete: (id: string) => void }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">Generated Records</h2>
            {cards.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No records generated yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">NIC</th>
                                <th className="px-4 py-2">Designation</th>
                                <th className="px-4 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cards.map((card) => (
                                <tr key={card.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium">{card.nameWithInitials}</td>
                                    <td className="px-4 py-2">{card.nic}</td>
                                    <td className="px-4 py-2">{card.designation}</td>
                                    <td className="px-4 py-2 text-right flex justify-end gap-2">
                                        <button onClick={() => onEdit(card)} className="text-blue-600 hover:bg-blue-50 p-1 rounded" title="Edit">
                                            <EditIcon size={16} />
                                        </button>
                                        <button onClick={() => onPrint(card)} className="text-gray-600 hover:bg-gray-100 p-1 rounded" title="Print">
                                            <PrinterIcon size={16} />
                                        </button>
                                        <button onClick={() => { if(card.id) onDelete(card.id) }} className="text-red-500 hover:bg-red-50 p-1 rounded" title="Delete">
                                            <TrashIcon size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const toRad = (deg: number) => deg * (Math.PI / 180);
const rotate = (x: number, y: number, r: number) => ({
    x: x * Math.cos(r) - y * Math.sin(r),
    y: x * Math.sin(r) + y * Math.cos(r)
});

const getComputedTextStyle = (style: TextStyle): React.CSSProperties => {
    return {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
        fontWeight: style.bold ? 'bold' : 'normal',
        fontStyle: style.italic ? 'italic' : 'normal',
        textDecoration: [
            style.underline ? 'underline' : '',
            style.strikethrough ? 'line-through' : ''
        ].filter(Boolean).join(' '),
        textTransform: style.caps === 'all' ? 'uppercase' : style.caps === 'small' ? 'lowercase' : 'none',
        fontVariant: style.caps === 'small' ? 'small-caps' : undefined,
        color: style.color,
        opacity: (style.opacity ?? 100) / 100,
        textAlign: style.textAlign,
        letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
        lineHeight: style.lineHeight,
        WebkitTextStroke: style.strokeWidth ? `${style.strokeWidth}px ${style.strokeColor}` : undefined,
    };
};

const App = () => {
  const [data, setData] = useState<IdCardData>(INITIAL_DATA);

  const [images, setImages] = useState(INITIAL_IMAGES);
  
  const [designations, setDesignations] = useState<DesignationConfig[]>(INITIAL_DESIGNATIONS);
  const [isDesignationManagerOpen, setIsDesignationManagerOpen] = useState(false);

  const [grades, setGrades] = useState<GradeConfig[]>(INITIAL_GRADES);
  const [isGradeManagerOpen, setIsGradeManagerOpen] = useState(false);

  const [barcodeConfig, setBarcodeConfig] = useState<BarcodeConfig>(INITIAL_BARCODE_CONFIG);
  const [isBarcodeManagerOpen, setIsBarcodeManagerOpen] = useState(false);

  const [profileConfig, setProfileConfig] = useState<ProfileConfig>(INITIAL_PROFILE_CONFIG);
  const [isProfileStyleManagerOpen, setIsProfileStyleManagerOpen] = useState(false);

  const [signatureConfig, setSignatureConfig] = useState<SignatureConfig>(INITIAL_SIGNATURE_CONFIG);
  const [isSignatureStyleManagerOpen, setIsSignatureStyleManagerOpen] = useState(false);

  const [pmgSignatureConfig, setPmgSignatureConfig] = useState<SignatureConfig>(INITIAL_PMG_SIGNATURE_CONFIG);
  const [isPmgSignatureStyleManagerOpen, setIsPmgSignatureStyleManagerOpen] = useState(false);
  
  const [generatedCards, setGeneratedCards] = useState<IdCardData[]>(INITIAL_GENERATED_CARDS);

  const [zoom, setZoom] = useState(100);
  const [isLocked, setIsLocked] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  
  const [previewMode, setPreviewMode] = useState<'front' | 'back' | 'both'>('both');
  
  const [activeTab, setActiveTab] = useState<'frontImages'|'frontText'|'frontShapes'|'backImages'|'backText'|'backShapes'>('frontText');
  const [customElements, setCustomElements] = useState<CustomElement[]>(INITIAL_CUSTOM_ELEMENTS);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  const [standardStyles, setStandardStyles] = useState<Record<string, TextStyle>>({
      nameWithInitials: { fontSize: 16, bold: true, color: '#111827', fontFamily: '"Inter", sans-serif', textAlign: 'center' },
      fullName: { fontSize: 10, color: '#4b5563', fontFamily: '"Inter", sans-serif', textAlign: 'center' },
      designation: { fontSize: 12, bold: true, color: '#1e3a8a', fontFamily: '"Inter", sans-serif', textAlign: 'center', caps: 'all' },
      grade: { fontSize: 10, color: '#1e3a8a', fontFamily: '"Inter", sans-serif', textAlign: 'center' },
      officialAddress: { fontSize: 8, color: '#4b5563', fontFamily: '"Inter", sans-serif', textAlign: 'center', lineHeight: 1.2 },
      footerLeft: { fontSize: 9, color: '#4b5563', fontFamily: '"Inter", sans-serif', bold: true },
      footerRight: { fontSize: 9, color: '#4b5563', fontFamily: '"Inter", sans-serif', bold: true }
  });
  
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizingHandle, setResizingHandle] = useState<string | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, elX: 0, elY: 0, startW: 0, startH: 0 });

  const [inspectorPosition, setInspectorPosition] = useState<{x: number, y: number} | null>(null);
  const [isDraggingInspector, setIsDraggingInspector] = useState(false);
  const inspectorDragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const inspectorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDesignation = designations.find(d => d.title === data.designation);
  const activeGrade = grades.find(g => g.title === data.grade);
  
  const isStandardSelection = selectedElementId && selectedElementId.startsWith('std_');
  const selectedStandardKey = isStandardSelection ? selectedElementId!.replace('std_', '') : null;
  
  const selectedStyle: TextStyle | undefined = isStandardSelection
      ? standardStyles[selectedStandardKey!]
      : customElements.find(el => el.id === selectedElementId);

  useEffect(() => {
        if (editingElementId) {
            const el = document.getElementById(`editable-text-${editingElementId}`);
            if (el) {
                el.focus();
            }
        }
  }, [editingElementId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (key: keyof typeof images) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setImages(prev => ({ ...prev, [key]: result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleGenerateCard = () => {
      const newCard = { ...data, id: Date.now().toString() };
      setGeneratedCards(prev => [newCard, ...prev]);
  };
  
  const handleDeleteCard = (id: string) => {
      setGeneratedCards(prev => prev.filter(c => c.id !== id));
  };

  const handleEditCard = (card: IdCardData) => {
    setData(card);
    // Optionally scroll to top or provide feedback
  };

  const handlePrintCard = (card: IdCardData) => {
    setData(card);
    setPreviewMode('both');
    setTimeout(() => {
        window.print();
    }, 500);
  };
  
  const handleResetPositions = () => {
      if (window.confirm("Are you sure you want to reset all custom elements to their default state?")) {
          setCustomElements(INITIAL_CUSTOM_ELEMENTS);
          setSelectedElementId(null);
      }
  };

  const handleFactoryReset = () => {
      if (window.confirm("Are you sure you want to reset the ENTIRE application to the Base Model? All changes and data will be lost.")) {
          setData(INITIAL_DATA);
          setImages(INITIAL_IMAGES);
          setDesignations(INITIAL_DESIGNATIONS);
          setGrades(INITIAL_GRADES);
          setBarcodeConfig(INITIAL_BARCODE_CONFIG);
          setProfileConfig(INITIAL_PROFILE_CONFIG);
          setSignatureConfig(INITIAL_SIGNATURE_CONFIG);
          setPmgSignatureConfig(INITIAL_PMG_SIGNATURE_CONFIG);
          setCustomElements(INITIAL_CUSTOM_ELEMENTS);
          setGeneratedCards(INITIAL_GENERATED_CARDS);
          setSelectedElementId(null);
      }
  };

  const handleSaveTemplate = () => {
      const templateData = {
          data,
          images,
          designations,
          grades,
          barcodeConfig,
          profileConfig,
          signatureConfig,
          pmgSignatureConfig,
          customElements,
          standardStyles
      };
      
      const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `id-card-template-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleLoadTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!window.confirm("This will overwrite your current design. Do you want to continue?")) {
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const loadedData = JSON.parse(event.target?.result as string);
              if (loadedData.data) setData(loadedData.data);
              if (loadedData.images) setImages(loadedData.images);
              if (loadedData.designations) setDesignations(loadedData.designations);
              if (loadedData.grades) setGrades(loadedData.grades);
              if (loadedData.barcodeConfig) setBarcodeConfig(loadedData.barcodeConfig);
              if (loadedData.profileConfig) setProfileConfig(loadedData.profileConfig);
              if (loadedData.signatureConfig) setSignatureConfig(loadedData.signatureConfig);
              if (loadedData.pmgSignatureConfig) setPmgSignatureConfig(loadedData.pmgSignatureConfig);
              if (loadedData.customElements) setCustomElements(loadedData.customElements);
              if (loadedData.standardStyles) setStandardStyles(loadedData.standardStyles);
          } catch (error) {
              console.error("Error loading template:", error);
              alert("Failed to load template. Invalid file.");
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  const addCustomText = () => {
      const currentSide = activeTab.startsWith('back') ? 'back' : 'front';
      const newEl: CustomElement = { 
          id: Date.now().toString(), 
          type: 'text', 
          text: 'New Text', 
          side: currentSide,
          bold: false, 
          italic: false, 
          fontSize: 12, 
          color: '#000000', 
          x: 20, 
          y: 20,
          width: 200, // Default width for wrapping
          fontFamily: '"Inter", sans-serif',
          opacity: 100,
          textAlign: 'left',
          lineHeight: 1.2,
          letterSpacing: 0,
          zIndex: 30
      };
      setCustomElements([...customElements, newEl]);
      setSelectedElementId(newEl.id);
  };

  const addCustomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = ev.target?.result as string;
            const currentSide = activeTab.startsWith('back') ? 'back' : 'front';
            const img = new Image();
            img.onload = () => {
                const aspectRatio = img.width / img.height;
                const newEl: CustomElement = {
                    id: Date.now().toString(),
                    type: 'image',
                    src: result,
                    side: currentSide,
                    width: 100, 
                    aspectRatio: aspectRatio,
                    x: 20,
                    y: 20,
                    opacity: 100,
                    rotation: 0,
                    flipX: false,
                    flipY: false,
                    zIndex: 20
                };
                setCustomElements(prev => [...prev, newEl]);
                setSelectedElementId(newEl.id);
            };
            img.src = result;
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  const addCustomShape = (type: 'rectangle' | 'circle' | 'star' | 'line') => {
      const currentSide = activeTab.startsWith('back') ? 'back' : 'front';
      const newEl: CustomElement = {
          id: Date.now().toString(),
          type: 'shape',
          shapeType: type,
          side: currentSide,
          width: 50,
          height: type === 'line' ? 2 : 50, 
          x: 50,
          y: 50,
          fillColor: type === 'line' ? 'transparent' : '#3b82f6',
          strokeColor: '#3b82f6',
          strokeWidth: type === 'line' ? 2 : 0,
          opacity: 100,
          rotation: 0,
          flipX: false,
          flipY: false,
          zIndex: 10 // Lower z-index for shapes
      };
      setCustomElements([...customElements, newEl]);
      setSelectedElementId(newEl.id);
  };
  
  const updateSelectedStyle = (updates: Partial<TextStyle>) => {
      if (isStandardSelection) {
          setStandardStyles(prev => ({
              ...prev,
              [selectedStandardKey!]: { ...prev[selectedStandardKey!], ...updates }
          }));
      } else {
          setCustomElements(prev => prev.map(el => el.id === selectedElementId ? { ...el, ...updates } : el));
      }
  };
  
  const updateAllTextStyles = (updates: Partial<TextStyle>) => {
      setCustomElements(prev => prev.map(el => {
          if (el.type === 'text') {
              return { ...el, ...updates };
          }
          return el;
      }));
  };
  
  const updateCustomElementText = (text: string) => {
      setCustomElements(prev => prev.map(el => el.id === selectedElementId ? { ...el, text } : el));
  };
  
  const updateCustomElement = (id: string, updates: Partial<CustomElement>) => {
      setCustomElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteCustomElement = (id: string) => {
      setCustomElements(prev => prev.filter(el => el.id !== id));
      if (selectedElementId === id) setSelectedElementId(null);
  };

  const moveElementLayer = (direction: 'forward' | 'backward') => {
      if (!selectedElementId || isStandardSelection) return;
      setCustomElements(prev => prev.map(el => {
          if (el.id === selectedElementId) {
              const currentZ = el.zIndex || 30;
              const newZ = direction === 'forward' ? Math.min(100, currentZ + 5) : Math.max(0, currentZ - 5);
              return { ...el, zIndex: newZ };
          }
          return el;
      }));
  };

  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    
    if (isLocked) return;
    if (editingElementId === id) return;

    const el = customElements.find(c => c.id === id);
    if(!el) return;

    setDraggingId(id);
    setSelectedElementId(id);
    dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        elX: el.x,
        elY: el.y,
        startW: 0, 
        startH: 0
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent, id: string, handle: string) => {
    e.stopPropagation();
    if (isLocked) return;

    const el = customElements.find(c => c.id === id);
    if (!el) return;
    
    setResizingId(id);
    setResizingHandle(handle);
    
    dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        elX: el.x,
        elY: el.y,
        startW: el.width || 50,
        startH: el.height || 50
    };
  };

  const handleInspectorDragStart = (e: React.MouseEvent) => {
      setIsDraggingInspector(true);
      let currentX = inspectorPosition?.x;
      let currentY = inspectorPosition?.y;
      if (currentX === undefined && inspectorRef.current) {
          const rect = inspectorRef.current.getBoundingClientRect();
          currentX = rect.left;
          currentY = rect.top;
          setInspectorPosition({ x: currentX, y: currentY });
      }
      inspectorDragRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          initialX: currentX ?? (window.innerWidth - 300),
          initialY: currentY ?? 150
      };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (draggingId) {
             const scale = zoom / 100;
             const dx = (e.clientX - dragStartRef.current.x) / scale;
             const dy = (e.clientY - dragStartRef.current.y) / scale;
             
             setCustomElements(prev => prev.map(el => {
                 if (el.id === draggingId) {
                     return { ...el, x: dragStartRef.current.elX + dx, y: dragStartRef.current.elY + dy };
                 }
                 return el;
             }));
        } else if (resizingId && resizingHandle) {
             const scale = zoom / 100;
             const el = customElements.find(c => c.id === resizingId);
             if (!el) return;

             const { elX, elY, startW, startH } = dragStartRef.current;
             const rad = toRad(el.rotation || 0);

             const globalDx = (e.clientX - dragStartRef.current.x) / scale;
             const globalDy = (e.clientY - dragStartRef.current.y) / scale;

             const localDelta = rotate(globalDx, globalDy, -rad);
             
             let dW = 0;
             let dH = 0;
             let fixedX = 0; 
             let fixedY = 0;

             if (resizingHandle.includes('e')) {
                 dW = localDelta.x;
                 fixedX = -startW / 2;
             } else if (resizingHandle.includes('w')) {
                 dW = -localDelta.x;
                 fixedX = startW / 2;
             }

             if (resizingHandle.includes('s')) {
                 dH = localDelta.y;
                 fixedY = -startH / 2;
             } else if (resizingHandle.includes('n')) {
                 dH = -localDelta.y;
                 fixedY = startH / 2;
             }

             const newW = Math.max(10, startW + dW);
             const newH = Math.max(10, startH + dH);

             const oldCenterX = elX + startW/2;
             const oldCenterY = elY + startH/2;
             
             const fixedGlobal = {
                 x: oldCenterX + (fixedX * Math.cos(rad) - fixedY * Math.sin(rad)),
                 y: oldCenterY + (fixedX * Math.sin(rad) + fixedY * Math.cos(rad))
             };

             const handleMap: any = {
                'se': { fx: -1, fy: -1 }, 
                'sw': { fx: 1, fy: -1 }, 
                'ne': { fx: -1, fy: 1 },  
                'nw': { fx: 1, fy: 1 },   
                'n':  { fx: 0, fy: 1 },
                's':  { fx: 0, fy: -1 },
                'e':  { fx: -1, fy: 0 },
                'w':  { fx: 1, fy: 0 }
             };
             
             const signs = handleMap[resizingHandle];
             const newFixedLocalX = (signs.fx || 0) * newW / 2;
             const newFixedLocalY = (signs.fy || 0) * newH / 2;

             const rotatedNewFixedOffset = {
                 x: newFixedLocalX * Math.cos(rad) - newFixedLocalY * Math.sin(rad),
                 y: newFixedLocalX * Math.sin(rad) + newFixedLocalY * Math.cos(rad)
             };

             const newCenterX = fixedGlobal.x - rotatedNewFixedOffset.x;
             const newCenterY = fixedGlobal.y - rotatedNewFixedOffset.y;

             setCustomElements(prev => prev.map(item => {
                 if (item.id === resizingId) {
                     return { 
                         ...item, 
                         width: newW, 
                         height: newH,
                         x: newCenterX - newW/2,
                         y: newCenterY - newH/2
                     };
                 }
                 return item;
             }));

        } else if (isDraggingInspector) {
            const dx = e.clientX - inspectorDragRef.current.startX;
            const dy = e.clientY - inspectorDragRef.current.startY;
            setInspectorPosition({
                x: inspectorDragRef.current.initialX + dx,
                y: inspectorDragRef.current.initialY + dy
            });
        }
    };

    const handleMouseUp = () => {
        setDraggingId(null);
        setResizingId(null);
        setResizingHandle(null);
        setIsDraggingInspector(false);
    };

    if (draggingId || resizingId || isDraggingInspector) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, resizingId, resizingHandle, zoom, isDraggingInspector]);


  const autoFillData = async () => {
    setLoadingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate a fictitious Sri Lankan identity profile for a postal department employee. Return ONLY JSON.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nameWithInitials: { type: Type.STRING },
              fullName: { type: Type.STRING },
              designation: { type: Type.STRING },
              grade: { type: Type.STRING },
              nic: { type: Type.STRING },
              dateOfIssue: { type: Type.STRING },
              slPostFileNo: { type: Type.STRING },
              officialAddress: { type: Type.STRING }
            }
          }
        }
      });
      
      const generated = JSON.parse(response.text || '{}');
      setData(generated);
    } catch (e) {
      console.error("AI Error", e);
      alert("Failed to auto-fill data. Please check console.");
    } finally {
      setLoadingAi(false);
    }
  };

  const renderInspector = () => {
      if (!selectedStyle) return null;
      
      return (
        <div className="space-y-4 select-none">
            <div 
                className="flex justify-between items-center border-b border-gray-200 pb-2 cursor-grab active:cursor-grabbing"
                onMouseDown={handleInspectorDragStart}
            >
                <div className="flex items-center gap-2">
                    <DragHandleIcon className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-700">
                        {isStandardSelection ? `Edit ${selectedStandardKey}` : (selectedStyle as CustomElement).type === 'image' ? 'Edit Image' : (selectedStyle as CustomElement).type === 'shape' ? 'Edit Shape' : 'Edit Text'}
                    </span>
                </div>
                <button onClick={() => setSelectedElementId(null)} className="text-xs text-blue-600 hover:underline">Close</button>
            </div>
            
            {!isStandardSelection && (
                <div className="flex justify-between gap-2 border-b border-gray-100 pb-2">
                    <button onClick={() => moveElementLayer('backward')} className="flex-1 py-1.5 bg-gray-50 border border-gray-200 rounded text-[10px] text-gray-600 hover:bg-gray-100 flex justify-center items-center gap-1" title="Send Backward">
                        <SendBackwardIcon className="w-3 h-3"/> Backward
                    </button>
                    <button onClick={() => moveElementLayer('forward')} className="flex-1 py-1.5 bg-gray-50 border border-gray-200 rounded text-[10px] text-gray-600 hover:bg-gray-100 flex justify-center items-center gap-1" title="Bring Forward">
                        <BringForwardIcon className="w-3 h-3"/> Forward
                    </button>
                </div>
            )}

            {!isStandardSelection && (selectedStyle as CustomElement).type === 'text' && (
                <textarea
                    value={(selectedStyle as CustomElement).text}
                    onChange={(e) => updateCustomElementText(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded p-2 focus:border-blue-500 focus:outline-none min-h-[60px]"
                    placeholder="Type text here..."
                />
            )}
            
            {!isStandardSelection && ((selectedStyle as CustomElement).type === 'image' || (selectedStyle as CustomElement).type === 'shape') && (
                <div className="space-y-4">
                     <h4 className="text-[10px] font-bold text-gray-800 uppercase bg-gray-100 p-1 rounded">Visual Style</h4>
                     
                    {(selectedStyle as CustomElement).type === 'image' && (
                        <button 
                            onClick={() => {
                                // No crop logic here anymore
                            }}
                            className="hidden w-full py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 flex items-center justify-center gap-2 mb-2"
                        >
                            <CropIcon /> Crop Image
                        </button>
                    )}

                    {(selectedStyle as CustomElement).type === 'shape' && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] text-gray-600">Fill Color</label>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => updateCustomElement((selectedStyle as CustomElement).id, { fillColor: 'transparent' })}
                                        className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                                            (selectedStyle as CustomElement).fillColor === 'transparent' 
                                            ? 'border-red-400 bg-red-50 text-red-500' 
                                            : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                                        }`}
                                        title="No Fill"
                                    >
                                        <NoColorIcon />
                                    </button>
                                    <div className="relative w-6 h-6 rounded border border-gray-200 overflow-hidden">
                                        <input 
                                            type="color" 
                                            value={(selectedStyle as CustomElement).fillColor === 'transparent' ? '#ffffff' : (selectedStyle as CustomElement).fillColor || '#000000'}
                                            onChange={(e) => updateCustomElement((selectedStyle as CustomElement).id, { fillColor: e.target.value })}
                                            className="absolute -top-1 -left-1 w-8 h-8 p-0 border-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] text-gray-600">Outline Color</label>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => updateCustomElement((selectedStyle as CustomElement).id, { strokeColor: 'transparent' })}
                                        className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                                            (selectedStyle as CustomElement).strokeColor === 'transparent' 
                                            ? 'border-red-400 bg-red-50 text-red-500' 
                                            : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                                        }`}
                                        title="No Outline"
                                    >
                                        <NoColorIcon />
                                    </button>
                                    <div className="relative w-6 h-6 rounded border border-gray-200 overflow-hidden">
                                        <input 
                                            type="color" 
                                            value={(selectedStyle as CustomElement).strokeColor === 'transparent' ? '#ffffff' : (selectedStyle as CustomElement).strokeColor || '#000000'}
                                            onChange={(e) => updateCustomElement((selectedStyle as CustomElement).id, { strokeColor: e.target.value })}
                                            className="absolute -top-1 -left-1 w-8 h-8 p-0 border-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                    <span>Outline Width</span>
                                    <span>{(selectedStyle as CustomElement).strokeWidth || 0}px</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="10" 
                                    step="0.5"
                                    value={(selectedStyle as CustomElement).strokeWidth || 0} 
                                    onChange={(e) => updateCustomElement((selectedStyle as CustomElement).id, { strokeWidth: parseFloat(e.target.value) })} 
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 pt-1 border-t border-gray-100">
                        <div>
                            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                <span>Opacity</span>
                                <span>{selectedStyle.opacity ?? 100}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={selectedStyle.opacity ?? 100} 
                                onChange={(e) => updateCustomElement((selectedStyle as CustomElement).id, { opacity: parseInt(e.target.value) })} 
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                <span>Rotation</span>
                                <span>{(selectedStyle as CustomElement).rotation || 0}°</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="360" 
                                value={(selectedStyle as CustomElement).rotation || 0} 
                                onChange={(e) => updateCustomElement((selectedStyle as CustomElement).id, { rotation: parseInt(e.target.value) })} 
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="flex justify-between gap-2">
                            <button 
                                onClick={() => updateCustomElement((selectedStyle as CustomElement).id, { flipX: !(selectedStyle as CustomElement).flipX })}
                                className={`flex-1 py-1.5 border rounded text-[10px] font-medium flex items-center justify-center gap-1 ${ (selectedStyle as CustomElement).flipX ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50' }`}
                            >
                                <FlipHorizontalIcon className="w-3 h-3" /> Flip H
                            </button>
                            <button 
                                onClick={() => updateCustomElement((selectedStyle as CustomElement).id, { flipY: !(selectedStyle as CustomElement).flipY })}
                                className={`flex-1 py-1.5 border rounded text-[10px] font-medium flex items-center justify-center gap-1 ${ (selectedStyle as CustomElement).flipY ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50' }`}
                            >
                                <FlipVerticalIcon className="w-3 h-3" /> Flip V
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Zoom / Size (Width)</label>
                            <span className="text-[10px] text-gray-500">{(selectedStyle as CustomElement).width?.toFixed(0)}px</span>
                        </div>
                        <input 
                            type="range" 
                            min="10" 
                            max="300" 
                            value={(selectedStyle as CustomElement).width || 50}
                            onChange={(e) => {
                                const newWidth = parseInt(e.target.value);
                                const newHeight = (selectedStyle as CustomElement).shapeType === 'line' ? (selectedStyle as CustomElement).height : newWidth;
                                updateCustomElement((selectedStyle as CustomElement).id, { width: newWidth, height: newHeight })
                            }}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            )}

            {(isStandardSelection || (selectedStyle as CustomElement).type === 'text') && (
                <>
                <TextStyleControls 
                    style={selectedStyle} 
                    onUpdate={updateSelectedStyle} 
                    title=""
                />

                <div className="flex justify-between bg-white border border-gray-200 rounded p-1 mt-2">
                    {['left', 'center', 'right', 'justify'].map((align) => (
                            <button 
                            key={align}
                            onClick={() => updateSelectedStyle({ textAlign: align as any })}
                            className={`p-1.5 rounded hover:bg-gray-100 flex-1 flex justify-center ${selectedStyle.textAlign === align ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                            title={align}
                        >
                            <span className="text-[10px] capitalize">{align[0].toUpperCase()}</span>
                        </button>
                    ))}
                </div>

                <div className="space-y-3 mt-2">
                    <div className="flex justify-between items-center">
                        <label className="block text-xs font-medium text-gray-500">Opacity: {selectedStyle.opacity}%</label>
                        <input type="range" min="0" max="100" value={selectedStyle.opacity ?? 100} onChange={(e) => updateSelectedStyle({ opacity: parseInt(e.target.value) })} className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    </div>

                    <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-[10px] text-gray-500">Text Outline</label>
                            <input type="range" min="0" max="5" step="0.5" value={selectedStyle.strokeWidth || 0} onChange={(e) => updateSelectedStyle({ strokeWidth: parseFloat(e.target.value) })} className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        {selectedStyle.strokeWidth && selectedStyle.strokeWidth > 0 ? (
                            <div className="flex justify-between items-center mt-1">
                                <label className="block text-[10px] text-gray-500">Outline Color</label>
                                <input type="color" className="w-8 h-6 p-0 rounded cursor-pointer border border-gray-300" value={selectedStyle.strokeColor || '#000000'} onChange={(e) => updateSelectedStyle({ strokeColor: e.target.value })} />
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                        <label className="block text-[10px] text-gray-500 mb-1">Letter Spacing (px)</label>
                        <input 
                            type="number" 
                            step="0.1"
                            value={selectedStyle.letterSpacing || 0}
                            onChange={(e) => updateSelectedStyle({ letterSpacing: parseFloat(e.target.value) })}
                            className="w-full text-xs border border-gray-300 rounded p-1"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-gray-500 mb-1">Line Height</label>
                        <input 
                            type="number" 
                            step="0.1"
                            value={selectedStyle.lineHeight || 1.2}
                            onChange={(e) => updateSelectedStyle({ lineHeight: parseFloat(e.target.value) })}
                            className="w-full text-xs border border-gray-300 rounded p-1"
                        />
                    </div>
                </div>
                </>
            )}
            
            {!isStandardSelection && (
                <button 
                    onClick={() => deleteCustomElement((selectedStyle as CustomElement).id)}
                    className="w-full py-2 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 flex items-center justify-center gap-2 mt-4"
                >
                    <TrashIcon /> Delete Element
                </button>
            )}
        </div>
      );
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      <style>{`
          @media print {
            body * {
                visibility: hidden;
            }
            #printable-area, #printable-area * {
                visibility: visible;
            }
            #printable-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 0;
                background: white;
            }
            .no-print {
                display: none !important;
            }
          }
      `}</style>
      
      <DesignationManager 
        isOpen={isDesignationManagerOpen}
        onClose={() => setIsDesignationManagerOpen(false)}
        designations={designations}
        setDesignations={setDesignations}
      />
      
      <GradeManager 
        isOpen={isGradeManagerOpen}
        onClose={() => setIsGradeManagerOpen(false)}
        grades={grades}
        setGrades={setGrades}
      />

      <BarcodeManager 
        isOpen={isBarcodeManagerOpen}
        onClose={() => setIsBarcodeManagerOpen(false)}
        config={barcodeConfig}
        setConfig={setBarcodeConfig}
      />

      <ProfileStyleManager 
        isOpen={isProfileStyleManagerOpen}
        onClose={() => setIsProfileStyleManagerOpen(false)}
        config={profileConfig}
        setConfig={setProfileConfig}
      />

      <SignatureStyleManager 
        isOpen={isSignatureStyleManagerOpen}
        onClose={() => setIsSignatureStyleManagerOpen(false)}
        config={signatureConfig}
        setConfig={setSignatureConfig}
        title="Holder Signature Style"
      />

      <SignatureStyleManager 
        isOpen={isPmgSignatureStyleManagerOpen}
        onClose={() => setIsPmgSignatureStyleManagerOpen(false)}
        config={pmgSignatureConfig}
        setConfig={setPmgSignatureConfig}
        title="PMG Signature Style"
      />

      {/* Header */}
      <header className="bg-[#1e88e5] text-white p-4 shadow-md flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"/></svg>
            </div>
            <div>
                <h1 className="text-xl font-bold leading-tight">ID Card Management System</h1>
                <p className="text-xs text-blue-100 opacity-90">Department of Posts - Sri Lanka | Magicard 300 NEO</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button className="bg-white text-blue-600 px-4 py-2 rounded text-sm font-semibold hover:bg-blue-50 transition-colors">Publish</button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-3 flex flex-wrap gap-3 items-center sticky top-[72px] z-10 shadow-sm">
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 bg-white">
            <SearchIcon /> Search by NIC
        </button>
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 bg-white">
            <UploadIcon /> Import Excel
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 bg-white">
            <DownloadIcon /> Export to Excel
        </button>
        <div className="flex-1"></div>
        <button 
            onClick={autoFillData}
            disabled={loadingAi}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded text-sm text-purple-700 hover:bg-purple-100 transition-colors"
        >
            {loadingAi ? <div className="animate-spin h-3 w-3 border-2 border-purple-700 rounded-full border-t-transparent"></div> : <SparklesIcon />}
            AI Auto-Fill
        </button>
        <button 
            onClick={handleSaveTemplate}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 bg-white"
        >
            <SaveIcon /> Save Template
        </button>
        <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 bg-white"
        >
            <UploadIcon /> Load Template
        </button>
        <input 
            type="file" 
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleLoadTemplate}
        />
         <button 
            onClick={handleFactoryReset}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-red-600 hover:bg-red-50 bg-white"
            title="Reset to Base Model"
        >
            <FactoryResetIcon className="w-4 h-4" /> Reset App
        </button>
      </div>

      <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-y-auto content-start">
        <div className="col-span-12 lg:col-span-7 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4">Background Images</h2>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">Front Side Background</label>
                        <div className="flex gap-4 items-start">
                            <div className="w-16 h-24 bg-gray-100 rounded border border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
                                {images.frontBg ? <img src={images.frontBg} className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">Preview</span>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 cursor-pointer flex items-center gap-2">
                                    <UploadIcon /> Upload
                                    <input type="file" className="hidden" onChange={handleImageUpload('frontBg')} />
                                </label>
                                <button className="text-xs text-red-500 hover:text-red-600 text-left px-1">Remove</button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">Back Side Background</label>
                        <div className="flex gap-4 items-start">
                            <div className="w-16 h-24 bg-gray-100 rounded border border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
                                {images.backBg ? <img src={images.backBg} className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">Preview</span>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 cursor-pointer flex items-center gap-2">
                                    <UploadIcon /> Upload
                                    <input type="file" className="hidden" onChange={handleImageUpload('backBg')} />
                                </label>
                                <button className="text-xs text-red-500 hover:text-red-600 text-left px-1">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-4">Upload JPG images (54mm x 85.6mm recommended) to use as card backgrounds.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-base font-bold text-gray-800">ID Card Details</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setIsDesignationManagerOpen(true)} className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 font-medium bg-gray-50 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 transition-colors"><SettingsIcon /> Manage Designations</button>
                        <button onClick={() => setIsGradeManagerOpen(true)} className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 font-medium bg-gray-50 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 transition-colors"><SettingsIcon /> Manage Grades</button>
                        <button onClick={() => setIsBarcodeManagerOpen(true)} className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 font-medium bg-gray-50 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 transition-colors"><BarcodeIcon /> Manage Barcode</button>
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Profile Photo</label>
                        <div className="flex gap-6 items-center">
                            <div className="w-24 h-28 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0 relative group">
                                {images.profile ? <img src={images.profile} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300">No Img</div>}
                            </div>
                            <div className="space-y-3">
                                <label className="px-4 py-2 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 cursor-pointer flex items-center gap-2 bg-white"><UploadIcon /> Browse & Upload<input type="file" className="hidden" onChange={handleImageUpload('profile')} /></label>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsProfileStyleManagerOpen(true)} className="px-4 py-2 border-0 text-xs font-medium hover:text-blue-600 flex items-center gap-2 text-gray-600"><PaletteIcon /> Style</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div><label className="block text-xs font-medium text-gray-700 mb-1">Name with Initials</label><input type="text" name="nameWithInitials" value={data.nameWithInitials} onChange={handleInputChange} className="w-full px-3 py-2 bg-blue-50/30 border border-blue-100 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" /></div>
                        <div><label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label><input type="text" name="fullName" value={data.fullName} onChange={handleInputChange} className="w-full px-3 py-2 bg-blue-50/30 border border-blue-100 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" /></div>
                        <div><label className="block text-xs font-medium text-gray-700 mb-1">Designation</label><select name="designation" value={data.designation} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-400">{designations.map(d => (<option key={d.id} value={d.title}>{d.title}</option>))}</select></div>
                        <div><label className="block text-xs font-medium text-gray-700 mb-1">Grade</label><select name="grade" value={data.grade} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-400">{grades.map(g => (<option key={g.id} value={g.title}>{g.title}</option>))}</select></div>
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Official Address</label>
                            <textarea name="officialAddress" rows={3} value={data.officialAddress} onChange={handleInputChange} className="w-full px-3 py-2 bg-blue-50/30 border border-blue-100 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all min-h-[60px]" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 col-span-2">
                             <div><label className="block text-xs font-medium text-gray-700 mb-1">NIC Number <span className="text-gray-400 font-normal text-[10px]">(generates barcode)</span></label><input type="text" name="nic" value={data.nic} onChange={handleInputChange} className="w-full px-3 py-2 bg-blue-50/30 border border-blue-100 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" /></div>
                             <div><label className="block text-xs font-medium text-gray-700 mb-1">Date of Issue</label><input type="date" name="dateOfIssue" value={data.dateOfIssue} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-400" /></div>
                        </div>
                        <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">SL Post File No</label><input type="text" name="slPostFileNo" value={data.slPostFileNo} onChange={handleInputChange} className="w-full px-3 py-2 bg-blue-50/30 border border-blue-100 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" /></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 pt-2 border-t border-gray-100">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Holder Signature (Back)</label>
                            <div className="space-y-3">
                                <div className="flex gap-4 items-center">
                                    <div className="w-20 h-10 bg-gray-50 border border-dashed border-gray-300 rounded flex items-center justify-center overflow-hidden">{images.signature ? <img src={images.signature} className="max-w-full max-h-full" /> : <span className="text-[10px] text-gray-400">No Sig</span>}</div>
                                    <label className="px-3 py-1.5 border border-gray-300 rounded text-[10px] font-medium hover:bg-gray-50 cursor-pointer flex items-center gap-1 bg-white"><UploadIcon className="w-3 h-3" /> Upload<input type="file" className="hidden" onChange={handleImageUpload('signature')} /></label>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsSignatureStyleManagerOpen(true)} className="px-3 py-1.5 border border-gray-200 rounded text-[10px] font-medium hover:text-blue-600 flex items-center gap-2 text-gray-600"><PaletteIcon className="w-3 h-3"/> Style</button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">PMG Signature (Back)</label>
                            <div className="space-y-3">
                                <div className="flex gap-4 items-center">
                                    <div className="w-20 h-10 bg-gray-50 border border-dashed border-gray-300 rounded flex items-center justify-center overflow-hidden">{images.postmasterSignature ? <img src={images.postmasterSignature} className="max-w-full max-h-full" /> : <span className="text-[10px] text-gray-400">No Sig</span>}</div>
                                    <label className="px-3 py-1.5 border border-gray-300 rounded text-[10px] font-medium hover:bg-gray-50 cursor-pointer flex items-center gap-1 bg-white"><UploadIcon className="w-3 h-3" /> Upload<input type="file" className="hidden" onChange={handleImageUpload('postmasterSignature')} /></label>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsPmgSignatureStyleManagerOpen(true)} className="px-3 py-1.5 border border-gray-200 rounded text-[10px] font-medium hover:text-blue-600 flex items-center gap-2 text-gray-600"><PaletteIcon className="w-3 h-3"/> Style</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4"><button onClick={handleGenerateCard} className="bg-[#1e88e5] hover:bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium shadow-sm transition-colors">Generate ID Card</button></div>
                </div>
            </div>

            <GeneratedRecordsTable 
                cards={generatedCards}
                onEdit={handleEditCard}
                onPrint={handlePrintCard}
                onDelete={handleDeleteCard}
            />

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4">Custom Elements</h2>
                <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
                    {['Front Images', 'Front Text', 'Front Shapes', 'Back Images', 'Back Text', 'Back Shapes'].map((tab) => {
                         const key = tab.replace(/\s+/g, '').replace(/^(.)/, (c) => c.toLowerCase()) as typeof activeTab;
                         return (<button key={tab} onClick={() => {setActiveTab(key);setSelectedElementId(null);}} className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tab}</button>);
                    })}
                </div>
                <div className="min-h-[250px]">
                    {activeTab === 'frontText' && (
                        <div>
                             <div className="mb-4">
                                <TextStyleControls 
                                    style={{}} // Empty defaults for global
                                    onUpdate={updateAllTextStyles} 
                                    title="Global Text Style (Apply to All)"
                                />
                            </div>
                            <div className="flex justify-between items-center mb-4"><span className="text-xs font-medium text-gray-600">Front Side - Text Elements</span><button onClick={addCustomText} className="text-xs flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium transition-colors"><PlusIcon /> Add Text</button></div>
                            <div className="space-y-3">{customElements.filter(el => el.type === 'text' && (el.side === 'front' || !el.side)).map((item) => (<div key={item.id} className={`flex items-center gap-2 p-2 rounded border transition-colors cursor-pointer ${selectedElementId === item.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`} onClick={() => setSelectedElementId(item.id)}><div className="w-6 flex items-center justify-center text-gray-400"><TextIcon /></div><div className="flex-1 overflow-hidden"><div className="text-xs font-medium truncate text-gray-700">{item.text || "Empty Text"}</div><div className="text-[10px] text-gray-400 truncate">{item.fontSize}px • {item.fontFamily?.split(',')[0].replace(/"/g, '')}</div></div><button onClick={(e) => { e.stopPropagation(); deleteCustomElement(item.id); }} className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><TrashIcon /></button></div>))}{customElements.filter(el => el.type === 'text' && (el.side === 'front' || !el.side)).length === 0 && (<div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-lg"><p className="text-xs text-gray-400">No custom text added yet.</p></div>)}</div>
                        </div>
                    )}
                    {activeTab === 'frontImages' && (
                        <div>
                            <div className="flex justify-between items-center mb-4"><span className="text-xs font-medium text-gray-600">Front Side - Images & Icons</span><label className="text-xs flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded font-medium transition-colors cursor-pointer shadow-sm"><UploadIcon /> Upload Image<input type="file" className="hidden" accept="image/*" onChange={addCustomImage} /></label></div>
                            <div className="grid grid-cols-2 gap-3">{customElements.filter(el => el.type === 'image' && (el.side === 'front' || !el.side)).map(el => (<div key={el.id} className={`relative group border rounded-lg p-2 transition-all cursor-pointer ${selectedElementId === el.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'}`} onClick={() => setSelectedElementId(el.id)}><div className="h-24 bg-gray-100 rounded border border-gray-100 mb-2 flex items-center justify-center overflow-hidden relative"><img src={el.src} className="max-w-full max-h-full object-contain" /><div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded">{(el.width || 0).toFixed(0)}px</div></div><button onClick={(e) => { e.stopPropagation(); deleteCustomElement(el.id); }} className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors opacity-0 group-hover:opacity-100" title="Remove Image"><TrashIcon className="w-3 h-3"/></button><div className="text-[10px] text-gray-500 text-center truncate">Click to select & resize</div></div>))}{customElements.filter(el => el.type === 'image' && (el.side === 'front' || !el.side)).length === 0 && (<div className="col-span-2 flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-lg text-gray-400"><div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 text-gray-300"><ImageIcon /></div><span className="text-xs font-medium">No images added</span><span className="text-[10px] mt-1">Upload logos, icons, or graphics</span></div>)}</div>
                        </div>
                    )}
                    {activeTab === 'frontShapes' && (
                        <div>
                            <div className="mb-4"><span className="text-xs font-medium text-gray-600 block mb-3">Add Shapes</span><div className="grid grid-cols-4 gap-2"><button onClick={() => addCustomShape('rectangle')} className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 transition-colors"><SquareIcon className="text-gray-600"/><span className="text-[10px] text-gray-500">Box</span></button><button onClick={() => addCustomShape('circle')} className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 transition-colors"><CircleIcon className="text-gray-600"/><span className="text-[10px] text-gray-500">Circle</span></button><button onClick={() => addCustomShape('star')} className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 transition-colors"><StarIcon className="text-gray-600"/><span className="text-[10px] text-gray-500">Star</span></button><button onClick={() => addCustomShape('line')} className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 transition-colors"><LineIcon className="text-gray-600"/><span className="text-[10px] text-gray-500">Line</span></button></div></div>
                            <div className="space-y-2 mt-4 pt-4 border-t border-gray-100"><span className="text-xs font-medium text-gray-600 block mb-2">Added Shapes</span>{customElements.filter(el => el.type === 'shape' && (el.side === 'front' || !el.side)).map(el => (<div key={el.id} className={`flex items-center justify-between p-2 border rounded cursor-pointer ${selectedElementId === el.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`} onClick={() => setSelectedElementId(el.id)}><div className="flex items-center gap-3"><div className="w-6 flex justify-center text-gray-500">{el.shapeType === 'rectangle' && <SquareIcon />}{el.shapeType === 'circle' && <CircleIcon />}{el.shapeType === 'star' && <StarIcon />}{el.shapeType === 'line' && <LineIcon />}</div><div className="text-xs text-gray-700 capitalize">{el.shapeType}</div></div><button onClick={(e) => { e.stopPropagation(); deleteCustomElement(el.id); }} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-3 h-3"/></button></div>))}{customElements.filter(el => el.type === 'shape' && (el.side === 'front' || !el.side)).length === 0 && (<div className="text-center py-4 text-[10px] text-gray-400 italic">No shapes added yet.</div>)}</div>
                        </div>
                    )}
                    {activeTab === 'backImages' && (
                        <div>
                            <div className="flex justify-between items-center mb-4"><span className="text-xs font-medium text-gray-600">Back Side - Images & Icons</span><label className="text-xs flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded font-medium transition-colors cursor-pointer shadow-sm"><UploadIcon /> Upload Image<input type="file" className="hidden" accept="image/*" onChange={addCustomImage} /></label></div>
                            <div className="grid grid-cols-2 gap-3">{customElements.filter(el => el.type === 'image' && el.side === 'back').map(el => (<div key={el.id} className={`relative group border rounded-lg p-2 transition-all cursor-pointer ${selectedElementId === el.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'}`} onClick={() => setSelectedElementId(el.id)}><div className="h-24 bg-gray-100 rounded border border-gray-100 mb-2 flex items-center justify-center overflow-hidden relative"><img src={el.src} className="max-w-full max-h-full object-contain" /><div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded">{(el.width || 0).toFixed(0)}px</div></div><button onClick={(e) => { e.stopPropagation(); deleteCustomElement(el.id); }} className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors opacity-0 group-hover:opacity-100" title="Remove Image"><TrashIcon className="w-3 h-3"/></button><div className="text-[10px] text-gray-500 text-center truncate">Click to select & resize</div></div>))}{customElements.filter(el => el.type === 'image' && el.side === 'back').length === 0 && (<div className="col-span-2 flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-lg text-gray-400"><div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 text-gray-300"><ImageIcon /></div><span className="text-xs font-medium">No images added</span><span className="text-[10px] mt-1">Upload logos, icons, or graphics</span></div>)}</div>
                        </div>
                    )}
                    {activeTab === 'backText' && (
                        <div>
                             <div className="mb-4">
                                <TextStyleControls 
                                    style={{}} 
                                    onUpdate={updateAllTextStyles} 
                                    title="Global Text Style (Apply to All)"
                                />
                            </div>
                            <div className="flex justify-between items-center mb-4"><span className="text-xs font-medium text-gray-600">Back Side - Text Elements</span><button onClick={addCustomText} className="text-xs flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium transition-colors"><PlusIcon /> Add Text</button></div>
                            <div className="space-y-3">{customElements.filter(el => el.type === 'text' && el.side === 'back').map((item) => (<div key={item.id} className={`flex items-center gap-2 p-2 rounded border transition-colors cursor-pointer ${selectedElementId === item.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`} onClick={() => setSelectedElementId(item.id)}><div className="w-6 flex items-center justify-center text-gray-400"><TextIcon /></div><div className="flex-1 overflow-hidden"><div className="text-xs font-medium truncate text-gray-700">{item.text || "Empty Text"}</div><div className="text-[10px] text-gray-400 truncate">{item.fontSize}px • {item.fontFamily?.split(',')[0].replace(/"/g, '')}</div></div><button onClick={(e) => { e.stopPropagation(); deleteCustomElement(item.id); }} className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><TrashIcon /></button></div>))}{customElements.filter(el => el.type === 'text' && el.side === 'back').length === 0 && (<div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-lg"><p className="text-xs text-gray-400">No custom text added yet.</p></div>)}</div>
                        </div>
                    )}
                    {activeTab === 'backShapes' && (
                        <div>
                            <div className="mb-4"><span className="text-xs font-medium text-gray-600 block mb-3">Add Shapes (Back Side)</span><div className="grid grid-cols-4 gap-2"><button onClick={() => addCustomShape('rectangle')} className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 transition-colors"><SquareIcon className="text-gray-600"/><span className="text-[10px] text-gray-500">Box</span></button><button onClick={() => addCustomShape('circle')} className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 transition-colors"><CircleIcon className="text-gray-600"/><span className="text-[10px] text-gray-500">Circle</span></button><button onClick={() => addCustomShape('star')} className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 transition-colors"><StarIcon className="text-gray-600"/><span className="text-[10px] text-gray-500">Star</span></button><button onClick={() => addCustomShape('line')} className="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 transition-colors"><LineIcon className="text-gray-600"/><span className="text-[10px] text-gray-500">Line</span></button></div></div>
                            <div className="space-y-2 mt-4 pt-4 border-t border-gray-100"><span className="text-xs font-medium text-gray-600 block mb-2">Added Shapes</span>{customElements.filter(el => el.type === 'shape' && el.side === 'back').map(el => (<div key={el.id} className={`flex items-center justify-between p-2 border rounded cursor-pointer ${selectedElementId === el.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`} onClick={() => setSelectedElementId(el.id)}><div className="flex items-center gap-3"><div className="w-6 flex justify-center text-gray-500">{el.shapeType === 'rectangle' && <SquareIcon />}{el.shapeType === 'circle' && <CircleIcon />}{el.shapeType === 'star' && <StarIcon />}{el.shapeType === 'line' && <LineIcon />}</div><div className="text-xs text-gray-700 capitalize">{el.shapeType}</div></div><button onClick={(e) => { e.stopPropagation(); deleteCustomElement(el.id); }} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-3 h-3"/></button></div>))}{customElements.filter(el => el.type === 'shape' && el.side === 'back').length === 0 && (<div className="text-center py-4 text-[10px] text-gray-400 italic">No shapes added yet.</div>)}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base font-bold text-gray-800">Card Preview</h2>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg mr-2 no-print"><button onClick={() => setPreviewMode('front')} className={`p-1.5 rounded ${previewMode === 'front' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} title="Front Only"><ViewFrontIcon /></button><button onClick={() => setPreviewMode('back')} className={`p-1.5 rounded ${previewMode === 'back' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} title="Back Only"><ViewBackIcon /></button><button onClick={() => setPreviewMode('both')} className={`p-1.5 rounded ${previewMode === 'both' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} title="Both Sides"><ViewBothIcon /></button></div>
                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 no-print" onClick={() => setZoom(z => Math.max(z - 10, 50))}><ZoomOutIcon /></button><span className="text-xs font-medium text-gray-600 w-10 text-center no-print">{zoom}%</span><button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 no-print" onClick={() => setZoom(z => Math.min(z + 10, 200))}><ZoomInIcon /></button><button className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1.5 hover:bg-gray-200 rounded font-medium ml-1 no-print" onClick={() => setZoom(100)}>Actual Size</button><div className="w-px h-4 bg-gray-300 mx-1 no-print"></div><button onClick={() => {setIsLocked(!isLocked);setSelectedElementId(null);}} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded font-medium shadow-sm transition-colors no-print ${isLocked ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-[#1e88e5] text-white'}`}>{isLocked ? <><LockIcon /> Locked</> : <><UnlockIcon /> Drag Mode</>}</button><button onClick={handleResetPositions} className="text-gray-600 text-xs px-3 py-1.5 hover:bg-gray-100 rounded font-medium no-print">Reset Positions</button>
                    </div>
                </div>

                <div className="bg-blue-50/50 rounded-lg p-3 mb-6 border border-blue-100 text-[11px] text-gray-600 leading-relaxed no-print">{isLocked ? "Preview Mode: Editing disabled. Unlock to make changes." : "Drag elements to reposition. Drag corners to resize. Double-click text to edit."}</div>

                <div id="printable-area" className="flex flex-col items-center gap-8 overflow-hidden bg-gray-50 p-8 rounded-xl inner-shadow border border-gray-100 relative" style={{ minHeight: '600px'}}>
                    
                    {(previewMode === 'front' || previewMode === 'both') && (
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 no-print">Front Side</span>
                        <div className="relative group shadow-2xl transition-transform duration-200 bg-white" style={{ width: '320px', height: '500px', transform: `scale(${zoom/100})`, transformOrigin: 'top center' }}>
                            <div className="absolute inset-0 bg-white rounded-xl overflow-hidden border border-gray-200 pointer-events-none">{images.frontBg && <img src={images.frontBg} className="w-full h-full object-cover" />}<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div></div>
                            <div className="absolute left-0 right-0 h-4 z-10 pointer-events-none" style={{ top: '53px', backgroundColor: activeDesignation?.color || '#2563eb' }}></div>
                            <div className="absolute left-0 right-0 bottom-0 h-5 z-10 pointer-events-none" style={{ backgroundColor: activeDesignation?.color || '#2563eb' }}></div>

                            <div className="absolute inset-0 flex flex-col items-center pt-5 text-center p-4 z-20">
                                <div className="overflow-hidden shadow-md transition-all duration-200 pointer-events-none flex-shrink-0 relative z-20" style={{width: `${118 * profileConfig.scale}px`, height: `${177 * profileConfig.scale}px`, borderWidth: `${profileConfig.borderWidth}px`, borderColor: profileConfig.borderColor, borderStyle: 'solid', borderRadius: `${profileConfig.borderRadius}%`, marginTop: `${(profileConfig.yOffset * profileConfig.scale) + 40}px`, marginBottom: `${12 * profileConfig.scale}px`}}><div className="w-full h-full bg-gray-200 bg-white">{images.profile && <img src={images.profile} className="w-full h-full object-cover" />}</div></div>
                                <div className={`mb-0.5 rounded px-1 relative z-20 ${!isLocked ? 'cursor-pointer hover:ring-1 hover:ring-blue-300' : ''} ${selectedElementId === 'std_nameWithInitials' ? 'ring-1 ring-blue-500 bg-blue-50/20' : ''}`} onClick={(e) => { if (isLocked) return; e.stopPropagation(); setSelectedElementId('std_nameWithInitials'); }} style={getComputedTextStyle(standardStyles.nameWithInitials)}>{data.nameWithInitials || "Name"}</div>
                                <div className={`mb-3 px-4 rounded relative z-20 ${!isLocked ? 'cursor-pointer hover:ring-1 hover:ring-blue-300' : ''} ${selectedElementId === 'std_fullName' ? 'ring-1 ring-blue-500 bg-blue-50/20' : ''}`} onClick={(e) => { if (isLocked) return; e.stopPropagation(); setSelectedElementId('std_fullName'); }} style={getComputedTextStyle(standardStyles.fullName)}>{data.fullName || "Full Name"}</div>
                                <div className="mb-2 w-full flex flex-col items-center relative z-20"><div className={`rounded px-2 ${!isLocked ? 'cursor-pointer hover:ring-1 hover:ring-blue-300' : ''} ${selectedElementId === 'std_designation' ? 'ring-1 ring-blue-500 bg-blue-50/20' : ''}`} onClick={(e) => { if (isLocked) return; e.stopPropagation(); setSelectedElementId('std_designation'); }} style={getComputedTextStyle({ ...standardStyles.designation, color: standardStyles.designation.color !== '#1e3a8a' ? standardStyles.designation.color : (activeDesignation?.textColor || '#1e3a8a') })}>{data.designation || "Designation"}</div><div className={`rounded px-2 ${!isLocked ? 'cursor-pointer hover:ring-1 hover:ring-blue-300' : ''} ${selectedElementId === 'std_grade' ? 'ring-1 ring-blue-500 bg-blue-50/20' : ''}`} onClick={(e) => { if (isLocked) return; e.stopPropagation(); setSelectedElementId('std_grade'); }} style={getComputedTextStyle({ ...standardStyles.grade, color: standardStyles.grade.color !== '#1e3a8a' ? standardStyles.grade.color : (activeGrade?.textColor || '#1e3a8a') })}>{data.grade}</div>
                                <div 
                                    className={`mt-1 px-4 whitespace-pre-wrap ${!isLocked ? 'cursor-pointer hover:ring-1 hover:ring-blue-300' : ''} ${selectedElementId === 'std_officialAddress' ? 'ring-1 ring-blue-500 bg-blue-50/20' : ''}`} 
                                    onClick={(e) => { if (isLocked) return; e.stopPropagation(); setSelectedElementId('std_officialAddress'); }} 
                                    style={{
                                        ...getComputedTextStyle(standardStyles.officialAddress),
                                        width: '100%',
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    {data.officialAddress}
                                </div>
                                </div>
                                <div className="mt-auto mb-5 w-full px-4 flex flex-col items-center pointer-events-none relative z-20"><div className="w-full max-w-[90%] overflow-hidden flex justify-center"><BarcodeGenerator value={data.nic} config={barcodeConfig} /></div><div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-1 w-full pointer-events-auto"><div className={`rounded px-1 ${!isLocked ? 'cursor-pointer hover:ring-1 hover:ring-blue-300' : ''} ${selectedElementId === 'std_footerLeft' ? 'ring-1 ring-blue-500 bg-blue-50/20' : ''}`} onClick={(e) => { if (isLocked) return; e.stopPropagation(); setSelectedElementId('std_footerLeft'); }} style={getComputedTextStyle(standardStyles.footerLeft)}>Date: {data.dateOfIssue}</div><div className={`rounded px-1 ${!isLocked ? 'cursor-pointer hover:ring-1 hover:ring-blue-300' : ''} ${selectedElementId === 'std_footerRight' ? 'ring-1 ring-blue-500 bg-blue-50/20' : ''}`} onClick={(e) => { if (isLocked) return; e.stopPropagation(); setSelectedElementId('std_footerRight'); }} style={getComputedTextStyle(standardStyles.footerRight)}>SL Post {data.slPostFileNo}</div></div></div>
                                
                                {customElements.filter(el => !el.side || el.side === 'front').map(el => {
                                    const textStyle = el.type === 'text' ? getComputedTextStyle(el) : {};
                                    const isEditing = editingElementId === el.id;
                                    const isSelected = selectedElementId === el.id && !isLocked;

                                    return (
                                        <div 
                                            key={el.id} 
                                            onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                                            onDoubleClick={(e) => {
                                                e.stopPropagation();
                                                if (isLocked) return;
                                                if (el.type === 'text') setEditingElementId(el.id);
                                            }}
                                            className={`absolute group select-none pointer-events-auto ${isSelected ? 'z-[100]' : ''}`}
                                            style={{ 
                                                top: `${el.y}px`, 
                                                left: `${el.x}px`, 
                                                cursor: isLocked ? 'default' : 'move',
                                                transform: `rotate(${el.rotation || 0}deg)`,
                                                zIndex: isSelected ? 100 : (el.zIndex || 30)
                                            }}
                                        >
                                            <div className={`${isSelected ? 'ring-1 ring-blue-500 ring-dashed' : (!isLocked ? 'group-hover:ring-1 group-hover:ring-gray-300 group-hover:ring-dashed' : '')}`}>
                                            {el.type === 'text' ? (
                                                <div 
                                                    id={`editable-text-${el.id}`}
                                                    contentEditable={isEditing}
                                                    suppressContentEditableWarning={true}
                                                    onBlur={(e) => {
                                                        updateCustomElement(el.id, { text: e.currentTarget.innerText });
                                                        setEditingElementId(null);
                                                    }}
                                                    onMouseDown={(e) => { if (isEditing) e.stopPropagation(); }}
                                                    style={{
                                                        ...textStyle,
                                                        width: el.width ? `${el.width}px` : 'auto',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                        cursor: isEditing ? 'text' : (isLocked ? 'default' : 'move'),
                                                        outline: isEditing ? 'none' : undefined,
                                                        minWidth: isEditing ? '20px' : undefined
                                                    }}
                                                >
                                                    {el.text}
                                                </div>
                                            ) : el.type === 'shape' ? (
                                                <div style={{
                                                    width: `${el.width}px`,
                                                    height: `${el.height}px`,
                                                    opacity: (el.opacity ?? 100) / 100,
                                                    transform: `scaleX(${el.flipX ? -1 : 1}) scaleY(${el.flipY ? -1 : 1})`,
                                                    position: 'relative'
                                                }}>
                                                    {el.shapeType === 'rectangle' && (<div style={{width: '100%', height: '100%', backgroundColor: el.fillColor, border: `${el.strokeWidth}px solid ${el.strokeColor}`}} />)}
                                                    {el.shapeType === 'circle' && (<div style={{width: '100%', height: '100%', backgroundColor: el.fillColor, border: `${el.strokeWidth}px solid ${el.strokeColor}`, borderRadius: '50%'}} />)}
                                                    {el.shapeType === 'star' && (<svg viewBox="0 0 24 24" style={{width: '100%', height: '100%', overflow: 'visible'}} preserveAspectRatio="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={el.fillColor} stroke={el.strokeColor} strokeWidth={el.strokeWidth ? el.strokeWidth / 2 : 0} vectorEffect="non-scaling-stroke" /></svg>)}
                                                    {el.shapeType === 'line' && (<div style={{width: '100%', height: `${Math.max(1, el.strokeWidth || 1)}px`, backgroundColor: el.strokeColor, position: 'absolute', top: '50%', transform: 'translateY(-50%)'}} />)}
                                                </div>
                                            ) : (
                                                <div style={{
                                                    width: `${el.width}px`,
                                                    height: 'auto',
                                                    opacity: (el.opacity ?? 100) / 100,
                                                    transform: `scaleX(${el.flipX ? -1 : 1}) scaleY(${el.flipY ? -1 : 1})`
                                                }} className="relative">
                                                    <img src={el.src} className="w-full h-auto pointer-events-none" />
                                                </div>
                                            )}
                                            </div>

                                            {isSelected && !isEditing && (
                                                <>
                                                    <div onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'nw')} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-600 rounded-full shadow cursor-nw-resize z-50 hover:bg-blue-50"></div>
                                                    <div onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'ne')} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-600 rounded-full shadow cursor-ne-resize z-50 hover:bg-blue-50"></div>
                                                    <div onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'sw')} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-600 rounded-full shadow cursor-sw-resize z-50 hover:bg-blue-50"></div>
                                                    <div onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'se')} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-600 rounded-full shadow cursor-se-resize z-50 hover:bg-blue-50"></div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    )}

                    {(previewMode === 'back' || previewMode === 'both') && (
                    <div className="flex flex-col items-center gap-2">
                         <span className="text-xs font-semibold text-gray-500 no-print">Back Side</span>
                        <div className="relative group shadow-2xl transition-transform duration-200 bg-white" style={{ width: '320px', height: '500px', transform: `scale(${zoom/100})`, transformOrigin: 'top center' }}>
                            <div className="absolute inset-0 bg-white rounded-xl overflow-hidden border border-gray-200">{images.backBg && <img src={images.backBg} className="w-full h-full object-cover" />}</div>
                            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center pointer-events-none">
                                <div className="w-full mb-8 px-4 opacity-90 flex justify-center"><BarcodeGenerator value={data.nic} config={{ ...barcodeConfig, displayValue: false }} /></div>
                                <div className="border-b border-dashed border-gray-400 w-3/4 mb-2 pb-2 min-h-[40px] flex items-end justify-center overflow-hidden">
                                    {images.signature && (
                                        <img 
                                            src={images.signature} 
                                            className="h-12 mx-auto" 
                                            style={{
                                                transform: `scale(${signatureConfig.scale}) translate(${signatureConfig.xOffset}px, ${signatureConfig.yOffset}px)`,
                                                opacity: signatureConfig.opacity / 100
                                            }}
                                        />
                                    )}
                                </div>
                                <p className="text-[10px] font-bold text-gray-800 mb-12 uppercase tracking-wide">Signature of Card Holder</p>
                                <div className="mt-auto space-y-3 w-full">
                                    <div className="w-full flex justify-center">
                                        <div className="w-32 h-12 relative flex items-center justify-center overflow-hidden">
                                            {images.postmasterSignature ? (
                                                <img 
                                                    src={images.postmasterSignature} 
                                                    className="max-w-full max-h-full object-contain" 
                                                    style={{
                                                        transform: `scale(${pmgSignatureConfig.scale}) translate(${pmgSignatureConfig.xOffset}px, ${pmgSignatureConfig.yOffset}px)`,
                                                        opacity: pmgSignatureConfig.opacity / 100
                                                    }}
                                                />
                                            ) : (
                                                <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full text-blue-900 opacity-70"><path d="M20,50 Q50,20 80,50 T150,50" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-900">Postmaster General</p>
                                    <div className="text-[9px] text-gray-500 leading-relaxed mt-6 border-t border-gray-100 pt-2 w-full">If found, Please return to:<br/><span className="font-semibold text-gray-700">Postmaster General</span><br/>Colombo - 01000</div>
                                </div>
                            </div>
                            
                            {customElements.filter(el => el.side === 'back').map(el => {
                                const textStyle = el.type === 'text' ? getComputedTextStyle(el) : {};
                                const isEditing = editingElementId === el.id;
                                const isSelected = selectedElementId === el.id && !isLocked;

                                return (
                                    <div 
                                        key={el.id} 
                                        onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            if (isLocked) return;
                                            if (el.type === 'text') setEditingElementId(el.id);
                                        }}
                                        className={`absolute group select-none pointer-events-auto ${isSelected ? 'z-[100]' : ''}`}
                                        style={{ 
                                            top: `${el.y}px`, 
                                            left: `${el.x}px`, 
                                            cursor: isLocked ? 'default' : 'move',
                                            transform: `rotate(${el.rotation || 0}deg)`,
                                            zIndex: isSelected ? 100 : (el.zIndex || 30)
                                        }}
                                    >
                                        <div className={`${isSelected ? 'ring-1 ring-blue-500 ring-dashed' : (!isLocked ? 'group-hover:ring-1 group-hover:ring-gray-300 group-hover:ring-dashed' : '')}`}>
                                        {el.type === 'text' ? (
                                            <div 
                                                id={`editable-text-${el.id}`}
                                                contentEditable={isEditing}
                                                suppressContentEditableWarning={true}
                                                onBlur={(e) => {
                                                    updateCustomElement(el.id, { text: e.currentTarget.innerText });
                                                    setEditingElementId(null);
                                                }}
                                                onMouseDown={(e) => { if (isEditing) e.stopPropagation(); }}
                                                style={{
                                                    ...textStyle,
                                                    width: el.width ? `${el.width}px` : 'auto',
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word',
                                                    cursor: isEditing ? 'text' : (isLocked ? 'default' : 'move'),
                                                    outline: isEditing ? 'none' : undefined,
                                                    minWidth: isEditing ? '20px' : undefined
                                                }}
                                            >
                                                {el.text}
                                            </div>
                                        ) : el.type === 'shape' ? (
                                            <div style={{
                                                width: `${el.width}px`,
                                                height: `${el.height}px`,
                                                opacity: (el.opacity ?? 100) / 100,
                                                transform: `scaleX(${el.flipX ? -1 : 1}) scaleY(${el.flipY ? -1 : 1})`,
                                                position: 'relative'
                                            }}>
                                                {el.shapeType === 'rectangle' && (<div style={{width: '100%', height: '100%', backgroundColor: el.fillColor, border: `${el.strokeWidth}px solid ${el.strokeColor}`}} />)}
                                                {el.shapeType === 'circle' && (<div style={{width: '100%', height: '100%', backgroundColor: el.fillColor, border: `${el.strokeWidth}px solid ${el.strokeColor}`, borderRadius: '50%'}} />)}
                                                {el.shapeType === 'star' && (<svg viewBox="0 0 24 24" style={{width: '100%', height: '100%', overflow: 'visible'}} preserveAspectRatio="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={el.fillColor} stroke={el.strokeColor} strokeWidth={el.strokeWidth ? el.strokeWidth / 2 : 0} vectorEffect="non-scaling-stroke" /></svg>)}
                                                {el.shapeType === 'line' && (<div style={{width: '100%', height: `${Math.max(1, el.strokeWidth || 1)}px`, backgroundColor: el.strokeColor, position: 'absolute', top: '50%', transform: 'translateY(-50%)'}} />)}
                                            </div>
                                        ) : (
                                            <div style={{
                                                width: `${el.width}px`,
                                                height: 'auto',
                                                opacity: (el.opacity ?? 100) / 100,
                                                transform: `scaleX(${el.flipX ? -1 : 1}) scaleY(${el.flipY ? -1 : 1})`
                                            }} className="relative">
                                                <img src={el.src} className="w-full h-auto pointer-events-none" />
                                            </div>
                                        )}
                                        </div>

                                        {isSelected && !isEditing && (
                                            <>
                                                <div onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'nw')} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-600 rounded-full shadow cursor-nw-resize z-50 hover:bg-blue-50"></div>
                                                <div onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'ne')} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-600 rounded-full shadow cursor-ne-resize z-50 hover:bg-blue-50"></div>
                                                <div onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'sw')} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-600 rounded-full shadow cursor-sw-resize z-50 hover:bg-blue-50"></div>
                                                <div onMouseDown={(e) => handleResizeMouseDown(e, el.id, 'se')} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-600 rounded-full shadow cursor-se-resize z-50 hover:bg-blue-50"></div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    )}
                </div>
                
                <div className="mt-6 flex justify-center"><button className="flex items-center gap-2 bg-[#1e88e5] text-white px-6 py-2 rounded font-medium shadow-md hover:bg-blue-600 transition-colors"><FilePdfIcon /> Save as PDF</button></div>
            </div>
        </div>
      </div>
      
      {selectedStyle && (
          <div 
              ref={inspectorRef}
              className={`fixed w-64 bg-white/95 backdrop-blur rounded-xl shadow-2xl border border-gray-200 p-4 z-[1000] animate-in fade-in zoom-in-95 duration-200 max-h-[calc(100%-2rem)] overflow-y-auto ${inspectorPosition ? '' : 'right-4 top-24'}`}
              style={inspectorPosition ? { top: inspectorPosition.y, left: inspectorPosition.x } : {}}
          >
              {renderInspector()}
          </div>
      )}

    </div>
  );
};

const rootElement = document.getElementById("root");
if (!rootElement) {
    console.error("Failed to find the root element");
} else {
    const root = createRoot(rootElement);
    root.render(<App />);
}