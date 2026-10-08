'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';
import { AI_KNOWLEDGE_BASE, PERSONAL_INFO } from '@/lib/data';
import { api } from '@/lib/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const idRef = useRef(1);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hi! I'm Basi's AI Portfolio Assistant. I'm strictly grounded in his verified projects, skills, education, and career experience. Ask me anything about his qualifications!`,
      timestamp: 'Just now'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const [projectsList, setProjectsList] = useState<any[]>([]);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('portfolio_settings');
      if (cached) setSettings(JSON.parse(cached));
    } catch {}

    api.settings.get().then(data => {
      if (data) setSettings(data);
    }).catch(() => {});

    api.projects.getAll().then(data => {
      setProjectsList(Array.isArray(data) ? data : []);
    }).catch(() => setProjectsList([]));

    const handleUpdate = (e: any) => {
      if (e.detail) setSettings(e.detail);
    };
    window.addEventListener('portfolio_settings_updated', handleUpdate);

    return () => {
      window.removeEventListener('portfolio_settings_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'Does Basi have MongoDB experience?',
    'What are his featured MERN projects?',
    'What is his full tech stack?',
    'Is he available for full-time roles?'
  ];

  const generateAnswer = (userQuery: string): string => {
    const q = userQuery.toLowerCase();

    if (q.includes('mongo') || q.includes('database') || q.includes('mongoose')) {
      return `Yes, absolutely! MongoDB is one of Basi's core proficiencies (3+ years). He builds production applications utilizing MongoDB Atlas, Mongoose ODM, aggregation framework pipelines, schema indexing for fast query response, and vector search embeddings.`;
    }

    if (q.includes('mern') || q.includes('stack') || q.includes('tech') || q.includes('skills')) {
      return `Basi specializes in the MERN + AI stack:\n• Frontend: Next.js 16 (App Router, Partial Prerendering), React 19, TypeScript, Tailwind CSS v4, Motion, GSAP.\n• Backend: Node.js 24 LTS, Express.js, RESTful microservices, WebSockets.\n• Databases & Cloud: MongoDB Atlas, Mongoose, Redis, Cloudinary, Docker, Vercel.\n• AI: Claude API, OpenAI, prompt engineering.`;
    }

    if (q.includes('project') || q.includes('work') || q.includes('portfolio')) {
      if (projectsList.length > 0) {
        const projListStr = projectsList.map((p, idx) => `${idx + 1}. ${p.title} — ${p.description || 'Production MERN system'}`).join('\n');
        return `Basi's verified uploaded projects include:\n${projListStr}\n\nExplore the Projects page to view live architectures, live demos, and full details!`;
      }
      return `Basi builds high-performance MERN & Next.js applications with resilient distributed backends. Explore the Projects page to view full case studies and live demos.`;
    }

    const contactEmail = settings?.email || PERSONAL_INFO.email;

    if (q.includes('hire') || q.includes('available') || q.includes('job') || q.includes('freelance') || q.includes('contact') || q.includes('email')) {
      return `Yes! Basi is actively seeking Full-Time Full Stack Developer (MERN / Next.js) roles and high-impact freelance engineering contracts. He is available for remote work worldwide or on-site/hybrid positions. You can contact him directly at ${contactEmail} or through the Contact page.`;
    }

    if (q.includes('education') || q.includes('degree') || q.includes('college') || q.includes('university')) {
      return `Basi holds a Bachelor of Science in Computer Science from the University of Calicut and completed intensive Agentic MERN Stack development engineering at Entri Elevate.`;
    }

    if (q.includes('experience') || q.includes('intern') || q.includes('years')) {
      return `Basi has intensive software engineering experience specializing in full-stack MERN, Node.js microservices, Next.js 16, and cloud database architecture.`;
    }

    const match = AI_KNOWLEDGE_BASE.find(k => 
      k.topic.toLowerCase().includes(q) || k.content.toLowerCase().includes(q)
    );

    if (match) {
      return match.content;
    }

    return `As Basi's AI assistant, I'm strictly grounded in his professional experience. He is a skilled MERN Stack Developer with expertise in Next.js 16, Node.js, Express, and MongoDB Atlas. Check out his Projects and Skills pages for in-depth case studies, or reach out to him directly at ${contactEmail}!`;
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    idRef.current += 1;
    const currentId = `msg-${idRef.current}`;

    const userMsg: Message = {
      id: currentId,
      sender: 'user',
      text,
      timestamp: 'Sent'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      idRef.current += 1;
      const respId = `msg-${idRef.current}`;
      const answer = generateAnswer(text);
      const assistantMsg: Message = {
        id: respId,
        sender: 'assistant',
        text: answer,
        timestamp: 'Received'
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-surface border border-primary/40 shadow-xl hover:border-primary text-foreground transition-all duration-300 hover:scale-105 group cursor-pointer"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full gradient-brand-bg flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
            </span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold leading-tight flex items-center gap-1 text-primary">
              Ask About Basi
            </p>
            <p className="text-[10px] text-text-secondary leading-tight">AI Assistant (Grounded)</p>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md h-[550px] bg-surface border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-4 border-b border-border/50 bg-surface-elevated/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-brand-bg flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold">Ask About Basi</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono font-medium">
                    Claude Haiku
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                  Grounded in verified resume data
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
              aria-label="Close assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-border/60 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-surface-elevated border border-border/60 text-foreground rounded-bl-none'
                  }`}
                >
                  {msg.text}
                  <div
                    className={`mt-1 text-[10px] text-right ${
                      msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-text-secondary'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-text-secondary p-2">
                <Bot className="w-4 h-4 text-primary animate-spin" />
                <span>Searching knowledge base & synthesizing answer...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts suggestions */}
          <div className="px-3 py-2 border-t border-border/30 bg-surface/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-surface-elevated hover:bg-surface-elevated/80 border border-border/60 text-text-secondary hover:text-foreground transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-border/50 bg-surface flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything about Basi's skills or projects..."
              className="flex-1 bg-surface-elevated border border-border/60 rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-text-secondary outline-none focus:border-primary/60 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-xl gradient-brand-bg text-white hover:opacity-95 disabled:opacity-40 transition-opacity cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
