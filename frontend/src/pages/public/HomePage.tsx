import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Search, Sparkles, Timer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      num: '01',
      title: 'Select a Topic',
      desc: 'Browse academic and technical categories ranging from Java and React to MySQL and General Knowledge.',
      icon: Search
    },
    {
      num: '02',
      title: 'Answer Under Time',
      desc: 'Test your precision under realistic time constraints with a live countdown timer.',
      icon: Timer
    },
    {
      num: '03',
      title: 'Review & Benchmark',
      desc: 'Get instant server-validated scores, complete answer breakdowns, and performance analytics.',
      icon: Award
    }
  ];

  return (
    <div className="bg-[#f7faf8]">
      {/* Hero Section — Emerald Oasis Academic Prestige */}
      <section className="relative overflow-hidden pt-14 pb-16">
        <div className="container-page relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-[#d0e9d6] text-[#364c3e] border border-[#5B7564]">
                <Sparkles className="h-3.5 w-3.5 text-[#735c00]" />
                Digital Traditionalism & Learning
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] text-[#181c1b]">
                Master Code & Tech Skills with{' '}
                <span className="text-[#735c00] underline decoration-[#D4AF37] decoration-2 underline-offset-4">
                  Real-Time Timed Quizzes
                </span>
              </h1>

              <p className="font-sans text-[#4d4635] text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Test your knowledge across Java, React, Python, Data Science, DevOps, and any custom technical category. Enjoy server-authoritative timing,
                instant scoring, and detailed academic answer breakdowns.
              </p>

              <div className="pt-2 flex flex-wrap gap-4 items-center">
                <Link
                  className="btn btn-primary shadow-xs uppercase tracking-wider text-xs font-bold"
                  to="/quizzes"
                >
                  Explore Quizzes <ArrowRight className="h-4 w-4" />
                </Link>

                {!user && (
                  <Link
                    className="btn btn-secondary shadow-xs uppercase tracking-wider text-xs font-bold"
                    to="/register"
                  >
                    Create Account
                  </Link>
                )}
              </div>
            </div>

            {/* Right Column: How QuizForge Works Workflow */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="card p-7 text-left space-y-6">
                  <div className="text-center space-y-2 border-b border-[#e0e3e1] pb-4">
                    <span className="text-[#735c00] font-bold text-xs tracking-widest uppercase bg-[#f1f4f2] px-3 py-1 rounded-full border border-[#d0c5af] inline-block">
                      Academic Workflow
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#181c1b] tracking-tight">How QuizForge Works</h2>
                    <p className="font-sans text-[#4d4635] text-xs font-normal leading-relaxed">
                      Three structured steps to practice, evaluate, and sharpen your intellect.
                    </p>
                  </div>

                  <div className="space-y-3.5" onMouseLeave={() => setActiveStep(null)}>
                    {steps.map((step, idx) => {
                      const IconComp = step.icon;
                      const isHighlighted = activeStep === idx;
                      return (
                        <div
                          key={step.num}
                          onMouseEnter={() => setActiveStep(idx)}
                          className={`group rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                            isHighlighted
                              ? 'border-2 border-[#D4AF37] bg-[#f1f4f2] shadow-xs'
                              : 'bg-[#ffffff] border border-[#e0e3e1] hover:border-[#d0c5af]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                  isHighlighted
                                    ? 'bg-[#181c1b] text-[#D4AF37] border border-[#D4AF37]'
                                    : 'bg-[#ebefed] border border-[#d0c5af] text-[#54615a] group-hover:bg-[#181c1b] group-hover:text-[#D4AF37]'
                                }`}
                              >
                                <IconComp className="h-4.5 w-4.5" />
                              </div>
                              <div>
                                <h3 className="font-sans text-sm font-bold text-[#181c1b]">
                                  {step.title}
                                </h3>
                              </div>
                            </div>
                            <span
                              className={`font-serif text-xl font-bold leading-none transition-colors ${
                                isHighlighted ? 'text-[#735c00]' : 'text-[#d0c5af]'
                              }`}
                            >
                              {step.num}
                            </span>
                          </div>
                          <p className="font-sans text-[#4d4635] text-xs leading-relaxed font-normal mt-2 pl-12">
                            {step.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
