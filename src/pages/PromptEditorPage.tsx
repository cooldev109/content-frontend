import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { authFetch } from '../api/client';
import './PromptEditorPage.css';

const PROMPT_KEYS = ['moduleGeneration', 'topicIndex', 'topicDevelopment'] as const;
type PromptKey = typeof PROMPT_KEYS[number];

const STORAGE_PREFIX = 'customPrompt_';

const VARIABLES: Record<PromptKey, string> = {
  moduleGeneration: '{{courseTitle}}',
  topicIndex: '{{courseName}}, {{level}}, {{objective}}, {{topicName}}',
  topicDevelopment: '{{courseName}}, {{level}}, {{objective}}, {{topicName}}, {{topicIndex}}',
};

function PromptEditorPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [defaults, setDefaults] = useState<Record<PromptKey, string> | null>(null);
  const [customs, setCustoms] = useState<Record<PromptKey, string | null>>({
    moduleGeneration: null,
    topicIndex: null,
    topicDevelopment: null,
  });
  const [expandedSection, setExpandedSection] = useState<PromptKey | null>('moduleGeneration');
  const [loadError, setLoadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  useEffect(() => {
    // Load defaults and saved custom prompts in parallel
    Promise.all([
      authFetch('/api/prompts/defaults').then((res) => res.json()),
      authFetch('/api/prompts/saved').then((res) => res.json()),
    ])
      .then(([defaultsData, savedData]) => {
        if (defaultsData.success) {
          setDefaults(defaultsData.prompts);
        } else {
          setLoadError(defaultsData.error || 'Failed to load defaults');
        }

        if (savedData.success && savedData.prompts) {
          const saved = savedData.prompts;
          const loadedCustoms: Record<PromptKey, string | null> = {
            moduleGeneration: null,
            topicIndex: null,
            topicDevelopment: null,
          };
          for (const key of PROMPT_KEYS) {
            if (saved[key]) {
              loadedCustoms[key] = saved[key];
              localStorage.setItem(`${STORAGE_PREFIX}${key}`, saved[key]);
            }
          }
          setCustoms(loadedCustoms);
        }
      })
      .catch(() => setLoadError('Failed to connect to server'));
  }, []);

  const handleChange = (key: PromptKey, value: string) => {
    setCustoms((prev) => ({ ...prev, [key]: value }));
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
    setSaveStatus('idle');
  };

  const handleResetDefault = (key: PromptKey) => {
    setCustoms((prev) => ({ ...prev, [key]: null }));
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Build the prompts object: only include custom ones
      const promptsToSave: Record<string, string> = {};
      for (const key of PROMPT_KEYS) {
        if (customs[key] !== null) {
          promptsToSave[key] = customs[key]!;
        }
      }

      const response = await authFetch('/api/prompts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompts: promptsToSave }),
      });

      const data = await response.json();
      if (data.success) {
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const isCustom = (key: PromptKey): boolean => customs[key] !== null;
  const getValue = (key: PromptKey): string => customs[key] ?? defaults?.[key] ?? '';

  const toggleSection = (key: PromptKey) => {
    setExpandedSection(expandedSection === key ? null : key);
  };

  if (!defaults && !loadError) {
    return (
      <div className="prompt-editor-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('promptEditor.loadingDefaults')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prompt-editor-page">
      <button className="btn-back" onClick={() => navigate('/')}>
        &larr; {t('promptEditor.backToWorkflows')}
      </button>

      <div className="editor-header">
        <div className="editor-header-text">
          <h2>{t('promptEditor.pageTitle')}</h2>
          <p>{t('promptEditor.pageDescription')}</p>
        </div>
        <div className="editor-header-actions">
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? t('promptEditor.saving') : t('promptEditor.saveButton')}
          </button>
          {saveStatus === 'saved' && (
            <span className="save-status save-success">{t('promptEditor.savedSuccess')}</span>
          )}
          {saveStatus === 'error' && (
            <span className="save-status save-error">{t('promptEditor.savedError')}</span>
          )}
        </div>
      </div>

      {loadError && <div className="error-message">{loadError}</div>}

      <div className="prompt-sections">
        {PROMPT_KEYS.map((key) => (
          <div key={key} className={`prompt-section ${expandedSection === key ? 'expanded' : ''}`}>
            <div className="prompt-section-header" onClick={() => toggleSection(key)}>
              <div className="prompt-section-info">
                <h3>{t(`promptEditor.${key}`)}</h3>
                <p>{t(`promptEditor.${key}Desc`)}</p>
              </div>
              <div className="prompt-section-meta">
                <span className={`badge ${isCustom(key) ? 'badge-custom' : 'badge-default'}`}>
                  {isCustom(key) ? t('promptEditor.badgeCustom') : t('promptEditor.badgeDefault')}
                </span>
                <span className="expand-icon">{expandedSection === key ? '▲' : '▼'}</span>
              </div>
            </div>

            {expandedSection === key && (
              <div className="prompt-section-body">
                <div className="variables-hint">
                  {t('promptEditor.variablesHint', { variables: VARIABLES[key] })}
                </div>
                <textarea
                  value={getValue(key)}
                  onChange={(e) => handleChange(key, e.target.value)}
                  rows={18}
                  spellCheck={false}
                />
                <div className="prompt-section-actions">
                  <button
                    className="btn-reset-default"
                    onClick={() => handleResetDefault(key)}
                    disabled={!isCustom(key)}
                  >
                    {t('promptEditor.setDefault')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PromptEditorPage;
