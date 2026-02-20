import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import './WorkflowSelectionPage.css';

const API_URL = import.meta.env.VITE_API_URL || '';

function WorkflowSelectionPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'not_authenticated'>('checking');
  const [authUrl, setAuthUrl] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/status`);
      const data = await response.json();
      setAuthStatus(data.authenticated ? 'authenticated' : 'not_authenticated');
    } catch {
      setAuthStatus('not_authenticated');
    }
  };

  const handleConnect = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/url`);
      const data = await response.json();
      setAuthUrl(data.url);
      setShowAuthForm(true);
      setAuthError('');
      setAuthCode('');
      // Open Google auth page in new tab
      window.open(data.url, '_blank');
    } catch {
      setAuthError('Failed to get authorization URL');
    }
  };

  const handleSubmitCode = async () => {
    if (!authCode.trim()) return;

    setIsSubmitting(true);
    setAuthError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: authCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      setAuthStatus('authenticated');
      setShowAuthForm(false);
      setAuthCode('');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to authenticate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, { method: 'POST' });
      setAuthStatus('not_authenticated');
      setShowAuthForm(false);
    } catch { /* ignore */ }
  };

  return (
    <div className="workflow-selection-page">
      {/* Auth Status Banner */}
      <div className={`auth-banner ${authStatus}`}>
        {authStatus === 'checking' && (
          <span>{t('workflowSelection.checkingConnection')}</span>
        )}
        {authStatus === 'authenticated' && (
          <>
            <span className="auth-status-dot connected"></span>
            <span>{t('workflowSelection.driveConnected')}</span>
            <button className="btn-logout" onClick={handleLogout}>{t('workflowSelection.disconnect')}</button>
          </>
        )}
        {authStatus === 'not_authenticated' && !showAuthForm && (
          <>
            <span className="auth-status-dot disconnected"></span>
            <span>{t('workflowSelection.driveNotConnected')}</span>
            <button className="btn-login" onClick={handleConnect}>{t('workflowSelection.connectDrive')}</button>
          </>
        )}
      </div>

      {/* Auth Code Form */}
      {showAuthForm && authStatus !== 'authenticated' && (
        <div className="auth-form">
          <h3>{t('workflowSelection.connectDrive')}</h3>
          <p className="auth-instructions">
            {t('workflowSelection.authStep1')}<br />
            {t('workflowSelection.authStep2')}<br />
            {t('workflowSelection.authStep3')}<br />
            <span className="auth-hint">{t('workflowSelection.authStep3Hint')}</span><br />
            {t('workflowSelection.authStep4')}
          </p>

          {authUrl && (
            <div className="auth-url-box">
              <span>{t('workflowSelection.tabNotOpen')} </span>
              <a href={authUrl} target="_blank" rel="noopener noreferrer">{t('workflowSelection.clickHereManual')}</a>
            </div>
          )}

          <div className="auth-code-input">
            <input
              type="text"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder={t('workflowSelection.pasteCodePlaceholder')}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitCode()}
            />
            <button onClick={handleSubmitCode} disabled={isSubmitting || !authCode.trim()}>
              {isSubmitting ? t('workflowSelection.connecting') : t('workflowSelection.submit')}
            </button>
          </div>

          {authError && <div className="auth-error">{authError}</div>}

          <button className="btn-cancel-auth" onClick={() => setShowAuthForm(false)}>{t('workflowSelection.cancel')}</button>
        </div>
      )}

      <div className="workflow-header">
        <h2>{t('workflowSelection.selectMethod')}</h2>
        <p className="description">{t('workflowSelection.selectMethodDesc')}</p>
      </div>

      <div className="workflow-cards">
        {/* Workflow 1: Google Drive File ID */}
        <div className="workflow-card" onClick={() => navigate('/file-id')}>
          <div className="workflow-icon">📄</div>
          <h3>{t('workflowSelection.fromGoogleDoc')}</h3>
          <p>{t('workflowSelection.fromGoogleDocDesc')}</p>
          <ul className="workflow-features">
            <li>{t('workflowSelection.importFromDrive')}</li>
            <li>{t('workflowSelection.preStructured')}</li>
            <li>{t('workflowSelection.directGeneration')}</li>
          </ul>
          <button className="btn-select">{t('common.select')}</button>
        </div>

        {/* Workflow 2: Course Title */}
        <div className="workflow-card featured" onClick={() => navigate('/title-input')}>
          <div className="workflow-badge">{t('workflowSelection.recommended')}</div>
          <div className="workflow-icon">✨</div>
          <h3>{t('workflowSelection.fromCourseTitle')}</h3>
          <p>{t('workflowSelection.fromCourseTitleDesc')}</p>
          <ul className="workflow-features">
            <li>{t('workflowSelection.aiPoweredGeneration')}</li>
            <li>{t('workflowSelection.editCustomize')}</li>
            <li>{t('workflowSelection.exportAsTxt')}</li>
          </ul>
          <button className="btn-select btn-featured">{t('common.select')}</button>
        </div>

        {/* Workflow 3: TXT File Upload */}
        <div className="workflow-card" onClick={() => navigate('/file-upload')}>
          <div className="workflow-icon">📁</div>
          <h3>{t('workflowSelection.fromTxtFile')}</h3>
          <p>{t('workflowSelection.fromTxtFileDesc')}</p>
          <ul className="workflow-features">
            <li>{t('workflowSelection.importExisting')}</li>
            <li>{t('workflowSelection.batchProcessing')}</li>
            <li>{t('workflowSelection.customFormat')}</li>
          </ul>
          <button className="btn-select">{t('common.select')}</button>
        </div>
      </div>

      <div className="workflow-info">
        <h4>{t('workflowSelection.needHelp')}</h4>
        <p>
          <strong>{t('workflowSelection.fromGoogleDoc')}:</strong> {t('workflowSelection.helpGoogleDoc')}<br />
          <strong>{t('workflowSelection.fromCourseTitle')}:</strong> {t('workflowSelection.helpCourseTitle')}<br />
          <strong>{t('workflowSelection.fromTxtFile')}:</strong> {t('workflowSelection.helpTxtFile')}
        </p>
      </div>
    </div>
  );
}

export default WorkflowSelectionPage;
