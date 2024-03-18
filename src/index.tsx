import React from 'react';
import ReactDOM from 'react-dom/client';
import { Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.scss';
import AIME from './pages/AIME/AIME.tsx';
import '@rainbow-me/rainbowkit/styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <>
    <HashRouter>
      <Routes>
        <Route path='/' element={<App />}>
          <Route path='' element={<AIME />} />
          <Route path='*' element={<Navigate to='/' />} />
        </Route>
      </Routes>
    </HashRouter>
  </>
);
