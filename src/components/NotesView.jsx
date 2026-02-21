import { useState } from 'react'
import { PlusCircle, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react'
import { DrawingBoard } from './DrawingBoard'
import { useNotes } from '../hooks/useNotes'

export const NotesView = () => {
    const { notes, loading, saveNote, deleteNote } = useNotes()
    const [isDrawing, setIsDrawing] = useState(false)

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col h-full animate-in fade-in duration-500">

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-main)] capitalize tracking-tight flex items-center gap-3">
                        <ImageIcon className="text-[var(--color-forge-accent)]" size={32} />
                        Creative Board
                    </h1>
                    <p className="text-gray-400 mt-1">Doodle, sketch, and leave visual notes.</p>
                </div>

                <button
                    onClick={() => setIsDrawing(true)}
                    className="flex items-center gap-2 bg-[var(--color-forge-accent)] text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-neon"
                >
                    <PlusCircle size={20} />
                    <span className="hidden sm:inline-block">New Sketch</span>
                </button>
            </div>

            {/* Loading State */}
            {loading && notes.length === 0 && (
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="animate-spin text-[var(--color-forge-accent)]" size={40} />
                </div>
            )}

            {/* Empty State */}
            {!loading && notes.length === 0 && (
                <div className="flex-grow flex flex-col items-center justify-center text-center max-w-md mx-auto opacity-50">
                    <ImageIcon size={64} className="mb-4 text-gray-500" />
                    <h3 className="text-xl font-bold mb-2">No sketches yet</h3>
                    <p className="text-gray-400">Your board is empty. Tap the button above to draw your first Noteit!</p>
                </div>
            )}

            {/* Masonry / Grid Board */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-max pb-12">
                {notes.map(note => (
                    <div
                        key={note.id}
                        className="group relative aspect-square bg-white p-3 sm:p-4 pb-8 sm:pb-12 shadow-xl hover:-translate-y-2 hover:rotate-1 transition-all duration-300 cursor-pointer"
                        style={{ transform: `rotate(${Math.random() * 4 - 2}deg)` }}
                    >
                        {/* Visual Tape/Pin */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-4 bg-white/40 backdrop-blur-md border border-gray-200/50 shadow-sm rotate-[-2deg]"></div>

                        <div className="w-full h-full bg-[#0f0f0f] overflow-hidden shadow-inner border border-gray-100 flex items-center justify-center">
                            <img src={note.image_url} className="w-full h-full object-contain" alt="Note Sketch" />
                        </div>

                        {/* Delete Button (Hover) */}
                        <button
                            onClick={() => deleteNote(note.id)}
                            className="absolute bottom-2 right-2 text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>

            {/* The Fullscreen Canvas Overlay */}
            <DrawingBoard
                isOpen={isDrawing}
                onClose={() => setIsDrawing(false)}
                onSave={saveNote}
            />
        </div>
    )
}
