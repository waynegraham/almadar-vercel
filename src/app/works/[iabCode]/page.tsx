// src/app/works/[iabCode]/page.tsx
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { buildWorkByIabCodeQuery, getWorkByIabCode } from "@/lib/strapi";

interface PageProps {
  params: Promise<{
    iabCode: string;
  }>;
}

interface AgentRecord {
  id?: number;
  documentId?: string;
  name?: string;
  nameEn?: string;
  nameAr?: string;
  displayName?: string;
  title?: string;
  titleEn?: string;
  titleAr?: string;
  label?: string;
  labelEn?: string;
  labelAr?: string;
}

interface AgentCredit {
  id?: number;
  documentId?: string;
  label?: string;
  labelEn?: string;
  labelAr?: string;
  agent?: AgentRecord | null;
  agent_role?: AgentRecord | null;
}

interface Work {
  id: number;
  documentId?: string;
  iabCode: string;
  titleEn?: string;
  titleAr?: string;
  creditLineEn?: string;
  creditLineAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  agentCredits?: AgentCredit[];
}

function getRecordLabel(record?: AgentRecord | null) {
  return (
    record?.displayName ||
    record?.name ||
    record?.nameEn ||
    record?.title ||
    record?.titleEn ||
    record?.label ||
    record?.labelEn ||
    record?.nameAr ||
    record?.titleAr ||
    record?.labelAr ||
    ""
  );
}

function getCreditRoleLabel(credit: AgentCredit) {
  return (
    getRecordLabel(credit.agent_role) ||
    credit.label ||
    credit.labelEn ||
    credit.labelAr ||
    ""
  );
}

function AgentCredits({ credits }: { credits?: AgentCredit[] }) {
  if (!credits?.length) {
    return null;
  }

  return (
    <section className="mt-10 border-t border-slate-100 pt-8">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
        Credits
      </h2>
      <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
        {credits.map((credit, index) => {
          const agentName = getRecordLabel(credit.agent) || "Unknown agent";
          const roleName = getCreditRoleLabel(credit);
          const key = credit.documentId || credit.id || `${agentName}-${roleName}-${index}`;

          return (
            <li key={key} className="flex flex-col gap-1 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between">
              <span className="font-medium text-slate-900">{agentName}</span>
              {roleName && (
                <span className="text-sm text-slate-500">{roleName}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default async function IndividualWorkPage({ params }: PageProps) {
  const { iabCode } = await params;
  const { isEnabled: isDraft } = await draftMode();
  
  let work: Work | null = null;
  try {
    work = await getWorkByIabCode(iabCode, isDraft);
  } catch (error) {
    console.error("Failed to fetch work from Strapi:", error);
    return notFound();
  }

  if (!work) {
    notFound();
  }

  // --- CONSTRUCT THE EXACT STRAPI API REQUEST URL FOR DEBUGGING ---
  const query = buildWorkByIabCodeQuery(iabCode, isDraft);
  const exactStrapiApiUrl = `${process.env.STRAPI_API_URL || "http://localhost:1337"}/api/works?${query.toString()}`;
  // ---------------------------------------------------------------

  return (
    <main className="min-h-screen bg-slate-50 pb-24 relative" id="work-detail-page">
      {isDraft && (
        <div className="bg-amber-600 text-white text-center text-xs font-mono uppercase tracking-widest py-2 sticky top-0 z-50 shadow-md">
          Draft Context Active &mdash; Displaying Unpublished Edits
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 md:p-12">
        <section className="mb-6 md:mb-12">
          <h1 className="text-5xl font-bold text-slate-900">
            {work.titleEn || work.titleAr || "Untitled"}
          </h1>
          <p>{work.creditLineEn}</p>
        </section>
      </div>

      <section className="mt-12 p-6 md:p-12">
        <div className="">
          about
        </div>
        <div>
          <p className="text-sm text-slate-500 mt-1 mb-6">
             {work.descriptionEn && (
                <div className="prose prose-slate max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: work.descriptionEn }} />
              )}
          </p>
        </div>
      </section>

      <section id="item-details">

      </section>

      <div className="max-w-6xl mx-auto p-6 md:p-12">
        <Link 
          href="/works" 
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 mb-8 font-medium transition-colors"
        >
          &larr; Return to Index
        </Link>

        {/* Work Container Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-8 md:p-12">
          
          {/* Header Metadata Ribbon */}
          <div className="flex flex-wrap items-center gap-3 mb-8 border-b border-slate-100 pb-6">
            <span className="text-xs font-mono font-bold bg-slate-900 text-white px-3 py-1.5 rounded-md tracking-wider">
              {work.creditLineEn}
            </span>
          </div>

          {/* Bilingual Column Matrix Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* LTR English Content Panel */}
            <section className="space-y-6" dir="ltr">
              <h1 className="text-3xl font-black text-slate-900 leading-tight">{work.titleEn}</h1>
              {work.descriptionEn && (
                <div className="prose prose-slate max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: work.descriptionEn }} />
              )}
            </section>

            {/* RTL Arabic Content Panel */}
            <section className="space-y-6 md:border-r md:pr-12 border-slate-100 text-right" dir="rtl">
              <h1 className="text-3xl font-black text-slate-900 leading-tight font-sans">{work.titleAr || "بدون عنوان"}</h1>
              {work.descriptionAr && (
                <span className="prose prose-slate max-w-none text-slate-700 font-sans" dangerouslySetInnerHTML={{ __html: work.descriptionAr }} />
              )}
            </section>
          </div>

          <AgentCredits credits={work.agentCredits} />

        </div>

        {/* --- DIAGNOSTIC API LINK SECTION --- */}
        <div className="mt-12 p-6 bg-slate-900 text-slate-300 rounded-xl border border-slate-800 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <span className="text-amber-400 font-bold tracking-wider uppercase text-[10px]">Developer Diagnostics</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-400 text-[10px]">GET</span>
          </div>
          <p className="text-slate-400 mb-2 font-sans text-sm">
            Inspect the raw Strapi backend JSON response payload for this record (includes components and nested schemas):
          </p>
          <a 
            href={exactStrapiApiUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block text-blue-400 hover:text-blue-300 underline break-all bg-slate-950 p-3 rounded border border-slate-800 transition-colors duration-150"
          >
            {exactStrapiApiUrl}
          </a>
        </div>
        {/* ------------------------------------ */}

      </div>
    </main>
  );
}
