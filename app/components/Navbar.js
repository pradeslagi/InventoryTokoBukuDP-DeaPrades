import { useState, useEffect, useRef } from 'react';
import { Menu, User } from 'lucide-react';
import Link from 'next/link';
export default function Navbar({ toggleSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const [role, setRole] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setRole(user.role === 'manager' ? 'Manager' : 'Admin');
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow w-full h-16 flex items-center justify-between px-4 fixed top-0 z-30">
      <button onClick={toggleSidebar} className="text-blue-700 text-2xl">
        <Menu />
      </button>
      <h1 className="text-lg font-semibold text-blue-700 hidden md:block">Dashboard</h1>

      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <span className="text-sm text-gray-600 hidden sm:block">{role}</span>
          <User className="w-8 h-8 text-blue-700" />
        </div>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-50">
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
            >
              Profil
            </a>
            <button
              onClick={() => {
                // Hapus cookie user
                document.cookie = 'user=; Max-Age=0; path=/;';
                // Hapus localStorage
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                // Redirect ke login
                window.location.href = '/login';
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
// ...existing code...