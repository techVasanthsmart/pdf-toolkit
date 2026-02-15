import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Merger from './pages/Merger';
import Splitter from './pages/Splitter';
import Reorder from './pages/Reorder';
import ImagesToPdf from './pages/ImagesToPdf';
import MarkdownToPdf from './pages/MarkdownToPdf';
import { initAnalytics, trackPageView } from './analytics';
import './index.css';

function App() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="merge" element={<Merger />} />
        <Route path="split" element={<Splitter />} />
        <Route path="reorder" element={<Reorder />} />
        <Route path="images-to-pdf" element={<ImagesToPdf />} />
        <Route path="markdown-to-pdf" element={<MarkdownToPdf />} />
      </Route>
    </Routes>
  );
}

export default App;
