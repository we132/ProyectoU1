import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useLanguage } from '../context/LanguageContext';
import { Store, Coins, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

const GACHA_PETS = [
    // Common (50%)
    { id: 'pet_doge', name: 'Doge', rarity: 'common', emoji: '🐕', color: 'bg-gray-400' },
    { id: 'pet_popcat', name: 'Pop Cat', rarity: 'common', emoji: '😺', color: 'bg-gray-400' },
    { id: 'pet_capybara', name: 'Capybara', rarity: 'common', emoji: '🦫', color: 'bg-gray-400' },
    // Rare (30%)
    { id: 'pet_cheems', name: 'Cheems', rarity: 'rare', emoji: '🐶', color: 'bg-blue-400' },
    { id: 'pet_frog', name: 'Pepe', rarity: 'rare', emoji: '🐸', color: 'bg-blue-400' },
    // Epic (15%)
    { id: 'pet_cryingcat', name: 'Crying Cat', rarity: 'epic', emoji: '😿', color: 'bg-purple-400' },
    { id: 'pet_floppa', name: 'Floppa', rarity: 'epic', emoji: '🐈', color: 'bg-purple-400' },
    // Legendary (5%)
    { id: 'pet_nyan', name: 'Nyan Cat', rarity: 'legendary', emoji: '🌈', color: 'bg-yellow-400' },
    { id: 'pet_gigachad', name: 'Gigachad', rarity: 'legendary', emoji: '🗿', color: 'bg-yellow-400' },
];

const EGG_COST = 100;

export const StoreView = () => {
    const { t } = useLanguage();
    const { profile, loading, refreshProfile } = useProfile();
    const [isRolling, setIsRolling] = useState(false);
    const [rolledPet, setRolledPet] = useState(null);
    const [rollError, setRollError] = useState('');

    const rollGacha = async () => {
        if (!profile || profile.coins < EGG_COST || isRolling) return;

        setRollError('');
        setIsRolling(true);
        setRolledPet(null);

        // Deduct Coins immediately for UX
        const newTotal = profile.coins - EGG_COST;

        // Let the unboxing animation play out for 2 seconds
        await new Promise(res => setTimeout(res, 2000));

        // RNG Math
        const rand = Math.random() * 100;
        let rarity = 'common';
        if (rand < 5) rarity = 'legendary';
        else if (rand < 20) rarity = 'epic';
        else if (rand < 50) rarity = 'rare';

        const possiblePets = GACHA_PETS.filter(p => p.rarity === rarity);
        const wonPet = possiblePets[Math.floor(Math.random() * possiblePets.length)];

        // Update Database
        const currentPets = profile.unlocked_pets || [];
        const newPets = [...new Set([...currentPets, wonPet.id])]; // Prevent precise duplicates in array, though duplicates just mean wasted coins in gacha

        const { error } = await supabase
            .from('profiles')
            .update({
                coins: newTotal,
                unlocked_pets: newPets
            })
            .eq('id', profile.id);

        if (error) {
            setRollError('Transaction failed. Coins refunded.');
            setRolledPet(null);
        } else {
            setRolledPet(wonPet);
            await refreshProfile(); // Resync state
        }

        setIsRolling(false);
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-forge-accent w-10 h-10" />
            </div>
        );
    }

    const unlockedPetIds = profile?.unlocked_pets || [];

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto w-full animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-forge-700/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-forge-900 rounded-2xl border border-forge-700/50 shadow-inner text-yellow-400">
                        <Store size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">The Armory</h1>
                        <p className="text-gray-400 font-medium text-sm">Gacha & Cosmetics Store</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-forge-900 border border-yellow-500/30 px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                    <Coins size={18} className="text-yellow-400" />
                    <span className="font-bold text-yellow-400 text-lg">{profile?.coins || 0}</span>
                </div>
            </div>

            {/* Gacha Section */}
            <div className="bg-forge-900 border border-forge-700 rounded-3xl p-8 mb-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-forge-accent to-transparent opacity-50"></div>

                <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="text-forge-accent" /> Meme Pet Gacha
                </h2>
                <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                    Spend your hard-earned task coins to unlock rare meme companions. Duplicates are possible!
                </p>

                {rollError && (
                    <div className="text-red-400 text-sm mb-4 font-bold flex justify-center items-center gap-2">
                        <AlertCircle size={16} /> {rollError}
                    </div>
                )}

                <div className="flex flex-col items-center justify-center mb-6 min-h-[160px]">
                    {isRolling ? (
                        <div className="animate-bounce">
                            <div className="text-6xl animate-pulse filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">🥚</div>
                            <p className="mt-4 text-forge-accent font-bold animate-pulse">Unboxing...</p>
                        </div>
                    ) : rolledPet ? (
                        <div className="animate-in zoom-in spin-in-12 duration-700">
                            <div className={`text-6xl p-6 rounded-full inline-block ${rolledPet.color} bg-opacity-20 shadow-[0_0_30px_currentColor] border-2 border-current mb-4`}>
                                {rolledPet.emoji}
                            </div>
                            <h3 className={`text-2xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r ${rolledPet.rarity === 'legendary' ? 'from-yellow-400 to-orange-500' : rolledPet.rarity === 'epic' ? 'from-purple-400 to-pink-500' : rolledPet.rarity === 'rare' ? 'from-blue-400 to-cyan-400' : 'from-gray-300 to-gray-500'}`}>
                                {rolledPet.name}
                            </h3>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">{rolledPet.rarity}</p>
                        </div>
                    ) : (
                        <div className="text-6xl opacity-80 hover:scale-110 transition-transform cursor-pointer drop-shadow-2xl" onClick={rollGacha}>
                            🥚
                        </div>
                    )}
                </div>

                <button
                    onClick={rollGacha}
                    disabled={isRolling || (profile?.coins || 0) < EGG_COST}
                    className="bg-forge-accent hover:bg-forge-accent-hover disabled:bg-forge-800 disabled:text-gray-500 text-white font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2 mx-auto disabled:cursor-not-allowed disabled:shadow-none shadow-[0_0_20px_rgba(255,83,73,0.3)] hover:shadow-[0_0_30px_rgba(255,83,73,0.5)] transform hover:-translate-y-1"
                >
                    <Coins size={18} /> Buy Egg (-{EGG_COST} Coins)
                </button>
            </div>

            {/* Pet Inventory */}
            <div>
                <h3 className="text-xl font-bold text-white mb-6 border-b border-forge-800 pb-2">Your Companions</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {GACHA_PETS.map(pet => {
                        const isUnlocked = unlockedPetIds.includes(pet.id);
                        return (
                            <div
                                key={pet.id}
                                className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${isUnlocked ? 'bg-forge-900 border-forge-700 hover:border-current hover:bg-opacity-50 cursor-pointer shadow-sm' : 'bg-forge-[950] border-transparent opacity-40 grayscale'}`}
                                style={{ color: isUnlocked ? (pet.rarity === 'legendary' ? '#eab308' : pet.rarity === 'epic' ? '#a855f7' : pet.rarity === 'rare' ? '#3b82f6' : '#9ca3af') : undefined }}
                            >
                                <div className="text-3xl mb-2 filter drop-shadow-md">
                                    {isUnlocked ? pet.emoji : '❓'}
                                </div>
                                <span className="text-[10px] font-bold text-center text-white truncate w-full">
                                    {isUnlocked ? pet.name : 'Unknown'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
