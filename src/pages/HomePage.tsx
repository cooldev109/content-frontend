import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startGeneration, validateConfig } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [fileId, setFileId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configStatus, setConfigStatus] = useState<'unchecked' | 'valid' | 'invalid'>('unchecked');

  const checkConfig = async () => {
    try {
      const result = await validateConfig();
      setConfigStatus(result.valid ? 'valid' : 'invalid');
      if (!result.valid) {
        setError(t('home.configInvalid'));
      }
    } catch (err) {
      setConfigStatus('invalid');
      setError(t('home.connectFailed'));
    }
  };

  const handleGenerate = async () => {
    if (!fileId.trim()) {
      setError(t('home.pleaseEnterFileId'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await startGeneration({
        indexFileId: fileId.trim(),
      });

      if (result.success && result.jobId) {
        navigate(`/generate/${result.jobId}`);
      } else {
        throw new Error('Failed to start generation');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <button className="btn-back" onClick={() => navigate('/')}>
        &larr; {t('common.backToWorkflows')}
      </button>

      <div className="config-check">
        {configStatus === 'unchecked' && (
          <button onClick={checkConfig} className="btn-check">
            {t('home.checkBackend')}
          </button>
        )}
        {configStatus === 'valid' && (
          <span className="status-ok">&#10003; {t('home.backendConnected')}</span>
        )}
        {configStatus === 'invalid' && (
          <span className="status-error">&#10007; {t('home.backendError')}</span>
        )}
      </div>

      <div className="input-card">
        <h2>{t('home.enterFileId')}</h2>
        <p className="description">
          {t('home.enterFileIdDesc')}
        </p>

        <div className="form-group">
          <label htmlFor="fileId">{t('home.fileIdLabel')}</label>
          <input
            type="text"
            id="fileId"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            placeholder={t('home.fileIdPlaceholder')}
            disabled={loading}
          />
          <small>
            {t('home.fileIdHint')}<strong>{t('home.fileIdHintBold')}</strong>{t('home.fileIdHintSuffix')}
          </small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          className="btn-generate"
          onClick={handleGenerate}
          disabled={loading || !fileId.trim()}
        >
          {loading ? t('home.starting') : t('home.generateContent')}
        </button>
      </div>

      <div className="info-section">
        <h3>{t('home.howItWorks')}</h3>
        <ol>
          <li>{t('home.step1')}</li>
          <li>{t('home.step2')}</li>
          <li>{t('home.step3')}</li>
          <li>{t('home.step4')}</li>
        </ol>
      </div>
    </div>
  );
}
