import React, { useState, useRef, useCallback, FormEvent, useEffect } from "react";
import {
  Video, ClipboardList, BookOpen, Mic, ArrowLeft,
  FileText, Film, Trash2, Eye, FolderOpen, Lock, User,
  Search, X, ChevronRight, Mail, FlaskConical, LogOut, ChevronDown,
  Minus, Square, Maximize2, Globe, Phone, Plus, Building2,
  Users, Beaker, Wrench, UserCircle2, Upload, ChevronDown as Chevron,
} from "lucide-react";

// ─── Sections ────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "videos",     number: "01", title: "Know How",                bg: "#1A9A9A", circleBg: "rgba(255,255,255,0.18)", Icon: Video,        accept: "video/*,application/pdf,.doc,.docx,.ppt,.pptx", itemLabel: "experiencia / técnica" },
  { id: "protocolos", number: "02", title: "Protocolos\nEnriquecidos", bg: "#E07B2A", circleBg: "rgba(255,255,255,0.18)", Icon: ClipboardList, accept: ".pdf,.doc,.docx",                              itemLabel: "protocolo"             },
  { id: "lecciones",  number: "03", title: "Información",              bg: "#687A8C", circleBg: "rgba(255,255,255,0.18)", Icon: BookOpen,      accept: ".pdf,.doc,.docx,.ppt,.pptx",                   itemLabel: "lección / documento"   },
  { id: "entrevista", number: "04", title: "Contactos\ny Entrevistas", bg: "#2B3A52", circleBg: "rgba(255,255,255,0.18)", Icon: Mic,           accept: "audio/*,video/*,.pdf",                         itemLabel: ""                      },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];
type LibrarySectionId = "videos" | "protocolos" | "lecciones";

// ─── Members ─────────────────────────────────────────────────────────────────

const MEMBERS = [
  { id: "m1", name: "Ana García",      role: "Investigadora principal",    initials: "AG", color: "#1A9A9A", email: "ana.garcia@lab.edu",    bio: "Especialista en biología molecular con 12 años de experiencia en el laboratorio." },
  { id: "m2", name: "Carlos López",    role: "Investigador senior",        initials: "CL", color: "#E07B2A", email: "carlos.lopez@lab.edu",  bio: "Experto en microscopía y técnicas de imagen celular avanzada." },
  { id: "m3", name: "María Fernández", role: "Becaria doctoral",           initials: "MF", color: "#687A8C", email: "m.fernandez@lab.edu",   bio: "Desarrollando su tesis sobre expresión génica en condiciones de estrés." },
  { id: "m4", name: "Juan Martínez",   role: "Técnico de laboratorio",     initials: "JM", color: "#2B3A52", email: "j.martinez@lab.edu",    bio: "Responsable de equipos y mantenimiento de protocolos de seguridad." },
  { id: "m5", name: "Laura Sánchez",   role: "Investigadora postdoctoral", initials: "LS", color: "#7B5EA7", email: "laura.sanchez@lab.edu", bio: "Trabajando en mecanismos de resistencia a antibióticos en bacterias." },
  { id: "m6", name: "Diego Torres",    role: "Becario de investigación",   initials: "DT", color: "#C0392B", email: "diego.torres@lab.edu",  bio: "Apoya en experimentos de cultivo celular y análisis de datos." },
];

// ─── Types ───────────────────────────────────────────────────────────────────

type UploadedFile = {
  id: string; name: string; size: number; type: string;
  url: string; uploadedAt: Date; uploadedBy?: string;
};

type LibraryItem = {
  id: string; title: string; description?: string;
  files: UploadedFile[]; createdAt: Date;
};

type LibraryState = Record<LibrarySectionId, LibraryItem[]>;

type ContactCategory = "proveedor" | "laboratorio" | "grupo" | "persona" | "servicio";
type Contact = { id: string; name: string; website: string; contact: string; category: ContactCategory };

type Page = { kind: "home" } | { kind: "section"; id: SectionId } | { kind: "member"; id: string };

type SearchResult =
  | { kind: "section"; section: (typeof SECTIONS)[number] }
  | { kind: "item"; item: LibraryItem; sectionId: LibrarySectionId; section: (typeof SECTIONS)[number] }
  | { kind: "member"; member: (typeof MEMBERS)[number] };

// ─── Initial data ─────────────────────────────────────────────────────────────

