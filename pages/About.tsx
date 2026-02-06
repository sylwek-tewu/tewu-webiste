
import React from 'react';
import { ShieldCheck, Clock, Award, Users, CheckCircle2 } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Header Section */}
      <section className="bg-slate-900 py-24 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
            Poznaj TEWU
          </h1>
          <p className="text-xl text-slate-400">
            Ponad 25 lat doświadczenia w budowaniu stabilnych fundamentów finansowych dla polskiego biznesu.
          </p>
        </div>
      </section>

      {/* Main Intro Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                Szukasz rzetelnego i godnego zaufania biura rachunkowego, które kompleksowo zajmie się księgowością Twojej firmy?
              </h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  <span className="font-bold text-slate-900">Biuro Rachunkowe TEWU Sp. z o.o.</span> to idealny wybór dla przedsiębiorców, którzy cenią profesjonalizm, terminowość i bezpieczeństwo. 
                </p>
                <p>
                  Posiadamy wieloletnie doświadczenie w prowadzeniu księgowości dla firm o różnym profilu działalności. Nasz zespół wykwalifikowanych księgowych stale dba o aktualizację swojej wiedzy i umiejętności, aby zapewnić naszym klientom usługi na najwyższym poziomie.
                </p>
              </div>
              <div className="pt-4 grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="font-bold text-slate-900">Profesjonalizm</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="font-bold text-slate-900">Terminowość</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="font-bold text-slate-900">Bezpieczeństwo</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="font-bold text-slate-900">Doświadczenie</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" 
                  alt="Zespół TEWU" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hidden md:block max-w-[280px]">
                <p className="text-blue-600 font-black text-4xl mb-1">25+</p>
                <p className="text-slate-900 font-bold text-lg mb-2">Lat na rynku</p>
                <p className="text-slate-500 text-sm">Znamy przepisy od podszewki i wiemy, jak chronić Twój biznes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">Nasze wartości</h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Dlaczego my?</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <ShieldCheck size={32} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-4">Bezpieczeństwo</h4>
              <p className="text-slate-600 leading-relaxed">
                Stosujemy najwyższe standardy ochrony danych i posiadamy pełne ubezpieczenie OC, dając Ci spokój ducha.
              </p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <Clock size={32} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-4">Terminowość</h4>
              <p className="text-slate-600 leading-relaxed">
                Szanujemy Twój czas. Gwarantujemy, że wszystkie rozliczenia i deklaracje zostaną złożone w ustawowych terminach.
              </p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <Award size={32} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-4">Ekspertyza</h4>
              <p className="text-slate-600 leading-relaxed">
                Nasz zespół to specjaliści, którzy nieustannie podnoszą swoje kwalifikacje, śledząc dynamiczne zmiany w prawie.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-8">Nasza misja</h2>
          <p className="text-2xl text-slate-600 italic leading-relaxed">
            "Naszym celem jest odciążenie przedsiębiorców z biurokracji, aby mogli w pełni skupić się na rozwoju swoich firm, mając pewność, że ich finanse są w najlepszych rękach."
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
