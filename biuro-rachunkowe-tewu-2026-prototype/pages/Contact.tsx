
import React from 'react';
import { Mail, Phone, MapPin, Clock, FileText, Landmark, Building2, Smartphone } from 'lucide-react';
import { CONTACT_DETAILS } from '../constants';

const Contact: React.FC = () => {
  return (
    <div className="bg-white">
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">Kontakt</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Zapraszamy do kontaktu telefonicznego, mailowego lub osobistej wizyty w naszym biurze w Szczecinie.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-stretch">
            {/* Informacje Podstawowe (Lewa kolumna) */}
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-8">
                <Building2 className="text-blue-600" /> Dane kontaktowe
              </h2>
              
              <div className="flex-grow flex flex-col gap-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Adres</p>
                      <p className="text-sm font-bold text-slate-900 leading-snug">{CONTACT_DETAILS.address}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Email</p>
                      <a href={`mailto:${CONTACT_DETAILS.email}`} className="block text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                        {CONTACT_DETAILS.email}
                      </a>
                      <a href="mailto:sw@tewu.szczecin.pl" className="block text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                        sw@tewu.szczecin.pl
                      </a>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Tel. sekretariat</p>
                      <a href={`tel:${CONTACT_DETAILS.phone.replace(/\s/g, '')}`} className="block text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                        {CONTACT_DETAILS.phone}
                      </a>
                      <a href="tel:+48602235736" className="block text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                        602 235 736
                      </a>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Tel. komórkowy</p>
                      <a href="tel:+48501482555" className="block text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                        501 482 555
                      </a>
                      <a href="tel:+48886543973" className="block text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                        886 543 973
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600 px-8 py-6 rounded-3xl text-white shadow-xl shadow-blue-100 flex items-center justify-between flex-grow">
                  <div>
                    <p className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-2">Godziny otwarcia</p>
                    <p className="text-2xl font-black">{CONTACT_DETAILS.hours}</p>
                  </div>
                  <Clock size={48} className="text-blue-400 opacity-50" />
                </div>
              </div>
            </div>

            {/* Dane Rejestrowe i Bankowe (Prawa kolumna) */}
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-8">
                <FileText className="text-blue-600" /> Dane rejestrowe i bankowe
              </h2>
              
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 flex-grow flex flex-col">
                <div className="border-b border-slate-100 pb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Nazwa pełna</p>
                  <p className="text-lg font-bold text-slate-900">Biuro Rachunkowe TEWU Sp z o.o.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">NIP</p>
                    <p className="text-base font-bold text-slate-900">9552249417</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">REGON</p>
                    <p className="text-base font-bold text-slate-900">320601499</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">KRS</p>
                    <p className="text-base font-bold text-slate-900">0000320281</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Kapitał zakładowy</p>
                    <p className="text-base font-bold text-slate-900">50 000,00 ZŁ</p>
                  </div>
                </div>

                <div className="mt-auto pt-4 bg-slate-50 p-6 rounded-2xl border border-blue-50">
                  <div className="flex items-center gap-3 mb-2 text-blue-600">
                    <Landmark size={20} />
                    <p className="text-xs font-bold uppercase tracking-widest">Numer rachunku bankowego</p>
                  </div>
                  <p className="text-lg font-mono font-bold text-slate-800 break-all">
                    10 1020 4795 0000 9002 0180 2966
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Nasza lokalizacja w Szczecinie</h2>
          <p className="text-slate-500 mt-2">Al. Powstańców Wielkopolskich 78A LU2</p>
        </div>
        <div className="w-full h-[500px] bg-slate-100 relative group overflow-hidden">
           <iframe 
             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2377.9304323676235!2d14.536737377030806!3d53.40715377230495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47aa0914a8b79b9b%3A0x6a0c5c6d3d6e5a6b!2sAleja%20Powsta%C5%84c%C3%B3w%20Wielkopolskich%2078A%2C%2070-110%20Szczecin!5e0!3m2!1spl!2spl!4v1715850000000!5m2!1spl!2spl" 
             width="100%" 
             height="100%" 
             style={{ border: 0 }} 
             allowFullScreen 
             loading="lazy" 
             referrerPolicy="no-referrer-when-downgrade"
             className="grayscale group-hover:grayscale-0 transition-all duration-700"
           ></iframe>
        </div>
      </section>
    </div>
  );
};

export default Contact;
