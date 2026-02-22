import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { register, setToken } from '../api/client';
import './LoginPage.css';

interface SignupPageProps {
  onSignup: (username: string) => void;
  onSwitchToLogin: () => void;
}

function SignupPage({ onSignup, onSwitchToLogin }: SignupPageProps) {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h2>{t('signup.title')}</h2>
          <p>{t('signup.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">{t('login.usernameLabel')}</label>
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

          <div className="form-group">
            <label htmlFor="password">{t('login.passwordLabel')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.passwordPlaceholder')}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('signup.confirmPasswordLabel')}</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('signup.confirmPasswordPlaceholder')}
              disabled={isLoading}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? t('signup.signingUp') : t('signup.signupButton')}
          </button>
        </form>

        <div className="auth-switch">
          {t('signup.alreadyHaveAccount')}{' '}
          <button type="button" className="btn-link" onClick={onSwitchToLogin}>
            {t('signup.goToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
