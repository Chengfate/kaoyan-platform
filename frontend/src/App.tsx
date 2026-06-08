import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import SchoolDetailPage from './pages/SchoolDetailPage';
import ScoreComparePage from './pages/ScoreComparePage';
import RecommendPage from './pages/RecommendPage';
import CompetitionPage from './pages/CompetitionPage';
import MajorDifficultyPage from './pages/MajorDifficultyPage';
import KnowledgePage from './pages/KnowledgePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/schools/:id" element={<SchoolDetailPage />} />
            <Route path="/compare" element={<ScoreComparePage />} />
            <Route path="/recommend" element={<RecommendPage />} />
            <Route path="/competition" element={<CompetitionPage />} />
            <Route path="/difficulty" element={<MajorDifficultyPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
