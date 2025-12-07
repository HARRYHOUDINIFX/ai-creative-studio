import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EditProvider } from './context/EditContext';
import Layout from './components/Layout';
import PricingPage from './pages/PricingPage';
import PortfolioPage from './pages/PortfolioPage';
import PortfolioListPage from './pages/PortfolioListPage';

const App: React.FC = () => {
  return (
    <EditProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="pricing" element={<PricingPage />} />
            <Route index element={<PortfolioListPage />} />
            <Route path="portfolio/:projectId" element={<PortfolioPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </EditProvider>
  );
};

export default App;