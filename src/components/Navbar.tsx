import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link as ScrollLink } from "react-scroll";

const NAV_LINKS = [
  { label: "Home", href: "home" },
  { label: "About", href: "about" },
  { label: "Skills", href: "skills" },
  { label: "Services", href: "services" },
  { label: "Projects", href: "projects" },
  { label: "Contact", href: "contact" },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Branding */}
        <a href="#home" className="font-bold text-xl text-gray-900">
          Valbit
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6">
          {NAV_LINKS.map((link) => (
            <ScrollLink
              key={link.label}
              to={link.href}
              smooth={true}
              offset={-64}
              duration={500}
              className="text-gray-700 hover:text-blue-600 font-medium cursor-pointer"
            >
              {link.label}
            </ScrollLink>
          ))}
        </div>

        {/* Hamburger Menu */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-2">
          {NAV_LINKS.map((link) => (
            <ScrollLink
              key={link.label}
              to={link.href}
              smooth={true}
              offset={-64}
              duration={500}
              className="block w-full text-left px-2 py-2 text-gray-700 hover:text-blue-600 font-medium cursor-pointer"
              onClick={closeMenu}
            >
              {link.label}
            </ScrollLink>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
