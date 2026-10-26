import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import PromotionsPage from "./pages/PromotionsPage.jsx";
import UserSelectPage from "./pages/UserSelectPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserSelectPage />} />
        <Route path="/promotions" element={<PromotionsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;