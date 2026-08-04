import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Resume from './pages/Resume';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Photos from './pages/Photos';
import OverlappingRun from './pages/OverlappingRun';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/photos/:folderName" element={<Photos />} />
          <Route path="/overlapping-run" element={<OverlappingRun />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;