import { Routes, Route } from 'react-router-dom';
import SetupPage from './pages/SetupPage';
import BattlePage from './pages/BattlePage';
import ReplayPage from './pages/ReplayPage';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<SetupPage />} />
        <Route path="/battle" element={<BattlePage />} />
        <Route path="/replay" element={<ReplayPage />} />
      </Routes>
    </div>
  );
}

export default App;
