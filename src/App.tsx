import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WorkflowSelectionPage from './pages/WorkflowSelectionPage';
import HomePage from './pages/HomePage';
import TitleInputPage from './pages/TitleInputPage';
import ModuleEditorPage from './pages/ModuleEditorPage';
import FileUploadPage from './pages/FileUploadPage';
import GenerationPage from './pages/GenerationPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <h1>Course Content Generator</h1>
          <p>AI-powered course content generation with Google Drive integration</p>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<WorkflowSelectionPage />} />
            <Route path="/file-id" element={<HomePage />} />
            <Route path="/title-input" element={<TitleInputPage />} />
            <Route path="/module-editor" element={<ModuleEditorPage />} />
            <Route path="/file-upload" element={<FileUploadPage />} />
            <Route path="/generate/:jobId" element={<GenerationPage />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>Course Content Generator v1.0.0</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
