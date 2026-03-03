import { useProfile } from '../hooks/useProfile';
import { GACHA_PETS } from './StoreView';
import { Sparkles, Tent } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const PetPlaypen = () => {
    const { profile } = useProfile();
    const { t } = useLanguage();
    const unlockedPetIds = profile?.unlocked_pets || [];

    if (unlockedPetIds.length === 0) return null;

    const unlockedPets = GACHA_PETS.filter(p => unlockedPetIds.includes(p.id));

    return (
        <div className="bg-gradient-to-b from-blue-900/20 to-green-900/40 border border-green-800/50 rounded-3xl p-5 mb-8 relative overflow-hidden shadow-[inset_0_0_20px_rgba(34,197,94,0.1)] w-full">
            <h3 className="text-sm font-bold text-green-400/80 mb-6 flex items-center gap-2 uppercase tracking-widest z-10 relative">
                <Tent size={16} /> My Companions
            </h3>

            <div className="flex flex-wrap gap-4 items-end justify-start min-h-[60px] relative z-10 px-2 pb-2">
                {unlockedPets.map((pet, i) => (
                    <div
                        key={pet.id}
                        className="group relative animate-bounce cursor-pointer flex flex-col items-center"
                        style={{
                            animationDelay: `${i * 1.5}s`,
                            animationDuration: `${2.5 + Math.random()}s`,
                            marginLeft: i === 0 ? '0' : `${Math.random() * 10}px`
                        }}
                    >
                        <div className={`text-4xl filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)] transition-transform hover:scale-125 hover:rotate-6`}>
                            {pet.emoji}
                        </div>
                        {/* Shadow oval underneath */}
                        <div className="w-6 h-1 bg-black/30 rounded-[100%] absolute -bottom-1 blur-[2px]"></div>

                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-forge-900 border border-forge-700 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-20">
                            {pet.name}
                        </div>
                    </div>
                ))}
            </div>

            {/* Environment Art */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-green-900/80 to-transparent z-0"></div>
            <div className="absolute top-4 right-6 text-2xl opacity-20 filter blur-[1px]">☁️</div>
            <div className="absolute top-2 left-1/3 text-xl opacity-10 filter blur-[1px]">☁️</div>
        </div>
    );
};
