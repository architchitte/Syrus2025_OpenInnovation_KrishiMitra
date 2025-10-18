import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-white bg-brand-forest-green' : 'text-gray-700 hover:text-white hover:bg-brand-forest-green'}`}
  >
    {children}
  </NavLink>
);

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-forest-green flex items-center justify-center text-white font-bold">KM</div>
              <div className="hidden sm:block">
                <div className="text-lg font-poppins font-bold text-brand-forest-green">KrishiMitra</div>
                <div className="text-xs text-gray-500">Farm to Table</div>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <NavItem to="/dashboard">Dashboard</NavItem>
            <NavItem to="/bulk-buy">Bulk Buy</NavItem>
            <NavItem to="/recommendations">Crop Recommendation</NavItem>
            <NavItem to="/cold-storage">Cold Storage</NavItem>
            <NavItem to="/chatbot">Chatbot</NavItem>
            <NavItem to="/products">Products</NavItem>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/cart" className="p-2 rounded-md hover:bg-brand-light-aqua">
              <ShoppingCart size={18} />
            </Link>
            <Link to="/login" className="btn-primary px-4 py-2 rounded-md text-sm">Login</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
