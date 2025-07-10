import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppRoutes from './appRoutes';

function App() {
  return (
    <Router>
    <AppRoutes />
  </Router>
  );
}

export default App;
