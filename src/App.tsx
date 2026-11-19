import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatBot from './components/ChatBot';

// Add smooth scroll behavior globally
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="h-screen">
        <Routes>
          <Route path="/" element={<ChatBot />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
