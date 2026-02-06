
import React from 'react';
import { SERVICES } from '../constants';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-slate-900 py-24 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
            Pełna oferta usług księgowych
          </h1>
          <p className="text-xl text-slate-400">
            Dostarczamy kompleksowe rozwiązania dla biznesu, od prostych ewidencji po zaawansowane doradztwo podatkowe.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map((service) => (
              <div 
                key={service.id} 
                className="group p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 leading-tight">
                  {service.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-8">
            Nie wiesz, która forma rozliczenia będzie dla Ciebie najlepsza?
          </h2>
          <p className="text-blue-100 text-lg mb-12 max-w-2xl mx-auto">
            Skontaktuj się z nami. Przeanalizujemy Twoją sytuację i zaproponujemy optymalne rozwiązania podatkowe.
          </p>
          <Link 
            to="/kontakt" 
            className="inline-flex items-center px-10 py-5 bg-white text-blue-600 font-black text-lg rounded-2xl hover:bg-blue-50 transition-colors shadow-xl"
          >
            Umów się na konsultację <ArrowRight className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Additional Values */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex gap-4">
              <CheckCircle2 className="text-green-500 w-8 h-8 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 text-lg mb-2">Bezpieczeństwo</h4>
                <p className="text-slate-600 text-sm">Pełna odpowiedzialność cywilna i ubezpieczenie OC biura.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="text-green-500 w-8 h-8 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 text-lg mb-2">Terminowość</h4>
                <p className="text-slate-600 text-sm">Gwarantujemy dotrzymanie wszystkich terminów ustawowych.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="text-green-500 w-8 h-8 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 text-lg mb-2">Nowoczesność</h4>
                <p className="text-slate-600 text-sm">E-księgowość i elektroniczny obieg dokumentów.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
