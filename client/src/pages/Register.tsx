import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register({ name, email, password });
            navigate('/');
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            const errorMessage = axiosError.response?.data?.message || (err instanceof Error ? err.message : t('auth.registration_failed'));
            setError(errorMessage);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="card" style={{ padding: '2rem', width: '100%', maxWidth: '400px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{t('auth.register')}</h2>
                {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('auth.name')}</label>
                        <input
                            type="text"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('auth.email')}</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('auth.password')}</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{t('auth.register')}</button>
                </form>
                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    {t('auth.have_account')} <Link to="/login" style={{ color: 'var(--primary)' }}>{t('auth.login')}</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
