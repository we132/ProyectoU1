import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { X, Check } from 'lucide-react'
import getCroppedImg from '../utils/cropUtils'

export const CropModal = ({ imageSrc, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [isCropping, setIsCropping] = useState(false)

    const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        try {
            setIsCropping(true)
            const croppedImageBlob = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                0 // 0 rotation
            )

            // Create a new File from the Blob
            const croppedFile = new File([croppedImageBlob], 'cropped_task_image.webp', { type: 'image/webp' })
            onCropComplete(croppedFile)
        } catch (e) {
            console.error('Error cropping image:', e)
            onCancel() // Fallback gracefully
        } finally {
            setIsCropping(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[70] flex flex-col items-center justify-center p-4">

            <div className="w-full max-w-2xl bg-[var(--color-forge-900)] rounded-3xl border border-[var(--color-forge-700)] shadow-2xl overflow-hidden flex flex-col h-[80vh] sm:h-[600px] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-[var(--color-forge-700)] bg-[var(--color-forge-800)]">
                    <h3 className="text-xl font-bold text-white">Frame your Image</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative flex-grow bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={16 / 9} // Default aspect ratio for tasks
                        onCropChange={setCrop}
                        onCropComplete={onCropCompleteCallback}
                        onZoomChange={setZoom}
                        classes={{ containerClassName: 'bg-black' }}
                    />
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-[var(--color-forge-800)] border-t border-[var(--color-forge-700)] flex flex-col sm:flex-row items-center justify-between gap-4">

                    {/* Zoom Slider */}
                    <div className="flex items-center gap-4 w-full sm:w-1/2">
                        <span className="text-xs font-bold text-gray-400">ZOOM</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-1 bg-[var(--color-forge-700)] rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={onCancel}
                            disabled={isCropping}
                            className="flex-1 sm:flex-none px-6 py-2 rounded-full border border-[var(--color-forge-700)] text-gray-300 font-bold hover:bg-[var(--color-forge-700)] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isCropping}
                            className="flex-1 sm:flex-none px-6 py-2 rounded-full bg-[var(--color-forge-accent)] text-white font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-neon"
                        >
                            {isCropping ? <span className="animate-spin text-xl leading-none">⍥</span> : <Check size={18} />}
                            Crop & Save
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
