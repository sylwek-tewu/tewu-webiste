
import React from 'react';
import { ShieldCheck, Zap, Target, Lock } from 'lucide-react';

const Outsourcing: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-slate-900 py-24 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
            Outsourcing Procesów Biznesowych (BPO)
          </h1>
          <p className="text-xl text-slate-400">
            Zredukuj koszty operacyjne i skup się na kluczowych aspektach swojej działalności. 
            Przejmiemy Twoje procesy back-office z najwyższą dbałością o jakość i rzetelność.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dlaczego outsourcing z TEWU?</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Zewnętrzna obsługa procesów finansowo-księgowych to nie tylko oszczędność na etatach. 
                To dostęp do wyspecjalizowanej wiedzy naszych ekspertów oraz gwarancja pełnej zgodności z aktualnymi przepisami prawa.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Obniżenie kosztów operacyjnych nawet o 40%",
                  "Dostęp do ekspertów bez konieczności rekrutacji",
                  "Gwarancja ciągłości procesów (brak problemów z urlopami)",
                  "Przeniesienie ryzyka prawnego i podatkowego na biuro"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <ShieldCheck className="text-green-500 w-5 h-5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {[
                { title: "Szybkość", icon: <Zap className="text-yellow-500" />, desc: "Sprawne procesowanie dokumentacji" },
                { title: "Optymalizacja", icon: <Target className="text-blue-500" />, desc: "Usprawnienie procesów wewnętrznych" },
                { title: "Poufność", icon: <Lock className="text-indigo-500" />, desc: "Ścisła ochrona danych biznesowych" },
                { title: "Stabilność", icon: <ShieldCheck className="text-purple-500" />, desc: "Bezpieczeństwo i ciągłość operacji" }
              ].map((box, i) => (
                <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="mb-4">{box.icon}</div>
                  <h4 className="font-bold text-slate-900 mb-2">{box.title}</h4>
                  <p className="text-xs text-slate-500 leading-normal">{box.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Jak zacząć?</h2>
            <p className="text-slate-500 mt-2">Wdrożenie procesu outsourcingu w 3 krokach</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Analiza", desc: "Poznajemy Twoje procesy i identyfikujemy obszary do przejęcia." },
              { step: "02", title: "Migracja", desc: "Przygotowujemy dokumentację i ustalamy zasady obiegu informacji." },
              { step: "03", title: "Operacje", desc: "Przejmujemy pełną odpowiedzialność za wybrane procesy biznesowe." }
            ].map((step, i) => (
              <div key={i} className="relative p-8 bg-white rounded-3xl shadow-sm border border-slate-100">
                <span className="text-6xl font-black text-blue-600/10 absolute top-4 right-8">{step.step}</span>
                <h4 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h4>
                <p className="text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Outsourcing;
