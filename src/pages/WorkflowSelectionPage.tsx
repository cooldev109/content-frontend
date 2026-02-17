import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WorkflowSelectionPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3456';

function WorkflowSelectionPage() {
  const navigate = useNavigate();
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
          <span>Checking Google Drive connection...</span>
        )}
        {authStatus === 'authenticated' && (
          <>
            <span className="auth-status-dot connected"></span>
            <span>Google Drive connected</span>
            <button className="btn-logout" onClick={handleLogout}>Disconnect</button>
          </>
        )}
        {authStatus === 'not_authenticated' && !showAuthForm && (
          <>
            <span className="auth-status-dot disconnected"></span>
            <span>Google Drive not connected</span>
            <button className="btn-login" onClick={handleConnect}>Connect Google Drive</button>
          </>
        )}
      </div>

      {/* Auth Code Form */}
      {showAuthForm && authStatus !== 'authenticated' && (
        <div className="auth-form">
          <h3>Connect Google Drive</h3>
          <p className="auth-instructions">
            1. A Google sign-in page has opened in a new tab.<br />
            2. Sign in and approve access.<br />
            3. After approving, copy the <strong>authorization code</strong> from the browser URL bar<br />
            <span className="auth-hint">(The URL will look like: http://localhost/?code=<strong>4/xxx...</strong>&scope=...)</span><br />
            4. Paste only the code value below.
          </p>

          {authUrl && (
            <div className="auth-url-box">
              <span>If the tab didn't open, </span>
              <a href={authUrl} target="_blank" rel="noopener noreferrer">click here to open manually</a>
            </div>
          )}

          <div className="auth-code-input">
            <input
              type="text"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="Paste authorization code here (e.g. 4/1ASc3g...)"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitCode()}
            />
            <button onClick={handleSubmitCode} disabled={isSubmitting || !authCode.trim()}>
              {isSubmitting ? 'Connecting...' : 'Submit'}
            </button>
          </div>

          {authError && <div className="auth-error">{authError}</div>}

          <button className="btn-cancel-auth" onClick={() => setShowAuthForm(false)}>Cancel</button>
        </div>
      )}

      <div className="workflow-header">
        <h2>Select Generation Method</h2>
        <p className="description">Choose how you want to create your course content</p>
      </div>

      <div className="workflow-cards">
        {/* Workflow 1: Google Drive File ID */}
        <div className="workflow-card" onClick={() => navigate('/file-id')}>
          <div className="workflow-icon">📄</div>
          <h3>From Google Doc</h3>
          <p>Use an existing Google Doc with your course index structure</p>
          <ul className="workflow-features">
            <li>Import from Google Drive</li>
            <li>Pre-structured index document</li>
            <li>Direct content generation</li>
          </ul>
          <button className="btn-select">Select</button>
        </div>

        {/* Workflow 2: Course Title */}
        <div className="workflow-card featured" onClick={() => navigate('/title-input')}>
          <div className="workflow-badge">Recommended</div>
          <div className="workflow-icon">✨</div>
          <h3>From Course Title</h3>
          <p>AI generates module structure from your course title</p>
          <ul className="workflow-features">
            <li>AI-powered module generation</li>
            <li>Edit and customize modules</li>
            <li>Export as TXT file</li>
          </ul>
          <button className="btn-select btn-featured">Select</button>
        </div>

        {/* Workflow 3: TXT File Upload */}
        <div className="workflow-card" onClick={() => navigate('/file-upload')}>
          <div className="workflow-icon">📁</div>
          <h3>From TXT File</h3>
          <p>Upload a text file with your module structure</p>
          <ul className="workflow-features">
            <li>Import existing structure</li>
            <li>Batch processing</li>
            <li>Custom format support</li>
          </ul>
          <button className="btn-select">Select</button>
        </div>
      </div>

      <div className="workflow-info">
        <h4>Need help choosing?</h4>
        <p>
          <strong>From Google Doc:</strong> Best if you already have a structured course index in Google Docs.<br />
          <strong>From Course Title:</strong> Best for starting from scratch - AI will help you structure your course.<br />
          <strong>From TXT File:</strong> Best if you have module lists in text format.
        </p>
      </div>
    </div>
  );
}

export default WorkflowSelectionPage;
