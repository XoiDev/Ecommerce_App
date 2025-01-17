import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/dashboard/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import useAuth from "./hooks/useAuth";
import Vendors from "./pages/dashboard/vendors/Vendors";
import Categories from "./pages/dashboard/categories/Categories";
import Login from "./pages/login/Login";
import { ToastContainer } from "react-toastify";
import Products from "./pages/dashboard/products/Products";
import DiscountCode from "./pages/dashboard/discount-code/DiscountCode";
import Discount from "./pages/dashboard/discount/Discount";

const App: React.FC = () => {
  const auth = useAuth();

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />

        {/* Private Routes */}
        <Route
          element={<PrivateRoute isAuthenticated={auth.isAuthenticated} />}
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route>
            <Route
              path="/"
              element={<Navigate to="/dashboard/vendors" replace />}
            />
            <Route path="/dashboard/*" element={<Dashboard />}>
              <Route path="vendors" element={<Vendors />} />
              <Route path="categories" element={<Categories />} />
              <Route path="discount-code" element={<DiscountCode />} />
              <Route path="products" element={<Products />} />
              <Route path="discount" element={<Discount />} />
            </Route>
          </Route>
        </Route>
      </Routes>
      {/* <ToastContainer /> */}
    </>
  );
};

export default App;
