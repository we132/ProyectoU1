import { useState, useRef, useEffect } from 'react';
import { Settings, X, LogOut, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../hooks/useProfile';

export const SettingsModal = ({ isOpen, onClose }) => {
    const { signOut, user } = useAuth();
    const { t } = useLanguage();
    const { applyTheme, currentTheme, presets } = useTheme();
    const { profile } = useProfile();

    if (!isOpen) return null;

    const currentLevel = profile?.level || 1;
    const username = user?.user_metadata?.username || user?.email;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-forge-800 border border-forge-700 w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col sm:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Left Column: Avatar & Profile Info */}
                <div className="w-full sm:w-1/3 bg-forge-900/50 p-8 flex flex-col items-center border-b sm:border-b-0 sm:border-r border-forge-700">
                    <div className="w-24 h-24 rounded-full bg-forge-900 border-2 border-forge-accent p-1 shadow-neon mb-4">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-forge-800 flex items-center justify-center text-forge-accent">
                                <User size={40} />
                            </div>
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-center text-[var(--color-text-main)] mb-1">
                        {username}
                    </h3>
                    <span className="text-sm font-bold text-forge-xp bg-forge-800 px-3 py-1 rounded-full border border-forge-700 mb-6 shadow-neon-xp">
                        LVL {currentLevel}
                    </span>

                    <button
                        onClick={signOut}
                        className="mt-auto w-full py-2 flex items-center justify-center gap-2 text-forge-danger border border-forge-danger/30 rounded-full hover:bg-forge-danger/10 transition-colors text-sm font-medium"
                    >
                        <LogOut size={16} />
                        {t('logout')}
                    </button>
                </div>

                {/* Right Column: Theme Settings */}
                <div className="w-full sm:w-2/3 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Settings className="text-forge-accent" size={24} />
                        <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Aesthetic Engine</h2>
                    </div>

                    <p className="text-sm text-gray-400 mb-6">
                        Select a cinematic theme to override the system colors. This signature is tied to your profile across all devices.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {presets.map(theme => {
                            const isActive = currentTheme?.id === theme.id;

                            return (
                                <button
                                    key={theme.id}
                                    onClick={() => applyTheme(theme)}
                                    className={`relative border rounded-xl overflow-hidden transition-all text-left flex flex-col ${isActive
                                            ? 'border-forge-accent ring-1 ring-forge-accent shadow-neon'
                                            : 'border-forge-700 hover:border-gray-500'
                                        }`}
                                    style={{ backgroundColor: theme.surface }}
                                >
                                    <div className="h-4 w-full" style={{ backgroundColor: theme.accent }}></div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>
                                            {theme.name}
                                        </h4>
                                        <div className="flex gap-2">
                                            <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: theme.bg }}></div>
                                            <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: theme.surface }}></div>
                                            <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: theme.accent }}></div>
                                        </div>
                                    </div>

                                    {isActive && (
                                        <div className="absolute top-2 right-2 text-forge-900 bg-forge-accent rounded-full p-0.5">
                                            <CheckCircle2 size={14} />
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
