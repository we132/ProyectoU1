import { useState, useEffect, useMemo } from 'react'
import { X, Save, Edit3, Image as ImageIcon, Loader2 } from 'lucide-react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { DrawingBoard } from './DrawingBoard'

export const NoteEditor = ({ activeNote, onClose, onSaveText, onAttachSketch }) => {
    // 1. ALL HOOKS AT THE TOP (Never after an if statement)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [mode, setMode] = useState('text')
    const [isSaving, setIsSaving] = useState(false)

    // Memoize Quill configuration unconditionally
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    }), [])

    // Sync incoming note
    useEffect(() => {
        if (activeNote) {
            setTitle(activeNote.title || 'Untitled Note')
            setContent(activeNote.content || '')
            setMode('text')
        }
    }, [activeNote])

    // 2. ONLY DO EARLY RETURNS AFTER ALL HOOKS ARE DECLARED
    if (!activeNote) return null

    const handleSaveText = async () => {
        setIsSaving(true)
        await onSaveText(activeNote.id, { title, content })
        setIsSaving(false)
    }

    const handleSaveSketch = async (imageBlob) => {
        setIsSaving(true)
        await onAttachSketch(activeNote.id, imageBlob)
        setIsSaving(false)
        setMode('text')
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-0 sm:p-4">
            <div className="bg-[var(--color-forge-900)] w-full max-w-5xl h-full sm:h-[90vh] rounded-none sm:rounded-3xl border-0 sm:border border-[var(--color-forge-700)] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                {/* Editor Top Bar */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-forge-700)] bg-[var(--color-forge-800)] shadow-sm z-10">
                    <div className="flex-grow max-w-2xl px-4">
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-transparent text-2xl font-bold text-[var(--color-text-main)] focus:outline-none focus:border-b-2 focus:border-[var(--color-forge-accent)] pb-1 transition-colors"
                            placeholder="Note Title"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSaveText}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-[var(--color-forge-accent)] px-6 py-2 rounded-full text-white font-bold hover:scale-105 transition-transform shadow-neon"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            <span className="hidden sm:inline-block">Save Note</span>
                        </button>

                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors bg-[var(--color-forge-700)] rounded-full hover:bg-[var(--color-forge-danger)] hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Mode Toggles */}
                <div className="flex justify-center p-3 border-b border-[var(--color-forge-700)] bg-[var(--color-forge-800)]/40 gap-2 sm:gap-4 flex-wrap">
                    <button
                        onClick={() => setMode('text')}
                        className={`flex items-center justify-center gap-2 px-3 sm:px-6 py-2 rounded-full font-bold text-xs sm:text-base transition-all flex-1 sm:flex-none ${mode === 'text' ? 'bg-[var(--color-text-main)] text-[var(--color-forge-900)] shadow-sm' : 'text-gray-400 border border-[var(--color-forge-700)] hover:text-white'}`}
                    >
                        <Edit3 size={16} className="sm:w-[18px] sm:h-[18px]" />
                        Rich Text
                    </button>

                    <button
                        onClick={() => setMode('sketch')}
                        className={`flex items-center justify-center gap-2 px-3 sm:px-6 py-2 rounded-full font-bold text-xs sm:text-base transition-all flex-1 sm:flex-none ${mode === 'sketch' ? 'bg-[var(--color-forge-accent)] text-white shadow-neon' : 'text-gray-400 border border-[var(--color-forge-700)] hover:text-white'}`}
                    >
                        <ImageIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="hidden sm:inline">Attach Canvas Drawing</span>
                        <span className="sm:hidden">Canvas</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-grow flex flex-col relative overflow-hidden bg-white">

                    {mode === 'text' ? (
                        <div className="flex flex-col h-full w-full text-black overflow-y-auto">
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                className="flex-grow flex flex-col min-h-[300px] sm:h-[calc(100%-42px)] border-none"
                                placeholder="Start typing your ideas here..."
                            />

                            {/* Attached Sketch Preview */}
                            {activeNote.image_url && (
                                <div className="p-8 bg-[#f5f5f5] border-t border-gray-200">
                                    <h4 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-4 flex items-center gap-2">
                                        <ImageIcon size={16} /> Attached Sketch
                                    </h4>
                                    <div className="w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-xl border border-gray-300 bg-[#0f0f0f]">
                                        <img src={activeNote.image_url} alt="Attached Drawing" className="w-full object-contain" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <DrawingBoard
                            isOpen={true}
                            onClose={() => setMode('text')}
                            onSave={handleSaveSketch}
                        />
                    )}

                </div>
            </div>
        </div>
    )
}
