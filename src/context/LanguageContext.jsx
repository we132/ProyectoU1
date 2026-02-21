import { createContext, useContext, useState, useEffect } from 'react';

// Translations Dictionary
export const translations = {
    es: {
        // Nav
        appTitle: 'The Forge',
        status: 'ESTADO',
        online: 'EN LÍNEA',
        offline: 'DESCONECTADO',
        lvl: 'NIV',
        logout: 'Cerrar sesión',
        // Auth
        loginTitle: 'Iniciar sesión',
        registerTitle: 'Crear cuenta',
        loginSubtitle: 'Accede a tu cuenta para continuar.',
        registerSubtitle: 'Regístrate para comenzar a gestionar tus tareas.',
        emailLabel: 'Correo electrónico',
        passwordLabel: 'Contraseña',
        usernameLabel: 'Nombre de usuario',
        emailPlaceholder: 'usuario@ejemplo.com',
        loginBtn: 'Iniciar sesión',
        registerBtn: 'Registrarse',
        processing: 'Procesando...',
        noAccount: '¿No tienes cuenta?',
        hasAccount: '¿Ya tienes cuenta?',
        switchRegister: 'Regístrate ahora',
        switchLogin: 'Inicia sesión aquí',
        // App & Dashboard
        welcome: 'Bienvenido de nuevo,',
        syncDesc: 'Tus tareas están listas.',
        // Kanban & Tasks
        backlog: 'Por Hacer',
        inProgress: 'En Progreso',
        done: 'Completado',
        noObjectives: 'No hay tareas',
        // Task Input Modal
        createTask: 'Crear nueva tarea',
        taskTitle: 'Título de la tarea',
        taskTitlePlaceholder: 'Ej. Grabar video del proyecto...',
        taskDesc: 'Descripción',
        taskDescPlaceholder: 'Detalles adicionales (opcional)...',
        difficulty: 'Dificultad',
        easy: 'Fácil (+10 XP)',
        medium: 'Normal (+50 XP)',
        hard: 'Difícil (+100 XP)',
        uploadImage: 'Subir miniatura',
        cancel: 'Cancelar',
        save: 'Guardar Tarea'
    },
    en: {
        // Nav
        appTitle: 'The Forge',
        status: 'STATUS',
        online: 'ONLINE',
        offline: 'OFFLINE',
        lvl: 'LVL',
        logout: 'Log out',
        // Auth
        loginTitle: 'Sign In',
        registerTitle: 'Create Account',
        loginSubtitle: 'Access your account to continue.',
        registerSubtitle: 'Sign up to start managing your tasks.',
        emailLabel: 'Email address',
        passwordLabel: 'Password',
        usernameLabel: 'Username',
        emailPlaceholder: 'user@example.com',
        loginBtn: 'Sign In',
        registerBtn: 'Sign Up',
        processing: 'Processing...',
        noAccount: 'Don\'t have an account?',
        hasAccount: 'Already have an account?',
        switchRegister: 'Sign up now',
        switchLogin: 'Sign in here',
        // App & Dashboard
        welcome: 'Welcome back,',
        syncDesc: 'Your workspace is ready.',
        // Kanban & Tasks
        backlog: 'To Do',
        inProgress: 'In Progress',
        done: 'Completed',
        noObjectives: 'No tasks found',
        // Task Input Modal
        createTask: 'Create new task',
        taskTitle: 'Task title',
        taskTitlePlaceholder: 'e.g. Record project video...',
        taskDesc: 'Description',
        taskDescPlaceholder: 'Additional details (optional)...',
        difficulty: 'Difficulty',
        easy: 'Easy (+10 XP)',
        medium: 'Normal (+50 XP)',
        hard: 'Hard (+100 XP)',
        uploadImage: 'Upload thumbnail',
        cancel: 'Cancel',
        save: 'Save Task'
    }
};

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    // Try to load language from localStorage, default to 'es'
    const [lang, setLang] = useState(() => {
        const saved = localStorage.getItem('forge_lang');
        return saved === 'en' ? 'en' : 'es';
    });

    useEffect(() => {
        localStorage.setItem('forge_lang', lang);
    }, [lang]);

    const toggleLanguage = () => {
        setLang(prev => (prev === 'es' ? 'en' : 'es'));
    };

    const t = (key) => {
        return translations[lang][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