const INITIAL_LIBRARY: LibraryState = {
  videos: [
    { id: "kh1", title: "Técnica de pipeteo avanzada",      description: "Mínima variación volumétrica en transferencias de pequeños volúmenes.",      files: [{ id: "v1", name: "Técnica de pipeteo - nivel avanzado.mp4",   size: 45_000_000,  type: "video/mp4",        url: "#", uploadedAt: new Date("2024-03-15"), uploadedBy: "m1" }], createdAt: new Date("2024-03-10") },
    { id: "kh2", title: "Microscopía confocal",             description: "Protocolo e imágenes de microscopía confocal aplicada a células en cultivo.", files: [{ id: "v2", name: "Microscopía confocal - introducción.mp4",   size: 120_000_000, type: "video/mp4",        url: "#", uploadedAt: new Date("2024-04-20"), uploadedBy: "m2" }], createdAt: new Date("2024-04-15") },
    { id: "kh3", title: "Electroforesis en gel de agarosa", description: "Procedimiento estándar y tips para resolución óptima de bandas.",            files: [{ id: "v3", name: "Electroforesis en gel de agarosa.mp4",      size: 60_000_000,  type: "video/mp4",        url: "#", uploadedAt: new Date("2024-06-10"), uploadedBy: "m3" }], createdAt: new Date("2024-06-01") },
  ],
  protocolos: [
    { id: "pr1", title: "Extracción de ADN",  description: "Protocolo optimizado para extracción de ADN genómico.",                        files: [{ id: "p1", name: "Protocolo de extracción de ADN.pdf",         size: 280_000,     type: "application/pdf",  url: "#", uploadedAt: new Date("2024-02-10"), uploadedBy: "m1" }], createdAt: new Date("2024-02-01") },
    { id: "pr2", title: "Western Blot",       description: "Errores comunes y criterios de calidad para Western Blot.",                   files: [{ id: "p2", name: "Western Blot - errores comunes.docx",        size: 150_000,     type: "application/docx", url: "#", uploadedAt: new Date("2024-05-01"), uploadedBy: "m3" }], createdAt: new Date("2024-04-20") },
    { id: "pr3", title: "Cultivo celular",    description: "Criterios de calidad para cultivo celular en condiciones estándar.",          files: [{ id: "p3", name: "Cultivo celular - criterios de calidad.pdf",  size: 340_000,     type: "application/pdf",  url: "#", uploadedAt: new Date("2024-07-15"), uploadedBy: "m2" }], createdAt: new Date("2024-07-10") },
  ],
  lecciones: [
    { id: "ls1", title: "Seguridad en el laboratorio",          description: "Normas y buenas prácticas de seguridad para el trabajo diario.",               files: [{ id: "l1", name: "Seguridad en el laboratorio.pdf",                     size: 500_000,     type: "application/pdf",  url: "#", uploadedAt: new Date("2024-01-20"), uploadedBy: "m4" }], createdAt: new Date("2024-01-15") },
    { id: "ls2", title: "Experimento de cultivo celular",       description: "Análisis y resultados del experimento de cultivo celular de 2024.",             files: [{ id: "l2", name: "Experimento de cultivo celular - análisis.pptx",       size: 3_200_000,   type: "application/pptx", url: "#", uploadedAt: new Date("2024-06-05"), uploadedBy: "m2" }], createdAt: new Date("2024-06-01") },
    { id: "ls3", title: "Buenas prácticas de documentación",    description: "Guía para documentar experimentos y resultados de manera efectiva.",            files: [{ id: "l3", name: "Lección: Buenas prácticas de documentación.pdf",       size: 210_000,     type: "application/pdf",  url: "#", uploadedAt: new Date("2024-08-01"), uploadedBy: "m5" }], createdAt: new Date("2024-07-25") },
  ],
};

const INITIAL_INTERVIEWS: UploadedFile[] = [
  { id: "e1", name: "Entrevista de salida - Ana García.mp4",  size: 200_000_000, type: "video/mp4",       url: "#", uploadedAt: new Date("2024-07-01"), uploadedBy: "m1" },
  { id: "e2", name: "Entrevista de salida - Carlos López.pdf", size: 180_000,    type: "application/pdf", url: "#", uploadedAt: new Date("2024-08-10"), uploadedBy: "m2" },
];

const CONTACT_CATEGORIES: { id: ContactCategory; label: string; Icon: React.ElementType; color: string }[] = [
  { id: "proveedor",   label: "Proveedores",             Icon: Building2,   color: "#E07B2A" },
  { id: "laboratorio", label: "Laboratorios",            Icon: Beaker,      color: "#1A9A9A" },
  { id: "grupo",       label: "Grupos de investigación", Icon: Users,       color: "#7B5EA7" },
  { id: "persona",     label: "Personas",                Icon: UserCircle2, color: "#687A8C" },
  { id: "servicio",    label: "Servicios",               Icon: Wrench,      color: "#2B3A52" },
];

