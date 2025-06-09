import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Import your pages here (to be created later)
// import Dashboard from './pages/Dashboard';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import ProjectDetails from './pages/ProjectDetails';
// import TestFlowEditor from './pages/TestFlowEditor';

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<div>Welcome to TestTrack</div>} />
        {/* Add your routes here */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/projects/:id" element={<ProjectDetails />} /> */}
        {/* <Route path="/test-flow/:id" element={<TestFlowEditor />} /> */}
      </Routes>
    </div>
  );
};

export default App;
