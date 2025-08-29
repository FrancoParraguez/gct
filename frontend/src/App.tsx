import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 text-white p-4 flex justify-between">
          <span className="font-bold">PlateApp</span>
          <div className="flex gap-4">
            <Link to="/">Home</Link>
            <Link to="/admin">Admin</Link>
          </div>
        </nav>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
