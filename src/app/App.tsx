import React, { useState, useRef, useCallback, FormEvent, useEffect } from "react";
import {
  Video, ClipboardList, BookOpen, Mic, ArrowLeft,
  FileText, Film, Trash2, Eye, FolderOpen, Lock, User,
  Search, X, ChevronRight, ChevronLeft, Mail, FlaskConical, LogOut, ChevronDown, Fingerprint,
  ShieldCheck, ShieldBan, Pencil, UserPlus, UserX, UserCheck, Ban,
  Globe, Phone, Plus, Building2,
  Users, Beaker, Wrench, UserCircle2, Upload, ChevronDown as Chevron,
} from "lucide-react";
import legadoLogo from "../assets/legado-logo.png";
import legadoWordmark from "../assets/legado-wordmark.png";
import biomitLogo from "../assets/biomit-logo.png";

// Fondo oscuro compartido por la barra superior y el login: hace resaltar el texto blanco del logo de BIOMIT.
const DARK_BRAND_BG = "#161B26";

// ─── Sections ────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "videos",     title: "Know How",                bg: "#1A9A9A", circleBg: "rgba(255,255,255,0.18)", Icon: Video,        accept: "video/*,application/pdf,.doc,.docx,.ppt,.pptx", itemLabel: "experiencia / técnica" },
  { id: "protocolos", title: "Protocolos\nEnriquecidos", bg: "#E07B2A", circleBg: "rgba(255,255,255,0.18)", Icon: ClipboardList, accept: ".pdf,.doc,.docx",                              itemLabel: "protocolo"             },
  { id: "lecciones",  title: "Información",              bg: "#687A8C", circleBg: "rgba(255,255,255,0.18)", Icon: BookOpen,      accept: ".pdf,.doc,.docx,.ppt,.pptx",                   itemLabel: "lección / documento"   },
  { id: "entrevista", title: "Contactos\ny Entrevistas", bg: "#2B3A52", circleBg: "rgba(255,255,255,0.18)", Icon: Mic,           accept: "audio/*,video/*,.pdf",                         itemLabel: ""                      },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];
// "datos" = Datos experimentales: no es una tarjeta del inicio, es una subsección de "Información" (lecciones).
type LibrarySectionId = "videos" | "protocolos" | "lecciones" | "datos";
type InformationTab = "documentos" | "datos";

// ─── Members ─────────────────────────────────────────────────────────────────

// Color de avatar por grupo, para distinguir de un vistazo tesistas, tesinistas, pasantes y colaboradores.
const MEMBER_GROUP_COLORS = { admin: "#C0392B", tesista: "#1A9A9A", tesinista: "#E07B2A", pasante: "#7B5EA7", colaborador: "#2B3A52" } as const;

// username = usuario con el que se ingresa en el login del prototipo (la contraseña no se valida).
// profession, joinedYear, email y bio son DATOS DE EJEMPLO inventados: reemplazar por los reales.
// Los mails usan el dominio reservado ".example", que nunca resuelve (no le llega nada a nadie).
const EXAMPLE_MEMBER_PROFILES = [
  { id: "m0",  username: "valeria",   name: "Valeria Bosio",          role: "Administradora", initials: "VB", color: MEMBER_GROUP_COLORS.admin,       profession: "Lic. en Biotecnología",                joinedYear: 2016, email: "valeria.bosio@biomitlab.example",    bio: "Coordina Legado y la gestión del conocimiento del grupo. Se ocupa de que cada técnica, protocolo y dato quede documentado antes de que sus autores se vayan del laboratorio." },
  { id: "m1",  username: "victoria",  name: "Victoria Machain",       role: "Tesista",        initials: "VM", color: MEMBER_GROUP_COLORS.tesista,     profession: "Lic. en Biotecnología",                joinedYear: 2021, email: "victoria.machain@biomitlab.example", bio: "Su tesis doctoral estudia scaffolds de policaprolactona obtenidos por electrospinning para regeneración de piel. Referente del grupo en cultivo celular." },
  { id: "m2",  username: "facundo",   name: "Facundo Pedemonte",      role: "Tesista",        initials: "FP", color: MEMBER_GROUP_COLORS.tesista,     profession: "Ing. en Materiales",                   joinedYear: 2022, email: "facundo.pedemonte@biomitlab.example", bio: "Trabaja en hidrogeles de alginato y gelatina para bioimpresión 3D. Se encarga de la caracterización mecánica y reológica de los materiales." },
  { id: "m3",  username: "gaston",    name: "Gaston Corti",           role: "Tesista",        initials: "GC", color: MEMBER_GROUP_COLORS.tesista,     profession: "Lic. en Química",                      joinedYear: 2022, email: "gaston.corti@biomitlab.example",     bio: "Desarrolla sistemas de liberación controlada de fármacos a partir de nanopartículas poliméricas. Responsable del espectrofotómetro UV-Vis." },
  { id: "m4",  username: "bianca",    name: "Bianca Sciutto",         role: "Tesinista",      initials: "BS", color: MEMBER_GROUP_COLORS.tesinista,   profession: "Estudiante de Biotecnología (UNLP)",   joinedYear: 2024, email: "bianca.sciutto@biomitlab.example",   bio: "Su tesina evalúa la viabilidad celular sobre membranas de quitosano mediante ensayos MTT." },
  { id: "m5",  username: "santiago",  name: "Santiago Calonje",       role: "Tesinista",      initials: "SC", color: MEMBER_GROUP_COLORS.tesinista,   profession: "Estudiante de Ing. Química (UNLP)",    joinedYear: 2025, email: "santiago.calonje@biomitlab.example", bio: "Estudia la cinética de degradación in vitro de scaffolds poliméricos en distintas condiciones de pH." },
  { id: "m6",  username: "ezequiel",  name: "Ezequiel Skliar",        role: "Pasante UNLP",   initials: "ES", color: MEMBER_GROUP_COLORS.pasante,     profession: "Estudiante de Informática (UNLP)",     joinedYear: 2026, email: "ezequiel.skliar@biomitlab.example",  bio: "Colabora en el desarrollo de Legado y en la digitalización de registros y datos experimentales del laboratorio." },
  { id: "m7",  username: "gabriel",   name: "Gabriel Araujo",         role: "Pasante UNLP",   initials: "GA", color: MEMBER_GROUP_COLORS.pasante,     profession: "Estudiante de Bioingeniería (UNLP)",   joinedYear: 2026, email: "gabriel.araujo@biomitlab.example",   bio: "Da apoyo en la preparación de muestras y en el mantenimiento de equipos." },
  { id: "m8",  username: "diego",     name: "Dr. Diego Croci",        role: "Colaborador",    initials: "DC", color: MEMBER_GROUP_COLORS.colaborador, profession: "Doctor en Ciencias Biológicas",        joinedYear: 2019, email: "diego.croci@biomitlab.example",      bio: "Asesora al grupo en inmunología y en la evaluación de la respuesta inflamatoria frente a biomateriales." },
  { id: "m9",  username: "marcos",    name: "Dr. Marcos Galli",       role: "Colaborador",    initials: "MG", color: MEMBER_GROUP_COLORS.colaborador, profession: "Doctor en Ingeniería",                 joinedYear: 2018, email: "marcos.galli@biomitlab.example",     bio: "Colabora en el diseño de dispositivos y en el modelado de propiedades mecánicas de los materiales." },
  { id: "m10", username: "sebastian", name: "Dr. Sebastian Graf",     role: "Colaborador",    initials: "SG", color: MEMBER_GROUP_COLORS.colaborador, profession: "Doctor en Química",                    joinedYear: 2020, email: "sebastian.graf@biomitlab.example",   bio: "Aporta experiencia en síntesis y caracterización de polímeros biodegradables." },
  { id: "m11", username: "laura",     name: "Dra. M. Laura Mascotti", role: "Colaboradora",   initials: "LM", color: MEMBER_GROUP_COLORS.colaborador, profession: "Doctora en Ciencias Biológicas",       joinedYear: 2017, email: "laura.mascotti@biomitlab.example",   bio: "Colabora en biología celular y microscopía, y acompaña la formación de tesinistas." },
];

/** Antigüedad legible, por ejemplo "Desde 2021 · 5 años". Año actual o futuro: "Desde 2026 · Este año". */
function formatSeniority(joinedYear: number) {
  const years = new Date().getFullYear() - joinedYear;
  if (years <= 0) return `Desde ${joinedYear} · Este año`;
  return `Desde ${joinedYear} · ${years} ${years === 1 ? "año" : "años"}`;
}

// "baja" = ex integrante: no puede ingresar ni aparece en la lista, pero sus aportes conservan su nombre.
type MemberStatus = "activo" | "baja";

type Member = {
  id: string; username: string; name: string; role: string; initials: string; color: string;
  profession: string; joinedYear: number; email: string; bio: string;
  /** Puede entrar al menú Admin (alta, baja, modificación y bloqueo de usuarios). */
  isAdmin: boolean;
  /** Puede ver la sección restringida "Contactos y Entrevistas". */
  canAccessContacts: boolean;
  status: MemberStatus;
  /** Bloqueo temporal: no puede ingresar hasta esta fecha. null = sin bloqueo. */
  blockedUntil: Date | null;
  blockReason: string;
};

// Estado inicial: Valeria es la única administradora y la única con acceso a Contactos y Entrevistas.
const INITIAL_MEMBERS: Member[] = EXAMPLE_MEMBER_PROFILES.map((profile) => ({
  ...profile,
  isAdmin: profile.id === "m0",
  canAccessContacts: profile.id === "m0",
  status: "activo",
  blockedUntil: null,
  blockReason: "",
}));

// Roles disponibles en el alta/modificación; el color del avatar se deriva del rol.
const ROLE_OPTIONS: { role: string; color: string }[] = [
  { role: "Administradora", color: MEMBER_GROUP_COLORS.admin },
  { role: "Administrador",  color: MEMBER_GROUP_COLORS.admin },
  { role: "Tesista",        color: MEMBER_GROUP_COLORS.tesista },
  { role: "Tesinista",      color: MEMBER_GROUP_COLORS.tesinista },
  { role: "Pasante UNLP",   color: MEMBER_GROUP_COLORS.pasante },
  { role: "Colaboradora",   color: MEMBER_GROUP_COLORS.colaborador },
  { role: "Colaborador",    color: MEMBER_GROUP_COLORS.colaborador },
];

/** Color de avatar para un rol; rol desconocido = gris. */
function colorForRole(role: string) {
  return ROLE_OPTIONS.find((r) => r.role === role)?.color ?? "#687A8C";
}

