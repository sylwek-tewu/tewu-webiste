
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Outsourcing from './pages/Outsourcing';
import Contact from './pages/Contact';
import Certificates from './pages/Certificates';

// Komponent resetujący pozycję skrolla przy zmianie ścieżki
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Resetuje scroll do samej góry przy zmianie podstrony
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/o-nas" element={<About />} />
            <Route path="/uslugi" element={<Services />} />
            <Route path="/outsourcing" element={<Outsourcing />} />
            <Route path="/certyfikaty" element={<Certificates />} />
            <Route path="/kontakt" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
