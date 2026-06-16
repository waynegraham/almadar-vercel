import Link from "next/link";
import { getAllWorks } from "@/lib/strapi";

interface WorkSummary {
    id: number;
    documentId: string;
    iabCode: string;
    titleEn: string;
    titleAr: string;
    displayTitle: string;
}

export const revalidate = 3600; // Revalidate the page every hour

export default async function AllWorksPage() {
    const works: WorkSummary[] = await getAllWorks();
    return (
    <main className="min-h-screen bg-slate-50 py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <header className="border-b border-slate-200 pb-6 mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Collection Index</h1>
          <p className="text-slate-500 mt-2">Accession registry and digital archive entries.</p>
        </header>

        {works.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">No works found in the collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {works.map((work) => (
              <Link 
                key={work.documentId} 
                href={`/works/${work.iabCode}`}
                className="group block bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-400 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md tracking-wide">
                    {work.iabCode}
                  </span>
                </div>
                
                {/* English Content Stack */}
                <div dir="ltr" className="mb-4">
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {work.titleEn}
                  </h2>
                  {work.displayTitle && (
                    <p className="text-sm text-slate-400 italic mt-0.5">{work.displayTitle}</p>
                  )}
                </div>

                {/* Arabic Content Stack Preview */}
                {work.titleAr && (
                  <div dir="rtl" className="border-t border-slate-100 pt-3 text-right">
                    <h2 className="text-base font-medium text-slate-700 font-sans">
                      {work.titleAr}
                    </h2>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
    );
}