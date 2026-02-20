import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import './TitleInputPage.css';

function TitleInputPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [courseTitle, setCourseTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseTitle.trim()) {
      setError(t('titleInput.pleaseEnterTitle'));
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/modules/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseTitle: courseTitle.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('titleInput.failedGenerate'));
      }

      // Navigate to module editor with generated structure
      navigate('/module-editor', { state: { courseStructure: data.courseStructure } });
    } catch (err: any) {
      setError(err.message || t('titleInput.failedGenerate'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="title-input-page">
      <button className="btn-back" onClick={() => navigate('/')}>
        &larr; {t('common.backToWorkflows')}
      </button>

      <div className="input-card">
        <div className="card-icon">✨</div>
        <h2>{t('titleInput.generateStructure')}</h2>
        <p className="description">
          {t('titleInput.generateStructureDesc')}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="courseTitle">{t('titleInput.courseTitleLabel')}</label>
            <input
              type="text"
              id="courseTitle"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder={t('titleInput.courseTitlePlaceholder')}
              disabled={isGenerating}
              autoFocus
            />
            <small>{t('titleInput.courseTitleHint')}</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-generate" disabled={isGenerating || !courseTitle.trim()}>
            {isGenerating ? (
              <>
                <span className="spinner-inline"></span>
                {t('titleInput.generatingModules')}
              </>
            ) : (
              t('titleInput.generateModuleStructure')
            )}
          </button>
        </form>

        <div className="examples">
          <h4>{t('titleInput.examplesTitle')}</h4>
          <ul>
            <li onClick={() => setCourseTitle(t('titleInput.example1'))}>
              {t('titleInput.example1')}
            </li>
            <li onClick={() => setCourseTitle(t('titleInput.example2'))}>
              {t('titleInput.example2')}
            </li>
            <li onClick={() => setCourseTitle(t('titleInput.example3'))}>
              {t('titleInput.example3')}
            </li>
          </ul>
        </div>
      </div>

      <div className="info-section">
        <h3>{t('titleInput.whatHappensNext')}</h3>
        <ol>
          <li>{t('titleInput.nextStep1')}</li>
          <li>{t('titleInput.nextStep2')}</li>
          <li>{t('titleInput.nextStep3')}</li>
          <li>{t('titleInput.nextStep4')}</li>
        </ol>
      </div>
    </div>
  );
}

export default TitleInputPage;
