import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AuthPage = ({ isLogin }) => {
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password, role: "user" };

    try {
      const response = await api.post(endpoint.replace(/^\/api/, '/auth'), body);
      const data = response.data;
      if (data.token) {
        try { localStorage.setItem('token', data.token); } catch (e) {}
        // If backend returned user data, prefer that
        const userData = data.user || data;
        try { login(userData); } catch (e) {}
        // Redirect based on role
        const role = userData?.role || 'user';
        if (role === 'farmer') navigate('/dashboard'); else navigate('/products');
      } else {
        alert(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-center mb-4">{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="p-2 border rounded-md w-full"
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="p-2 border rounded-md w-full"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="p-2 border rounded-md w-full"
            required
          />
          <button type="submit" className="bg-purple-600 text-white py-2 rounded-md">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <p className="text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <a href={isLogin ? "/register" : "/login"} className="text-purple-600 ml-2">
            {isLogin ? "Register" : "Login"}
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