const INITIAL_CONTACTS: Contact[] = [
  { id: "c1",  name: "Sigma-Aldrich",                website: "sigmaaldrich.com",         contact: "ventas@sigma.com",               category: "proveedor"   },
  { id: "c2",  name: "Thermo Fisher Scientific",     website: "thermofisher.com",          contact: "+1-800-766-7000",                category: "proveedor"   },
  { id: "c3",  name: "Lab. Biología Molecular UBA",  website: "uba.ar/biologia",           contact: "labmol@uba.ar",                  category: "laboratorio" },
  { id: "c4",  name: "INGEBI - CONICET",             website: "ingebi.conicet.gov.ar",     contact: "info@ingebi.conicet.gov.ar",     category: "laboratorio" },
  { id: "c5",  name: "Grupo GenExpress",             website: "genexpress.edu.ar",         contact: "contacto@genexpress.edu.ar",     category: "grupo"       },
  { id: "c6",  name: "Red CABBIO",                   website: "cabbio.org",                contact: "admin@cabbio.org",               category: "grupo"       },
  { id: "c7",  name: "Dr. Marcos Ruiz",              website: "",                          contact: "marcos.ruiz@fcen.uba.ar",        category: "persona"     },
  { id: "c8",  name: "Dra. Sofía Palacios",          website: "sofiapalacios.com.ar",      contact: "sofia@palacios.com.ar",          category: "persona"     },
  { id: "c9",  name: "Servicio de Secuenciación NGS",website: "ngs-service.com.ar",        contact: "ngs@service.com.ar",             category: "servicio"    },
  { id: "c10", name: "Microscopía Electrónica FCEN", website: "fcen.uba.ar/microscopia",   contact: "micro@fcen.uba.ar",              category: "servicio"    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(type: string) {
  if (type.startsWith("video/")) return <Film className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
}

function MemberAvatar({ member, size = "md" }: { member: (typeof MEMBERS)[number]; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-11 h-11 text-sm", lg: "w-16 h-16 text-lg", xl: "w-24 h-24 text-2xl" };
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`} style={{ backgroundColor: member.color }}>
      {member.initials}
    </div>
  );
}

// ─── Shared: Section header ───────────────────────────────────────────────────

function SectionHeader({ title, number, bg, Icon, onBack }: {
  title: string; number: string; bg: string; Icon: React.ElementType; onBack: () => void;
}) {
  return (
    <div className="px-8 py-5 flex items-center gap-4 shadow-md flex-shrink-0" style={{ backgroundColor: bg }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-white/75 hover:text-white transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />Inicio
      </button>
      <div className="w-px h-5 bg-white/25" />
      <Icon className="w-5 h-5 text-white" strokeWidth={1.6} />
      <h1 className="text-white font-bold text-lg leading-none">{title.replace(/\n/g, " ")}</h1>
      <span className="ml-auto text-white/50 text-xs font-semibold tracking-widest">{number}</span>
    </div>
  );
}

// ─── Shared: Compact file row ─────────────────────────────────────────────────

function FileRow({ file, bg, onRemove }: { file: UploadedFile; bg: string; onRemove: () => void }) {
  const uploader = MEMBERS.find((m) => m.id === file.uploadedBy);
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#F7F9FB] transition-colors group">
      <span style={{ color: bg }} className="flex-shrink-0">{fileIcon(file.type)}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#2B3A52] font-medium truncate">{file.name}</p>
        <p className="text-xs text-[#9AAABB]">
          {formatBytes(file.size)} · {file.uploadedAt.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
          {uploader && <> · <span style={{ color: bg }}>{uploader.name}</span></>}
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a href={file.url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <Eye className="w-3.5 h-3.5 text-[#687A8C]" />
        </a>
        <button onClick={onRemove} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors">
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
        </button>
      </div>
    </div>
  );
}

// ─── NavBar ───────────────────────────────────────────────────────────────────

function NavBar({ currentUser, onGoHome, onGoProfile, onLogout, isMaximized, onMinimize, onMaximize, onClose }: {
  currentUser: (typeof MEMBERS)[number]; onGoHome: () => void; onGoProfile: () => void; onLogout: () => void;
  isMaximized: boolean; onMinimize: () => void; onMaximize: () => void; onClose: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <nav className="w-full bg-white border-b border-[#E8ECF0] shadow-sm z-40 sticky top-0 flex-shrink-0" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="px-4 h-14 flex items-center justify-between gap-4">
        <button onClick={onGoHome} className="flex items-center gap-2.5 group focus:outline-none flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-105" style={{ backgroundColor: "#1A9A9A" }}>
            <FlaskConical className="w-4 h-4 text-white" strokeWidth={1.8} />
          </div>
          
        </button>

        <div className="flex items-center gap-3">
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-[#F0F2F5] transition-colors focus:outline-none">
              <MemberAvatar member={currentUser} size="sm" />
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-[#2B3A52] leading-tight">{currentUser.name}</p>
                <p className="text-xs text-[#9AAABB] leading-tight">{currentUser.role}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#9AAABB] transition-transform duration-150 ${menuOpen ? "rotate-180" : ""}`} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E8ECF0] overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[#F0F2F5]">
                  <p className="text-xs font-semibold text-[#2B3A52]">{currentUser.name}</p>
                  <p className="text-xs text-[#9AAABB] truncate">{currentUser.email}</p>
                </div>
                <button onClick={() => { setMenuOpen(false); onGoProfile(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F7F9FB] transition-colors text-left">
                  <User className="w-4 h-4 text-[#687A8C]" /><span className="text-sm font-medium text-[#2B3A52]">Mi perfil</span>
                </button>
                <button onClick={() => { setMenuOpen(false); onLogout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left">
                  <LogOut className="w-4 h-4 text-red-400" /><span className="text-sm font-medium text-red-400">Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-[#E8ECF0]" />

          <div className="flex items-center gap-1">
            <button onClick={onMinimize} title="Minimizar" className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9AAABB] hover:bg-[#F0F2F5] hover:text-[#687A8C] transition-colors focus:outline-none">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button onClick={onMaximize} title={isMaximized ? "Restaurar" : "Maximizar"} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9AAABB] hover:bg-[#F0F2F5] hover:text-[#687A8C] transition-colors focus:outline-none">
              {isMaximized ? <Maximize2 className="w-3.5 h-3.5" /> : <Square className="w-3 h-3" strokeWidth={1.5} />}
            </button>
            <button onClick={onClose} title="Cerrar" className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9AAABB] hover:bg-red-50 hover:text-red-500 transition-colors focus:outline-none">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────

function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError("Por favor completá ambos campos."); return; }
    onLogin();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#EDF0F4", fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md" style={{ backgroundColor: "#1A9A9A" }}>
            <Lock className="w-7 h-7 text-white" strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#2B3A52] tracking-tight">Legado</h1>
          <p className="text-[#687A8C] text-sm mt-1">dejá tu huella</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg px-8 py-9">
          <h2 className="text-lg font-bold text-[#2B3A52] mb-6 text-center">Inicio de sesión</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#687A8C] uppercase tracking-wider mb-1.5">Nombre de usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AAABB]" />
                <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError(""); }} placeholder="usuario"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#DDE2E8] bg-[#F7F9FB] text-[#2B3A52] text-sm placeholder-[#B0BCCA] focus:outline-none focus:border-[#1A9A9A] focus:ring-2 focus:ring-[#1A9A9A]/20 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#687A8C] uppercase tracking-wider mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AAABB]" />
                <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#DDE2E8] bg-[#F7F9FB] text-[#2B3A52] text-sm placeholder-[#B0BCCA] focus:outline-none focus:border-[#1A9A9A] focus:ring-2 focus:ring-[#1A9A9A]/20 transition-all" />
              </div>
            </div>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button type="submit" className="mt-2 w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-150 hover:opacity-90 active:scale-[0.98] shadow-sm" style={{ backgroundColor: "#1A9A9A" }}>
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Global search bar (home) ─────────────────────────────────────────────────

function SearchBar({ library, onNavigate }: { library: LibraryState; onNavigate: (p: Page) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const results: SearchResult[] = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: SearchResult[] = [];
    for (const s of SECTIONS) {
      if (s.title.toLowerCase().includes(q)) out.push({ kind: "section", section: s });
    }
    for (const sid of ["videos", "protocolos", "lecciones"] as LibrarySectionId[]) {
      const sec = SECTIONS.find((s) => s.id === sid)!;
      for (const item of library[sid]) {
        if (item.title.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q) ||
            item.files.some((f) => f.name.toLowerCase().includes(q))) {
          out.push({ kind: "item", item, sectionId: sid, section: sec });
        }
      }
    }
    for (const m of MEMBERS) {
      if (m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)) out.push({ kind: "member", member: m });
    }
    return out.slice(0, 10);
  })();

  function handleSelect(r: SearchResult) {
    setQuery(""); setOpen(false);
    if (r.kind === "section") onNavigate({ kind: "section", id: r.section.id });
    else if (r.kind === "item") onNavigate({ kind: "section", id: r.sectionId });
    else onNavigate({ kind: "member", id: r.member.id });
  }

  return (
    <div ref={ref} className="relative w-full max-w-xl mx-auto mb-10">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AAABB]" />
        <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
          placeholder="Buscar experiencias, protocolos, información, integrantes…"
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-[#DDE2E8] bg-white text-[#2B3A52] text-sm placeholder-[#B0BCCA] shadow-sm focus:outline-none focus:border-[#1A9A9A] focus:ring-2 focus:ring-[#1A9A9A]/20 transition-all" />
        {query && <button onClick={() => { setQuery(""); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AAABB] hover:text-[#687A8C]"><X className="w-4 h-4" /></button>}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#E8ECF0] overflow-hidden z-50">
          {results.map((r, i) => {
            if (r.kind === "section") {
              const Icon = r.section.Icon;
              return (
                <button key={i} onClick={() => handleSelect(r)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F7F9FB] transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: r.section.bg + "22" }}><Icon className="w-4 h-4" style={{ color: r.section.bg }} /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[#2B3A52] truncate">{r.section.title.replace(/\n/g, " ")}</p><p className="text-xs text-[#9AAABB]">Sección</p></div>
                  <ChevronRight className="w-4 h-4 text-[#C4CDD8]" />
                </button>
              );
            }
            if (r.kind === "item") {
              const Icon = r.section.Icon;
              return (
                <button key={i} onClick={() => handleSelect(r)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F7F9FB] transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: r.section.bg + "22" }}><Icon className="w-4 h-4" style={{ color: r.section.bg }} /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[#2B3A52] truncate">{r.item.title}</p><p className="text-xs text-[#9AAABB]">{r.section.title.replace(/\n/g, " ")}</p></div>
                  <ChevronRight className="w-4 h-4 text-[#C4CDD8]" />
                </button>
              );
            }
            const m = r.member;
            return (
              <button key={i} onClick={() => handleSelect(r)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F7F9FB] transition-colors text-left">
                <MemberAvatar member={m} size="sm" />
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[#2B3A52] truncate">{m.name}</p><p className="text-xs text-[#9AAABB]">{m.role}</p></div>
                <ChevronRight className="w-4 h-4 text-[#C4CDD8]" />
              </button>
            );
          })}
        </div>
      )}
      {open && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#E8ECF0] px-4 py-6 text-center z-50">
          <p className="text-sm text-[#9AAABB]">Sin resultados para <strong className="text-[#687A8C]">"{query}"</strong></p>
        </div>
      )}
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────

function Home({ library, onNavigate }: { library: LibraryState; onNavigate: (p: Page) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center px-6 py-14" style={{ backgroundColor: "#EDF0F4", fontFamily: "'Inter', sans-serif" }}>
      
      
      <SearchBar library={library} onNavigate={onNavigate} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mb-16">
        {SECTIONS.map((s) => {
          const Icon = s.Icon;
          return (
            <button key={s.id} onClick={() => onNavigate({ kind: "section", id: s.id })}
              className="group flex flex-col items-center text-center rounded-2xl px-7 pt-12 pb-10 cursor-pointer transition-all duration-200 hover:scale-[1.04] hover:shadow-2xl shadow-lg focus:outline-none"
              style={{ backgroundColor: s.bg, minHeight: "300px" }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-7 transition-transform duration-200 group-hover:scale-105" style={{ backgroundColor: s.circleBg }}>
                <Icon className="w-9 h-9 text-white" strokeWidth={1.6} />
              </div>
              <span className="text-white/60 text-xs font-semibold tracking-[0.2em] mb-2">{s.number}</span>
              <h2 className="text-white font-bold leading-snug whitespace-pre-line text-[20px] mt-8">{s.title}</h2>
            </button>
          );
        })}
      </div>
      <div className="w-full max-w-5xl">
        <div className="flex items-center gap-2 mb-5">
          <FlaskConical className="w-5 h-5 text-[#687A8C]" />
          <h2 className="text-base font-bold text-[#2B3A52] uppercase tracking-wider">Integrantes del laboratorio</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {MEMBERS.map((m) => (
            <button key={m.id} onClick={() => onNavigate({ kind: "member", id: m.id })}
              className="group bg-white rounded-2xl px-4 py-5 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:scale-[1.03] transition-all duration-150 focus:outline-none">
              <MemberAvatar member={m} size="lg" />
              <p className="mt-3 text-sm font-semibold text-[#2B3A52] leading-tight">{m.name}</p>
              <p className="mt-1 text-xs text-[#9AAABB] leading-tight">{m.role}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Library page (Know How / Protocolos / Información) ───────────────────────

function ItemCard({ item, bg, accept, onAddFile, onRemoveFile, onDelete }: {
  item: LibraryItem; bg: string; accept: string;
  onAddFile: (itemId: string, fl: FileList) => void;
  onRemoveFile: (itemId: string, fileId: string) => void;
  onDelete: (itemId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Item header */}
      <div className="flex items-start gap-3 px-5 py-4 border-b border-[#F0F2F5]">
        <button onClick={() => setExpanded((v) => !v)} className="flex-1 flex items-center gap-2 text-left focus:outline-none min-w-0">
          <Chevron className={`w-4 h-4 text-[#9AAABB] flex-shrink-0 transition-transform ${expanded ? "" : "-rotate-90"}`} />
          <div className="min-w-0">
            <p className="font-bold text-[#2B3A52] text-sm leading-snug">{item.title}</p>
            {item.description && <p className="text-xs text-[#9AAABB] mt-0.5 truncate">{item.description}</p>}
          </div>
        </button>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs text-[#9AAABB]">{item.files.length} archivo{item.files.length !== 1 ? "s" : ""}</span>
          {/* Add file button */}
          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ backgroundColor: bg + "18", color: bg }}
            title="Añadir archivo"
          >
            <Plus className="w-3 h-3" />Añadir
          </button>
          <input ref={inputRef} type="file" multiple accept={accept} className="hidden"
            onChange={(e) => { if (e.target.files?.length) { onAddFile(item.id, e.target.files); e.target.value = ""; } }} />
          <button onClick={() => onDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Files */}
      {expanded && (
        <div className="px-4 py-2">
          {item.files.length === 0 ? (
            <button onClick={() => inputRef.current?.click()}
              className="w-full py-4 flex flex-col items-center gap-1.5 text-[#9AAABB] hover:text-[#687A8C] transition-colors">
              <Upload className="w-4 h-4" />
              <span className="text-xs">Añadir el primer archivo</span>
            </button>
          ) : (
            item.files.map((f) => (
              <FileRow key={f.id} file={f} bg={bg} onRemove={() => onRemoveFile(item.id, f.id)} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function LibraryPage({ section, items, onAddItem, onDeleteItem, onAddFile, onRemoveFile, onBack }: {
  section: (typeof SECTIONS)[number];
  items: LibraryItem[];
  onAddItem: (title: string, description: string) => void;
  onDeleteItem: (id: string) => void;
  onAddFile: (itemId: string, fl: FileList) => void;
  onRemoveFile: (itemId: string, fileId: string) => void;
  onBack: () => void;
}) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formError, setFormError] = useState("");

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    return !q || item.title.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.files.some((f) => f.name.toLowerCase().includes(q));
  });

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!formTitle.trim()) { setFormError("El nombre es obligatorio."); return; }
    onAddItem(formTitle.trim(), formDesc.trim());
    setFormTitle(""); setFormDesc(""); setFormError(""); setShowForm(false);
  }

  const Icon = section.Icon;

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: "#EDF0F4", fontFamily: "'Inter', sans-serif" }}>
      <SectionHeader title={section.title} number={section.number} bg={section.bg} Icon={Icon} onBack={onBack} />

      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-8">
        {/* Toolbar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AAABB]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Buscar ${section.itemLabel}…`}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#DDE2E8] bg-white text-[#2B3A52] text-sm placeholder-[#B0BCCA] focus:outline-none focus:border-[#1A9A9A] focus:ring-2 focus:ring-[#1A9A9A]/20 transition-all shadow-sm" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AAABB] hover:text-[#687A8C]"><X className="w-4 h-4" /></button>}
          </div>
          <button onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97] shadow-sm flex-shrink-0"
            style={{ backgroundColor: section.bg }}>
            <Plus className="w-4 h-4" />Nuevo
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8ECF0] p-5 mb-5">
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <input value={formTitle} onChange={(e) => { setFormTitle(e.target.value); setFormError(""); }} placeholder={`Nombre de la ${section.itemLabel} *`}
                className="w-full px-3 py-2.5 rounded-xl border border-[#DDE2E8] bg-[#F7F9FB] text-[#2B3A52] text-sm placeholder-[#B0BCCA] focus:outline-none focus:border-[#687A8C] focus:ring-2 focus:ring-[#687A8C]/15 transition-all" />
              <input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Descripción breve (opcional)"
                className="w-full px-3 py-2.5 rounded-xl border border-[#DDE2E8] bg-[#F7F9FB] text-[#2B3A52] text-sm placeholder-[#B0BCCA] focus:outline-none focus:border-[#687A8C] focus:ring-2 focus:ring-[#687A8C]/15 transition-all" />
              {formError && <p className="text-red-400 text-xs">{formError}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setShowForm(false); setFormError(""); }} className="px-4 py-2 rounded-xl text-[#687A8C] text-sm font-medium hover:bg-[#F0F2F5] transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm" style={{ backgroundColor: section.bg }}>Guardar</button>
              </div>
            </form>
          </div>
        )}

        {/* Items */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-[#9AAABB]">
            <FolderOpen className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">{search ? `Sin resultados para "${search}"` : `Aún no hay ${section.itemLabel}s. Creá el primero.`}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} bg={section.bg} accept={section.accept}
                onAddFile={onAddFile} onRemoveFile={onRemoveFile} onDelete={onDeleteItem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Contacts page ────────────────────────────────────────────────────────────

function ContactsPage({ contacts, interviews, onAddContact, onRemoveContact, onUploadInterview, onRemoveInterview, onBack }: {
  contacts: Contact[]; interviews: UploadedFile[];
  onAddContact: (c: Omit<Contact, "id">) => void; onRemoveContact: (id: string) => void;
  onUploadInterview: (fl: FileList) => void; onRemoveInterview: (id: string) => void;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<ContactCategory | "todos">("todos");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: "", website: "", contact: "", category: "proveedor" as ContactCategory });
  const [formError, setFormError] = useState("");

  const section = SECTIONS.find((s) => s.id === "entrevista")!;

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    const matchCat = activeTab === "todos" || c.category === activeTab;
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q) || c.website.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim()) { setFormError("Nombre y contacto son obligatorios."); return; }
    onAddContact({ name: form.name.trim(), website: form.website.trim(), contact: form.contact.trim(), category: form.category });
    setForm({ name: "", website: "", contact: "", category: "proveedor" }); setFormError(""); setShowForm(false);
  }

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: "#EDF0F4", fontFamily: "'Inter', sans-serif" }}>
      <SectionHeader title="Contactos y Entrevistas" number="04" bg="#2B3A52" Icon={Mic} onBack={onBack} />

      <div className="max-w-5xl mx-auto w-full px-6 py-8">

        {/* Contacts */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#2B3A52] text-sm uppercase tracking-wider">Directorio de contactos</h2>
          <button onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97] shadow-sm"
            style={{ backgroundColor: "#2B3A52" }}>
            <Plus className="w-4 h-4" />Agregar
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8ECF0] p-6 mb-4">
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-[#687A8C] uppercase tracking-wider mb-1">Nombre *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nombre o razón social"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#DDE2E8] bg-[#F7F9FB] text-[#2B3A52] text-sm placeholder-[#B0BCCA] focus:outline-none focus:border-[#2B3A52] focus:ring-2 focus:ring-[#2B3A52]/15 transition-all" /></div>
              <div><label className="block text-xs font-semibold text-[#687A8C] uppercase tracking-wider mb-1">Categoría</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ContactCategory }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#DDE2E8] bg-[#F7F9FB] text-[#2B3A52] text-sm focus:outline-none focus:border-[#2B3A52] focus:ring-2 focus:ring-[#2B3A52]/15 transition-all">
                  {CONTACT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select></div>
              <div><label className="block text-xs font-semibold text-[#687A8C] uppercase tracking-wider mb-1">Sitio web</label>
                <input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} placeholder="ejemplo.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#DDE2E8] bg-[#F7F9FB] text-[#2B3A52] text-sm placeholder-[#B0BCCA] focus:outline-none focus:border-[#2B3A52] focus:ring-2 focus:ring-[#2B3A52]/15 transition-all" /></div>
              <div><label className="block text-xs font-semibold text-[#687A8C] uppercase tracking-wider mb-1">Contacto *</label>
                <input value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} placeholder="email o teléfono"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#DDE2E8] bg-[#F7F9FB] text-[#2B3A52] text-sm placeholder-[#B0BCCA] focus:outline-none focus:border-[#2B3A52] focus:ring-2 focus:ring-[#2B3A52]/15 transition-all" /></div>
              {formError && <p className="sm:col-span-2 text-red-400 text-xs">{formError}</p>}
              <div className="sm:col-span-2 flex justify-end gap-2">
                <button type="button" onClick={() => { setShowForm(false); setFormError(""); }} className="px-4 py-2 rounded-xl text-[#687A8C] text-sm font-medium hover:bg-[#F0F2F5] transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 shadow-sm" style={{ backgroundColor: "#2B3A52" }}>Guardar</button>
              </div>
            </form>
          </div>
        )}

        {/* Search + tabs */}
        <div className="flex flex-wrap gap-2 items-center mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9AAABB]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar contacto…"
              className="pl-8 pr-8 py-2 rounded-xl border border-[#DDE2E8] bg-white text-[#2B3A52] text-xs placeholder-[#B0BCCA] focus:outline-none focus:border-[#2B3A52] focus:ring-2 focus:ring-[#2B3A52]/15 transition-all shadow-sm" />
            {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9AAABB]"><X className="w-3.5 h-3.5" /></button>}
          </div>
          <button onClick={() => setActiveTab("todos")} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "todos" ? "text-white shadow-sm" : "text-[#687A8C] bg-white hover:bg-[#F0F2F5]"}`} style={activeTab === "todos" ? { backgroundColor: "#2B3A52" } : {}}>
            Todos ({contacts.length})
          </button>
          {CONTACT_CATEGORIES.map((cat) => {
            const count = contacts.filter((c) => c.category === cat.id).length;
            const active = activeTab === cat.id;
            const CatIcon = cat.Icon;
            return (
              <button key={cat.id} onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${active ? "text-white shadow-sm" : "text-[#687A8C] bg-white hover:bg-[#F0F2F5]"}`}
                style={active ? { backgroundColor: cat.color } : {}}>
                <CatIcon className="w-3 h-3" />{cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-10">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-[#9AAABB]"><Users className="w-8 h-8 mb-2 opacity-30" /><p className="text-sm">Sin contactos.</p></div>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b border-[#F0F2F5]">
                <th className="text-left text-xs font-semibold text-[#9AAABB] uppercase tracking-wider px-5 py-3.5">Nombre</th>
                <th className="text-left text-xs font-semibold text-[#9AAABB] uppercase tracking-wider px-4 py-3.5 hidden sm:table-cell">Categoría</th>
                <th className="text-left text-xs font-semibold text-[#9AAABB] uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">Sitio web</th>
                <th className="text-left text-xs font-semibold text-[#9AAABB] uppercase tracking-wider px-4 py-3.5">Contacto</th>
                <th className="w-10 px-2" />
              </tr></thead>
              <tbody>
                {filtered.map((c, i) => {
                  const cat = CONTACT_CATEGORIES.find((k) => k.id === c.category)!;
                  const CatIcon = cat.Icon;
                  return (
                    <tr key={c.id} className={`border-b border-[#F7F9FB] last:border-0 hover:bg-[#F9FAFB] transition-colors ${i % 2 !== 0 ? "bg-[#FAFBFC]" : ""}`}>
                      <td className="px-5 py-3.5"><span className="font-semibold text-[#2B3A52] text-sm">{c.name}</span></td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg" style={{ backgroundColor: cat.color + "18", color: cat.color }}>
                          <CatIcon className="w-3 h-3" />{cat.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        {c.website ? <a href={`https://${c.website.replace(/^https?:\/\//, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#1A9A9A] hover:underline"><Globe className="w-3 h-3" />{c.website}</a>
                          : <span className="text-xs text-[#C4CDD8]">—</span>}
                      </td>
                      <td className="px-4 py-3.5"><span className="inline-flex items-center gap-1 text-xs text-[#687A8C]"><Phone className="w-3 h-3 flex-shrink-0" />{c.contact}</span></td>
                      <td className="px-2 py-3.5">
                        <button onClick={() => onRemoveContact(c.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Interviews */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-[#2B3A52]" />
            <h2 className="font-bold text-[#2B3A52] text-sm uppercase tracking-wider">Entrevistas de salida</h2>
          </div>
          <button onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97] shadow-sm"
            style={{ backgroundColor: "#2B3A52" }}>
            <Plus className="w-4 h-4" />Subir entrevista
          </button>
          <input ref={inputRef} type="file" multiple accept={section.accept} className="hidden"
            onChange={(e) => { if (e.target.files?.length) { onUploadInterview(e.target.files); } }} />
        </div>

        {interviews.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-[#9AAABB]"><FolderOpen className="w-8 h-8 mb-2 opacity-30" /><p className="text-sm">No hay entrevistas registradas aún.</p></div>
        ) : (
          <div className="flex flex-col gap-3">
            {interviews.map((f) => (
              <div key={f.id} className="bg-white rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#2B3A52" + "20" }}>
                  <FileText className="w-5 h-5 text-[#2B3A52]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#2B3A52] text-sm truncate">{f.name}</p>
                  <p className="text-[#9AAABB] text-xs mt-0.5">
                    {formatBytes(f.size)} · {f.uploadedAt.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                    {MEMBERS.find((m) => m.id === f.uploadedBy) && <> · <span className="text-[#2B3A52]">{MEMBERS.find((m) => m.id === f.uploadedBy)?.name}</span></>}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"><Eye className="w-4 h-4 text-[#687A8C]" /></a>
                  <button onClick={() => onRemoveInterview(f.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Member profile page ──────────────────────────────────────────────────────

function MemberPage({ member, library, interviews, onBack }: {
  member: (typeof MEMBERS)[number]; library: LibraryState; interviews: UploadedFile[]; onBack: () => void;
}) {
  const memberSections = [
    { section: SECTIONS[0], items: library.videos.filter((i) => i.files.some((f) => f.uploadedBy === member.id)) },
    { section: SECTIONS[1], items: library.protocolos.filter((i) => i.files.some((f) => f.uploadedBy === member.id)) },
    { section: SECTIONS[2], items: library.lecciones.filter((i) => i.files.some((f) => f.uploadedBy === member.id)) },
  ].filter((g) => g.items.length > 0);

  const memberInterviews = interviews.filter((f) => f.uploadedBy === member.id);

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: "#EDF0F4", fontFamily: "'Inter', sans-serif" }}>
      <div className="px-8 py-5 flex items-center gap-4 shadow-md flex-shrink-0" style={{ backgroundColor: member.color }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/75 hover:text-white transition-colors text-sm font-medium"><ArrowLeft className="w-4 h-4" />Inicio</button>
        <div className="w-px h-5 bg-white/25" />
        <MemberAvatar member={member} size="sm" />
        <h1 className="text-white font-bold text-lg">{member.name}</h1>
      </div>

      <div className="max-w-3xl mx-auto w-full px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm p-8 flex gap-6 items-start mb-10">
          <MemberAvatar member={member} size="xl" />
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold text-[#2B3A52]">{member.name}</h2>
            <p className="text-sm font-semibold mt-1" style={{ color: member.color }}>{member.role}</p>
            <p className="text-[#687A8C] text-sm mt-3 leading-relaxed">{member.bio}</p>
            <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1.5 mt-4 text-xs text-[#9AAABB] hover:text-[#687A8C] transition-colors"><Mail className="w-3.5 h-3.5" />{member.email}</a>
          </div>
        </div>

        <h3 className="font-bold text-[#2B3A52] text-sm uppercase tracking-wider mb-5">Contribuciones de {member.name.split(" ")[0]}</h3>

        {memberSections.length === 0 && memberInterviews.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-[#9AAABB]"><FolderOpen className="w-10 h-10 mb-3 opacity-40" /><p className="text-sm">Este integrante aún no ha subido archivos.</p></div>
        ) : (
          <div className="flex flex-col gap-8">
            {memberSections.map(({ section, items }) => {
              const Icon = section.Icon;
              return (
                <div key={section.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: section.bg + "22" }}><Icon className="w-3.5 h-3.5" style={{ color: section.bg }} /></div>
                    <span className="text-sm font-bold text-[#2B3A52]">{section.title.replace(/\n/g, " ")}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {items.map((item) => (
                      <div key={item.id} className="bg-white rounded-xl px-5 py-3.5 shadow-sm">
                        <p className="font-semibold text-[#2B3A52] text-sm mb-2">{item.title}</p>
                        {item.files.filter((f) => f.uploadedBy === member.id).map((f) => (
                          <FileRow key={f.id} file={f} bg={section.bg} onRemove={() => {}} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {memberInterviews.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#2B3A52" + "22" }}><Mic className="w-3.5 h-3.5 text-[#2B3A52]" /></div>
                  <span className="text-sm font-bold text-[#2B3A52]">Entrevistas</span>
                </div>
                <div className="flex flex-col gap-2">
                  {memberInterviews.map((f) => <FileRow key={f.id} file={f} bg="#2B3A52" onRemove={() => {}} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const CURRENT_USER_ID = "m1";
type WindowState = "normal" | "minimized" | "closed";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState<Page>({ kind: "home" });
  const [library, setLibrary] = useState<LibraryState>(INITIAL_LIBRARY);
  const [interviews, setInterviews] = useState<UploadedFile[]>(INITIAL_INTERVIEWS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [windowState, setWindowState] = useState<WindowState>("normal");
  const [isMaximized, setIsMaximized] = useState(false);

  const addItem = useCallback((sectionId: LibrarySectionId, title: string, description: string) => {
    setLibrary((prev) => ({
      ...prev,
      [sectionId]: [...prev[sectionId], { id: crypto.randomUUID(), title, description, files: [], createdAt: new Date() }],
    }));
  }, []);

  const deleteItem = useCallback((sectionId: LibrarySectionId, itemId: string) => {
    setLibrary((prev) => ({ ...prev, [sectionId]: prev[sectionId].filter((i) => i.id !== itemId) }));
  }, []);

  const addFile = useCallback((sectionId: LibrarySectionId, itemId: string, fl: FileList) => {
    const added: UploadedFile[] = Array.from(fl).map((f) => ({
      id: crypto.randomUUID(), name: f.name, size: f.size, type: f.type,
      url: URL.createObjectURL(f), uploadedAt: new Date(), uploadedBy: CURRENT_USER_ID,
    }));
    setLibrary((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId].map((i) => i.id === itemId ? { ...i, files: [...i.files, ...added] } : i),
    }));
  }, []);

  const removeFile = useCallback((sectionId: LibrarySectionId, itemId: string, fileId: string) => {
    setLibrary((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId].map((i) => i.id === itemId ? { ...i, files: i.files.filter((f) => f.id !== fileId) } : i),
    }));
  }, []);

  const addInterview = useCallback((fl: FileList) => {
    const added: UploadedFile[] = Array.from(fl).map((f) => ({
      id: crypto.randomUUID(), name: f.name, size: f.size, type: f.type,
      url: URL.createObjectURL(f), uploadedAt: new Date(), uploadedBy: CURRENT_USER_ID,
    }));
    setInterviews((prev) => [...prev, ...added]);
  }, []);

  function handleLogout() { setLoggedIn(false); setPage({ kind: "home" }); setWindowState("normal"); }
  function handleMaximize() {
    if (!isMaximized) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
    setIsMaximized((v) => !v);
  }

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  if (windowState === "closed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 opacity-40" style={{ backgroundColor: "#1A9A9A" }}><FlaskConical className="w-7 h-7 text-white" strokeWidth={1.8} /></div>
          <p className="text-white/30 text-sm mb-6">La aplicación está cerrada</p>
          <button onClick={() => setWindowState("normal")} className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-80 transition-opacity" style={{ backgroundColor: "#1A9A9A" }}>Reabrir Legado</button>
        </div>
      </div>
    );
  }

  const currentUser = MEMBERS.find((m) => m.id === CURRENT_USER_ID)!;
  const navbar = (
    <NavBar currentUser={currentUser}
      onGoHome={() => setPage({ kind: "home" })}
      onGoProfile={() => setPage({ kind: "member", id: CURRENT_USER_ID })}
      onLogout={handleLogout} isMaximized={isMaximized}
      onMinimize={() => setWindowState("minimized")} onMaximize={handleMaximize}
      onClose={() => setWindowState("closed")} />
  );

  if (windowState === "minimized") {
    return (
      <div className="flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
        {navbar}
        <div className="flex items-center justify-center py-6 cursor-pointer select-none bg-[#EDF0F4]" onClick={() => setWindowState("normal")}>
          <p className="text-xs text-[#9AAABB]">Aplicación minimizada — clic para restaurar</p>
        </div>
      </div>
    );
  }

  function renderPage() {
    if (page.kind === "home") return <Home library={library} onNavigate={setPage} />;

    if (page.kind === "section") {
      if (page.id === "entrevista") {
        return (
          <ContactsPage contacts={contacts} interviews={interviews}
            onAddContact={(c) => setContacts((prev) => [...prev, { ...c, id: crypto.randomUUID() }])}
            onRemoveContact={(id) => setContacts((prev) => prev.filter((c) => c.id !== id))}
            onUploadInterview={addInterview}
            onRemoveInterview={(id) => setInterviews((prev) => prev.filter((f) => f.id !== id))}
            onBack={() => setPage({ kind: "home" })} />
        );
      }
      const sid = page.id as LibrarySectionId;
      const section = SECTIONS.find((s) => s.id === sid)!;
      return (
        <LibraryPage section={section} items={library[sid]}
          onAddItem={(t, d) => addItem(sid, t, d)}
          onDeleteItem={(id) => deleteItem(sid, id)}
          onAddFile={(itemId, fl) => addFile(sid, itemId, fl)}
          onRemoveFile={(itemId, fileId) => removeFile(sid, itemId, fileId)}
          onBack={() => setPage({ kind: "home" })} />
      );
    }

    if (page.kind === "member") {
      const member = MEMBERS.find((m) => m.id === page.id)!;
      return <MemberPage member={member} library={library} interviews={interviews} onBack={() => setPage({ kind: "home" })} />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {navbar}
      {renderPage()}
    </div>
  );
}