/** Iniciales a partir del nombre, ignorando títulos ("Dr.", "Dra.") e iniciales sueltas ("M."). Ej.: "Dra. M. Laura Mascotti" → "LM". */
function initialsFromName(name: string) {
  const words = name.trim().split(/\s+/).filter((w) => !/^(dra?|[a-z])\.$/i.test(w));
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// Lista de integrantes vigente (editable desde Admin), disponible para cualquier componente sin pasarla por props.
const MembersContext = React.createContext<Member[]>(INITIAL_MEMBERS);

/** Integrantes vigentes, incluidos los dados de baja (filtrar por status donde corresponda). */
function useMembers() {
  return React.useContext(MembersContext);
}

const RESTRICTED_SECTION_ID = "entrevista";

/** Indica si el integrante puede ver la sección restringida "Contactos y Entrevistas". */
function canAccessContacts(member: Member) {
  return member.canAccessContacts;
}

/** Secciones que el integrante puede ver: todas, salvo la restringida si no tiene acceso. */
function visibleSectionsFor(member: Member) {
  return SECTIONS.filter((s) => s.id !== RESTRICTED_SECTION_ID || canAccessContacts(member));
}

/** true si el integrante tiene un bloqueo temporal vigente a la fecha indicada (por defecto, ahora). */
function isTemporarilyBlocked(member: Member, now = new Date()) {
  return member.blockedUntil !== null && member.blockedUntil > now;
}

/** Normaliza un usuario para comparar: minúsculas, sin espacios en los extremos y sin tildes. */
function normalizeUsername(username: string) {
  return username.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/** Busca al integrante por usuario, sin distinguir mayúsculas ni tildes. Devuelve undefined si no existe. */
function findMemberByUsername(members: Member[], username: string) {
  const normalized = normalizeUsername(username);
  return members.find((m) => m.username === normalized);
}

/** Fecha corta en castellano, por ejemplo "25 sept 2026". */
function formatShortDate(date: Date) {
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Types ───────────────────────────────────────────────────────────────────

type UploadedFile = {
  id: string; name: string; size: number; type: string;
  url: string; uploadedAt: Date; uploadedBy?: string;
};

// Áreas temáticas del laboratorio: sirven para filtrar y agrupar en todas las secciones de biblioteca.
const RESEARCH_TOPICS = [
  { id: "oseo",         label: "Tejido óseo",         color: "#B7791F" },
  { id: "osteocondral", label: "Tejido osteocondral", color: "#9C4221" },
  { id: "cutaneo",      label: "Tejido cutáneo",      color: "#C2417F" },
  { id: "vascular",     label: "Tejido vascular",     color: "#C53030" },
  { id: "biopolimeros", label: "Biopolímeros",        color: "#2F855A" },
  { id: "bioimpresion", label: "Bioimpresión 3D",     color: "#2B6CB0" },
] as const;

type ResearchTopicId = (typeof RESEARCH_TOPICS)[number]["id"];

const NO_TOPIC_LABEL = "Sin área asignada";

/** Nombre del área temática, o "Sin área asignada" si el ítem no tiene. */
function topicLabel(topic?: ResearchTopicId) {
  return RESEARCH_TOPICS.find((t) => t.id === topic)?.label ?? NO_TOPIC_LABEL;
}

// Tipos de ítem por sección, se muestran como etiqueta. Datos experimentales no usa tipo: se clasifica por equipo.
const ITEM_KINDS_BY_SECTION: Record<LibrarySectionId, string[]> = {
  videos:     ["Experiencia", "Detalle de protocolo", "Nueva síntesis"],
  protocolos: ["Obtención", "Síntesis", "Purificación", "Caracterización"],
  lecciones:  ["Seminario", "Bibliografía", "Curso"],
  datos:      [],
};

type LibraryItem = {
  id: string; title: string; description?: string;
  /** Tipo dentro de la sección (ver ITEM_KINDS_BY_SECTION), por ejemplo "Experiencia" o "Síntesis". */
  kind?: string;
  /** Área temática; sin valor = "Sin área asignada". */
  topic?: ResearchTopicId;
  /** Solo en Datos experimentales: equipo con el que se obtuvieron los datos (permite agrupar por equipo). */
  equipment?: string;
  files: UploadedFile[]; createdAt: Date;
};

/** Datos opcionales que se completan al crear un ítem desde los formularios. */
type LibraryItemDetails = Pick<LibraryItem, "kind" | "topic" | "equipment">;

/**
 * Agrupa ítems por área temática, en el orden de RESEARCH_TOPICS.
 * Los que no tienen área van al final, y las áreas sin ítems no aparecen.
 */
function groupItemsByTopic(items: LibraryItem[]) {
  const groups = RESEARCH_TOPICS
    .map((t) => ({ key: t.id as string, label: t.label, color: t.color as string, items: items.filter((i) => i.topic === t.id) }));
  groups.push({ key: "sin-area", label: NO_TOPIC_LABEL, color: "#9AAABB", items: items.filter((i) => !i.topic) });
  return groups.filter((g) => g.items.length > 0);
}

type LibraryState = Record<LibrarySectionId, LibraryItem[]>;

type ContactCategory = "proveedor" | "laboratorio" | "grupo" | "persona" | "servicio";
type Contact = { id: string; name: string; website: string; contact: string; category: ContactCategory };

// infoTab: subsección de "Información" que se abre al entrar (por defecto, Documentos).
type Page = { kind: "home" } | { kind: "section"; id: SectionId; infoTab?: InformationTab } | { kind: "member"; id: string } | { kind: "admin" };

type SearchResult =
  | { kind: "section"; section: (typeof SECTIONS)[number] }
  | { kind: "item"; item: LibraryItem; sectionId: LibrarySectionId; section: (typeof SECTIONS)[number] }
  | { kind: "member"; member: Member };

// ─── Initial data ─────────────────────────────────────────────────────────────

const MIME_BY_EXTENSION: Record<string, string> = {
  mp4: "video/mp4", pdf: "application/pdf", png: "image/png",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

/**
 * Crea un archivo de ejemplo (sin contenido real, url "#"). El tipo MIME se deduce de la extensión;
 * extensión desconocida = tipo vacío, como pasa con los formatos nativos de los equipos.
 */
function exampleFile(id: string, name: string, size: number, uploadedBy: string, uploadedAt: string): UploadedFile {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  return { id, name, size, type: MIME_BY_EXTENSION[extension] ?? "", url: "#", uploadedAt: new Date(uploadedAt), uploadedBy };
}

// Contenido de ejemplo del prototipo: títulos realistas del área, sin datos reales detrás.
const INITIAL_LIBRARY: LibraryState = {
  videos: [
    { id: "kh1", kind: "Experiencia",          topic: "cutaneo",      title: "Electrospinning de membranas de PCL",                description: "Ajuste de voltaje, caudal y distancia al colector para obtener fibras uniformes.",       createdAt: new Date("2025-03-10"), files: [exampleFile("kh1a", "Electrospinning PCL - puesta a punto.mp4", 145_000_000, "m1", "2025-03-15")] },
    { id: "kh2", kind: "Detalle de protocolo", topic: "oseo",         title: "Siembra de células en scaffolds 3D",                 description: "Siembra estática vs. dinámica y cómo evitar que las células se vayan al fondo del pocillo.", createdAt: new Date("2025-04-02"), files: [exampleFile("kh2a", "Siembra en scaffolds 3D.mp4", 98_000_000, "m1", "2025-04-05")] },
    { id: "kh3", kind: "Nueva síntesis",       topic: "oseo",         title: "Hidroxiapatita nanoestructurada por vía húmeda",     description: "Variante de la síntesis con control de pH que mejora la cristalinidad.",                createdAt: new Date("2025-06-18"), files: [exampleFile("kh3a", "Síntesis de nano-hidroxiapatita.mp4", 120_000_000, "m3", "2025-06-20"), exampleFile("kh3b", "Notas de la síntesis.pdf", 240_000, "m3", "2025-06-20")] },
    { id: "kh4", kind: "Experiencia",          topic: "bioimpresion", title: "Bioimpresión de hidrogeles de alginato-gelatina",   description: "Temperatura del cartucho, presión y velocidad para lograr buena fidelidad de forma.",     createdAt: new Date("2025-08-07"), files: [exampleFile("kh4a", "Bioimpresión alginato-gelatina.mp4", 210_000_000, "m2", "2025-08-10")] },
    { id: "kh5", kind: "Detalle de protocolo", topic: "biopolimeros", title: "Entrecruzamiento de quitosano con genipina",         description: "Tiempos, concentración y cómo reconocer el punto final por el color.",                   createdAt: new Date("2025-09-01"), files: [exampleFile("kh5a", "Entrecruzamiento con genipina.mp4", 76_000_000, "m4", "2025-09-03")] },
    { id: "kh6", kind: "Experiencia",          topic: "vascular",     title: "Recubrimiento endotelial de injertos tubulares",    description: "Siembra en rotación de células endoteliales sobre injertos de pequeño diámetro.",        createdAt: new Date("2025-10-12"), files: [exampleFile("kh6a", "Endotelización de injertos.mp4", 132_000_000, "m9", "2025-10-15")] },
  ],
  protocolos: [
    { id: "pr1", kind: "Obtención",       topic: "biopolimeros", title: "Obtención de colágeno tipo I a partir de tendón",       description: "Extracción ácida, precipitación salina y diálisis.",                          createdAt: new Date("2024-11-05"), files: [exampleFile("pr1a", "Obtención de colágeno tipo I.pdf", 310_000, "m1", "2024-11-08")] },
    { id: "pr2", kind: "Síntesis",        topic: "oseo",         title: "Síntesis de hidroxiapatita por precipitación húmeda",  description: "Relación Ca/P, control de pH y tratamiento térmico posterior.",               createdAt: new Date("2025-02-14"), files: [exampleFile("pr2a", "Síntesis de hidroxiapatita.docx", 180_000, "m3", "2025-02-16")] },
    { id: "pr3", kind: "Purificación",    topic: "biopolimeros", title: "Purificación de quitosano comercial",                   description: "Disolución, filtrado y reprecipitación para eliminar impurezas.",              createdAt: new Date("2025-03-20"), files: [exampleFile("pr3a", "Purificación de quitosano.pdf", 260_000, "m4", "2025-03-22")] },
    { id: "pr4", kind: "Caracterización", topic: "biopolimeros", title: "Caracterización por FTIR de scaffolds poliméricos",      description: "Preparación de muestras, parámetros de medición y bandas de referencia.",     createdAt: new Date("2025-05-06"), files: [exampleFile("pr4a", "Caracterización por FTIR.pdf", 420_000, "m3", "2025-05-08")] },
    { id: "pr5", kind: "Caracterización", topic: "cutaneo",      title: "Caracterización por SEM de membranas electrohiladas",   description: "Metalizado, condiciones de observación y medición del diámetro de fibras.",   createdAt: new Date("2025-06-02"), files: [exampleFile("pr5a", "Caracterización por SEM.pdf", 390_000, "m5", "2025-06-04")] },
    { id: "pr6", kind: "Síntesis",        topic: "bioimpresion", title: "Síntesis de GelMA para bioimpresión",                   description: "Metacrilación de gelatina, diálisis, liofilización y grado de sustitución.",   createdAt: new Date("2025-07-11"), files: [exampleFile("pr6a", "Síntesis de GelMA.docx", 205_000, "m2", "2025-07-13")] },
    { id: "pr7", kind: "Obtención",       topic: "osteocondral", title: "Obtención de scaffolds bifásicos osteocondrales",       description: "Capa ósea mineralizada unida a una capa cartilaginosa de hidrogel.",           createdAt: new Date("2025-09-24"), files: [exampleFile("pr7a", "Scaffolds bifásicos osteocondrales.pdf", 470_000, "m10", "2025-09-26")] },
  ],
  lecciones: [
    { id: "ls1", kind: "Seminario",    topic: "osteocondral", title: "Estrategias de regeneración osteocondral",               description: "Scaffolds bifásicos y gradientes de composición: estado del arte.",   createdAt: new Date("2025-04-22"), files: [exampleFile("ls1a", "Seminario - Regeneración osteocondral.pptx", 8_400_000, "m11", "2025-04-22")] },
    { id: "ls2", kind: "Seminario",    topic: "vascular",     title: "Vascularización de constructos de ingeniería de tejidos", description: "Por qué los constructos grandes fallan sin irrigación y cómo se aborda.", createdAt: new Date("2025-07-30"), files: [exampleFile("ls2a", "Seminario - Vascularización.pptx", 6_900_000, "m8", "2025-07-30")] },
    { id: "ls3", kind: "Bibliografía", topic: "bioimpresion", title: "Hidrogeles para bioimpresión 3D",                         description: "Selección de revisiones sobre biotintas, reología e imprimibilidad.",  createdAt: new Date("2025-05-15"), files: [exampleFile("ls3a", "Revisiones - Biotintas e imprimibilidad.pdf", 3_100_000, "m2", "2025-05-15")] },
    { id: "ls4", kind: "Bibliografía", topic: "cutaneo",      title: "Biopolímeros naturales en apósitos para heridas",         description: "Artículos sobre quitosano, colágeno y alginato en regeneración de piel.", createdAt: new Date("2025-08-19"), files: [exampleFile("ls4a", "Bibliografía - Apósitos biopoliméricos.pdf", 2_600_000, "m1", "2025-08-19")] },
    { id: "ls5", kind: "Curso",        topic: "bioimpresion", title: "Introducción a la bioimpresión 3D",                       description: "Material del curso de posgrado: diseño CAD, slicing y biotintas.",     createdAt: new Date("2025-10-03"), files: [exampleFile("ls5a", "Curso - Bioimpresión 3D - clase 1.pdf", 4_200_000, "m6", "2025-10-03"), exampleFile("ls5b", "Curso - Bioimpresión 3D - clase 2.pdf", 3_800_000, "m6", "2025-10-10")] },
    { id: "ls6", kind: "Curso",                               title: "Bioseguridad y buenas prácticas de laboratorio",          description: "Curso obligatorio para quienes ingresan al laboratorio.",             createdAt: new Date("2024-03-01"), files: [exampleFile("ls6a", "Curso - Bioseguridad.pdf", 1_500_000, "m0", "2024-03-01")] },
  ],
  // Cada experiencia suele tener el Excel exportado, el gráfico y el archivo nativo del equipo.
  datos: [
    { id: "dx1", topic: "cutaneo",      equipment: "Espectrofotómetro UV-Vis",      title: "Degradación de scaffolds de PCL",                description: "Pérdida de masa y absorbancia del medio a 1, 2 y 4 semanas en PBS a 37 °C.", createdAt: new Date("2025-05-10"), files: [
      exampleFile("dx1a", "degradacion_PCL_semanas1-4.xlsx", 184_000, "m5", "2025-06-12"),
      exampleFile("dx1b", "curva_degradacion_PCL.pdf",       412_000, "m5", "2025-06-12"),
      exampleFile("dx1c", "PCL_semana4_barrido.spc",          96_000, "m5", "2025-06-12"),
    ] },
    { id: "dx2", topic: "biopolimeros", equipment: "Espectrofotómetro UV-Vis",      title: "Liberación de ibuprofeno desde nanopartículas", description: "Cinética de liberación a pH 7,4 y 5,5 durante 72 h. Curva de calibración incluida.", createdAt: new Date("2025-08-02"), files: [
      exampleFile("dx2a", "liberacion_ibuprofeno_pH74_pH55.xlsx", 236_000, "m3", "2025-08-20"),
      exampleFile("dx2b", "grafico_liberacion_acumulada.png",     158_000, "m3", "2025-08-20"),
      exampleFile("dx2c", "calibracion_ibuprofeno_264nm.pdf",     205_000, "m3", "2025-08-20"),
    ] },
    { id: "dx3", topic: "cutaneo",      equipment: "Lector de microplacas",         title: "Viabilidad celular MTT sobre quitosano",        description: "Fibroblastos L929 a 24, 48 y 72 h. Absorbancia a 570 nm, placas 1 a 3.", createdAt: new Date("2025-09-15"), files: [
      exampleFile("dx3a", "MTT_quitosano_placas1-3.xlsx", 128_000, "m4", "2025-10-01"),
      exampleFile("dx3b", "viabilidad_por_tiempo.pdf",     318_000, "m4", "2025-10-01"),
      exampleFile("dx3c", "MTT_placa1_24h.skax",            64_000, "m4", "2025-10-01"),
    ] },
    { id: "dx4", topic: "bioimpresion", equipment: "Reómetro rotacional",           title: "Reología de hidrogeles alginato-gelatina",      description: "Barridos de amplitud y frecuencia para tres formulaciones (A, B y C) a 25 °C.", createdAt: new Date("2025-11-03"), files: [
      exampleFile("dx4a", "reologia_hidrogeles_ABC.xlsx",    342_000,   "m2", "2025-11-18"),
      exampleFile("dx4b", "modulos_G1_G2_vs_frecuencia.pdf", 276_000,   "m2", "2025-11-18"),
      exampleFile("dx4c", "hidrogel_B_barrido_amplitud.rwd", 1_240_000, "m2", "2025-11-18"),
    ] },
    { id: "dx5", topic: "oseo",         equipment: "Máquina universal de ensayos",  title: "Compresión de scaffolds de hidroxiapatita",     description: "Módulo de compresión y resistencia de scaffolds con 60 % y 75 % de porosidad.", createdAt: new Date("2025-12-01"), files: [
      exampleFile("dx5a", "compresion_HA_porosidad60_75.xlsx", 198_000, "m3", "2025-12-05"),
      exampleFile("dx5b", "curvas_tension_deformacion.pdf",    355_000, "m3", "2025-12-05"),
      exampleFile("dx5c", "HA75_probeta3.is_comp",             512_000, "m3", "2025-12-05"),
    ] },
  ],
};

type ExperimentalFileKind = { label: string; color: string; hint?: string };

/**
 * Clasifica un archivo de datos experimentales por su extensión: Excel, PDF, gráfico (imagen)
 * o archivo nativo del equipo. Cualquier extensión desconocida se toma como nativa, porque
 * esos formatos solo se abren con el software del equipo.
 */
function experimentalFileKind(fileName: string): ExperimentalFileKind {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["xlsx", "xls", "csv", "ods"].includes(extension)) return { label: "Excel", color: "#1D7A45" };
  if (extension === "pdf") return { label: "PDF", color: "#C0392B" };
  if (["png", "jpg", "jpeg", "svg", "tif", "tiff"].includes(extension)) return { label: "Gráfico", color: "#7B5EA7" };
  return { label: "Archivo del equipo", color: "#687A8C", hint: "Solo se abre con el software del equipo. Usá la versión Excel o PDF." };
}

const INITIAL_INTERVIEWS: UploadedFile[] = [
  { id: "e1", name: "Entrevista de salida - Victoria Machain.mp4",  size: 200_000_000, type: "video/mp4",       url: "#", uploadedAt: new Date("2024-07-01"), uploadedBy: "m1" },
  { id: "e2", name: "Entrevista de salida - Facundo Pedemonte.pdf", size: 180_000,    type: "application/pdf", url: "#", uploadedAt: new Date("2024-08-10"), uploadedBy: "m2" },
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

function MemberAvatar({ member, size = "md" }: { member: Member; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-11 h-11 text-sm", lg: "w-16 h-16 text-lg", xl: "w-24 h-24 text-2xl" };
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`} style={{ backgroundColor: member.color }}>
      {member.initials}
    </div>
  );
}

// ─── Shared: Section header ───────────────────────────────────────────────────

type SectionNavigation = { sections: (typeof SECTIONS)[number][]; onSelectSection: (sectionId: SectionId) => void };

// Secciones visibles para el usuario y cómo navegar a ellas; lo provee App para que los encabezados muestren las pestañas.
const SectionNavigationContext = React.createContext<SectionNavigation | null>(null);

/**
 * Barra de color de una pantalla. Con currentSectionId (y SectionNavigationContext disponible) muestra
 * pestañas con todas las secciones visibles para el usuario: la actual resaltada en blanco y el resto
 * clickeables para saltar directo. Sin currentSectionId (por ejemplo, Admin) muestra solo el título.
 * En celular, las pestañas no actuales muestran solo el ícono y la barra se desliza horizontalmente.
 */
function SectionHeader({ title, bg, Icon, onBack, currentSectionId }: {
  title: string; bg: string; Icon: React.ElementType; onBack: () => void;
  currentSectionId?: SectionId;
}) {
  const navigation = React.useContext(SectionNavigationContext);
  const showTabs = currentSectionId !== undefined && navigation !== null;

  const backButton = (
    <button onClick={onBack} className="flex items-center gap-1.5 text-white/75 hover:text-white transition-colors text-sm font-medium flex-shrink-0">
      <ArrowLeft className="w-4 h-4" />Inicio
    </button>
  );

  if (!showTabs) {
    return (
      <div className="px-6 sm:px-8 py-4 flex items-center gap-4 shadow-md flex-shrink-0" style={{ backgroundColor: bg }}>
        {backButton}
        <div className="w-px h-5 bg-white/25 flex-shrink-0" />
        <Icon className="w-5 h-5 text-white" strokeWidth={1.6} />
        <h1 className="text-white font-bold text-lg leading-none">{title.replace(/\n/g, " ")}</h1>
      </div>
    );
  }

  return (
    // Tres columnas: "Inicio" a la izquierda, pestañas centradas en la barra y una columna vacía del mismo
    // ancho a la derecha, para que el centrado sea respecto de toda la barra y no del espacio que sobra.
    <div className="px-6 sm:px-8 py-4 grid grid-cols-[1fr_minmax(0,auto)_1fr] items-center gap-4 shadow-md flex-shrink-0" style={{ backgroundColor: bg }}>
      <div className="flex items-center">{backButton}</div>
        <nav className="flex items-center gap-1.5 overflow-x-auto min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Secciones">
          <h1 className="sr-only">{title.replace(/\n/g, " ")}</h1>
          {navigation.sections.map((s) => {
            const isCurrent = s.id === currentSectionId;
            const TabIcon = s.Icon;
            const label = s.title.replace(/\n/g, " ");
            return (
              <button key={s.id} onClick={() => { if (!isCurrent) navigation.onSelectSection(s.id); }}
                aria-current={isCurrent ? "page" : undefined} title={label}
                // Actual: fondo blanco con texto del color de la sección. Resto: blanco decolorado, sin fondo;
                // al pasar el mouse se aclaran para mostrar que se pueden clickear.
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap flex-shrink-0 transition-all ${isCurrent ? "bg-white font-bold shadow-sm cursor-default" : "text-white/55 font-medium hover:text-white hover:bg-white/15"}`}
                style={isCurrent ? { color: bg } : {}}>
                <TabIcon className="w-4 h-4 flex-shrink-0" strokeWidth={isCurrent ? 2 : 1.6} />
                <span className={isCurrent ? "" : "hidden md:inline"}>{label}</span>
              </button>
            );
          })}
        </nav>
      <div aria-hidden="true" />
    </div>
  );
}

