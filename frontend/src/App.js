import React from "react";
import AppRoutes from "./routes";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <Header />
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
