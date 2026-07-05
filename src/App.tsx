import { HashRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import JourneyDetailPage from "./pages/JourneyDetailPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/journey/:id" element={<JourneyDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
}
