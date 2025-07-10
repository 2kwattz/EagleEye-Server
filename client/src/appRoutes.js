import { Routes, Route } from 'react-router-dom';
import Home from '../src/pages/Home';
import RegistrationForm from './pages/Account/register';

export default function AppRoutes() {
    return (
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/register" element={<RegistrationForm/>}></Route>
        
        
        
      </Routes>
    );
  }