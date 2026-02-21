import { useState, useEffect } from 'react';
import { PackageOpen, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const AVATAR_POOLS = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=Alpha&backgroundColor=1a1a1a',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Beta&backgroundColor=0f0f0f',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Gamma&backgroundColor=272727',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Delta&backgroundColor=ff0000',
    'https://api.dicebear.com/7.x/micah/svg?seed=Felix&backgroundColor=ea3323',
    'https://api.dicebear.com/7.x/micah/svg?seed=Aneka&backgroundColor=3ea6ff',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Destiny&backgroundColor=111111',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack&backgroundColor=00ff00'
];

export const LootboxModal = ({ isOpen, newLevel, onClose, onEquip }) => {
    const { t } = useLanguage();
    const [phase, setPhase] = useState('closed'); // 'closed', 'opening', 'opened'
    const [reward, setReward] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setPhase('closed');
            // Pick a random avatar
            const randomAvatar = AVATAR_POOLS[Math.floor(Math.random() * AVATAR_POOLS.length)];
            setReward(randomAvatar);

            // Auto-trigger opening animation
            const timer = setTimeout(() => {
                setPhase('opening');
                setTimeout(() => setPhase('opened'), 1500);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/95 z-[70] flex flex-col items-center justify-center p-4 animate-in fade-in duration-300 backdrop-blur-md">

            <h2 className="text-3xl md:text-5xl font-bold tracking-widest text-[#dfdfdf] uppercase mb-12 text-center drop-shadow-[0_0_15px_var(--color-forge-xp)]">
                LEVEL UP! <span className="text-forge-xp">{newLevel}</span>
            </h2>

            <div className="relative w-64 h-64 flex items-center justify-center">

                {/* Phase 1 & 2: Closed / Opening Box */}
                {phase !== 'opened' && (
                    <div className={`text-forge-accent transition-all duration-1000 ${phase === 'opening' ? 'scale-150 animate-pulse drop-shadow-[0_0_50px_var(--color-forge-accent)]' : 'scale-100 animate-bounce drop-shadow-neon'}`}>
                        <PackageOpen size={120} />
                    </div>
                )}

                {/* Phase 3: The Drop */}
                {phase === 'opened' && reward && (
                    <div className="animate-in zoom-in-50 spin-in-12 duration-700 flex flex-col items-center">
                        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full"></div>
                        <div className="relative z-10 w-48 h-48 rounded-2xl bg-forge-800 border-4 border-forge-xp shadow-[0_0_40px_var(--color-forge-xp)] p-2 mb-6">
                            <img src={reward} alt="New Avatar" className="w-full h-full object-cover rounded-xl" />
                        </div>

                        <div className="flex items-center gap-2 text-forge-xp font-bold text-xl uppercase tracking-widest drop-shadow-neon-xp mb-8">
                            <Sparkles /> New Avatar Unlocked <Sparkles />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 rounded-full border border-forge-700 text-gray-300 hover:bg-forge-800 hover:text-white transition-colors"
                            >
                                Keep Old
                            </button>
                            <button
                                onClick={() => {
                                    onEquip(reward);
                                    onClose();
                                }}
                                className="px-8 py-3 rounded-full bg-forge-xp text-forge-900 font-bold shadow-[0_0_20px_var(--color-forge-xp)] hover:scale-105 transition-transform"
                            >
                                Equip Now
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
