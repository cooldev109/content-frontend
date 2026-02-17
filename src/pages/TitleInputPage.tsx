import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TitleInputPage.css';

function TitleInputPage() {
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseTitle.trim()) {
      setError('Please enter a course title');
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:3456/api/modules/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseTitle: courseTitle.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate modules');
      }

      // Navigate to module editor with generated structure
      navigate('/module-editor', { state: { courseStructure: data.courseStructure } });
    } catch (err: any) {
      setError(err.message || 'Failed to generate modules');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="title-input-page">
      <button className="btn-back" onClick={() => navigate('/')}>
        ← Back to workflows
      </button>

      <div className="input-card">
        <div className="card-icon">✨</div>
        <h2>Generate Course Structure</h2>
        <p className="description">
          Enter your course title and AI will generate a complete module structure for you
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="courseTitle">Course Title</label>
            <input
              type="text"
              id="courseTitle"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="e.g., Introduction to Personal Finance"
              disabled={isGenerating}
              autoFocus
            />
            <small>Be specific - include the topic, level, or target audience if relevant</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-generate" disabled={isGenerating || !courseTitle.trim()}>
            {isGenerating ? (
              <>
                <span className="spinner-inline"></span>
                Generating modules...
              </>
            ) : (
              'Generate Module Structure'
            )}
          </button>
        </form>

        <div className="examples">
          <h4>Examples of good course titles:</h4>
          <ul>
            <li onClick={() => setCourseTitle('Fundamentos de Inversión en Bolsa para Principiantes')}>
              Fundamentos de Inversión en Bolsa para Principiantes
            </li>
            <li onClick={() => setCourseTitle('Marketing Digital: De Cero a Experto')}>
              Marketing Digital: De Cero a Experto
            </li>
            <li onClick={() => setCourseTitle('Programación en Python para Análisis de Datos')}>
              Programación en Python para Análisis de Datos
            </li>
          </ul>
        </div>
      </div>

      <div className="info-section">
        <h3>What happens next?</h3>
        <ol>
          <li>AI analyzes your course title and generates a module structure</li>
          <li>You can review, edit, and customize the generated modules</li>
          <li>Export the structure as a TXT file for future use</li>
          <li>Generate the full course content and save to Google Drive</li>
        </ol>
      </div>
    </div>
  );
}

export default TitleInputPage;
