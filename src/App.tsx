import React from "react";
import logo from "./logo.svg";
import { Builder } from "./components/Builder";
import {
  BrowserRouter,
  HashRouter,
  Route,
  Routes,
  createHashRouter,
} from "react-router-dom";
import { Home } from "./components/Home";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Builder />} />
        <Route path="/book" element={<Builder />} />
        <Route path="/music" element={<Builder isMusic={true} />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
