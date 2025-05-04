import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Header from "./components/Header.jsx";
import HomePage from "./components/HomePage.jsx"
import LoginPage from "./components/LoginPage.jsx";
import {AuthProvider} from "./components/AuthContext.jsx"
import ProtectedRoute from './components/ProtectedRoute.jsx'
import BookingPage from "./components/BookingPage.jsx"
import EmployeesSection from "./components/EmployeesSection.jsx";
import EmployeeSchedule from "./components/EmployeeSchedule.jsx";


function App() {

  return (
    <Router>
    <AuthProvider>
      
        <Header />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          { /* <Route path="/register" element={<RegisterPage />} /> */}
          <Route path="/" element={<ProtectedRoute>
                                      <HomePage />
                                   </ProtectedRoute> }
          />
          <Route path="/book" element={<ProtectedRoute>
                                        <BookingPage />
                                      </ProtectedRoute> }
          />
          <Route path="/admin" element={<ProtectedRoute> 
                                          <EmployeesSection/>
                                        </ProtectedRoute>}/>
          <Route path="/admin/employee" element={
                                        <ProtectedRoute>
                                          <EmployeeSchedule />
                                        </ProtectedRoute>}/>
        </Routes>
      
    </AuthProvider>
    </Router>
  );
}

export default App
