import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './FileUploadPage.css';

function FileUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.txt')) {
      setError('Please upload a .txt file');
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
      setError('Failed to read file');
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
      setError('Please upload a file first');
      return;
    }

    setError('');
    setIsParsing(true);

    try {
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:3456/api/modules/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: fileContent,
          courseTitle: courseTitle.trim() || 'Imported Course',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse modules');
      }

      // Navigate to module editor with parsed structure and source info
      navigate('/module-editor', { state: { courseStructure: data.courseStructure, from: 'file-upload' } });
    } catch (err: any) {
      setError(err.message || 'Failed to parse modules');
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
        ← Back to workflows
      </button>

      <div className="upload-card">
        <div className="card-icon">📁</div>
        <h2>Import Module Structure</h2>
        <p className="description">
          Upload a TXT file containing your course module structure
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
                  <span className="file-size">{fileContent.length} characters</span>
                </div>
                <button type="button" className="btn-clear" onClick={clearFile}>
                  ×
                </button>
              </div>
            ) : (
              <div className="drop-content">
                <div className="drop-icon">📤</div>
                <p>Drag & drop your TXT file here</p>
                <span>or click to browse</span>
              </div>
            )}
          </div>

          {fileName && (
            <div className="form-group">
              <label htmlFor="courseTitle">Course Title (optional)</label>
              <input
                type="text"
                id="courseTitle"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="Enter course title or leave empty to auto-detect"
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
                Parsing modules...
              </>
            ) : (
              'Parse & Continue'
            )}
          </button>
        </form>
      </div>

      <div className="format-info">
        <h3>Expected File Format</h3>
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
          Each module should start with "Module N:" followed by the title.
          Description, Topics, Objectives, and Duration fields are optional.
        </p>
      </div>
    </div>
  );
}

export default FileUploadPage;
