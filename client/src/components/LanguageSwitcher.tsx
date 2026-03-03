import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'es' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="btn"
            style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                backgroundColor: 'var(--surface-hover)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '600'
            }}
        >
            <span style={{ opacity: i18n.language === 'en' ? 1 : 0.4 }}>EN</span>
            <span style={{ width: '1px', height: '12px', backgroundColor: 'var(--border)' }}></span>
            <span style={{ opacity: i18n.language === 'es' ? 1 : 0.4 }}>ES</span>
        </button>
    );
};

export default LanguageSwitcher;
