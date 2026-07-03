import { Route, Routes } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import BottomTabBar from './components/BottomTabBar'
import AuthModal from './components/AuthModal'
import AboutPage from './pages/AboutPage'
import DetailPage from './pages/DetailPage'
import GenerateResultPage from './pages/GenerateResultPage'
import HistoryPage from './pages/HistoryPage'
import HomePage from './pages/HomePage'
import PrivacyPage from './pages/PrivacyPage'
import SettingsPage from './pages/SettingsPage'
import TermsPage from './pages/TermsPage'
import TextMemoryPage from './pages/TextMemoryPage'
import WordCardPage from './pages/WordCardPage'

export default function App() {
  return (
    <div className="min-h-screen pb-[calc(86px+env(safe-area-inset-bottom))] text-ink">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/text-memory" element={<TextMemoryPage />} />
          <Route path="/word-card" element={<WordCardPage />} />
          <Route path="/result/:id" element={<GenerateResultPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/detail/:id" element={<DetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </AnimatePresence>
      <BottomTabBar />
      <AuthModal />
    </div>
  )
}
