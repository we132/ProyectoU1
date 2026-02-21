import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';

export const THEME_PRESETS = [
    {
        id: 'default',
        name: 'Streaming (Default)',
        bg: '#0f0f0f',
        surface: '#1a1a1a',
        border: '#272727',
        accent: '#ff0000',
        xp: '#3ea6ff',
        danger: '#ea3323',
        text: '#ffffff'
    },
    {
        id: 'matrix',
        name: 'The Matrix (Hacker)',
        bg: '#000000',
        surface: '#001a00',
        border: '#003300',
        accent: '#00ff00',
        xp: '#00cc00',
        danger: '#ff0000',
        text: '#00ff00'
    },
    {
        id: 'oppenheimer',
        name: 'Film Noir (Oppenheimer)',
        bg: '#111111',
        surface: '#1e1e1e',
        border: '#333333',
        accent: '#b85e00', // Explosion Orange
        xp: '#8c8c8c',
        danger: '#cc0000',
        text: '#dfdfdf'
    },
    {
        id: 'synthwave',
        name: 'Retro 80s (Stranger Things)',
        bg: '#090514', // Deep purple night
        surface: '#150a2b',
        border: '#28114f',
        accent: '#ff0055', // Neon Pink
        xp: '#00e5ff', // Cyan
        danger: '#ff3300',
        text: '#ffe6f2'
    }
];

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const { user } = useAuth();
    const [currentTheme, setCurrentTheme] = useState(THEME_PRESETS[0]);
    const [loadingTheme, setLoadingTheme] = useState(true);

    // Apply CSS Variables to Root Document
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--color-forge-900', currentTheme.bg);
        root.style.setProperty('--color-forge-800', currentTheme.surface);
        root.style.setProperty('--color-forge-700', currentTheme.border);
        root.style.setProperty('--color-forge-accent', currentTheme.accent);
        // Darken accent for hover
        root.style.setProperty('--color-forge-accent-hover', currentTheme.accent + 'cc');
        root.style.setProperty('--color-forge-xp', currentTheme.xp);
        root.style.setProperty('--color-forge-danger', currentTheme.danger);
        root.style.setProperty('--color-text-main', currentTheme.text);
    }, [currentTheme]);

    // Fetch Theme from Profile
    useEffect(() => {
        const fetchTheme = async () => {
            if (!user) {
                setLoadingTheme(false);
                return;
            }
            const { data, error } = await supabase
                .from('profiles')
                .select('theme_prefs')
                .eq('id', user.id)
                .single();

            if (!error && data?.theme_prefs) {
                setCurrentTheme(data.theme_prefs);
            }
            setLoadingTheme(false);
        };

        fetchTheme();
    }, [user]);

    // Update Theme both locally and in DB
    const applyTheme = async (themeObj) => {
        setCurrentTheme(themeObj);
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update({ theme_prefs: themeObj })
            .eq('id', user.id);

        if (error) console.error("Error saving theme to Supabase:", error);
    };

    return (
        <ThemeContext.Provider value={{ currentTheme, applyTheme, presets: THEME_PRESETS, loadingTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
