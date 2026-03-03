import { useState, useEffect } from 'react';
import { useFlashcards } from '../hooks/useFlashcards';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Plus, Trash2, BookOpen, ChevronRight, X, Play } from 'lucide-react';
import { DeckView } from './DeckView';

export const FlashcardsView = () => {
    const { t } = useLanguage();
    const { applyTheme, currentTheme } = useTheme();
    const { decks, loadingDecks, fetchDecks, createDeck, deleteDeck } = useFlashcards();
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [activeDeck, setActiveDeck] = useState(null);

    useEffect(() => {
        fetchDecks();
    }, [fetchDecks]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (newTitle.trim()) {
            await createDeck(newTitle, newDesc);
            setNewTitle('');
            setNewDesc('');
            setIsCreating(false);
        }
    };

    if (activeDeck) {
        return <DeckView deck={activeDeck} onBack={() => setActiveDeck(null)} />;
    }

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto w-full relative animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-forge-700/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-forge-900 rounded-2xl border border-forge-700/50 shadow-inner text-[var(--color-forge-accent)]">
                        <BookOpen size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">{t('flashcards')}</h1>
                        <p className="text-gray-400 font-medium text-sm">Spaced Repetition Engine</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-[var(--color-text-main)] text-[var(--color-forge-900)] px-5 py-2.5 rounded-full font-bold hover:scale-105 transition-transform shadow-neon"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline-block">{t('createDeck')}</span>
                </button>
            </div>

            {/* Create Deck Inline Form */}
            {isCreating && (
                <div className="bg-forge-900 border border-[var(--color-forge-accent)]/50 rounded-2xl p-6 mb-8 animate-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">New Active Deck</h3>
                        <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleCreate} className="flex flex-col gap-4">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Deck Title (e.g. Biology 101)"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            className="w-full bg-forge-800 border border-forge-700 rounded-xl p-3 text-white placeholder-gray-500 font-bold focus:border-[var(--color-forge-accent)] outline-none transition-colors"
                        />
                        <input
                            type="text"
                            placeholder="Description (Optional)"
                            value={newDesc}
                            onChange={e => setNewDesc(e.target.value)}
                            className="w-full bg-forge-800 border border-forge-700 rounded-xl p-3 text-white placeholder-gray-500 text-sm focus:border-[var(--color-forge-accent)] outline-none transition-colors"
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                type="submit"
                                disabled={!newTitle.trim()}
                                className="bg-[var(--color-forge-accent)] text-white px-6 py-2 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-all"
                            >
                                {t('createDeck')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Decks Grid */}
            {loadingDecks ? (
                <div className="flex justify-center p-12">
                    <div className="animate-pulse w-8 h-8 rounded-full bg-[var(--color-forge-accent)]"></div>
                </div>
            ) : decks.length === 0 && !isCreating ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-forge-700 rounded-3xl">
                    <BookOpen size={48} className="text-forge-800 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Decks Found</h3>
                    <p className="text-gray-400 max-w-md">Create your first flashcard deck to start memorizing terms, formulas, and concepts faster.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                    {decks.map(deck => (
                        <div
                            key={deck.id}
                            className="group relative bg-forge-900 border border-forge-700 rounded-2xl p-6 transition-all hover:border-[var(--color-forge-accent)] hover:shadow-neon cursor-pointer flex flex-col h-[200px]"
                            onClick={() => setActiveDeck(deck)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white line-clamp-2 pr-6">
                                    {deck.title}
                                </h3>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Delete this entire deck and all its cards?')) {
                                            deleteDeck(deck.id);
                                        }
                                    }}
                                    className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 p-2 text-forge-danger hover:bg-forge-danger/20 rounded-lg transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <p className="text-sm text-gray-400 line-clamp-2 mb-auto">
                                {deck.description || 'No description provided.'}
                            </p>

                            <div className="mt-4 pt-4 border-t border-forge-800 flex items-center justify-between text-[var(--color-forge-accent)]">
                                <span className="text-xs font-bold uppercase tracking-wider">{t('studyDeck')}</span>
                                <div className="p-1.5 rounded-full bg-[var(--color-forge-accent)]/10 group-hover:bg-[var(--color-forge-accent)] group-hover:text-white transition-colors">
                                    <Play size={14} className="ml-0.5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
