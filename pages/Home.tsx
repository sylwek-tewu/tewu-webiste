
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Award } from 'lucide-react';
import { REASONS_TO_TRUST, SERVICES } from '../constants';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-widest border border-blue-100">
                Ponad 25 lat na rynku
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1]">
                Księgowość <br/>
                <span className="text-blue-600 italic">bez stresu.</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                Zajmij się rozwojem swojej firmy, a weźmiemy na siebie formalności. Profesjonalne wsparcie księgowe dla biznesu w TEWU.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/kontakt"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  Skontaktuj się z nami <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/uslugi"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-slate-900 border-2 border-slate-100 font-bold text-lg hover:border-slate-300 transition-all"
                >
                  Poznaj ofertę
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                  alt="Biuro rachunkowe" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Summary */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-black text-slate-900">150+</p>
              <p className="text-slate-500 font-medium">Zadowolonych firm</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-slate-900">25+</p>
              <p className="text-slate-500 font-medium">Lat doświadczenia</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-slate-900">100%</p>
              <p className="text-slate-500 font-medium">Bezpieczeństwa</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-slate-900">24h</p>
              <p className="text-slate-500 font-medium">Czas reakcji</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">Nasza Oferta</h2>
          <h3 className="text-4xl font-black text-slate-900 tracking-tight">Czym się zajmujemy?</h3>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES.slice(0, 4).map((service) => (
            <div key={service.id} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all group border border-slate-100">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {service.icon}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-4">{service.title}</h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-2">{service.description}</p>
              <Link to="/uslugi" className="text-blue-600 font-bold text-sm inline-flex items-center hover:gap-2 transition-all">
                Więcej <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
           <Link to="/uslugi" className="inline-flex items-center text-slate-900 font-black hover:text-blue-600 transition-colors">
             Zobacz pełną ofertę ({SERVICES.length} pozycji) <ArrowRight className="ml-2" />
           </Link>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-24 bg-white overflow-hidden border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Część górna: 3 punkty obok zdjęć */}
          <div className="flex flex-col lg:flex-row items-start gap-20">
            <div className="lg:w-7/12 space-y-12">
               <div className="space-y-4">
                 <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Dlaczego warto nam zaufać?</h2>
                 <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                   W TEWU wierzymy, że księgowość to co więcej niż tylko liczby. To fundament Twojego biznesu, który wymaga solidności, nowoczesnego podejścia i pełnej transparentności.
                 </p>
               </div>
               
               <div className="space-y-10">
                 {REASONS_TO_TRUST.slice(0, 3).map((reason, idx) => (
                   <div key={idx} className="flex gap-6 items-start group">
                     <div className="flex-shrink-0 bg-blue-50 p-4 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                       {reason.icon}
                     </div>
                     <div>
                       <h4 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{reason.title}</h4>
                       <p className="text-slate-600 text-base leading-relaxed max-w-xl">{reason.description}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="lg:w-5/12 relative w-full lg:sticky lg:top-32">
               <div className="grid grid-cols-2 gap-4">
                 <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80" className="rounded-3xl shadow-lg mt-12 w-full aspect-[3/4] object-cover" alt="Zespół przy pracy" />
                 <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" className="rounded-3xl shadow-lg w-full aspect-[3/4] object-cover" alt="Spotkanie biznesowe" />
               </div>
            </div>
          </div>

          {/* Część dolna: Pozostałe punkty w 2 równych kolumnach (Grid 6:6) */}
          <div className="mt-12 grid md:grid-cols-2 gap-x-12 gap-y-10">
            {REASONS_TO_TRUST.slice(3).map((reason, idx) => (
              <div key={idx} className="flex gap-6 items-start group">
                <div className="flex-shrink-0 bg-blue-50 p-4 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  {reason.icon}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{reason.title}</h4>
                  <p className="text-slate-600 text-base leading-relaxed">{reason.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
