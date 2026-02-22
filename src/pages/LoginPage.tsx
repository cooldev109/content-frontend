import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { login, setToken } from '../api/client';
import './LoginPage.css';

interface LoginPageProps {
  onLogin: (username: string) => void;
  onSwitchToSignup: () => void;
}

function LoginPage({ onLogin, onSwitchToSignup }: LoginPageProps) {
  const { language, setLanguage, t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError(t('login.fillAllFields'));
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const data = await login(username.trim(), password);
      setToken(data.token);
      localStorage.setItem('user', data.username);
      onLogin(data.username);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || t('login.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left: Branding Panel */}
      <div className="auth-branding">
        <div className="auth-branding-content">
          <div className="auth-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h1>{t('app.title')}</h1>
          <p className="auth-branding-tagline">{t('auth.brandTagline')}</p>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="auth-feature-dot" />
              <span>{t('auth.feature1')}</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-dot" />
              <span>{t('auth.feature2')}</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-dot" />
              <span>{t('auth.feature3')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="auth-form-panel">
        <button
          className="auth-lang-toggle"
          onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
        >
          {language === 'en' ? 'ES' : 'EN'}
        </button>

        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>{t('login.title')}</h2>
            <p>{t('login.subtitle')}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="username">{t('login.usernameLabel')}</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('login.usernamePlaceholder')}
                  autoFocus
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">{t('login.passwordLabel')}</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={isLoading}>
              <span>
                {isLoading && <div className="auth-spinner" />}
                {isLoading ? t('login.loggingIn') : t('login.loginButton')}
              </span>
            </button>
          </form>

          <div className="auth-switch">
            {t('login.noAccount')}{' '}
            <button type="button" className="auth-switch-link" onClick={onSwitchToSignup}>
              {t('login.goToSignup')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
