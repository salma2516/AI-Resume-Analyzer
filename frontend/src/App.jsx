import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Candidate from "./pages/Candidate";
import Skills from "./pages/Skills";
import Jobs from "./pages/Jobs";
import Roadmap from "./pages/Roadmap";
import Report from "./pages/Report";
import Login from "./pages/Login";


// =========================================================
// PROTECTED ROUTE
// =========================================================

function ProtectedRoute({ children }) {
  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


// =========================================================
// APP
// =========================================================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =================================================
            ROOT
        ================================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* =================================================
            DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            CANDIDATE
        ================================================= */}

        <Route
          path="/candidate"
          element={
            <ProtectedRoute>
              <Candidate />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            PROFILE ALIAS
        ================================================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Candidate />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            SKILLS
        ================================================= */}

        <Route
          path="/skills"
          element={
            <ProtectedRoute>
              <Skills />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            JOBS
        ================================================= */}

        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            ROADMAP
        ================================================= */}

        <Route
          path="/roadmap"
          element={
            <ProtectedRoute>
              <Roadmap />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            REPORT
        ================================================= */}

        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            UNKNOWN ROUTES
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;