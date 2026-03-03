import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export const useFlashcards = (workspaceId) => {
    const { user } = useAuth();
    const [decks, setDecks] = useState([]);
    const [cards, setCards] = useState([]);
    const [loadingDecks, setLoadingDecks] = useState(false);
    const [loadingCards, setLoadingCards] = useState(false);

    // Fetch all decks for the user
    const fetchDecks = useCallback(async () => {
        if (!user) return;
        setLoadingDecks(true);
        try {
            let query = supabase
                .from('flashcard_decks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (workspaceId) {
                query = query.eq('workspace_id', workspaceId)
            } else {
                query = query.is('workspace_id', null)
            }

            const { data, error } = await query;

            if (error) throw error;
            setDecks(data);
        } catch (error) {
            console.error('Error fetching decks:', error);
        } finally {
            setLoadingDecks(false);
        }
    }, [user]);

    // Fetch cards for a specific deck
    const fetchCards = useCallback(async (deckId) => {
        if (!user || !deckId) return;
        setLoadingCards(true);
        try {
            const { data, error } = await supabase
                .from('flashcards')
                .select('*')
                .eq('deck_id', deckId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setCards(data);
            return data;
        } catch (error) {
            console.error('Error fetching cards:', error);
            return [];
        } finally {
            setLoadingCards(false);
        }
    }, [user]);

    // Create Deck
    const createDeck = async (title, description) => {
        if (!user || !title.trim()) return null;
        try {
            const { data, error } = await supabase
                .from('flashcard_decks')
                .insert([{ user_id: user.id, workspace_id: workspaceId || null, title: title.trim(), description: description?.trim() }])
                .select()
                .single();

            if (error) throw error;
            setDecks(prev => [data, ...prev]);
            return data;
        } catch (error) {
            console.error('Error creating deck:', error);
            return null;
        }
    };

    // Delete Deck
    const deleteDeck = async (deckId) => {
        if (!user) return false;
        try {
            const { error } = await supabase
                .from('flashcard_decks')
                .delete()
                .eq('id', deckId);

            if (error) throw error;
            setDecks(prev => prev.filter(d => d.id !== deckId));
            return true;
        } catch (error) {
            console.error('Error deleting deck:', error);
            return false;
        }
    };

    // Create Card
    const createCard = async (deckId, front, back) => {
        if (!user || !front.trim() || !back.trim()) return null;
        try {
            const { data, error } = await supabase
                .from('flashcards')
                .insert([{ deck_id: deckId, front_content: front.trim(), back_content: back.trim() }])
                .select()
                .single();

            if (error) throw error;
            setCards(prev => [...prev, data]);
            return data;
        } catch (error) {
            console.error('Error creating card:', error);
            return null;
        }
    };

    // Delete Card
    const deleteCard = async (cardId) => {
        if (!user) return false;
        try {
            const { error } = await supabase
                .from('flashcards')
                .delete()
                .eq('id', cardId);

            if (error) throw error;
            setCards(prev => prev.filter(c => c.id !== cardId));
            return true;
        } catch (error) {
            console.error('Error deleting card:', error);
            return false;
        }
    };

    return {
        decks,
        cards,
        loadingDecks,
        loadingCards,
        fetchDecks,
        fetchCards,
        createDeck,
        deleteDeck,
        createCard,
        deleteCard
    };
};
