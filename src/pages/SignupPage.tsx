import { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { register, setToken } from '../api/client';
import './LoginPage.css';

interface SignupPageProps {
  onSignup: (username: string) => void;
  onSwitchToLogin: () => void;
}

function getPasswordStrength(password: string): { level: number; key: string } {
  if (!password) return { level: 0, key: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 1, key: 'weak' };
  if (score <= 3) return { level: 2, key: 'medium' };
  return { level: 3, key: 'strong' };
}

function SignupPage({ onSignup, onSwitchToLogin }: SignupPageProps) {
  const { language, setLanguage, t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError(t('signup.fillAllFields'));
      return;
    }

    if (username.trim().length < 3) {
      setError(t('signup.usernameTooShort'));
      return;
    }

    if (password.length < 6) {
      setError(t('signup.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('signup.passwordsMismatch'));
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const data = await register(username.trim(), password);
      setToken(data.token);
      localStorage.setItem('user', data.username);
      onSignup(data.username);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || t('signup.registrationFailed'));
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
            <h2>{t('signup.title')}</h2>
            <p>{t('signup.subtitle')}</p>
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
              {password && (
                <>
                  <div className="auth-password-strength">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`auth-strength-bar ${i <= strength.level ? `active ${strength.key}` : ''}`}
                      />
                    ))}
                  </div>
                  <span className={`auth-strength-text ${strength.key}`}>
                    {t(`auth.strength.${strength.key}`)}
                  </span>
                </>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">{t('signup.confirmPasswordLabel')}</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('signup.confirmPasswordPlaceholder')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                >
                  {showConfirm ? (
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
                {isLoading ? t('signup.signingUp') : t('signup.signupButton')}
              </span>
            </button>
          </form>

          <div className="auth-switch">
            {t('signup.alreadyHaveAccount')}{' '}
            <button type="button" className="auth-switch-link" onClick={onSwitchToLogin}>
              {t('signup.goToLogin')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
