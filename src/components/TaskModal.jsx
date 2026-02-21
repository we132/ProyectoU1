import { useState, useRef, useEffect } from 'react'
import { Plus, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export const TaskModal = ({ onSaveTask, initialData = null, isOpen, onClose, onOpenNew }) => {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(false)

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [difficulty, setDifficulty] = useState('medium')
    const [imageFile, setImageFile] = useState(null)

    const fileInputRef = useRef(null)

    // Populate data if we are editing an existing task
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title || '')
                setDescription(initialData.description || '')
                setDifficulty(initialData.difficulty || 'medium')
            } else {
                setTitle('')
                setDescription('')
                setDifficulty('medium')
            }
            setImageFile(null)
        }
    }, [isOpen, initialData])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)

        if (initialData) {
            // Editing
            await onSaveTask(initialData.id, { title, description, difficulty, imageFile, image_url: initialData.image_url })
        } else {
            // Creating
            await onSaveTask(title, description, difficulty, imageFile)
        }

        setLoading(false)
        onClose()
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0])
        }
    }

    return (
        <div className="mb-8">
            {/* Trigger Button - Only show if we aren't being invoked as an "Edit" modal exclusively */}
            {onOpenNew && (
                <div className="flex justify-between items-center bg-[var(--color-forge-800)] p-4 rounded-xl border border-[var(--color-forge-700)] shadow-sm">
                    <h2 className="text-xl font-bold">{t('backlog')} & {t('inProgress')}</h2>
                    <button
                        onClick={onOpenNew}
                        className="flex items-center gap-2 bg-[var(--color-text-main)] text-[var(--color-forge-900)] px-4 py-2 rounded-full font-bold hover:scale-105 transition-transform"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline-block">{t('createTask')}</span>
                    </button>
                </div>
            )}

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[var(--color-forge-800)] border border-[var(--color-forge-700)] w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-[var(--color-text-main)] transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-2xl font-bold mb-6 text-[var(--color-text-main)]">
                            {initialData ? 'Edit Task' : t('createTask')}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-5">

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('taskTitle')} *</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder={t('taskTitlePlaceholder')}
                                    className="w-full bg-[var(--color-forge-900)] border border-[var(--color-forge-700)] rounded-lg px-4 py-3 text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-forge-accent)] transition-colors"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('taskDesc')}</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder={t('taskDescPlaceholder')}
                                    rows="3"
                                    className="w-full bg-[var(--color-forge-900)] border border-[var(--color-forge-700)] rounded-lg px-4 py-3 text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-forge-accent)] transition-colors resize-none"
                                    disabled={loading}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('difficulty')}</label>
                                    <select
                                        value={difficulty}
                                        onChange={e => setDifficulty(e.target.value)}
                                        className="w-full bg-[var(--color-forge-900)] border border-[var(--color-forge-700)] rounded-lg px-4 py-3 text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-forge-accent)] appearance-none cursor-pointer"
                                        disabled={loading}
                                    >
                                        <option value="easy">{t('easy')}</option>
                                        <option value="medium">{t('medium')}</option>
                                        <option value="hard">{t('hard')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('uploadImage')}</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`w-full bg-[var(--color-forge-900)] border border-[var(--color-forge-700)] rounded-lg h-12 flex items-center justify-center gap-2 cursor-pointer hover:border-[var(--color-forge-accent)] transition-colors text-sm ${imageFile ? 'text-[var(--color-forge-accent)]' : 'text-gray-400'}`}
                                    >
                                        {imageFile ? <ImageIcon size={18} /> : <Upload size={18} />}
                                        <span className="truncate max-w-[120px]">
                                            {imageFile ? imageFile.name : initialData?.image_url ? 'Replace Image' : t('uploadImage')}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-[var(--color-forge-700)]">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-full text-gray-400 hover:text-[var(--color-text-main)] hover:bg-[var(--color-forge-700)] font-medium transition-colors"
                                    disabled={loading}
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !title.trim()}
                                    className="px-6 py-2.5 rounded-full bg-[var(--color-forge-accent)] text-white font-medium hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading && <Loader2 size={16} className="animate-spin" />}
                                    {initialData ? 'Update Task' : t('save')}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
