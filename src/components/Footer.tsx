import React from "react";
import { Github, Linkedin, Mail, Globe } from "lucide-react";
import { Link as ScrollLink } from "react-scroll";

interface FooterLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

const socials: FooterLink[] = [
  {
    icon: <Github size={20} />,
    href: "https://github.com/raaeeiii",
    label: "GitHub",
  },
  {
    icon: <Linkedin size={20} />,
    href: "https://linkedin.com/in/rahibrk",
    label: "LinkedIn",
  },
  {
    icon: <Mail size={20} />,
    href: "mailto:contact@valbit.in",
    label: "Email",
  },
  {
    icon: <Globe size={20} />,
    href: "https://valbit.in",
    label: "Website",
  },
];

const quickLinks = [
  { label: "Home", href: "home" },
  { label: "About", href: "about" },
  { label: "Skills", href: "skills" },
  { label: "Services", href: "services" },
  { label: "Projects", href: "projects" },
  { label: "Contact", href: "contact" },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 
                          bg-clip-text text-transparent">
              RAHIB RK
            </h3>
            <p className="text-sm text-gray-400">
              AI Engineer & Automation Developer specializing in modern web technologies and AI solutions.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              {quickLinks.map(link => (
                <ScrollLink
                  key={link.label}
                  to={link.href}
                  smooth={true}
                  offset={-64}
                  duration={500}
                  className="text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  {link.label}
                </ScrollLink>
              ))}
            </div>
          </div>
          
          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Connect</h4>
            <div className="flex flex-wrap gap-4">
              {socials.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact</h4>
            <div className="text-sm space-y-2">
              <p>Kochi, Kerala</p>
              <p>India</p>
              <a href="mailto:contact@valbit.in" 
                 className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                contact@valbit.in
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-400">
            © {currentYear} Rahib RK. All rights reserved.
          </div>
          <div className="text-sm text-gray-400">
            Made with ❤️ by <span className="text-blue-400">Valbit</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer
