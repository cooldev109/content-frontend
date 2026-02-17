import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ModuleEditorPage.css';

interface Module {
  number: number;
  title: string;
  description: string;
  objectives: string[];
  topics: string[];
  estimatedDuration: string;
}

interface CourseStructure {
  courseTitle: string;
  courseDescription: string;
  targetAudience: string;
  prerequisites: string;
  estimatedDuration: string;
  modules: Module[];
  learningOutcomes: string[];
}

function ModuleEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [courseStructure, setCourseStructure] = useState<CourseStructure | null>(null);
  const [editingModule, setEditingModule] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [sourceFlow, setSourceFlow] = useState<'title-input' | 'file-upload'>('title-input');

  useEffect(() => {
    const state = location.state as { courseStructure?: CourseStructure; from?: string } | null;
    if (state?.courseStructure) {
      setCourseStructure(state.courseStructure);
      // Track where user came from
      if (state.from === 'file-upload') {
        setSourceFlow('file-upload');
      }
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  const updateModule = (index: number, field: keyof Module, value: any) => {
    if (!courseStructure) return;

    const updatedModules = [...courseStructure.modules];
    updatedModules[index] = { ...updatedModules[index], [field]: value };
    setCourseStructure({ ...courseStructure, modules: updatedModules });
  };

  const addModule = () => {
    if (!courseStructure) return;

    const newModule: Module = {
      number: courseStructure.modules.length + 1,
      title: 'New Module',
      description: 'Module description',
      objectives: ['Learning objective'],
      topics: ['Topic 1'],
      estimatedDuration: '1-2 hours',
    };

    setCourseStructure({
      ...courseStructure,
      modules: [...courseStructure.modules, newModule],
    });
    setEditingModule(courseStructure.modules.length);
  };

  const deleteModule = (index: number) => {
    if (!courseStructure || courseStructure.modules.length <= 1) return;

    const updatedModules = courseStructure.modules
      .filter((_, i) => i !== index)
      .map((mod, i) => ({ ...mod, number: i + 1 }));

    setCourseStructure({ ...courseStructure, modules: updatedModules });
    setEditingModule(null);
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    if (!courseStructure) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= courseStructure.modules.length) return;

    const updatedModules = [...courseStructure.modules];
    [updatedModules[index], updatedModules[newIndex]] = [updatedModules[newIndex], updatedModules[index]];

    // Renumber modules
    updatedModules.forEach((mod, i) => (mod.number = i + 1));

    setCourseStructure({ ...courseStructure, modules: updatedModules });
    setEditingModule(newIndex);
  };

  const exportToTxt = () => {
    if (!courseStructure) return;

    let content = `Course: ${courseStructure.courseTitle}\n`;
    content += `Description: ${courseStructure.courseDescription}\n\n`;
    content += `===========================================\n\n`;

    courseStructure.modules.forEach((mod) => {
      content += `Module ${mod.number}: ${mod.title}\n`;
      content += `Description: ${mod.description}\n`;
      if (mod.objectives.length > 0) {
        content += `Objectives: ${mod.objectives.join(', ')}\n`;
      }
      if (mod.topics.length > 0) {
        content += `Topics: ${mod.topics.join(', ')}\n`;
      }
      content += `Duration: ${mod.estimatedDuration}\n`;
      content += `\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${courseStructure.courseTitle.replace(/[^a-z0-9]/gi, '_')}_modules.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateContent = async () => {
    if (!courseStructure) return;

    setError('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/modules/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseStructure }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start generation');
      }

      // Navigate to generation progress page
      navigate(`/generate/${data.jobId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start generation');
      setIsGenerating(false);
    }
  };

  if (!courseStructure) {
    return (
      <div className="module-editor-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (sourceFlow === 'file-upload') {
      navigate('/file-upload');
    } else {
      navigate('/title-input');
    }
  };

  return (
    <div className="module-editor-page">
      <button className="btn-back" onClick={handleBack}>
        ← Back to {sourceFlow === 'file-upload' ? 'file upload' : 'title input'}
      </button>

      <div className="editor-header">
        <div className="course-info">
          <h2>{courseStructure.courseTitle}</h2>
          <p>{courseStructure.courseDescription}</p>
          <div className="course-meta">
            <span>Target: {courseStructure.targetAudience}</span>
            <span>Duration: {courseStructure.estimatedDuration}</span>
            <span>{courseStructure.modules.length} modules</span>
          </div>
        </div>

        <div className="editor-actions">
          <button className="btn-export" onClick={exportToTxt}>
            Export TXT
          </button>
          <button className="btn-add" onClick={addModule}>
            + Add Module
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="modules-list">
        {courseStructure.modules.map((module, index) => (
          <div
            key={module.number}
            className={`module-card ${editingModule === index ? 'editing' : ''}`}
          >
            <div className="module-header">
              <div className="module-number">Module {module.number}</div>
              <div className="module-actions">
                <button
                  className="btn-icon"
                  onClick={() => moveModule(index, 'up')}
                  disabled={index === 0}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  className="btn-icon"
                  onClick={() => moveModule(index, 'down')}
                  disabled={index === courseStructure.modules.length - 1}
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  className="btn-icon btn-edit"
                  onClick={() => setEditingModule(editingModule === index ? null : index)}
                  title={editingModule === index ? 'Close' : 'Edit'}
                >
                  {editingModule === index ? '✓' : '✎'}
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => deleteModule(index)}
                  disabled={courseStructure.modules.length <= 1}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            </div>

            {editingModule === index ? (
              <div className="module-edit-form">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={module.title}
                    onChange={(e) => updateModule(index, 'title', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={module.description}
                    onChange={(e) => updateModule(index, 'description', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Topics (comma separated)</label>
                  <input
                    type="text"
                    value={module.topics.join(', ')}
                    onChange={(e) =>
                      updateModule(
                        index,
                        'topics',
                        e.target.value.split(',').map((t) => t.trim()).filter((t) => t)
                      )
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Objectives (comma separated)</label>
                  <input
                    type="text"
                    value={module.objectives.join(', ')}
                    onChange={(e) =>
                      updateModule(
                        index,
                        'objectives',
                        e.target.value.split(',').map((o) => o.trim()).filter((o) => o)
                      )
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Estimated Duration</label>
                  <input
                    type="text"
                    value={module.estimatedDuration}
                    onChange={(e) => updateModule(index, 'estimatedDuration', e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="module-content">
                <h3>{module.title}</h3>
                <p className="module-description">{module.description}</p>
                {module.topics.length > 0 && (
                  <div className="module-topics">
                    <strong>Topics:</strong> {module.topics.join(' • ')}
                  </div>
                )}
                <div className="module-duration">{module.estimatedDuration}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="generate-section">
        <button
          className="btn-generate"
          onClick={handleGenerateContent}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="spinner-inline"></span>
              Starting generation...
            </>
          ) : (
            'Generate Course Content'
          )}
        </button>
        <p className="generate-info">
          This will generate complete content for all {courseStructure.modules.length} modules and save to Google Drive
        </p>
      </div>
    </div>
  );
}

export default ModuleEditorPage;
