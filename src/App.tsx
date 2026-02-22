import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useLanguage } from './i18n/LanguageContext';
import { syncSavedPrompts, removeToken } from './api/client';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import WorkflowSelectionPage from './pages/WorkflowSelectionPage';
import HomePage from './pages/HomePage';
import TitleInputPage from './pages/TitleInputPage';
import ModuleEditorPage from './pages/ModuleEditorPage';
import FileUploadPage from './pages/FileUploadPage';
import GenerationPage from './pages/GenerationPage';
import PromptEditorPage from './pages/PromptEditorPage';
import './App.css';

function App() {
  const { language, setLanguage, t } = useLanguage();
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('user'));
  const [authPage, setAuthPage] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (user) {
      syncSavedPrompts();
    }
  }, [user]);

  const handleLogin = (username: string) => {
    setUser(username);
  };

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    if (authPage === 'signup') {
      return (
        <SignupPage
          onSignup={handleLogin}
          onSwitchToLogin={() => setAuthPage('login')}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToSignup={() => setAuthPage('signup')}
      />
    );
  }

  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <div className="header-top">
            <h1>{t('app.title')}</h1>
            <div className="header-actions">
              <Link to="/prompts" className="btn-prompts">
                {t('promptEditor.headerButton')}
              </Link>
              <button
                className="language-toggle"
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              >
                {language === 'en' ? 'ES' : 'EN'}
              </button>
              <button className="btn-user-logout" onClick={handleLogout}>
                {user} &middot; {t('login.logout')}
              </button>
            </div>
          </div>
          <p>{t('app.subtitle')}</p>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<WorkflowSelectionPage />} />
            <Route path="/file-id" element={<HomePage />} />
            <Route path="/title-input" element={<TitleInputPage />} />
            <Route path="/module-editor" element={<ModuleEditorPage />} />
            <Route path="/file-upload" element={<FileUploadPage />} />
            <Route path="/generate/:jobId" element={<GenerationPage />} />
            <Route path="/prompts" element={<PromptEditorPage />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>{t('app.version')}</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
