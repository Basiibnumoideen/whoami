import { USES_DATA } from '@/lib/data';
import { Laptop, Terminal, Cpu, Cloud } from 'lucide-react';

export const metadata = {
  title: 'Uses & Workspace (/uses) | Muhammed Abdul Basith',
  description: 'Hardware, editors, software tools, and configurations Muhammed Abdul Basith uses daily.',
};

export default function UsesPage() {
  const getCategoryIcon = (categoryName: string) => {
    if (categoryName.includes('Hardware')) return Laptop;
    if (categoryName.includes('Editor')) return Terminal;
    if (categoryName.includes('Stack')) return Cpu;
    return Cloud;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Header */}
      <div className="max-w-3xl mb-16">
        <p className="text-xs font-mono uppercase tracking-wider text-primary font-semibold mb-2">
          Daily Toolkit & Setup
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Software, Hardware & Ergonomics
        </h1>
        <p className="text-base text-text-secondary leading-relaxed">
          An authentic, unvarnished index of the tools, editor themes, hardware, and developer infrastructure I rely on to ship software every day.
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-12">
        {USES_DATA.categories.map((cat, idx) => {
          const Icon = getCategoryIcon(cat.name);

          return (
            <div key={idx} className="p-8 rounded-3xl bg-surface border border-border/80">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{cat.name}</h2>
                  <p className="text-xs text-text-secondary">{cat.items.length} Essential Tools</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cat.items.map((item, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-surface-elevated/40 border border-border/50 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                      <h3 className="text-sm font-bold text-foreground">{item.name}</h3>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed pl-3.5">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
