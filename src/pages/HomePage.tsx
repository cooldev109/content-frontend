import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startGeneration, validateConfig } from '../api/client';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [fileId, setFileId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configStatus, setConfigStatus] = useState<'unchecked' | 'valid' | 'invalid'>('unchecked');

  const checkConfig = async () => {
    try {
      const result = await validateConfig();
      setConfigStatus(result.valid ? 'valid' : 'invalid');
      if (!result.valid) {
        setError('Backend configuration is invalid. Please check your .env file.');
      }
    } catch (err) {
      setConfigStatus('invalid');
      setError('Failed to connect to backend server. Is it running on port 3456?');
    }
  };

  const handleGenerate = async () => {
    if (!fileId.trim()) {
      setError('Please enter a Google Drive File ID');
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
        ← Back to workflows
      </button>

      <div className="config-check">
        {configStatus === 'unchecked' && (
          <button onClick={checkConfig} className="btn-check">
            Check Backend Connection
          </button>
        )}
        {configStatus === 'valid' && (
          <span className="status-ok">✓ Backend Connected</span>
        )}
        {configStatus === 'invalid' && (
          <span className="status-error">✗ Backend Error</span>
        )}
      </div>

      <div className="input-card">
        <h2>Enter Google Drive File ID</h2>
        <p className="description">
          Enter the File ID of your course index document (Word doc or Google Doc)
        </p>

        <div className="form-group">
          <label htmlFor="fileId">File ID</label>
          <input
            type="text"
            id="fileId"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            placeholder="e.g., 1FhKtocKQ2TUd-nhO6IYWJwrRIsqjVBVj"
            disabled={loading}
          />
          <small>
            Find the ID in the URL: drive.google.com/file/d/<strong>[FILE_ID]</strong>/view
          </small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          className="btn-generate"
          onClick={handleGenerate}
          disabled={loading || !fileId.trim()}
        >
          {loading ? 'Starting...' : 'Generate Course Content'}
        </button>
      </div>

      <div className="info-section">
        <h3>How it works</h3>
        <ol>
          <li>Enter the Google Drive File ID of your course index</li>
          <li>The system reads and parses the document</li>
          <li>Content is generated for each topic using AI</li>
          <li>Results are saved to Google Drive</li>
        </ol>
      </div>
    </div>
  );
}