// ─── Shared: Compact file row ─────────────────────────────────────────────────

function FileRow({ file, bg, onRemove, showExperimentalKind = false }: {
  file: UploadedFile; bg: string; onRemove: () => void;
  /** Muestra la etiqueta Excel / PDF / Gráfico / Archivo del equipo (solo en Datos experimentales). */
  showExperimentalKind?: boolean;
}) {
  const members = useMembers();
  const uploader = members.find((m) => m.id === file.uploadedBy);
  const kind = showExperimentalKind ? experimentalFileKind(file.name) : null;
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#F7F9FB] transition-colors group">
      <span style={{ color: bg }} className="flex-shrink-0">{fileIcon(file.type)}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm text-[#2B3A52] font-medium truncate">{file.name}</p>
          {kind && (
            <span title={kind.hint} className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: kind.color + "18", color: kind.color }}>
              {kind.label}
            </span>
          )}
        </div>
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

function NavBar({ currentUser, onGoHome, onGoProfile, onGoAdmin, onLogout }: {
  currentUser: Member; onGoHome: () => void; onGoProfile: () => void;
  /** Abre el menú Admin; la opción solo se muestra si currentUser.isAdmin. */
  onGoAdmin: () => void;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <nav className="w-full border-b border-white/10 shadow-md z-40 sticky top-0 flex-shrink-0" style={{ backgroundColor: DARK_BRAND_BG, fontFamily: "'Inter', sans-serif" }}>
      <div className="px-6 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Ambos logos forman un solo botón que lleva al inicio */}
        <button onClick={onGoHome} title="Ir al inicio" aria-label="Ir al inicio" className="flex items-center gap-3 sm:gap-4 group cursor-pointer rounded-lg px-2 py-1 -mx-2 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 min-w-0">
          <img src={legadoWordmark} alt="Legado" className="h-6 sm:h-8 w-auto transition-transform group-hover:scale-105" />
          <div className="w-px h-8 bg-white/20 flex-shrink-0" />
          <img src={biomitLogo} alt="BIOMIT Lab" className="h-11 sm:h-12 w-auto transition-transform group-hover:scale-105" />
        </button>

        <div className="flex items-center gap-3">
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors focus:outline-none">
              <MemberAvatar member={currentUser} size="sm" />
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-white leading-tight">{currentUser.name}</p>
                <p className="text-xs text-white/55 leading-tight">{currentUser.role}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/55 transition-transform duration-150 ${menuOpen ? "rotate-180" : ""}`} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E8ECF0] overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[#F0F2F5]">
                  <p className="text-xs font-semibold text-[#2B3A52]">{currentUser.name}</p>
                  {currentUser.email && <p className="text-xs text-[#9AAABB] truncate">{currentUser.email}</p>}
                </div>
                <button onClick={() => { setMenuOpen(false); onGoProfile(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F7F9FB] transition-colors text-left">
                  <Fingerprint className="w-4 h-4 text-[#687A8C]" /><span className="text-sm font-medium text-[#2B3A52]">Mis huellas</span>
                </button>
                {currentUser.isAdmin && (
                  <button onClick={() => { setMenuOpen(false); onGoAdmin(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F7F9FB] transition-colors text-left">
                    <ShieldCheck className="w-4 h-4 text-[#687A8C]" /><span className="text-sm font-medium text-[#2B3A52]">Admin</span>
                  </button>
                )}
                <button onClick={() => { setMenuOpen(false); onLogout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left">
                  <LogOut className="w-4 h-4 text-red-400" /><span className="text-sm font-medium text-red-400">Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────

function Login({ onLogin }: { onLogin: (memberId: string) => void }) {
  const members = useMembers();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError("Por favor completá ambos campos."); return; }
    const member = findMemberByUsername(members, username);
    if (!member) { setError("Usuario no encontrado."); return; }
    if (member.status === "baja") { setError("Este usuario fue dado de baja. Consultá con la administración."); return; }
    if (isTemporarilyBlocked(member)) {
      setError(`Tu acceso está bloqueado hasta el ${formatShortDate(member.blockedUntil!)}.${member.blockReason ? ` Motivo: ${member.blockReason}` : ""}`);
      return;
    }
    onLogin(member.id);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: DARK_BRAND_BG, fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="sr-only">Legado</h1>
          <div className="flex items-center justify-center gap-5 sm:gap-7">
            <img src={legadoLogo} alt="Legado" className="h-28 sm:h-32 w-auto" />
            <div className="w-px h-20 bg-white/20" />
            <img src={biomitLogo} alt="BIOMIT Lab — Biomaterials & Tissue Engineering" className="h-28 sm:h-32 w-auto" />
          </div>
          <p className="text-white/60 text-sm mt-5">dejá tu huella</p>
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
          <p className="mt-5 text-[11px] text-[#9AAABB] text-center leading-relaxed">Prototipo: ingresá con tu nombre (ej. <strong>valeria</strong>, <strong>victoria</strong>) y cualquier contraseña.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Global search bar (home) ─────────────────────────────────────────────────

function SearchBar({ library, sections, onNavigate }: { library: LibraryState; sections: typeof SECTIONS[number][]; onNavigate: (p: Page) => void }) {
  const members = useMembers();
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
    for (const s of sections) {
      if (s.title.toLowerCase().includes(q)) out.push({ kind: "section", section: s });
    }
    for (const sid of ["videos", "protocolos", "lecciones", "datos"] as LibrarySectionId[]) {
      // Datos experimentales vive dentro de "Información".
      const sec = SECTIONS.find((s) => s.id === (sid === "datos" ? "lecciones" : sid))!;
      for (const item of library[sid]) {
        if (libraryItemMatches(item, q)) {
          out.push({ kind: "item", item, sectionId: sid, section: sec });
        }
      }
    }
    for (const m of members.filter((member) => member.status === "activo")) {
      if (m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)) out.push({ kind: "member", member: m });
    }
    return out.slice(0, 10);
  })();

  function handleSelect(r: SearchResult) {
    setQuery(""); setOpen(false);
    if (r.kind === "section") onNavigate({ kind: "section", id: r.section.id });
    else if (r.kind === "item") {
      if (r.sectionId === "datos") onNavigate({ kind: "section", id: "lecciones", infoTab: "datos" });
      else onNavigate({ kind: "section", id: r.sectionId });
    }
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
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[#2B3A52] truncate">{r.item.title}</p><p className="text-xs text-[#9AAABB]">{r.sectionId === "datos" ? "Información · Datos experimentales" : r.section.title.replace(/\n/g, " ")}</p></div>
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

function Home({ library, sections, onNavigate }: { library: LibraryState; sections: typeof SECTIONS[number][]; onNavigate: (p: Page) => void }) {
  // Los dados de baja no aparecen en la lista de integrantes (sus aportes sí conservan su nombre).
  const activeMembers = useMembers().filter((m) => m.status === "activo");
  // Clases estáticas (Tailwind no detecta clases armadas dinámicamente): 3 columnas si falta la sección restringida.
  const desktopColumnsClass = sections.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";
  return (
    <div className="flex-1 flex flex-col items-center px-6 pt-12 pb-8" style={{ backgroundColor: "#EDF0F4", fontFamily: "'Inter', sans-serif" }}>
      <SearchBar library={library} sections={sections} onNavigate={onNavigate} />
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${desktopColumnsClass} gap-6 w-full max-w-5xl mb-14`}>
        {sections.map((s) => {
          const Icon = s.Icon;
          return (
            <button key={s.id} onClick={() => onNavigate({ kind: "section", id: s.id })}
              className="group flex flex-col items-center justify-center text-center rounded-2xl px-7 py-8 min-h-[200px] lg:min-h-[320px] cursor-pointer transition-all duration-200 hover:scale-[1.04] hover:shadow-2xl shadow-lg focus:outline-none"
              style={{ backgroundColor: s.bg }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-105" style={{ backgroundColor: s.circleBg }}>
                <Icon className="w-8 h-8 text-white" strokeWidth={1.6} />
              </div>
              <h2 className="text-white font-bold leading-snug whitespace-pre-line text-[20px]">{s.title}</h2>
            </button>
          );
        })}
      </div>
      <MembersCarousel members={activeMembers} onSelect={(memberId) => onNavigate({ kind: "member", id: memberId })} />
    </div>
  );
}

