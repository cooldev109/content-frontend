import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import './FileUploadPage.css';

function FileUploadPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.txt')) {
      setError(t('fileUpload.pleaseUploadTxt'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      setFileName(file.name);
      setError('');

      // Try to extract course title from first line
      const firstLine = content.split('\n')[0];
      const courseMatch = firstLine.match(/^(?:Course|Curso)\s*[:\-]\s*(.+)$/i);
      if (courseMatch) {
        setCourseTitle(courseMatch[1].trim());
      }
    };
    reader.onerror = () => {
      setError(t('fileUpload.failedReadFile'));
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileContent) {
      setError(t('fileUpload.pleaseUploadFile'));
      return;
    }

    setError('');
    setIsParsing(true);

    try {
      const response = await fetch('/api/modules/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: fileContent,
          courseTitle: courseTitle.trim() || 'Imported Course',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('fileUpload.failedParseModules'));
      }

      // Navigate to module editor with parsed structure and source info
      navigate('/module-editor', { state: { courseStructure: data.courseStructure, from: 'file-upload' } });
    } catch (err: any) {
      setError(err.message || t('fileUpload.failedParseModules'));
    } finally {
      setIsParsing(false);
    }
  };

  const clearFile = () => {
    setFileContent('');
    setFileName('');
    setCourseTitle('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-upload-page">
      <button className="btn-back" onClick={() => navigate('/')}>
        &larr; {t('common.backToWorkflows')}
      </button>

      <div className="upload-card">
        <div className="card-icon">📁</div>
        <h2>{t('fileUpload.importModuleStructure')}</h2>
        <p className="description">
          {t('fileUpload.importDesc')}
        </p>

        <form onSubmit={handleSubmit}>
          <div
            className={`drop-zone ${dragActive ? 'active' : ''} ${fileName ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !fileName && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              hidden
            />

            {fileName ? (
              <div className="file-info">
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <span className="file-name">{fileName}</span>
                  <span className="file-size">{t('fileUpload.characters', { count: fileContent.length })}</span>
                </div>
                <button type="button" className="btn-clear" onClick={clearFile}>
                  &times;
                </button>
              </div>
            ) : (
              <div className="drop-content">
                <div className="drop-icon">📤</div>
                <p>{t('fileUpload.dragAndDrop')}</p>
                <span>{t('fileUpload.orClickBrowse')}</span>
              </div>
            )}
          </div>

          {fileName && (
            <div className="form-group">
              <label htmlFor="courseTitle">{t('fileUpload.courseTitleOptional')}</label>
              <input
                type="text"
                id="courseTitle"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder={t('fileUpload.courseTitlePlaceholder')}
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn-parse"
            disabled={isParsing || !fileContent}
          >
            {isParsing ? (
              <>
                <span className="spinner-inline"></span>
                {t('fileUpload.parsingModules')}
              </>
            ) : (
              t('fileUpload.parseContinue')
            )}
          </button>
        </form>
      </div>

      <div className="format-info">
        <h3>{t('fileUpload.expectedFormat')}</h3>
        <div className="format-example">
          <pre>{`Course: Introduction to Finance

Module 1: Understanding Money
Description: Learn the fundamentals of money management and financial literacy.
Topics: What is money, History of currency, Modern banking
Objectives: Understand basic concepts, Apply knowledge

Module 2: Budgeting Basics
Description: Master the art of creating and maintaining a personal budget.
Topics: Income tracking, Expense categories, Savings goals

Module 3: Investment Fundamentals
Description: Introduction to various investment vehicles and strategies.
Topics: Stocks, Bonds, Mutual funds, Risk assessment`}</pre>
        </div>
        <p className="format-note">
          {t('fileUpload.formatNote')}
        </p>
      </div>
    </div>
  );
}

export default FileUploadPage;
