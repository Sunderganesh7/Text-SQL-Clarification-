import React, { useRef } from 'react';
import { ArrowLeft, MessageSquare, Database, Search, BrainCircuit, MessageCircleQuestion, FileCode, ShieldCheck, Play, LineChart, FileText, ArrowDown } from 'lucide-react';

interface HelpPageProps {
  onBack: () => void;
}

export const HelpPage: React.FC<HelpPageProps> = ({ onBack }) => {
  const workflowRef = useRef<HTMLElement>(null);

  const scrollToWorkflow = () => {
    workflowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden w-full help-page">
      {/* Header */}
      <div className="flex items-center justify-between p-6 md:px-10 md:py-8 border-b border-border bg-surface flex-shrink-0 help-header z-20 shadow-sm relative">
        <div className="flex flex-col max-w-3xl">
          <h1 className="text-3xl md:text-[32px] font-bold text-text-primary tracking-tight mb-2">Help & About DataInsight AI</h1>
          <p className="text-[15px] md:text-base text-text-secondary">
            Understand how DataInsight AI turns natural-language questions into data insights.
          </p>
          <button 
            onClick={scrollToWorkflow}
            className="mt-6 flex items-center justify-center gap-2 px-5 py-2.5 w-max bg-background border border-border rounded-full text-text-primary hover:bg-surface hover:border-primary/30 hover:text-primary transition-all font-medium shadow-sm help-scroll-button group"
          >
            <span>Explore how it works</span>
            <ArrowDown size={16} className="text-primary group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
        <div className="flex items-start self-start">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-text-primary hover:bg-background hover:text-primary transition-colors font-medium shadow-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto w-full help-scroll-area relative">
        <div className="w-full max-w-[1200px] mx-auto py-10 md:py-12 px-6 md:px-10 space-y-10 md:space-y-12 pb-24 help-container">
          
          {/* Section: What is DataInsight AI? */}
          <section className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm help-section flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm help-step-number">
                01
              </span>
            </div>
            <div className="flex-1 space-y-4">
              <h2 className="text-[22px] md:text-[24px] font-bold text-text-primary help-section-title">
                What is DataInsight AI?
              </h2>
              <div className="text-text-secondary space-y-4 leading-[1.6] text-[15px]">
                <p>
                  <strong>DataInsight AI</strong> is a natural-language data analysis application.
                </p>
                <p>
                  It allows users to ask questions about their datasets using normal language instead of manually writing SQL queries.
                </p>
                <p>
                  The system understands the user's question, identifies relevant database information, generates SQL, validates the query, executes it safely, and presents the result in an understandable form.
                </p>
                <p>
                  The main goal is to make data analysis easier for users who may not know SQL.
                </p>
                
                <div className="mt-6 bg-background p-5 rounded-xl border border-border help-example">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare size={16} className="text-primary" />
                    <p className="font-semibold text-text-primary text-sm uppercase tracking-wider">Example</p>
                  </div>
                  <p className="text-text-primary font-medium text-lg mb-3">"Which city sold the most units?"</p>
                  <p className="text-sm">Instead of manually writing SQL, the user can simply ask the question. DataInsight AI processes the request and returns the relevant result.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section: How does DataInsight AI work? */}
          <section ref={workflowRef} className="bg-transparent help-section">
            <div className="flex items-center gap-4 mb-8">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm help-step-number shadow-sm">
                02
              </span>
              <div>
                <h2 className="text-[24px] md:text-[28px] font-bold text-text-primary help-section-title m-0">
                  How does DataInsight AI work?
                </h2>
                <p className="text-text-secondary text-[15px] mt-1">From a natural-language question to a clear, data-driven answer.</p>
              </div>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-4 md:pl-8 py-4 help-workflow">
              {/* The Vertical Line */}
              <div className="absolute left-9 md:left-[52px] top-4 bottom-4 w-0.5 bg-primary/20 help-timeline"></div>

              {/* Start Card */}
              <div className="relative z-10 flex items-start gap-6 mb-8 help-start-card">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface border-2 border-primary/30 text-primary shadow-sm flex-shrink-0 relative">
                  <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse"></div>
                  <span className="font-bold text-[10px] tracking-wider uppercase">Start</span>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 shadow-sm flex-1 max-w-2xl mt-1">
                  <h3 className="font-bold text-primary text-[16px] mb-1">START HERE</h3>
                  <p className="text-text-secondary text-[14px]">Ask a question about your data in normal language.</p>
                  <div className="mt-3 bg-surface/80 border border-border/50 rounded-lg p-3">
                    <p className="text-text-primary italic text-[14px]">"Which city sold the most units?"</p>
                  </div>
                </div>
              </div>

              {/* Step 01 */}
              <div className="relative z-10 flex items-start gap-6 mb-8 help-step">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface border-2 border-border shadow-sm flex-shrink-0 text-text-primary help-step-icon">
                  <MessageSquare size={20} />
                </div>
                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex-1 max-w-2xl mt-0 help-step-content hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">01</span>
                    <h3 className="font-bold text-text-primary text-[16px] md:text-[18px]">User Question</h3>
                  </div>
                  <p className="text-text-secondary text-[14px] md:text-[15px] leading-[1.6]">The user asks a question about their data using normal language.</p>
                </div>
              </div>

              {/* Step 02 */}
              <div className="relative z-10 flex items-start gap-6 mb-8 help-step">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface border-2 border-border shadow-sm flex-shrink-0 text-text-primary help-step-icon">
                  <Database size={20} />
                </div>
                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex-1 max-w-2xl mt-0 help-step-content hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">02</span>
                    <h3 className="font-bold text-text-primary text-[16px] md:text-[18px]">Schema Understanding</h3>
                  </div>
                  <p className="text-text-secondary text-[14px] md:text-[15px] leading-[1.6]">The system identifies the available tables, columns, data types and relevant database structure.</p>
                </div>
              </div>

              {/* Step 03 */}
              <div className="relative z-10 flex items-start gap-6 mb-8 help-step">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface border-2 border-border shadow-sm flex-shrink-0 text-text-primary help-step-icon">
                  <Search size={20} />
                </div>
                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex-1 max-w-2xl mt-0 help-step-content hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">03</span>
                    <h3 className="font-bold text-text-primary text-[16px] md:text-[18px]">RAG Retrieval</h3>
                  </div>
                  <p className="text-text-secondary text-[14px] md:text-[15px] leading-[1.6]">Relevant schema and business context are retrieved to help the system understand which information is needed.</p>
                </div>
              </div>

              {/* Step 04 */}
              <div className="relative z-10 flex items-start gap-6 mb-8 help-step">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface border-2 border-border shadow-sm flex-shrink-0 text-text-primary help-step-icon">
                  <BrainCircuit size={20} />
                </div>
                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex-1 max-w-2xl mt-0 help-step-content hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">04</span>
                    <h3 className="font-bold text-text-primary text-[16px] md:text-[18px]">Intent & Ambiguity Detection</h3>
                  </div>
                  <p className="text-text-secondary text-[14px] md:text-[15px] leading-[1.6]">The system determines what the user is asking and checks whether the request could have multiple meanings.</p>
                </div>
              </div>

              {/* Step 05 */}
              <div className="relative z-10 flex items-start gap-6 mb-8 help-step">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface border-2 border-border shadow-sm flex-shrink-0 text-text-primary help-step-icon">
                  <MessageCircleQuestion size={20} />
                </div>
                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex-1 max-w-2xl mt-0 help-step-content hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">05</span>
                    <h3 className="font-bold text-text-primary text-[16px] md:text-[18px]">Clarification if Required</h3>
                  </div>
                  <p className="text-text-secondary text-[14px] md:text-[15px] leading-[1.6]">If the question is unclear, the system can ask the user for clarification instead of guessing.</p>
                </div>
              </div>

              {/* Step 06 */}
              <div className="relative z-10 flex items-start gap-6 mb-8 help-step">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface border-2 border-border shadow-sm flex-shrink-0 text-text-primary help-step-icon">
                  <FileCode size={20} />
                </div>
                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex-1 max-w-2xl mt-0 help-step-content hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">06</span>
                    <h3 className="font-bold text-text-primary text-[16px] md:text-[18px]">SQL Generation</h3>
                  </div>
                  <p className="text-text-secondary text-[14px] md:text-[15px] leading-[1.6]">The system converts the natural-language request into an SQL query using the relevant schema and context.</p>
                </div>
              </div>

              {/* Step 07 */}
              <div className="relative z-10 flex items-start gap-6 mb-8 help-step">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface border-2 border-border shadow-sm flex-shrink-0 text-text-primary help-step-icon">
                  <ShieldCheck size={20} />
                </div>
                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex-1 max-w-2xl mt-0 help-step-content hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">07</span>
                    <h3 className="font-bold text-text-primary text-[16px] md:text-[18px]">SQL Validation & Security</h3>
                  </div>
                  <p className="text-text-secondary text-[14px] md:text-[15px] leading-[1.6]">The generated SQL is checked according to the application's read-only and security rules before execution.</p>
                </div>
              </div>

              {/* Step 08 */}
              <div className="relative z-10 flex items-start gap-6 mb-8 help-step">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface border-2 border-border shadow-sm flex-shrink-0 text-text-primary help-step-icon">
                  <Play size={20} className="ml-1" />
                </div>
                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex-1 max-w-2xl mt-0 help-step-content hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">08</span>
                    <h3 className="font-bold text-text-primary text-[16px] md:text-[18px]">Database Execution</h3>
                  </div>
                  <p className="text-text-secondary text-[14px] md:text-[15px] leading-[1.6]">The validated analytical query is executed against the available database.</p>
                </div>
              </div>

              {/* Step 09 */}
              <div className="relative z-10 flex items-start gap-6 mb-8 help-step">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface border-2 border-border shadow-sm flex-shrink-0 text-text-primary help-step-icon">
                  <LineChart size={20} />
                </div>
                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex-1 max-w-2xl mt-0 help-step-content hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">09</span>
                    <h3 className="font-bold text-text-primary text-[16px] md:text-[18px]">Results</h3>
                  </div>
                  <p className="text-text-secondary text-[14px] md:text-[15px] leading-[1.6]">The query results are returned and displayed to the user.</p>
                </div>
              </div>

              {/* Step 10 */}
              <div className="relative z-10 flex items-start gap-6 mb-8 help-step">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface border-2 border-border shadow-sm flex-shrink-0 text-text-primary help-step-icon">
                  <FileText size={20} />
                </div>
                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex-1 max-w-2xl mt-0 help-step-content hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">10</span>
                    <h3 className="font-bold text-text-primary text-[16px] md:text-[18px]">Natural Language Explanation</h3>
                  </div>
                  <p className="text-text-secondary text-[14px] md:text-[15px] leading-[1.6]">The system explains the result in simple, understandable language.</p>
                </div>
              </div>

              {/* End Card */}
              <div className="relative z-10 flex items-start gap-6 help-end-card">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 border-2 border-green-500/30 text-green-600 dark:text-green-400 shadow-sm flex-shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5 shadow-sm flex-1 max-w-2xl mt-1">
                  <h3 className="font-bold text-green-700 dark:text-green-400 text-[16px] mb-1 uppercase tracking-wider">Answer Ready</h3>
                  <p className="text-text-secondary text-[14px]">Your question has been analyzed and the result is ready to understand.</p>
                </div>
              </div>

            </div>
          </section>

          {/* Grid Layout for remaining sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
            
            {/* Section 03: How to ask questions */}
            <section className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm help-section flex flex-col gap-4">
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                  03
                </span>
                <h2 className="text-[20px] md:text-[22px] font-bold text-text-primary help-section-title m-0">
                  How to ask questions
                </h2>
              </div>
              <div className="text-text-secondary space-y-4 text-[15px] leading-[1.6]">
                <p>Users can ask questions using normal language. Specific questions usually produce clearer results.</p>
                
                <div className="bg-background p-5 rounded-xl border border-border space-y-3 help-example">
                  <p className="font-semibold text-text-primary text-sm uppercase tracking-wider">Good Examples</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-text-secondary">
                    <li>Which city sold the most units?</li>
                    <li>Which mobile model generated the highest total sales?</li>
                    <li>Show the top 5 cities by sales.</li>
                    <li>Which brand has the highest average customer rating?</li>
                    <li>Compare sales across cities.</li>
                  </ul>
                </div>
                
                <div className="bg-background p-5 rounded-xl border border-border space-y-2 mt-4 help-example">
                  <p className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-2">Tips</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-text-secondary">
                    <li>Be specific about the metric (e.g., "highest total sales" instead of "performed better").</li>
                    <li>Mention a time period when required.</li>
                    <li>Ask comparison questions clearly.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 04: Clarification Engine */}
            <section className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm help-section flex flex-col gap-4">
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                  04
                </span>
                <h2 className="text-[20px] md:text-[22px] font-bold text-text-primary help-section-title m-0">
                  Clarification Engine
                </h2>
              </div>
              <div className="text-text-secondary space-y-4 text-[15px] leading-[1.6]">
                <p>When a question has multiple possible interpretations, DataInsight AI can ask for clarification.</p>
                
                <div className="bg-background p-5 rounded-xl border border-border help-example">
                  <p className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-3">Example</p>
                  <p className="italic text-text-primary font-medium mb-2">"Which city performed better?"</p>
                  <p className="mb-2">This could mean:</p>
                  <ul className="list-disc pl-5 space-y-1 text-[14px] mb-4 text-text-secondary">
                    <li>highest sales</li>
                    <li>highest units sold</li>
                    <li>highest average rating</li>
                  </ul>
                  <p className="text-[14px] border-t border-border pt-4 text-text-secondary">Instead of guessing, the system can ask the user which metric they mean. This reduces ambiguity and helps produce a more accurate answer.</p>
                </div>
              </div>
            </section>

            {/* Section 05: Data Import */}
            <section className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm help-section flex flex-col gap-4">
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                  05
                </span>
                <h2 className="text-[20px] md:text-[22px] font-bold text-text-primary help-section-title m-0">
                  Data Import
                </h2>
              </div>
              <div className="text-text-secondary space-y-4 text-[15px] leading-[1.6]">
                <p>Users can upload supported <strong>CSV</strong> and <strong>XLSX</strong> datasets.</p>
                <p>After successful import:</p>
                <ol className="list-decimal pl-5 space-y-2 text-text-secondary">
                  <li>The file is processed.</li>
                  <li>The dataset becomes available.</li>
                  <li>Its database table becomes available to the application.</li>
                  <li>Schema Explorer can display its structure.</li>
                  <li>Analytics Chat can use the dataset for questions.</li>
                </ol>
                <p className="mt-4 pt-4 border-t border-border">The system is designed to work with different datasets rather than only one fixed dataset.</p>
              </div>
            </section>

            {/* Section 06: Data Cleaning */}
            <section className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm help-section flex flex-col gap-4">
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                  06
                </span>
                <h2 className="text-[20px] md:text-[22px] font-bold text-text-primary help-section-title m-0">
                  Data Cleaning
                </h2>
              </div>
              <div className="text-text-secondary space-y-4 text-[15px] leading-[1.6]">
                <p>The system includes a Safe Data Cleaning feature with capabilities such as:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <ul className="list-disc pl-5 space-y-2 text-text-secondary">
                    <li>data profiling</li>
                    <li>missing/empty value detection</li>
                    <li>whitespace cleanup</li>
                    <li>duplicate detection</li>
                    <li>date issue detection</li>
                  </ul>
                  <ul className="list-disc pl-5 space-y-2 text-text-secondary">
                    <li>outlier detection/flagging</li>
                    <li>anomalous value detection</li>
                    <li>safe column normalization where supported</li>
                    <li>audit information</li>
                    <li>before/after information</li>
                  </ul>
                </div>
                <p className="mt-4 pt-4 border-t border-border text-sm">The cleaning process is designed to be conservative and avoid blindly guessing missing values.</p>
              </div>
            </section>

            {/* Section 07: Schema Explorer */}
            <section className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm help-section flex flex-col gap-4">
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                  07
                </span>
                <h2 className="text-[20px] md:text-[22px] font-bold text-text-primary help-section-title m-0">
                  Schema Explorer
                </h2>
              </div>
              <div className="text-text-secondary space-y-4 text-[15px] leading-[1.6]">
                <p>Schema Explorer allows users to inspect the structure of the available database.</p>
                <p className="mb-2">Users can see:</p>
                <div className="flex flex-wrap gap-2.5">
                  <span className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm font-medium text-text-primary shadow-sm">tables</span>
                  <span className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm font-medium text-text-primary shadow-sm">columns</span>
                  <span className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm font-medium text-text-primary shadow-sm">data types</span>
                  <span className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm font-medium text-text-primary shadow-sm">nullable information</span>
                  <span className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm font-medium text-text-primary shadow-sm">primary keys</span>
                  <span className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm font-medium text-text-primary shadow-sm">foreign-key information where available</span>
                </div>
                <p className="mt-4 pt-4 border-t border-border">The schema is dynamic. When a new dataset is uploaded successfully, its table can become visible in Schema Explorer after the current schema is loaded/refreshed.</p>
              </div>
            </section>

            {/* Section 08: Query History */}
            <section className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm help-section flex flex-col gap-4">
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                  08
                </span>
                <h2 className="text-[20px] md:text-[22px] font-bold text-text-primary help-section-title m-0">
                  Query History
                </h2>
              </div>
              <div className="text-text-secondary space-y-4 text-[15px] leading-[1.6]">
                <p>Query History allows users to review previous questions/conversations.</p>
                <p className="mb-2">Users can:</p>
                <ul className="list-disc pl-5 space-y-2 text-text-secondary">
                  <li>review previous questions</li>
                  <li>search previous questions</li>
                  <li>review previous analysis</li>
                </ul>
                <div className="bg-background p-4 rounded-xl border border-border text-[14px] flex items-center gap-3 mt-4">
                  <Database size={18} className="text-primary flex-shrink-0" />
                  <p>Query history is persisted in your browser's local storage.</p>
                </div>
              </div>
            </section>

            {/* Section 09: SQL Generation */}
            <section className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm help-section flex flex-col gap-4">
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                  09
                </span>
                <h2 className="text-[20px] md:text-[22px] font-bold text-text-primary help-section-title m-0">
                  SQL Generation
                </h2>
              </div>
              <div className="text-text-secondary space-y-4 text-[15px] leading-[1.6]">
                <p>The system converts a natural-language request into SQL using the available schema and retrieved context.</p>
                <div className="bg-background p-5 rounded-xl border border-border help-example mt-4">
                  <p className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-3">Example</p>
                  <p className="italic text-text-primary font-medium">"Show total units sold by city."</p>
                </div>
                <p className="mt-4">The system generates an SQL query that performs the required aggregation using the relevant table and columns. The generated SQL can be displayed to the user so they can understand how the answer was obtained.</p>
              </div>
            </section>

            {/* Section 10: SQL Security */}
            <section className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm help-section flex flex-col gap-4">
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                  10
                </span>
                <h2 className="text-[20px] md:text-[22px] font-bold text-text-primary help-section-title m-0">
                  SQL Security
                </h2>
              </div>
              <div className="text-text-secondary space-y-4 text-[15px] leading-[1.6]">
                <p>Before generated SQL is executed, the application performs validation and security checks.</p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 py-3">
                  <span className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-[13px] font-semibold text-green-700 dark:text-green-400 shadow-sm"><ShieldCheck size={16}/> Read-only analysis</span>
                  <span className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[13px] font-semibold text-blue-700 dark:text-blue-400 shadow-sm"><ShieldCheck size={16}/> SQL validation</span>
                  <span className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-[13px] font-semibold text-red-700 dark:text-red-400 shadow-sm"><ShieldCheck size={16}/> Unsafe operations blocked</span>
                </div>
                <p>The application is designed for read-only analytical queries. Unsafe operations such as <strong>INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE</strong> are blocked according to the existing security implementation.</p>
                <p className="text-[14px]">Multiple statements and unsafe SQL patterns are also validated/blocked according to the existing implementation.</p>
              </div>
            </section>

            {/* Section 11: Dynamic Datasets */}
            <section className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm help-section flex flex-col gap-4 md:col-span-1 lg:col-span-2">
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                  11
                </span>
                <h2 className="text-[20px] md:text-[22px] font-bold text-text-primary help-section-title m-0">
                  Dynamic Datasets
                </h2>
              </div>
              <div className="text-text-secondary space-y-6 text-[15px] flex flex-col md:flex-row gap-8 leading-[1.6]">
                <div className="flex-1">
                  <p className="mb-5">DataInsight AI is designed to work with different datasets.</p>
                  <p className="mb-4 font-semibold text-text-primary uppercase tracking-wider text-sm">Example uploads:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-background border border-border rounded-xl p-4 text-center text-[13px] font-medium shadow-sm flex items-center justify-center h-full">Mobile Sales Data</div>
                    <div className="bg-background border border-border rounded-xl p-4 text-center text-[13px] font-medium shadow-sm flex items-center justify-center h-full">Employee Data</div>
                    <div className="bg-background border border-border rounded-xl p-4 text-center text-[13px] font-medium shadow-sm flex items-center justify-center h-full">Credit Card Fraud Data</div>
                    <div className="bg-background border border-border rounded-xl p-4 text-center text-[13px] font-medium shadow-sm flex items-center justify-center h-full">Student Data</div>
                  </div>
                </div>
                <div className="flex-1 flex items-center bg-primary/5 rounded-2xl p-6 border border-primary/20 shadow-sm">
                  <p className="text-text-primary leading-[1.7]">The Schema Explorer and analysis workflow automatically adapt to the actual dataset structure you provide, allowing flexible analysis across diverse domains.</p>
                </div>
              </div>
            </section>
          </div>
          
          {/* Section 12 - Quick Start */}
          <section className="bg-primary text-white p-8 md:p-12 rounded-[24px] shadow-lg help-quick-start mt-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col items-center text-center pb-8 mb-8 border-b border-white/20">
                <h2 className="text-[28px] md:text-[32px] font-bold text-white m-0 tracking-tight">
                  How to Get Started
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="bg-white/10 p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors">
                  <div className="text-[32px] font-bold text-white/40 mb-3 font-mono">01</div>
                  <h3 className="font-bold text-white text-[16px] mb-3">Upload dataset</h3>
                  <p className="text-[14px] text-white/80 leading-[1.6]">Upload your CSV/XLSX dataset and wait for import to complete.</p>
                </div>
                
                <div className="bg-white/10 p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors">
                  <div className="text-[32px] font-bold text-white/40 mb-3 font-mono">02</div>
                  <h3 className="font-bold text-white text-[16px] mb-3">Review schema</h3>
                  <p className="text-[14px] text-white/80 leading-[1.6]">Open Schema Explorer to review your tables and columns.</p>
                </div>
                
                <div className="bg-white/10 p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors">
                  <div className="text-[32px] font-bold text-white/40 mb-3 font-mono">03</div>
                  <h3 className="font-bold text-white text-[16px] mb-3">Ask a question</h3>
                  <p className="text-[14px] text-white/80 leading-[1.6]">Open Analytics Chat and ask a natural-language question.</p>
                </div>
                
                <div className="bg-white/10 p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors">
                  <div className="text-[32px] font-bold text-white/40 mb-3 font-mono">04</div>
                  <h3 className="font-bold text-white text-[16px] mb-3">Review results</h3>
                  <p className="text-[14px] text-white/80 leading-[1.6]">Review the generated SQL and the natural language answer.</p>
                </div>
                
                <div className="bg-white/10 p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors">
                  <div className="text-[32px] font-bold text-white/40 mb-3 font-mono">05</div>
                  <h3 className="font-bold text-white text-[16px] mb-3">Query history</h3>
                  <p className="text-[14px] text-white/80 leading-[1.6]">Use Query History to review your previous questions.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Final Overview Card */}
          <section className="bg-surface p-8 rounded-2xl border border-border shadow-sm mt-12 text-center help-overview">
            <h3 className="text-[20px] font-bold text-text-primary mb-6">DataInsight AI at a Glance</h3>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[14px] text-text-secondary font-medium">
              <span className="px-4 py-2 bg-background border border-border rounded-xl shadow-sm">Natural-language data analysis</span>
              <span className="text-border font-light">+</span>
              <span className="px-4 py-2 bg-background border border-border rounded-xl shadow-sm">Dynamic datasets</span>
              <span className="text-border font-light">+</span>
              <span className="px-4 py-2 bg-background border border-border rounded-xl shadow-sm">Schema understanding</span>
              <span className="text-border font-light">+</span>
              <span className="px-4 py-2 bg-background border border-border rounded-xl shadow-sm">RAG</span>
              <span className="text-border font-light">+</span>
              <span className="px-4 py-2 bg-background border border-border rounded-xl shadow-sm">Clarification</span>
              <span className="text-border font-light">+</span>
              <span className="px-4 py-2 bg-background border border-border rounded-xl shadow-sm">SQL generation</span>
              <span className="text-border font-light">+</span>
              <span className="px-4 py-2 bg-background border border-border rounded-xl shadow-sm">SQL validation</span>
              <span className="text-border font-light">+</span>
              <span className="px-4 py-2 bg-background border border-border rounded-xl shadow-sm">Database execution</span>
              <span className="text-border font-light">+</span>
              <span className="px-4 py-2 bg-background border border-border rounded-xl shadow-sm">Natural-language results</span>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
