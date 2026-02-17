import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { JobStatus } from '../api/client';
import { getJobStatus } from '../api/client';
import './GenerationPage.css';

export default function GenerationPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const pollStatus = async () => {
      try {
        const status = await getJobStatus(jobId);
        setJob(status);

        if (status.status === 'running') {
          setTimeout(pollStatus, 2000);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to get job status');
      }
    };

    pollStatus();
  }, [jobId]);

  if (error) {
    return (
      <div className="generation-page">
        <div className="error-container">
          <div className="error-icon">!</div>
          <h2>Error</h2>
          <p>{error}</p>
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="generation-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="generation-page">
      {job.status === 'running' && (
        <div className="progress-container">
          <h2>Generating Content...</h2>

          <div className="progress-bar-wrapper">
            <div className="progress-bar" style={{ width: `${job.progress}%` }}></div>
          </div>

          <div className="progress-info">
            <span className="progress-percent">{job.progress}%</span>
            <span className="progress-count">
              {job.completedTopics} / {job.totalTopics} topics
            </span>
          </div>

          {job.currentTopic && (
            <div className="current-task">
              <span className="label">Processing:</span>
              <span className="value">{job.currentTopic}</span>
            </div>
          )}

          <div className="spinner-small"></div>
        </div>
      )}

      {job.status === 'completed' && (
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h2>Generation Complete!</h2>

          <div className="stats">
            <div className="stat">
              <span className="stat-value">{job.totalTopics}</span>
              <span className="stat-label">Topics</span>
            </div>
            <div className="stat">
              <span className="stat-value">{job.totalTopics * 3}</span>
              <span className="stat-label">Documents</span>
            </div>
          </div>

          {job.report?.courseFolderId && (
            <a
              href={`https://drive.google.com/drive/folders/${job.report.courseFolderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-drive"
            >
              Open in Google Drive →
            </a>
          )}

          <button className="btn-new" onClick={() => navigate('/')}>
            Generate Another Course
          </button>
        </div>
      )}

      {job.status === 'failed' && (
        <div className="failed-container">
          <div className="failed-icon">✗</div>
          <h2>Generation Failed</h2>
          {job.error && <p className="error-text">{job.error}</p>}
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Try Again
          </button>
        </div>
      )}

      <div className="job-id">Job ID: {jobId}</div>
    </div>
  );
}
