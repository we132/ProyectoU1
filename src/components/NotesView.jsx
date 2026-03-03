import { useState, useRef, useEffect } from 'react'
import { PlusCircle, Trash2, Folder, FolderPlus, FileText, Image as ImageIcon, Loader2, ArrowRight, Edit2, Check, X, ChevronLeft } from 'lucide-react'
import { useNotes } from '../hooks/useNotes'
import { NoteEditor } from './NoteEditor'
import { useLanguage } from '../context/LanguageContext'
import { useWorkspaceContext } from '../context/WorkspaceContext'

export const NotesView = () => {
    const { t } = useLanguage()
    const { activeWorkspaceId } = useWorkspaceContext()
    const {
        folders, notes, loadingFolders, loadingNotes,
        createFolder, updateFolder, deleteFolder,
        createEmptyNote, updateNoteText, attachSketchToNote, deleteNote
    } = useNotes(activeWorkspaceId)

    const [activeFolderId, setActiveFolderId] = useState(null)
    const [activeNote, setActiveNote] = useState(null)

    const [isCreatingFolder, setIsCreatingFolder] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')

    // Folder Renaming State
    const [editingFolderId, setEditingFolderId] = useState(null)
    const [editingFolderName, setEditingFolderName] = useState('')
    const folderEditInputRef = useRef(null)

    useEffect(() => {
        if (editingFolderId && folderEditInputRef.current) {
            folderEditInputRef.current.focus()
        }
    }, [editingFolderId])

    const handleCreateFolder = async (e) => {
        e.preventDefault()
        if (!newFolderName.trim()) return
        const result = await createFolder(newFolderName)
        if (result.data) {
            setActiveFolderId(result.data.id)
            setIsCreatingFolder(false)
            setNewFolderName('')
        }
    }

    const handleUpdateFolder = async (folderId) => {
        if (!editingFolderName.trim()) {
            setEditingFolderId(null)
            return
        }
        await updateFolder(folderId, editingFolderName)
        setEditingFolderId(null)
    }

    const handleCreateNote = async () => {
        if (!activeFolderId) return
        const result = await createEmptyNote(activeFolderId)
        if (result.data) {
            setActiveNote(result.data)
        }
    }

    const activeNotes = notes.filter(n => n.folder_id === activeFolderId)

    return (
        <div className="w-full h-full flex flex-col md:flex-row gap-6 animate-in fade-in duration-500 overflow-hidden text-[var(--color-text-main)]">

            {/* LEFT PANE: FOLDERS SIDEBAR */}
            <div className={`w-full md:w-64 flex-shrink-0 flex-col bg-[var(--color-forge-900)] border border-[var(--color-forge-700)] rounded-2xl p-4 overflow-hidden h-full relative ${activeFolderId ? 'hidden md:flex' : 'flex'}`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Folder className="text-[var(--color-forge-accent)]" />
                        Spaces
                    </h2>
                    <button
                        onClick={() => setIsCreatingFolder(!isCreatingFolder)}
                        className="hidden md:flex p-1.5 text-gray-400 hover:text-white transition-colors bg-[var(--color-forge-800)] rounded-lg border border-[var(--color-forge-700)]"
                    >
                        <FolderPlus size={18} />
                    </button>
                </div>

                {isCreatingFolder && (
                    <form onSubmit={handleCreateFolder} className="mb-4 flex gap-2">
                        <input
                            autoFocus
                            type="text"
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            placeholder="Folder name..."
                            className="w-full bg-[var(--color-forge-800)] border border-[var(--color-forge-700)] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--color-forge-accent)]"
                        />
                        <button type="submit" className="bg-[var(--color-forge-accent)] p-2 rounded-lg text-white">
                            <ArrowRight size={16} />
                        </button>
                    </form>
                )}

                <div className="flex-grow overflow-y-auto space-y-1">
                    {loadingFolders ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="animate-spin text-[var(--color-forge-accent)]" size={24} />
                        </div>
                    ) : folders.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center mt-4">No spaces created yet.</p>
                    ) : (
                        folders.map(folder => (
                            <div
                                key={folder.id}
                                onClick={() => {
                                    if (editingFolderId !== folder.id) setActiveFolderId(folder.id)
                                }}
                                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${activeFolderId === folder.id ? 'bg-[var(--color-forge-800)] border-[var(--color-forge-accent)] text-white shadow-neon' : 'border-transparent text-gray-400 hover:bg-[var(--color-forge-800)]/50 hover:text-white'}`}
                            >
                                {editingFolderId === folder.id ? (
                                    <div className="flex items-center gap-2 w-full pr-2" onClick={e => e.stopPropagation()}>
                                        <input
                                            ref={folderEditInputRef}
                                            type="text"
                                            value={editingFolderName}
                                            onChange={e => setEditingFolderName(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleUpdateFolder(folder.id)
                                                if (e.key === 'Escape') setEditingFolderId(null)
                                            }}
                                            className="w-full bg-[var(--color-forge-900)] border border-[var(--color-forge-accent)] text-white rounded px-2 py-1 text-sm outline-none"
                                        />
                                        <button onClick={() => handleUpdateFolder(folder.id)} className="text-green-400 hover:text-green-300">
                                            <Check size={16} />
                                        </button>
                                        <button onClick={() => setEditingFolderId(null)} className="text-red-400 hover:text-red-300">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 truncate">
                                            <Folder size={16} className={activeFolderId === folder.id ? 'text-[var(--color-forge-accent)] flex-shrink-0' : 'flex-shrink-0'} />
                                            <span className="truncate text-sm font-medium">{folder.name}</span>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all flex-shrink-0">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingFolderName(folder.name);
                                                    setEditingFolderId(folder.id);
                                                }}
                                                className="p-1.5 text-blue-400 hover:bg-blue-400/20 rounded-md transition-colors"
                                                title="Rename Folder"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); if (activeFolderId === folder.id) setActiveFolderId(null); }}
                                                className="p-1.5 text-red-400 hover:bg-red-400/20 rounded-md transition-colors"
                                                title="Delete Folder"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Mobile FAB for Creating Folders */}
                <button
                    onClick={() => setIsCreatingFolder(!isCreatingFolder)}
                    className="md:hidden absolute bottom-4 right-4 bg-[var(--color-forge-accent)] text-white p-4 rounded-full shadow-neon flex items-center justify-center hover:scale-105 transition-transform z-10"
                >
                    <FolderPlus size={24} />
                </button>
            </div>

            {/* RIGHT PANE: NOTES GRID */}
            <div className={`flex-grow flex-col min-w-0 bg-[var(--color-forge-800)]/30 border border-[var(--color-forge-700)] rounded-2xl p-4 sm:p-6 h-full overflow-y-auto relative ${!activeFolderId ? 'hidden md:flex' : 'flex'}`}>
                {!activeFolderId ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-gray-500 gap-4 opacity-50">
                        <Folder size={64} className="text-gray-600" />
                        <h3 className="text-xl font-bold">Select or Create a Space</h3>
                        <p className="text-sm text-center max-w-sm">Folders act as separate universes for your notes and drawings.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-[var(--color-forge-700)] gap-4">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setActiveFolderId(null)}
                                    className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white hover:bg-[var(--color-forge-800)] rounded-xl transition-colors"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] truncate pr-4">
                                    {folders.find(f => f.id === activeFolderId)?.name || 'Folder'}
                                </h1>
                            </div>

                            <button
                                onClick={handleCreateNote}
                                className="hidden sm:flex flex-shrink-0 items-center gap-2 bg-[var(--color-text-main)] text-[var(--color-forge-900)] px-5 py-2.5 rounded-full font-bold hover:scale-105 transition-transform"
                            >
                                <PlusCircle size={20} />
                                <span className="hidden sm:inline-block">New Page</span>
                            </button>
                        </div>

                        {loadingNotes ? (
                            <div className="flex-grow flex items-center justify-center">
                                <Loader2 className="animate-spin text-[var(--color-forge-accent)]" size={40} />
                            </div>
                        ) : activeNotes.length === 0 ? (
                            <div className="flex-grow flex flex-col items-center justify-center text-center max-w-md mx-auto opacity-50">
                                <FileText size={48} className="mb-4 text-gray-500" />
                                <h3 className="text-lg font-bold mb-2">It's quiet in here...</h3>
                                <p className="text-sm text-gray-400">Click "New Page" to start typing or drawing.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
                                {activeNotes.map(note => (
                                    <div
                                        key={note.id}
                                        onClick={() => setActiveNote(note)}
                                        className="group bg-[var(--color-forge-900)] border border-[var(--color-forge-700)] p-4 rounded-2xl shadow-sm hover:border-[var(--color-forge-accent)] hover:-translate-y-1 transition-all cursor-pointer flex flex-col aspect-square relative overflow-hidden"
                                    >
                                        <h4 className="font-bold text-[var(--color-text-main)] truncate mb-2 pr-6">
                                            {note.title || 'Untitled Note'}
                                        </h4>

                                        {/* Parse tiny preview of HTML text */}
                                        <div
                                            className="text-xs text-gray-400 line-clamp-4 flex-grow prose prose-invert prose-sm"
                                            dangerouslySetInnerHTML={{ __html: note.content || '<i>Empty completely...</i>' }}
                                        />

                                        {/* Canvas Noteit Thumbnail */}
                                        {note.image_url && (
                                            <div className="w-full h-20 bg-black mt-3 rounded-lg flex items-center justify-center overflow-hidden border border-[var(--color-forge-700)] relative">
                                                <img src={note.image_url} alt="Attached Drawing" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute bottom-1 right-1 bg-black/60 p-1 rounded backdrop-blur-sm">
                                                    <ImageIcon size={12} className="text-[var(--color-forge-accent)]" />
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                                            className="absolute top-3 right-3 text-gray-500 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Mobile FAB for Creating Notes (Only visible when activeFolderId is valid and on mobile) */}
                {activeFolderId && (
                    <button
                        onClick={handleCreateNote}
                        className="md:hidden absolute bottom-4 right-4 bg-[var(--color-text-main)] text-[var(--color-forge-900)] p-4 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-10"
                    >
                        <PlusCircle size={24} />
                    </button>
                )}
            </div>

            {/* Fullscreen Editor Modal */}
            <NoteEditor
                activeNote={activeNote}
                onClose={() => setActiveNote(null)}
                onSaveText={updateNoteText}
                onAttachSketch={attachSketchToNote}
            />
        </div>
    )
}
