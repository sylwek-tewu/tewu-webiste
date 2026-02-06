
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Linkedin } from 'lucide-react';
import { CONTACT_DETAILS, COMPANY_FULL_NAME, NAV_LINKS } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white tracking-tighter">TEWU</h2>
            <p className="text-sm leading-relaxed">
              Twój zaufany partner w biznesie. Profesjonalna księgowość, kadry i płace oraz doradztwo dla firm każdej wielkości.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Nawigacja</h3>
            <ul className="space-y-4 text-sm">
              {NAV_LINKS.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Usługi</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/uslugi" className="hover:text-white transition-colors">Pełna Księgowość</Link></li>
              <li><Link to="/uslugi" className="hover:text-white transition-colors">Księga Przychodów</Link></li>
              <li><Link to="/outsourcing" className="hover:text-white transition-colors">Outsourcing BPO</Link></li>
              <li><Link to="/uslugi" className="hover:text-white transition-colors">Kadry i Płace</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Kontakt</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-400 mt-1 flex-shrink-0" />
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Biuro%20Rachunkowe%20TEWU%20Sp.%20z%20o.o.%20aleja%20Powsta%C5%84c%C3%B3w%20Wielkopolskich%2C%20Szczecin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {CONTACT_DETAILS.address}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-blue-400 mt-1 flex-shrink-0" />
                <div className="flex flex-col gap-2">
                  <a href={`tel:${CONTACT_DETAILS.phone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                    {CONTACT_DETAILS.phone}
                  </a>
                  <a href="tel:+48501482555" className="hover:text-white transition-colors">
                    501 482 555
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-blue-400 flex-shrink-0" />
                <a href={`mailto:${CONTACT_DETAILS.email}`} className="hover:text-white transition-colors">
                  {CONTACT_DETAILS.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-16 pt-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {COMPANY_FULL_NAME}. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
