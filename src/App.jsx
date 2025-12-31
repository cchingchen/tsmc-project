import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DeviceList from './DeviceList';
import Dashboard from './Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DeviceList />} />
        <Route path="/device/:id" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