/** Columnas de tarjetas de integrantes según el ancho: 6 en escritorio (≥1024px), 4 en tablet (≥640px), 2 en celular. */
function memberColumnsForWidth(width: number) {
  if (width >= 1024) return 6;
  if (width >= 640) return 4;
  return 2;
}

// Filas de integrantes por página: más integrantes que columnas × filas pasan a la página siguiente.
const MEMBER_ROWS_PER_PAGE = 1;

/**
 * Integrantes paginados en MEMBER_ROWS_PER_PAGE filas, con desplazamiento lateral entre páginas.
 * Cada página muestra tarjetas enteras (nunca cortadas); las flechas pasan de página
 * y los puntos indican la página actual. Sin flechas ni puntos si entran todos en una.
 */
function MembersCarousel({ members, onSelect }: { members: Member[]; onSelect: (memberId: string) => void }) {
  const [columns, setColumns] = useState(() => memberColumnsForWidth(window.innerWidth));
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    function handleResize() { setColumns(memberColumnsForWidth(window.innerWidth)); }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const membersPerPage = columns * MEMBER_ROWS_PER_PAGE;
  const pageCount = Math.max(1, Math.ceil(members.length / membersPerPage));
  // Si cambia el ancho o se da de baja a alguien, la página actual puede quedar fuera de rango.
  const currentPage = Math.min(pageIndex, pageCount - 1);
  const pageMembers = members.slice(currentPage * membersPerPage, (currentPage + 1) * membersPerPage);

  // Clases estáticas para que Tailwind las genere (no se pueden armar dinámicamente).
  const columnsClass = columns === 6 ? "grid-cols-6" : columns === 4 ? "grid-cols-4" : "grid-cols-2";
  const arrowClass = "absolute top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-[#E8ECF0] flex items-center justify-center text-[#687A8C] hover:text-[#2B3A52] hover:shadow-lg transition-all disabled:opacity-0 disabled:pointer-events-none";

  return (
    <div className="w-full max-w-5xl">
      <div className="flex items-center gap-2 mb-5">
        <FlaskConical className="w-5 h-5 text-[#687A8C]" />
        <h2 className="text-base font-bold text-[#2B3A52] uppercase tracking-wider">Integrantes del laboratorio</h2>
        <span className="text-xs text-[#9AAABB]">({members.length})</span>
      </div>
      <div className="relative">
        {pageCount > 1 && (
          <button onClick={() => setPageIndex(currentPage - 1)} disabled={currentPage === 0} aria-label="Integrantes anteriores" className={`${arrowClass} -left-4 sm:-left-5`}>
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className={`grid ${columnsClass} gap-4`}>
          {pageMembers.map((m) => (
            <button key={m.id} onClick={() => onSelect(m.id)}
              className="group bg-white rounded-2xl px-3 py-5 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:scale-[1.03] transition-all duration-150 focus:outline-none">
              <MemberAvatar member={m} size="lg" />
              <p className="mt-3 text-sm font-semibold text-[#2B3A52] leading-tight">{m.name}</p>
              <p className="mt-1 text-xs text-[#9AAABB] leading-tight">{m.role}</p>
            </button>
          ))}
        </div>
        {pageCount > 1 && (
          <button onClick={() => setPageIndex(currentPage + 1)} disabled={currentPage === pageCount - 1} aria-label="Más integrantes" className={`${arrowClass} -right-4 sm:-right-5`}>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
      {pageCount > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: pageCount }, (_, index) => (
            <button key={index} onClick={() => setPageIndex(index)} aria-label={`Página ${index + 1} de integrantes`}
              className={`h-2 rounded-full transition-all ${index === currentPage ? "w-5 bg-[#687A8C]" : "w-2 bg-[#C4CDD8] hover:bg-[#9AAABB]"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Library page (Know How / Protocolos / Información) ───────────────────────

/** Etiquetas de un ítem: tipo (color de la sección), área temática (color del área) y equipo. No renderiza nada si no tiene ninguna. */
function ItemTags({ item, bg }: { item: LibraryItem; bg: string }) {
  const topic = RESEARCH_TOPICS.find((t) => t.id === item.topic);
  if (!item.kind && !topic && !item.equipment) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {item.kind && (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: bg + "18", color: bg }}>{item.kind}</span>
      )}
      {topic && (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: topic.color + "18", color: topic.color }}>{topic.label}</span>
      )}
      {item.equipment && (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#687A8C]/10 text-[#687A8C]">
          <Wrench className="w-3 h-3" />{item.equipment}
        </span>
      )}
    </div>
  );
}

function ItemCard({ item, bg, accept, onAddFile, onRemoveFile, onDelete, showExperimentalKind = false }: {
  item: LibraryItem; bg: string;
  /** Tipos de archivo del selector; vacío = cualquier archivo (necesario para formatos nativos de equipos). */
  accept: string;
  onAddFile: (itemId: string, fl: FileList) => void;
  onRemoveFile: (itemId: string, fileId: string) => void;
  onDelete: (itemId: string) => void;
  /** Datos experimentales: muestra el equipo y la etiqueta de tipo en cada archivo. */
  showExperimentalKind?: boolean;
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
            <ItemTags item={item} bg={bg} />
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
              <FileRow key={f.id} file={f} bg={bg} showExperimentalKind={showExperimentalKind} onRemove={() => onRemoveFile(item.id, f.id)} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

type LibraryPanelHandlers = {
  onAddItem: (title: string, description: string, details?: LibraryItemDetails) => void;
  onDeleteItem: (id: string) => void;
  onAddFile: (itemId: string, fl: FileList) => void;
  onRemoveFile: (itemId: string, fileId: string) => void;
};

const LIBRARY_INPUT_CLASS = "w-full px-3 py-2.5 rounded-xl border border-[#DDE2E8] bg-[#F7F9FB] text-[#2B3A52] text-sm placeholder-[#B0BCCA] focus:outline-none focus:border-[#687A8C] focus:ring-2 focus:ring-[#687A8C]/15 transition-all";

/** Filtro de área temática: "Todas" + una opción por área con su cantidad (solo las que tienen ítems). null = todas. */
function TopicFilterChips({ items, selected, onSelect, accent }: {
  items: LibraryItem[]; selected: ResearchTopicId | null; onSelect: (topic: ResearchTopicId | null) => void; accent: string;
}) {
  const topicsWithItems = RESEARCH_TOPICS.filter((t) => items.some((i) => i.topic === t.id));
  if (topicsWithItems.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <button onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selected === null ? "text-white shadow-sm" : "text-[#687A8C] bg-white hover:bg-[#F0F2F5]"}`}
        style={selected === null ? { backgroundColor: accent } : {}}>
        Todas las áreas
      </button>
      {topicsWithItems.map((t) => {
        const active = selected === t.id;
        return (
          <button key={t.id} onClick={() => onSelect(active ? null : t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${active ? "text-white shadow-sm" : "bg-white hover:bg-[#F0F2F5]"}`}
            style={active ? { backgroundColor: t.color } : { color: t.color }}>
            {t.label} ({items.filter((i) => i.topic === t.id).length})
          </button>
        );
      })}
    </div>
  );
}

/** Selector segmentado (por ejemplo "Lista / Por área"). */
function SegmentedToggle<T extends string>({ options, value, onChange, accent }: {
  options: { value: T; label: string }[]; value: T; onChange: (value: T) => void; accent: string;
}) {
  return (
    <div className="flex rounded-xl bg-white shadow-sm p-1 flex-shrink-0">
      {options.map((option) => (
        <button key={option.value} onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${value === option.value ? "text-white" : "text-[#687A8C] hover:bg-[#F0F2F5]"}`}
          style={value === option.value ? { backgroundColor: accent } : {}}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Encabezado de un grupo (área o equipo) con su cantidad de ítems. */
function GroupHeading({ label, color, count, noun, Icon }: { label: string; color: string; count: number; noun: [string, string]; Icon?: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {Icon ? <Icon className="w-4 h-4" style={{ color }} /> : <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />}
      <h3 className="text-sm font-bold text-[#2B3A52]">{label}</h3>
      <span className="text-xs text-[#9AAABB]">{count} {count === 1 ? noun[0] : noun[1]}</span>
    </div>
  );
}

/** Coincidencia de búsqueda en título, descripción, tipo, área, equipo o nombre de archivo. */
function libraryItemMatches(item: LibraryItem, query: string) {
  const q = query.trim().toLowerCase();
  return !q || item.title.toLowerCase().includes(q) ||
    item.description?.toLowerCase().includes(q) ||
    item.kind?.toLowerCase().includes(q) ||
    (item.topic && topicLabel(item.topic).toLowerCase().includes(q)) ||
    item.equipment?.toLowerCase().includes(q) ||
    item.files.some((f) => f.name.toLowerCase().includes(q));
}

type LibraryView = "lista" | "area";

/**
 * Buscador, filtros (área y tipo), vista lista/por área, formulario "Nuevo" y listado de ítems
 * de una sección de biblioteca (sin encabezado). kinds vacío = la sección no usa tipo.
 */
function LibraryItemsPanel({ section, items, kinds, onAddItem, onDeleteItem, onAddFile, onRemoveFile }: LibraryPanelHandlers & {
  section: (typeof SECTIONS)[number];
  items: LibraryItem[];
  kinds: string[];
}) {
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<ResearchTopicId | null>(null);
  const [kindFilter, setKindFilter] = useState<string | null>(null);
  const [view, setView] = useState<LibraryView>("lista");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", kind: kinds[0] ?? "", topic: "" as ResearchTopicId | "" });
  const [formError, setFormError] = useState("");

  const filtered = items.filter((item) =>
    libraryItemMatches(item, search) &&
    (topicFilter === null || item.topic === topicFilter) &&
    (kindFilter === null || item.kind === kindFilter));

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setFormError("El título es obligatorio."); return; }
    onAddItem(form.title.trim(), form.description.trim(), { kind: form.kind || undefined, topic: form.topic || undefined });
    setForm({ title: "", description: "", kind: kinds[0] ?? "", topic: "" }); setFormError(""); setShowForm(false);
  }

  function renderCard(item: LibraryItem) {
    return (
      <ItemCard key={item.id} item={item} bg={section.bg} accept={section.accept}
        onAddFile={onAddFile} onRemoveFile={onRemoveFile} onDelete={onDeleteItem} />
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AAABB]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Buscar ${section.itemLabel}…`}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#DDE2E8] bg-white text-[#2B3A52] text-sm placeholder-[#B0BCCA] focus:outline-none focus:border-[#1A9A9A] focus:ring-2 focus:ring-[#1A9A9A]/20 transition-all shadow-sm" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AAABB] hover:text-[#687A8C]"><X className="w-4 h-4" /></button>}
        </div>
        <SegmentedToggle<LibraryView> accent={section.bg} value={view} onChange={setView}
          options={[{ value: "lista", label: "Lista" }, { value: "area", label: "Por área" }]} />
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97] shadow-sm flex-shrink-0"
          style={{ backgroundColor: section.bg }}>
          <Plus className="w-4 h-4" />Nuevo
        </button>
      </div>

      {/* Filtros */}
      <TopicFilterChips items={items} selected={topicFilter} onSelect={setTopicFilter} accent={section.bg} />
      {kinds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-xs font-semibold text-[#9AAABB] mr-1">Tipo:</span>
          {[null, ...kinds].map((kind) => {
            const active = kindFilter === kind;
            return (
              <button key={kind ?? "todos"} onClick={() => setKindFilter(kind)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${active ? "text-white" : "text-[#687A8C] bg-white hover:bg-[#F0F2F5]"}`}
                style={active ? { backgroundColor: section.bg } : {}}>
                {kind ?? "Todos"}
              </button>
            );
          })}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8ECF0] p-5 mb-5">
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setFormError(""); }} placeholder="Título *" className={`${LIBRARY_INPUT_CLASS} sm:col-span-2`} />
            {kinds.length > 0 && (
              <select value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))} className={LIBRARY_INPUT_CLASS}>
                {kinds.map((kind) => <option key={kind} value={kind}>{kind}</option>)}
              </select>
            )}
            <select value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value as ResearchTopicId | "" }))} className={`${LIBRARY_INPUT_CLASS} ${kinds.length > 0 ? "" : "sm:col-span-2"}`}>
              <option value="">{NO_TOPIC_LABEL}</option>
              {RESEARCH_TOPICS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción breve (opcional)" className={`${LIBRARY_INPUT_CLASS} sm:col-span-2`} />
            {formError && <p className="sm:col-span-2 text-red-400 text-xs">{formError}</p>}
            <div className="sm:col-span-2 flex justify-end gap-2">
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
          <p className="text-sm">{items.length > 0 ? "Sin resultados con estos filtros." : `Aún no hay ${section.itemLabel}s. Creá el primero.`}</p>
        </div>
      ) : view === "lista" ? (
        <div className="flex flex-col gap-4">{filtered.map(renderCard)}</div>
      ) : (
        <div className="flex flex-col gap-8">
          {groupItemsByTopic(filtered).map((group) => (
            <div key={group.key}>
              <GroupHeading label={group.label} color={group.color} count={group.items.length} noun={["ítem", "ítems"]} />
              <div className="flex flex-col gap-4">{group.items.map(renderCard)}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function LibraryPage({ section, items, onAddItem, onDeleteItem, onAddFile, onRemoveFile, onBack }: LibraryPanelHandlers & {
  section: (typeof SECTIONS)[number];
  items: LibraryItem[];
  onBack: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: "#EDF0F4", fontFamily: "'Inter', sans-serif" }}>
      <SectionHeader title={section.title} bg={section.bg} Icon={section.Icon} onBack={onBack} currentSectionId={section.id} />
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-8">
        <LibraryItemsPanel section={section} items={items} kinds={ITEM_KINDS_BY_SECTION[section.id as LibrarySectionId] ?? []}
          onAddItem={onAddItem} onDeleteItem={onDeleteItem} onAddFile={onAddFile} onRemoveFile={onRemoveFile} />
      </div>
    </div>
  );
}

type ExperimentGrouping = "experimento" | "equipo" | "area";

/**
 * Datos experimentales: cada experiencia tiene un equipo, un área y varios archivos (Excel, gráfico, PDF
 * y el archivo nativo del equipo). Se ven como lista, agrupados por equipo o por área temática.
 * El selector de archivos acepta cualquier formato, porque los nativos de cada equipo son muy variados.
 */
function ExperimentalDataPanel({ items, bg, onAddItem, onDeleteItem, onAddFile, onRemoveFile }: LibraryPanelHandlers & {
  items: LibraryItem[]; bg: string;
}) {
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<ResearchTopicId | null>(null);
  const [grouping, setGrouping] = useState<ExperimentGrouping>("experimento");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", equipment: "", description: "", topic: "" as ResearchTopicId | "" });
  const [formError, setFormError] = useState("");

  const knownEquipment = Array.from(new Set(items.map((i) => i.equipment).filter((e): e is string => !!e))).sort();

  const filtered = items.filter((item) => libraryItemMatches(item, search) && (topicFilter === null || item.topic === topicFilter));

  // Por equipo: un grupo por equipo, ordenados alfabéticamente; los que no tienen equipo van al final.
  const NO_EQUIPMENT_LABEL = "Sin equipo asignado";
  const equipmentGroups = Array.from(filtered.reduce((map, item) => {
    const key = item.equipment || NO_EQUIPMENT_LABEL;
    map.set(key, [...(map.get(key) ?? []), item]);
    return map;
  }, new Map<string, LibraryItem[]>()))
    .map(([equipment, groupItems]) => ({ equipment, items: groupItems }))
    .sort((a, b) => (a.equipment === NO_EQUIPMENT_LABEL ? 1 : b.equipment === NO_EQUIPMENT_LABEL ? -1 : a.equipment.localeCompare(b.equipment)));

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.equipment.trim()) { setFormError("El nombre del experimento y el equipo son obligatorios."); return; }
    onAddItem(form.title.trim(), form.description.trim(), { equipment: form.equipment.trim(), topic: form.topic || undefined });
    setForm({ title: "", equipment: "", description: "", topic: "" }); setFormError(""); setShowForm(false);
  }

  function renderCard(item: LibraryItem) {
    return (
      <ItemCard key={item.id} item={item} bg={bg} accept="" showExperimentalKind
        onAddFile={onAddFile} onRemoveFile={onRemoveFile} onDelete={onDeleteItem} />
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AAABB]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar experimento, equipo o archivo…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#DDE2E8] bg-white text-[#2B3A52] text-sm placeholder-[#B0BCCA] focus:outline-none focus:border-[#687A8C] focus:ring-2 focus:ring-[#687A8C]/20 transition-all shadow-sm" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AAABB] hover:text-[#687A8C]"><X className="w-4 h-4" /></button>}
        </div>
        <SegmentedToggle<ExperimentGrouping> accent={bg} value={grouping} onChange={setGrouping}
          options={[{ value: "experimento", label: "Lista" }, { value: "equipo", label: "Por equipo" }, { value: "area", label: "Por área" }]} />
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97] shadow-sm flex-shrink-0"
          style={{ backgroundColor: bg }}>
          <Plus className="w-4 h-4" />Nuevo experimento
        </button>
      </div>

      <TopicFilterChips items={items} selected={topicFilter} onSelect={setTopicFilter} accent={bg} />

      <p className="text-xs text-[#9AAABB] mb-5 mt-2 leading-relaxed">
        Subí los archivos de cada experiencia juntos: el Excel con los datos, el gráfico y el PDF. Los formatos propios de un equipo solo se abren con su software, así que acompañalos siempre de la exportación a Excel o PDF.
      </p>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8ECF0] p-5 mb-5">
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setFormError(""); }} placeholder="Nombre del experimento *" className={`${LIBRARY_INPUT_CLASS} sm:col-span-2`} />
            <input value={form.equipment} onChange={(e) => { setForm((f) => ({ ...f, equipment: e.target.value })); setFormError(""); }} placeholder="Equipo *" list="experimental-equipment-options" className={LIBRARY_INPUT_CLASS} />
            <datalist id="experimental-equipment-options">
              {knownEquipment.map((equipment) => <option key={equipment} value={equipment} />)}
            </datalist>
            <select value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value as ResearchTopicId | "" }))} className={LIBRARY_INPUT_CLASS}>
              <option value="">{NO_TOPIC_LABEL}</option>
              {RESEARCH_TOPICS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Condiciones, muestras, observaciones (opcional)" className={`${LIBRARY_INPUT_CLASS} sm:col-span-2`} />
            {formError && <p className="sm:col-span-2 text-red-400 text-xs">{formError}</p>}
            <div className="sm:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => { setShowForm(false); setFormError(""); }} className="px-4 py-2 rounded-xl text-[#687A8C] text-sm font-medium hover:bg-[#F0F2F5] transition-colors">Cancelar</button>
              <button type="submit" className="px-5 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm" style={{ backgroundColor: bg }}>Guardar</button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-[#9AAABB]">
          <FolderOpen className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">{items.length > 0 ? "Sin resultados con estos filtros." : "Aún no hay datos experimentales. Creá el primer experimento."}</p>
        </div>
      ) : grouping === "experimento" ? (
        <div className="flex flex-col gap-4">{filtered.map(renderCard)}</div>
      ) : grouping === "equipo" ? (
        <div className="flex flex-col gap-8">
          {equipmentGroups.map((group) => (
            <div key={group.equipment}>
              <GroupHeading label={group.equipment} color={bg} count={group.items.length} noun={["experimento", "experimentos"]} Icon={Wrench} />
              <div className="flex flex-col gap-4">{group.items.map(renderCard)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groupItemsByTopic(filtered).map((group) => (
            <div key={group.key}>
              <GroupHeading label={group.label} color={group.color} count={group.items.length} noun={["experimento", "experimentos"]} />
              <div className="flex flex-col gap-4">{group.items.map(renderCard)}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/**
 * Pantalla "Información" con submenú de dos secciones: Documentos (seminarios, bibliografía, cursos)
 * y Datos experimentales. initialTab define cuál se abre al entrar (por ejemplo, desde el buscador).
 */
function InformationPage({ section, documents, experimentalData, initialTab, documentHandlers, experimentalDataHandlers, onBack }: {
  section: (typeof SECTIONS)[number];
  documents: LibraryItem[];
  experimentalData: LibraryItem[];
  initialTab: InformationTab;
  documentHandlers: LibraryPanelHandlers;
  experimentalDataHandlers: LibraryPanelHandlers;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<InformationTab>(initialTab);

  const subMenuItems: { id: InformationTab; label: string; count: number; Icon: React.ElementType }[] = [
    { id: "documentos", label: "Documentos",            count: documents.length,        Icon: BookOpen },
    { id: "datos",      label: "Datos experimentales",  count: experimentalData.length, Icon: Beaker },
  ];

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: "#EDF0F4", fontFamily: "'Inter', sans-serif" }}>
      <SectionHeader title={section.title} bg={section.bg} Icon={section.Icon} onBack={onBack} currentSectionId={section.id} />

      <div className="max-w-6xl mx-auto w-full px-6 py-8 flex flex-col md:flex-row gap-6">
        {/* Submenú: pestañas arriba en celular, barra lateral en escritorio */}
        <nav className="md:w-56 flex-shrink-0">
          <div className="flex md:flex-col gap-2 md:sticky md:top-24">
            {subMenuItems.map((item) => {
              const active = activeTab === item.id;
              const ItemIcon = item.Icon;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={`flex-1 md:flex-none flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all ${active ? "text-white shadow-md" : "text-[#687A8C] bg-white hover:bg-[#F7F9FB] shadow-sm"}`}
                  style={active ? { backgroundColor: section.bg } : {}}>
                  <ItemIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <span className={`text-xs ${active ? "text-white/60" : "text-[#B0BCCA]"}`}>{item.count}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          {activeTab === "documentos"
            ? <LibraryItemsPanel section={section} items={documents} kinds={ITEM_KINDS_BY_SECTION.lecciones} {...documentHandlers} />
            : <ExperimentalDataPanel items={experimentalData} bg={section.bg} {...experimentalDataHandlers} />}
        </div>
      </div>
    </div>
  );
}

// ─── Contacts page ────────────────────────────────────────────────────────────

type ContactsView = "contactos" | "entrevistas";

const CONTACTS_DARK = "#2B3A52";
const CONTACTS_INPUT_CLASS = "w-full px-3 py-2.5 rounded-xl border border-[#DDE2E8] bg-[#F7F9FB] text-[#2B3A52] text-sm placeholder-[#B0BCCA] focus:outline-none focus:border-[#2B3A52] focus:ring-2 focus:ring-[#2B3A52]/15 transition-all";

/**
 * Pantalla restringida "Contactos y Entrevistas", con un submenú de dos secciones.
 * Contactos: primero muestra las categorías; al elegir una (o "Todos") muestra la lista filtrable.
 * Si se escribe en el buscador sin categoría elegida, busca en todas.
 * Entrevistas: listado de entrevistas de salida con buscador y carga de archivos.
 */
function ContactsPage({ contacts, interviews, onAddContact, onRemoveContact, onUploadInterview, onRemoveInterview, onBack }: {
  contacts: Contact[]; interviews: UploadedFile[];
  onAddContact: (c: Omit<Contact, "id">) => void; onRemoveContact: (id: string) => void;
  onUploadInterview: (fl: FileList) => void; onRemoveInterview: (id: string) => void;
  onBack: () => void;
}) {
  const members = useMembers();
  const [activeView, setActiveView] = useState<ContactsView>("contactos");
  // null = todavía no se eligió categoría: se muestran las tarjetas de categorías.
  const [selectedCategory, setSelectedCategory] = useState<ContactCategory | "todos" | null>(null);
  const [contactSearch, setContactSearch] = useState("");
  const [interviewSearch, setInterviewSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", website: "", contact: "", category: "proveedor" as ContactCategory });
  const [formError, setFormError] = useState("");
  const interviewInputRef = useRef<HTMLInputElement>(null);

  const section = SECTIONS.find((s) => s.id === RESTRICTED_SECTION_ID)!;
  const showContactList = selectedCategory !== null || contactSearch.trim() !== "";

  const filteredContacts = contacts.filter((c) => {
    const q = contactSearch.trim().toLowerCase();
    const matchCategory = selectedCategory === null || selectedCategory === "todos" || c.category === selectedCategory;
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q) || c.website.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  const filteredInterviews = interviews.filter((f) => {
    const q = interviewSearch.trim().toLowerCase();
    const uploaderName = members.find((m) => m.id === f.uploadedBy)?.name.toLowerCase() ?? "";
    return !q || f.name.toLowerCase().includes(q) || uploaderName.includes(q);
  });

  function openCategory(category: ContactCategory | "todos") {
    setSelectedCategory(category);
    if (category !== "todos") setForm((f) => ({ ...f, category }));
  }

  function backToCategories() {
    setSelectedCategory(null);
    setContactSearch("");
  }

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim()) { setFormError("Nombre y contacto son obligatorios."); return; }
    onAddContact({ name: form.name.trim(), website: form.website.trim(), contact: form.contact.trim(), category: form.category });
    setForm((f) => ({ name: "", website: "", contact: "", category: f.category })); setFormError(""); setShowForm(false);
  }

  const subMenuItems: { id: ContactsView; label: string; count: number; Icon: React.ElementType }[] = [
    { id: "contactos",   label: "Contactos",             count: contacts.length,   Icon: Users },
    { id: "entrevistas", label: "Entrevistas de salida", count: interviews.length, Icon: Mic },
  ];

  const selectedCategoryInfo = CONTACT_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: "#EDF0F4", fontFamily: "'Inter', sans-serif" }}>
      <SectionHeader title="Contactos y Entrevistas" bg={CONTACTS_DARK} Icon={Mic} onBack={onBack} currentSectionId={RESTRICTED_SECTION_ID} />

      <div className="max-w-6xl mx-auto w-full px-6 py-8 flex flex-col md:flex-row gap-6">

        {/* Submenú: pestañas arriba en celular, barra lateral en escritorio */}
        <nav className="md:w-56 flex-shrink-0">
          <div className="flex md:flex-col gap-2 md:sticky md:top-24">
            {subMenuItems.map((item) => {
              const active = activeView === item.id;
              const ItemIcon = item.Icon;
              return (
                <button key={item.id} onClick={() => setActiveView(item.id)}
                  className={`flex-1 md:flex-none flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all ${active ? "text-white shadow-md" : "text-[#687A8C] bg-white hover:bg-[#F7F9FB] shadow-sm"}`}
                  style={active ? { backgroundColor: CONTACTS_DARK } : {}}>
                  <ItemIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <span className={`text-xs ${active ? "text-white/60" : "text-[#B0BCCA]"}`}>{item.count}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          {activeView === "contactos" ? (
            <>
              {/* Encabezado + búsqueda + agregar */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                {showContactList && (
                  <button onClick={backToCategories} className="flex items-center gap-1 text-sm font-medium text-[#687A8C] hover:text-[#2B3A52] transition-colors">
                    <ArrowLeft className="w-4 h-4" />Categorías
                  </button>
                )}
                <h2 className="font-bold text-[#2B3A52] text-sm uppercase tracking-wider">
                  {selectedCategory === null ? (contactSearch.trim() ? "Resultados" : "Directorio de contactos") : selectedCategory === "todos" ? "Todos los contactos" : selectedCategoryInfo?.label}
                </h2>
                <div className="flex items-center gap-2 ml-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9AAABB]" />
                    <input value={contactSearch} onChange={(e) => setContactSearch(e.target.value)} placeholder="Buscar contacto…"
                      className="w-44 sm:w-56 pl-8 pr-8 py-2 rounded-xl border border-[#DDE2E8] bg-white text-[#2B3A52] text-xs placeholder-[#B0BCCA] focus:outline-none focus:border-[#2B3A52] focus:ring-2 focus:ring-[#2B3A52]/15 transition-all shadow-sm" />
                    {contactSearch && <button onClick={() => setContactSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9AAABB]"><X className="w-3.5 h-3.5" /></button>}
                  </div>
                  <button onClick={() => setShowForm((v) => !v)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97] shadow-sm"
                    style={{ backgroundColor: CONTACTS_DARK }}>
                    <Plus className="w-4 h-4" />Agregar
                  </button>
                </div>
              </div>

              {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#E8ECF0] p-6 mb-5">
                  <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold text-[#687A8C] uppercase tracking-wider mb-1">Nombre *</label>
                      <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nombre o razón social" className={CONTACTS_INPUT_CLASS} /></div>
                    <div><label className="block text-xs font-semibold text-[#687A8C] uppercase tracking-wider mb-1">Categoría</label>
                      <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ContactCategory }))} className={CONTACTS_INPUT_CLASS}>
                        {CONTACT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select></div>
                    <div><label className="block text-xs font-semibold text-[#687A8C] uppercase tracking-wider mb-1">Sitio web</label>
                      <input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} placeholder="ejemplo.com" className={CONTACTS_INPUT_CLASS} /></div>
                    <div><label className="block text-xs font-semibold text-[#687A8C] uppercase tracking-wider mb-1">Contacto *</label>
                      <input value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} placeholder="email o teléfono" className={CONTACTS_INPUT_CLASS} /></div>
                    {formError && <p className="sm:col-span-2 text-red-400 text-xs">{formError}</p>}
                    <div className="sm:col-span-2 flex justify-end gap-2">
                      <button type="button" onClick={() => { setShowForm(false); setFormError(""); }} className="px-4 py-2 rounded-xl text-[#687A8C] text-sm font-medium hover:bg-[#F0F2F5] transition-colors">Cancelar</button>
                      <button type="submit" className="px-5 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 shadow-sm" style={{ backgroundColor: CONTACTS_DARK }}>Guardar</button>
                    </div>
                  </form>
                </div>
              )}

              {!showContactList ? (
                /* Vista inicial: solo categorías */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {CONTACT_CATEGORIES.map((cat) => {
                    const CatIcon = cat.Icon;
                    const count = contacts.filter((c) => c.category === cat.id).length;
                    return (
                      <button key={cat.id} onClick={() => openCategory(cat.id)}
                        className="group bg-white rounded-2xl p-5 flex flex-col items-start text-left shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-150 focus:outline-none">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: cat.color + "1A" }}>
                          <CatIcon className="w-5 h-5" style={{ color: cat.color }} />
                        </div>
                        <p className="font-semibold text-[#2B3A52] text-sm">{cat.label}</p>
                        <p className="text-xs text-[#9AAABB] mt-0.5">{count} {count === 1 ? "contacto" : "contactos"}</p>
                      </button>
                    );
                  })}
                  <button onClick={() => openCategory("todos")}
                    className="group rounded-2xl p-5 flex flex-col items-start text-left border-2 border-dashed border-[#C4CDD8] hover:border-[#2B3A52] hover:bg-white transition-all duration-150 focus:outline-none">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-[#2B3A52]/10">
                      <Users className="w-5 h-5 text-[#2B3A52]" />
                    </div>
                    <p className="font-semibold text-[#2B3A52] text-sm">Ver todos</p>
                    <p className="text-xs text-[#9AAABB] mt-0.5">{contacts.length} contactos</p>
                  </button>
                </div>
              ) : (
                <>
                  {/* Chips para cambiar de categoría sin volver atrás */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button onClick={() => openCategory("todos")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedCategory === "todos" || selectedCategory === null ? "text-white shadow-sm" : "text-[#687A8C] bg-white hover:bg-[#F0F2F5]"}`}
                      style={selectedCategory === "todos" || selectedCategory === null ? { backgroundColor: CONTACTS_DARK } : {}}>
                      Todos ({contacts.length})
                    </button>
                    {CONTACT_CATEGORIES.map((cat) => {
                      const active = selectedCategory === cat.id;
                      const CatIcon = cat.Icon;
                      return (
                        <button key={cat.id} onClick={() => openCategory(cat.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${active ? "text-white shadow-sm" : "text-[#687A8C] bg-white hover:bg-[#F0F2F5]"}`}
                          style={active ? { backgroundColor: cat.color } : {}}>
                          <CatIcon className="w-3 h-3" />{cat.label} ({contacts.filter((c) => c.category === cat.id).length})
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {filteredContacts.length === 0 ? (
                      <div className="flex flex-col items-center py-10 text-[#9AAABB]"><Users className="w-8 h-8 mb-2 opacity-30" /><p className="text-sm">Sin contactos.</p></div>
                    ) : (
                      <table className="w-full">
                        <thead><tr className="border-b border-[#F0F2F5]">
                          <th className="text-left text-xs font-semibold text-[#9AAABB] uppercase tracking-wider px-5 py-3.5">Nombre</th>
                          <th className="text-left text-xs font-semibold text-[#9AAABB] uppercase tracking-wider px-4 py-3.5 hidden sm:table-cell">Categoría</th>
                          <th className="text-left text-xs font-semibold text-[#9AAABB] uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">Sitio web</th>
                          <th className="text-left text-xs font-semibold text-[#9AAABB] uppercase tracking-wider px-4 py-3.5">Contacto</th>
                          <th className="w-10 px-2" />
                        </tr></thead>
                        <tbody>
                          {filteredContacts.map((c, i) => {
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
                                <td className="px-4 py-3.5 hidden lg:table-cell">
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
                </>
              )}
            </>
          ) : (
            <>
              {/* Entrevistas de salida */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <h2 className="font-bold text-[#2B3A52] text-sm uppercase tracking-wider">Entrevistas de salida</h2>
                <div className="flex items-center gap-2 ml-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9AAABB]" />
                    <input value={interviewSearch} onChange={(e) => setInterviewSearch(e.target.value)} placeholder="Buscar entrevista…"
                      className="w-44 sm:w-56 pl-8 pr-8 py-2 rounded-xl border border-[#DDE2E8] bg-white text-[#2B3A52] text-xs placeholder-[#B0BCCA] focus:outline-none focus:border-[#2B3A52] focus:ring-2 focus:ring-[#2B3A52]/15 transition-all shadow-sm" />
                    {interviewSearch && <button onClick={() => setInterviewSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9AAABB]"><X className="w-3.5 h-3.5" /></button>}
                  </div>
                  <button onClick={() => interviewInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97] shadow-sm"
                    style={{ backgroundColor: CONTACTS_DARK }}>
                    <Upload className="w-4 h-4" />Subir
                  </button>
                  <input ref={interviewInputRef} type="file" multiple accept={section.accept} className="hidden"
                    onChange={(e) => { if (e.target.files?.length) { onUploadInterview(e.target.files); e.target.value = ""; } }} />
                </div>
              </div>

              {filteredInterviews.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-[#9AAABB]"><FolderOpen className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">{interviews.length === 0 ? "No hay entrevistas registradas aún." : "Sin resultados."}</p></div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredInterviews.map((f) => {
                    const uploader = members.find((m) => m.id === f.uploadedBy);
                    return (
                      <div key={f.id} className="bg-white rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: CONTACTS_DARK + "20" }}>
                          {f.type.startsWith("video/") ? <Film className="w-5 h-5 text-[#2B3A52]" /> : <FileText className="w-5 h-5 text-[#2B3A52]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#2B3A52] text-sm truncate">{f.name}</p>
                          <p className="text-[#9AAABB] text-xs mt-0.5">
                            {formatBytes(f.size)} · {f.uploadedAt.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                            {uploader && <> · <span className="text-[#2B3A52]">{uploader.name}</span></>}
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          <a href={f.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"><Eye className="w-4 h-4 text-[#687A8C]" /></a>
                          <button onClick={() => onRemoveInterview(f.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Member profile page ──────────────────────────────────────────────────────

function MemberPage({ member, library, interviews, isOwnProfile, onBack }: {
  member: Member; library: LibraryState;
  /** Entrevistas visibles para quien mira el perfil: pasar [] si no tiene acceso a "Contactos y Entrevistas". */
  interviews: UploadedFile[];
  /** true = el usuario está viendo su propio perfil ("Mis huellas"); cambia el título de la sección de aportes. */
  isOwnProfile: boolean;
  onBack: () => void;
}) {
  const informationSection = SECTIONS[2];
  // Grupos de aportes del integrante; Datos experimentales se muestra aparte aunque viva dentro de "Información".
  const memberSections = [
    { key: "videos",     title: SECTIONS[0].title,         Icon: SECTIONS[0].Icon, bg: SECTIONS[0].bg, experimental: false, items: library.videos },
    { key: "protocolos", title: SECTIONS[1].title,         Icon: SECTIONS[1].Icon, bg: SECTIONS[1].bg, experimental: false, items: library.protocolos },
    { key: "lecciones",  title: informationSection.title,  Icon: informationSection.Icon, bg: informationSection.bg, experimental: false, items: library.lecciones },
    { key: "datos",      title: "Datos experimentales",    Icon: Beaker,           bg: informationSection.bg, experimental: true,  items: library.datos },
  ]
    .map((g) => ({ ...g, items: g.items.filter((i) => i.files.some((f) => f.uploadedBy === member.id)) }))
    .filter((g) => g.items.length > 0);

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
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[#687A8C]">
              <span className="inline-flex items-center gap-1.5"><UserCircle2 className="w-3.5 h-3.5 text-[#9AAABB]" />{member.profession}</span>
              <span className="inline-flex items-center gap-1.5"><FlaskConical className="w-3.5 h-3.5 text-[#9AAABB]" />{formatSeniority(member.joinedYear)}</span>
            </div>
            <p className="text-[#687A8C] text-sm mt-3 leading-relaxed">{member.bio}</p>
            {member.email && <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1.5 mt-4 text-xs text-[#9AAABB] hover:text-[#687A8C] transition-colors"><Mail className="w-3.5 h-3.5" />{member.email}</a>}
          </div>
        </div>

        <h3 className="font-bold text-[#2B3A52] text-sm uppercase tracking-wider mb-5">
          {isOwnProfile ? "Mis huellas" : `Huellas de ${member.name.replace(/^(Dra?\.\s+)?([A-Z]\.\s+)?/, "").split(" ")[0]}`}
        </h3>

        {memberSections.length === 0 && memberInterviews.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-[#9AAABB]"><FolderOpen className="w-10 h-10 mb-3 opacity-40" /><p className="text-sm">Este integrante aún no ha subido archivos.</p></div>
        ) : (
          <div className="flex flex-col gap-8">
            {memberSections.map(({ key, title, Icon, bg, experimental, items }) => {
              return (
                <div key={key}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg + "22" }}><Icon className="w-3.5 h-3.5" style={{ color: bg }} /></div>
                    <span className="text-sm font-bold text-[#2B3A52]">{title.replace(/\n/g, " ")}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {items.map((item) => (
                      <div key={item.id} className="bg-white rounded-xl px-5 py-3.5 shadow-sm">
                        <p className="font-semibold text-[#2B3A52] text-sm mb-2">
                          {item.title}
                          {item.equipment && <span className="ml-2 text-xs font-medium text-[#9AAABB]">· {item.equipment}</span>}
                        </p>
                        {item.files.filter((f) => f.uploadedBy === member.id).map((f) => (
                          <FileRow key={f.id} file={f} bg={bg} showExperimentalKind={experimental} onRemove={() => {}} />
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

// ─── Admin: alta, baja, modificación y bloqueo de usuarios ────────────────────

type AdminStatusFilter = "todos" | "activos" | "bloqueados" | "baja";

const ADMIN_ACCENT = "#2B3A52";
const ADMIN_INPUT_CLASS = "w-full px-3 py-2.5 rounded-xl border border-[#DDE2E8] bg-[#F7F9FB] text-[#2B3A52] text-sm placeholder-[#B0BCCA] focus:outline-none focus:border-[#2B3A52] focus:ring-2 focus:ring-[#2B3A52]/15 transition-all";

/** Ventana modal centrada con fondo oscurecido; se cierra con el botón X o haciendo clic afuera. */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/40" onMouseDown={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-full overflow-y-auto" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F2F5]">
          <h2 className="font-bold text-[#2B3A52]">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9AAABB] hover:bg-[#F0F2F5]"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/**
 * Formulario de alta (member = null) o modificación de un integrante.
 * Valida nombre y usuario obligatorios y usuario único (normalizado, sin tildes).
 * Las iniciales y el color del avatar se recalculan a partir del nombre y el rol.
 * isSelf impide que el administrador se quite a sí mismo el rol de admin.
 */
function MemberFormModal({ member, isSelf, onSave, onClose }: {
  member: Member | null; isSelf: boolean; onSave: (member: Member) => void; onClose: () => void;
}) {
  const members = useMembers();
  const [form, setForm] = useState({
    name: member?.name ?? "",
    username: member?.username ?? "",
    role: member?.role ?? "Tesista",
    profession: member?.profession ?? "",
    joinedYear: String(member?.joinedYear ?? new Date().getFullYear()),
    email: member?.email ?? "",
    bio: member?.bio ?? "",
    isAdmin: member?.isAdmin ?? false,
    canAccessContacts: member?.canAccessContacts ?? false,
  });
  const [error, setError] = useState("");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value })); setError("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const username = normalizeUsername(form.username).replace(/\s+/g, "");
    const joinedYear = Number(form.joinedYear);
    if (!form.name.trim() || !username) { setError("Nombre y usuario son obligatorios."); return; }
    if (members.some((m) => m.username === username && m.id !== member?.id)) { setError(`El usuario "${username}" ya existe.`); return; }
    if (!Number.isInteger(joinedYear) || joinedYear < 1950 || joinedYear > new Date().getFullYear()) { setError("El año de ingreso no es válido."); return; }
    onSave({
      id: member?.id ?? crypto.randomUUID(),
      username,
      name: form.name.trim(),
      initials: initialsFromName(form.name),
      role: form.role,
      color: colorForRole(form.role),
      profession: form.profession.trim(),
      joinedYear,
      email: form.email.trim(),
      bio: form.bio.trim(),
      isAdmin: isSelf ? true : form.isAdmin,
      canAccessContacts: form.canAccessContacts,
      status: member?.status ?? "activo",
      blockedUntil: member?.blockedUntil ?? null,
      blockReason: member?.blockReason ?? "",
    });
  }

  const labelClass = "block text-xs font-semibold text-[#687A8C] uppercase tracking-wider mb-1";

  return (
    <Modal title={member ? `Editar a ${member.name}` : "Nuevo integrante"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className={labelClass}>Nombre y apellido *</label>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Ej.: Dra. Ana Pérez" className={ADMIN_INPUT_CLASS} /></div>
        <div><label className={labelClass}>Usuario *</label>
          <input value={form.username} onChange={(e) => update("username", e.target.value)} placeholder="ana" className={ADMIN_INPUT_CLASS} /></div>
        <div><label className={labelClass}>Rol</label>
          <select value={form.role} onChange={(e) => update("role", e.target.value)} className={ADMIN_INPUT_CLASS}>
            {ROLE_OPTIONS.map((r) => <option key={r.role} value={r.role}>{r.role}</option>)}
          </select></div>
        <div><label className={labelClass}>Profesión</label>
          <input value={form.profession} onChange={(e) => update("profession", e.target.value)} placeholder="Lic. en Biotecnología" className={ADMIN_INPUT_CLASS} /></div>
        <div><label className={labelClass}>Año de ingreso</label>
          <input type="number" value={form.joinedYear} onChange={(e) => update("joinedYear", e.target.value)} className={ADMIN_INPUT_CLASS} /></div>
        <div className="sm:col-span-2"><label className={labelClass}>Email</label>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="nombre@dominio.com" className={ADMIN_INPUT_CLASS} /></div>
        <div className="sm:col-span-2"><label className={labelClass}>Descripción</label>
          <textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={3} placeholder="Tema de trabajo, responsabilidades…" className={`${ADMIN_INPUT_CLASS} resize-none`} /></div>

        <div className="sm:col-span-2 flex flex-col gap-2.5 rounded-xl bg-[#F7F9FB] px-4 py-3">
          <p className="text-xs font-semibold text-[#687A8C] uppercase tracking-wider">Permisos</p>
          <label className={`flex items-center gap-2.5 text-sm text-[#2B3A52] ${isSelf ? "opacity-60" : "cursor-pointer"}`}>
            <input type="checkbox" checked={isSelf || form.isAdmin} disabled={isSelf} onChange={(e) => update("isAdmin", e.target.checked)} className="w-4 h-4 accent-[#2B3A52]" />
            Administrador (acceso al menú Admin)
          </label>
          {isSelf && <p className="text-[11px] text-[#9AAABB] -mt-1 ml-6">No podés quitarte el rol de administrador a vos mismo.</p>}
          <label className="flex items-center gap-2.5 text-sm text-[#2B3A52] cursor-pointer">
            <input type="checkbox" checked={form.canAccessContacts} onChange={(e) => update("canAccessContacts", e.target.checked)} className="w-4 h-4 accent-[#2B3A52]" />
            Acceso a Contactos y Entrevistas
          </label>
        </div>

        {error && <p className="sm:col-span-2 text-red-400 text-xs">{error}</p>}
        <div className="sm:col-span-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-[#687A8C] text-sm font-medium hover:bg-[#F0F2F5] transition-colors">Cancelar</button>
          <button type="submit" className="px-5 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 shadow-sm" style={{ backgroundColor: ADMIN_ACCENT }}>
            {member ? "Guardar cambios" : "Dar de alta"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const BLOCK_DURATION_OPTIONS = [
  { value: "1",  label: "1 día" },
  { value: "7",  label: "1 semana" },
  { value: "30", label: "1 mes" },
  { value: "fecha", label: "Hasta una fecha" },
] as const;

/**
 * Bloqueo temporal: el integrante no puede ingresar hasta la fecha elegida (hasta el final de ese día).
 * Al vencer, vuelve a tener acceso sin que nadie haga nada.
 */
function BlockMemberModal({ member, onConfirm, onClose }: {
  member: Member; onConfirm: (blockedUntil: Date, reason: string) => void; onClose: () => void;
}) {
  const [duration, setDuration] = useState<(typeof BLOCK_DURATION_OPTIONS)[number]["value"]>("7");
  const [untilDate, setUntilDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  // Fecha local (no toISOString, que usa UTC y en Argentina después de las 21 h daría un día de más).
  const minDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    let blockedUntil: Date;
    if (duration === "fecha") {
      if (!untilDate) { setError("Elegí la fecha hasta la que queda bloqueado."); return; }
      const [year, month, day] = untilDate.split("-").map(Number);
      blockedUntil = new Date(year, month - 1, day, 23, 59, 59);
    } else {
      blockedUntil = new Date();
      blockedUntil.setDate(blockedUntil.getDate() + Number(duration));
    }
    onConfirm(blockedUntil, reason.trim());
  }

  return (
    <Modal title={`Bloquear a ${member.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-[#687A8C]">No va a poder ingresar a Legado mientras dure el bloqueo. Sus aportes siguen visibles para el resto.</p>
        <div className="grid grid-cols-2 gap-2">
          {BLOCK_DURATION_OPTIONS.map((option) => (
            <button key={option.value} type="button" onClick={() => { setDuration(option.value); setError(""); }}
              className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${duration === option.value ? "text-white border-transparent" : "text-[#687A8C] border-[#DDE2E8] hover:bg-[#F7F9FB]"}`}
              style={duration === option.value ? { backgroundColor: "#C0392B" } : {}}>
              {option.label}
            </button>
          ))}
        </div>
        {duration === "fecha" && (
          <input type="date" min={minDate} value={untilDate} onChange={(e) => { setUntilDate(e.target.value); setError(""); }} className={ADMIN_INPUT_CLASS} />
        )}
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo (opcional, se le muestra al intentar ingresar)" className={ADMIN_INPUT_CLASS} />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-[#687A8C] text-sm font-medium hover:bg-[#F0F2F5] transition-colors">Cancelar</button>
          <button type="submit" className="px-5 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 shadow-sm bg-[#C0392B]">Bloquear</button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Menú Admin: listado de integrantes con búsqueda y filtro por estado, alta, modificación,
 * bloqueo temporal / desbloqueo y baja / reactivación. El administrador no puede bloquearse
 * ni darse de baja a sí mismo (currentUserId), para no dejar el sistema sin administración.
 */
function AdminPage({ currentUserId, onSaveMember, onUpdateMember, onBack }: {
  currentUserId: string;
  onSaveMember: (member: Member) => void;
  onUpdateMember: (memberId: string, changes: Partial<Member>) => void;
  onBack: () => void;
}) {
  const members = useMembers();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminStatusFilter>("todos");
  // undefined = formulario cerrado; null = alta; Member = modificación.
  const [editingMember, setEditingMember] = useState<Member | null | undefined>(undefined);
  const [blockingMember, setBlockingMember] = useState<Member | null>(null);
  const [removingMember, setRemovingMember] = useState<Member | null>(null);

  const now = new Date();
  const counts: Record<AdminStatusFilter, number> = {
    todos: members.length,
    activos: members.filter((m) => m.status === "activo" && !isTemporarilyBlocked(m, now)).length,
    bloqueados: members.filter((m) => m.status === "activo" && isTemporarilyBlocked(m, now)).length,
    baja: members.filter((m) => m.status === "baja").length,
  };

  const filtered = members.filter((m) => {
    const q = normalizeUsername(search);
    const matchSearch = !q || normalizeUsername(m.name).includes(q) || m.username.includes(q) || normalizeUsername(m.role).includes(q);
    const blocked = isTemporarilyBlocked(m, now);
    const matchStatus = statusFilter === "todos"
      || (statusFilter === "activos" && m.status === "activo" && !blocked)
      || (statusFilter === "bloqueados" && m.status === "activo" && blocked)
      || (statusFilter === "baja" && m.status === "baja");
    return matchSearch && matchStatus;
  });

  const filterOptions: { id: AdminStatusFilter; label: string }[] = [
    { id: "todos", label: "Todos" }, { id: "activos", label: "Activos" },
    { id: "bloqueados", label: "Bloqueados" }, { id: "baja", label: "Dados de baja" },
  ];

  const actionButtonClass = "w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: "#EDF0F4", fontFamily: "'Inter', sans-serif" }}>
      <SectionHeader title="Administración de usuarios" bg={ADMIN_ACCENT} Icon={ShieldCheck} onBack={onBack} />

      <div className="max-w-5xl mx-auto w-full px-6 py-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AAABB]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, usuario o rol…"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#DDE2E8] bg-white text-[#2B3A52] text-sm placeholder-[#B0BCCA] focus:outline-none focus:border-[#2B3A52] focus:ring-2 focus:ring-[#2B3A52]/15 transition-all shadow-sm" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AAABB] hover:text-[#687A8C]"><X className="w-4 h-4" /></button>}
          </div>
          <button onClick={() => setEditingMember(null)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97] shadow-sm"
            style={{ backgroundColor: ADMIN_ACCENT }}>
            <UserPlus className="w-4 h-4" />Nuevo integrante
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {filterOptions.map((option) => {
            const active = statusFilter === option.id;
            return (
              <button key={option.id} onClick={() => setStatusFilter(option.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${active ? "text-white shadow-sm" : "text-[#687A8C] bg-white hover:bg-[#F0F2F5]"}`}
                style={active ? { backgroundColor: ADMIN_ACCENT } : {}}>
                {option.label} ({counts[option.id]})
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-[#9AAABB]"><Users className="w-8 h-8 mb-2 opacity-30" /><p className="text-sm">Sin integrantes con estos filtros.</p></div>
          ) : filtered.map((m) => {
            const isSelf = m.id === currentUserId;
            const blocked = isTemporarilyBlocked(m, now);
            const removed = m.status === "baja";
            return (
              <div key={m.id} className={`flex flex-wrap sm:flex-nowrap items-center gap-4 px-5 py-4 border-b border-[#F0F2F5] last:border-0 ${removed ? "bg-[#FAFBFC]" : ""}`}>
                <div className={removed ? "opacity-40 grayscale" : ""}><MemberAvatar member={m} size="md" /></div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${removed ? "text-[#9AAABB]" : "text-[#2B3A52]"}`}>
                    {m.name}{isSelf && <span className="ml-1.5 text-xs font-medium text-[#9AAABB]">(vos)</span>}
                  </p>
                  <p className="text-xs text-[#9AAABB] truncate">@{m.username} · {m.role}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {m.isAdmin && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#2B3A52]/10 text-[#2B3A52]">Admin</span>}
                    {m.canAccessContacts && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#1A9A9A]/10 text-[#1A9A9A]">Contactos y Entrevistas</span>}
                    {blocked && !removed && (
                      <span title={m.blockReason || undefined} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#C0392B]/10 text-[#C0392B]">
                        Bloqueado hasta el {formatShortDate(m.blockedUntil!)}
                      </span>
                    )}
                    {removed && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#687A8C]/10 text-[#687A8C]">Dado de baja</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button title="Editar" onClick={() => setEditingMember(m)} className={`${actionButtonClass} text-[#687A8C] hover:bg-[#F0F2F5]`}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  {!removed && (blocked ? (
                    <button title="Desbloquear" onClick={() => onUpdateMember(m.id, { blockedUntil: null, blockReason: "" })} className={`${actionButtonClass} text-[#1A9A9A] hover:bg-[#1A9A9A]/10`}>
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                  ) : (
                    <button title={isSelf ? "No podés bloquearte a vos mismo" : "Bloquear temporalmente"} disabled={isSelf} onClick={() => setBlockingMember(m)} className={`${actionButtonClass} text-[#E07B2A] hover:bg-[#E07B2A]/10`}>
                      <ShieldBan className="w-4 h-4" />
                    </button>
                  ))}
                  {removed ? (
                    <button title="Reactivar" onClick={() => onUpdateMember(m.id, { status: "activo" })} className={`${actionButtonClass} text-[#1A9A9A] hover:bg-[#1A9A9A]/10`}>
                      <UserCheck className="w-4 h-4" />
                    </button>
                  ) : (
                    <button title={isSelf ? "No podés darte de baja a vos mismo" : "Dar de baja"} disabled={isSelf} onClick={() => setRemovingMember(m)} className={`${actionButtonClass} text-red-400 hover:bg-red-50`}>
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-[#9AAABB] mt-4 leading-relaxed">
          Dar de baja no borra a la persona: pasa a ser ex integrante, no puede ingresar y deja de aparecer en la lista, pero todo lo que subió conserva su nombre. Se puede reactivar cuando quieras.
        </p>
      </div>

      {editingMember !== undefined && (
        <MemberFormModal member={editingMember} isSelf={editingMember?.id === currentUserId}
          onSave={(member) => { onSaveMember(member); setEditingMember(undefined); }}
          onClose={() => setEditingMember(undefined)} />
      )}

      {blockingMember && (
        <BlockMemberModal member={blockingMember}
          onConfirm={(blockedUntil, reason) => { onUpdateMember(blockingMember.id, { blockedUntil, blockReason: reason }); setBlockingMember(null); }}
          onClose={() => setBlockingMember(null)} />
      )}

      {removingMember && (
        <Modal title={`Dar de baja a ${removingMember.name}`} onClose={() => setRemovingMember(null)}>
          <p className="text-sm text-[#687A8C] leading-relaxed">
            Va a dejar de poder ingresar y no va a aparecer en la lista de integrantes. Sus aportes se conservan con su nombre, y lo podés reactivar desde el filtro "Dados de baja".
          </p>
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => setRemovingMember(null)} className="px-4 py-2 rounded-xl text-[#687A8C] text-sm font-medium hover:bg-[#F0F2F5] transition-colors">Cancelar</button>
            <button onClick={() => { onUpdateMember(removingMember.id, { status: "baja", blockedUntil: null, blockReason: "" }); setRemovingMember(null); }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 shadow-sm bg-red-500">
              <Ban className="w-4 h-4" />Dar de baja
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  // null = nadie logueado.
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [page, setPage] = useState<Page>({ kind: "home" });
  const [library, setLibrary] = useState<LibraryState>(INITIAL_LIBRARY);
  const [interviews, setInterviews] = useState<UploadedFile[]>(INITIAL_INTERVIEWS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);

  /** Alta (id nuevo) o modificación (id existente) de un integrante. */
  const saveMember = useCallback((member: Member) => {
    setMembers((prev) => prev.some((m) => m.id === member.id) ? prev.map((m) => (m.id === member.id ? member : m)) : [...prev, member]);
  }, []);

  /** Aplica un cambio parcial a un integrante (bloqueo, baja, reactivación). */
  const updateMember = useCallback((memberId: string, changes: Partial<Member>) => {
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, ...changes } : m)));
  }, []);

  const addItem = useCallback((sectionId: LibrarySectionId, title: string, description: string, details?: LibraryItemDetails) => {
    setLibrary((prev) => ({
      ...prev,
      [sectionId]: [...prev[sectionId], { id: crypto.randomUUID(), title, description, ...details, files: [], createdAt: new Date() }],
    }));
  }, []);

  /** Handlers de biblioteca ya ligados a una sección, para pasarlos a los paneles. */
  function libraryHandlersFor(sid: LibrarySectionId): LibraryPanelHandlers {
    return {
      onAddItem: (t, d, details) => addItem(sid, t, d, details),
      onDeleteItem: (id) => deleteItem(sid, id),
      onAddFile: (itemId, fl) => addFile(sid, itemId, fl),
      onRemoveFile: (itemId, fileId) => removeFile(sid, itemId, fileId),
    };
  }

  const deleteItem = useCallback((sectionId: LibrarySectionId, itemId: string) => {
    setLibrary((prev) => ({ ...prev, [sectionId]: prev[sectionId].filter((i) => i.id !== itemId) }));
  }, []);

  const addFile = useCallback((sectionId: LibrarySectionId, itemId: string, fl: FileList) => {
    const added: UploadedFile[] = Array.from(fl).map((f) => ({
      id: crypto.randomUUID(), name: f.name, size: f.size, type: f.type,
      url: URL.createObjectURL(f), uploadedAt: new Date(), uploadedBy: currentUserId ?? undefined,
    }));
    setLibrary((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId].map((i) => i.id === itemId ? { ...i, files: [...i.files, ...added] } : i),
    }));
  }, [currentUserId]);

  const removeFile = useCallback((sectionId: LibrarySectionId, itemId: string, fileId: string) => {
    setLibrary((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId].map((i) => i.id === itemId ? { ...i, files: i.files.filter((f) => f.id !== fileId) } : i),
    }));
  }, []);

  const addInterview = useCallback((fl: FileList) => {
    const added: UploadedFile[] = Array.from(fl).map((f) => ({
      id: crypto.randomUUID(), name: f.name, size: f.size, type: f.type,
      url: URL.createObjectURL(f), uploadedAt: new Date(), uploadedBy: currentUserId ?? undefined,
    }));
    setInterviews((prev) => [...prev, ...added]);
  }, [currentUserId]);

  function handleLogout() { setCurrentUserId(null); setPage({ kind: "home" }); }

  const currentUser = members.find((m) => m.id === currentUserId);
  if (!currentUser) {
    return (
      <MembersContext.Provider value={members}>
        <Login onLogin={(memberId) => { setCurrentUserId(memberId); setPage({ kind: "home" }); }} />
      </MembersContext.Provider>
    );
  }

  const hasContactsAccess = canAccessContacts(currentUser);
  const visibleSections = visibleSectionsFor(currentUser);
  const navbar = (
    <NavBar currentUser={currentUser}
      onGoHome={() => setPage({ kind: "home" })}
      onGoProfile={() => setPage({ kind: "member", id: currentUser.id })}
      onGoAdmin={() => setPage({ kind: "admin" })}
      onLogout={handleLogout} />
  );

  function renderPage() {
    const homePage = <Home library={library} sections={visibleSections} onNavigate={setPage} />;
    if (page.kind === "home") return homePage;

    if (page.kind === "admin") {
      if (!currentUser!.isAdmin) return homePage;
      return <AdminPage currentUserId={currentUser!.id} onSaveMember={saveMember} onUpdateMember={updateMember} onBack={() => setPage({ kind: "home" })} />;
    }

    if (page.kind === "section") {
      if (page.id === RESTRICTED_SECTION_ID) {
        if (!hasContactsAccess) return homePage;
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
      if (sid === "lecciones") {
        const initialTab = page.infoTab ?? "documentos";
        return (
          // key: al llegar desde el buscador a otra subsección, se vuelve a montar con esa pestaña abierta.
          <InformationPage key={initialTab} section={section} initialTab={initialTab}
            documents={library.lecciones} experimentalData={library.datos}
            documentHandlers={libraryHandlersFor("lecciones")} experimentalDataHandlers={libraryHandlersFor("datos")}
            onBack={() => setPage({ kind: "home" })} />
        );
      }
      // key: al saltar entre Know How y Protocolos desde las pestañas, cada sección arranca con búsqueda y filtros limpios.
      return <LibraryPage key={sid} section={section} items={library[sid]} {...libraryHandlersFor(sid)} onBack={() => setPage({ kind: "home" })} />;
    }

    if (page.kind === "member") {
      const member = members.find((m) => m.id === page.id);
      if (!member) return homePage;
      return <MemberPage member={member} library={library} interviews={hasContactsAccess ? interviews : []} isOwnProfile={member.id === currentUser!.id} onBack={() => setPage({ kind: "home" })} />;
    }
  }

  return (
    <MembersContext.Provider value={members}>
      <SectionNavigationContext.Provider value={{ sections: visibleSections, onSelectSection: (sectionId) => setPage({ kind: "section", id: sectionId }) }}>
        <div className="flex flex-col min-h-screen">
          {navbar}
          {renderPage()}
        </div>
      </SectionNavigationContext.Provider>
    </MembersContext.Provider>
  );
}
