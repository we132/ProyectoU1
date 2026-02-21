import { useState, useRef, useEffect } from 'react'
import { Eraser, Save, X, Undo, RefreshCw, PenTool } from 'lucide-react'

const COLORS = ['#ffffff', '#ff0000', '#ff00ff', '#00ffff', '#00ff00', '#ffff00', '#1a1a1a']
const BRUSH_SIZES = [2, 5, 8, 12]

export const DrawingBoard = ({ isOpen, onClose, onSave }) => {
    const canvasRef = useRef(null)
    const contextRef = useRef(null)

    const [isDrawing, setIsDrawing] = useState(false)
    const [color, setColor] = useState('#ffffff')
    const [brushSize, setBrushSize] = useState(5)
    const [isSaving, setIsSaving] = useState(false)

    // History for undo feature
    const [history, setHistory] = useState([])

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            const canvas = canvasRef.current
            // Fix resolution for high DPI screens
            const rect = canvas.getBoundingClientRect()
            canvas.width = rect.width * 2
            canvas.height = rect.height * 2

            const context = canvas.getContext('2d')
            context.scale(2, 2)
            context.lineCap = 'round'
            context.lineJoin = 'round'
            context.strokeStyle = color
            context.lineWidth = brushSize

            // Paint background so it's not transparent on save
            context.fillStyle = '#0f0f0f'
            context.fillRect(0, 0, canvas.width, canvas.height)

            contextRef.current = context
            saveHistoryState() // Initial state
        }
    }, [isOpen])

    // Update brush properties dynamically
    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color
            contextRef.current.lineWidth = brushSize
        }
    }, [color, brushSize])

    const saveHistoryState = () => {
        if (!canvasRef.current) return
        setHistory(prev => [...prev, canvasRef.current.toDataURL()])
    }

    const handleUndo = () => {
        if (history.length <= 1) return // Keep the base background

        const newHistory = [...history]
        newHistory.pop() // Remove current
        const previousState = newHistory[newHistory.length - 1]

        const image = new Image()
        image.src = previousState
        image.onload = () => {
            const canvas = canvasRef.current
            const context = contextRef.current
            context.clearRect(0, 0, canvas.width, canvas.height)
            context.drawImage(image, 0, 0, canvas.width / 2, canvas.height / 2)
        }
        setHistory(newHistory)
    }

    const handleClear = () => {
        const canvas = canvasRef.current
        const context = contextRef.current
        context.fillStyle = '#0f0f0f'
        context.fillRect(0, 0, canvas.width, canvas.height)
        saveHistoryState()
    }

    // --- Drawing Logic ---
    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent
        contextRef.current.beginPath()
        contextRef.current.moveTo(offsetX, offsetY)
        setIsDrawing(true)
    }

    const finishDrawing = () => {
        contextRef.current.closePath()
        setIsDrawing(false)
        saveHistoryState()
    }

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return
        const { offsetX, offsetY } = nativeEvent
        contextRef.current.lineTo(offsetX, offsetY)
        contextRef.current.stroke()
    }

    // Touch Support
    const getTouchPos = (canvasDom, touchEvent) => {
        const rect = canvasDom.getBoundingClientRect()
        return {
            offsetX: touchEvent.touches[0].clientX - rect.left,
            offsetY: touchEvent.touches[0].clientY - rect.top
        }
    }

    const handleTouchStart = (e) => {
        e.preventDefault()
        startDrawing({ nativeEvent: getTouchPos(canvasRef.current, e) })
    }

    const handleTouchMove = (e) => {
        e.preventDefault()
        draw({ nativeEvent: getTouchPos(canvasRef.current, e) })
    }

    const handleSave = () => {
        setIsSaving(true)
        canvasRef.current.toBlob(async (blob) => {
            if (blob) {
                await onSave(blob)
                setIsSaving(false)
                onClose()
            }
        }, 'image/png')
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-2 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">

            <div className="bg-[var(--color-forge-800)] w-full max-w-4xl border border-[var(--color-forge-700)] rounded-3xl shadow-2xl flex flex-col overflow-hidden">

                {/* Header Tools */}
                <div className="border-b border-[var(--color-forge-700)] p-4 flex items-center justify-between bg-[var(--color-forge-900)]">
                    <div className="flex items-center gap-2 text-[var(--color-text-main)] font-bold">
                        <PenTool size={20} className="text-[var(--color-forge-accent)]" />
                        Sketchpad
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={handleUndo} className="p-2 text-gray-400 hover:text-white transition-colors" title="Undo">
                            <Undo size={20} />
                        </button>
                        <button onClick={handleClear} className="p-2 text-gray-400 hover:text-white transition-colors" title="Clear Canvas">
                            <RefreshCw size={20} />
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-[var(--color-forge-danger)] transition-colors" title="Close">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="relative w-full aspect-square sm:aspect-video bg-[#0f0f0f] cursor-crosshair touch-none">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseUp={finishDrawing}
                        onMouseOut={finishDrawing}
                        onMouseMove={draw}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={finishDrawing}
                        onTouchMove={handleTouchMove}
                        className="absolute inset-0 w-full h-full"
                    />
                </div>

                {/* Toolbar Footer */}
                <div className="p-4 bg-[var(--color-forge-900)] flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-forge-700)]">

                    {/* Colors */}
                    <div className="flex items-center gap-2">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'scale-125 border-[var(--color-text-main)] shadow-[0_0_10px_currentColor]' : 'border-gray-600'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>

                    {/* Sizes and Action */}
                    <div className="flex items-center gap-6 w-full sm:w-auto mt-4 sm:mt-0">

                        {/* Brush Size Slider */}
                        <div className="flex items-center gap-3 bg-[var(--color-forge-800)] px-3 py-1.5 rounded-full border border-[var(--color-forge-700)] flex-grow sm:flex-grow-0">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            <input
                                type="range"
                                min="1" max="30"
                                value={brushSize}
                                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                className="w-24 accent-[var(--color-forge-accent)]"
                            />
                            <span className="w-4 h-4 rounded-full bg-gray-400"></span>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--color-forge-accent)] text-white font-bold hover:scale-105 transition-transform shadow-neon"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Post Note
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
