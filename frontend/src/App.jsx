import { useState, useEffect, useRef } from "react";
import {
  Zap, Refrigerator, Tv, AirVent, Waves, Lightbulb, Router, Laptop, Fan, Flame,
  Upload, FileText, Camera, Plus, X, AlertTriangle, CloudLightning, CloudRain,
  ShieldAlert, Sparkles, Activity, Gauge, LogOut, LayoutDashboard, Package,
  ListTree, BellRing, Wand2, ChevronRight, CheckCircle2, TrendingUp, TrendingDown,
  CalendarClock, CircleDollarSign, Clock3, Bot, Send, User, Eye,
  Microwave, Coffee, Printer, Monitor, Speaker, Smartphone, CreditCard, Store, Wind, Shirt, Droplets, Utensils,
  Computer, Server, Gamepad2, BatteryCharging, Trash2, Sun, Moon
} from "lucide-react";
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend
} from "recharts";

const API_URL = "http://localhost:3001/api";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');
@keyframes eq {
  0% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
  100% { transform: scaleY(0.3); }
}
.eq-bar {
  animation: eq 1s ease-in-out infinite;
  transform-origin: bottom;
}`;
const disp = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };
const body = { fontFamily: "'Inter', sans-serif" };

const APPLIANCE_TYPES = [
  // Hogar Básico
  { type: "refrigerador", label: "Refrigerador", icon: Refrigerator, baseWatts: 150 },
  { type: "television", label: "Televisor", icon: Tv, baseWatts: 90 },
  { type: "aire", label: "Aire acondicionado", icon: AirVent, baseWatts: 1200 },
  { type: "lavadora", label: "Lavadora", icon: Waves, baseWatts: 500 },
  { type: "iluminacion", label: "Iluminación (Focos)", icon: Lightbulb, baseWatts: 60 },
  { type: "ventilador", label: "Ventilador", icon: Fan, baseWatts: 55 },
  
  // Cocina
  { type: "microondas", label: "Microondas", icon: Microwave, baseWatts: 1000 },
  { type: "cafetera", label: "Cafetera", icon: Coffee, baseWatts: 800 },
  { type: "licuadora", label: "Licuadora", icon: Utensils, baseWatts: 400 },
  { type: "plancha", label: "Plancha de Ropa", icon: Shirt, baseWatts: 1200 },

  // Electrónica / Entretenimiento
  { type: "laptop", label: "Laptop", icon: Laptop, baseWatts: 65 },
  { type: "pc", label: "Computadora de Escritorio", icon: Computer, baseWatts: 300 },
  { type: "monitor", label: "Monitor extra", icon: Monitor, baseWatts: 30 },
  { type: "consola", label: "Consola de Videojuegos", icon: Gamepad2, baseWatts: 150 },
  { type: "router", label: "Router / Módem", icon: Router, baseWatts: 12 },
  { type: "parlante", label: "Sistema de Sonido", icon: Speaker, baseWatts: 100 },
  { type: "cargador", label: "Cargador de Celular", icon: BatteryCharging, baseWatts: 15 },

  // Cuidado Personal / Clima
  { type: "secadora_pelo", label: "Secadora de Cabello", icon: Wind, baseWatts: 1500 },
  { type: "calefactor", label: "Calefactor / Estufa", icon: Flame, baseWatts: 900 },
  { type: "calentador_agua", label: "Calentador de Agua", icon: Droplets, baseWatts: 3000 },

  // Negocio / Tienda Pequeña
  { type: "vitrina", label: "Vitrina Refrigeradora", icon: Store, baseWatts: 350 },
  { type: "congelador", label: "Congelador Horizontal", icon: Refrigerator, baseWatts: 250 },
  { type: "impresora", label: "Impresora / Copiadora", icon: Printer, baseWatts: 400 },
  { type: "pos", label: "Punto de Venta (POS)", icon: CreditCard, baseWatts: 25 },
  { type: "servidor", label: "Servidor Pequeño", icon: Server, baseWatts: 400 },
  
  { type: "otro", label: "Otro", icon: Zap, baseWatts: 100 },
];
const typeMeta = (type) => APPLIANCE_TYPES.find((t) => t.type === type) || APPLIANCE_TYPES[APPLIANCE_TYPES.length - 1];

const CLIMATE_ALERTS = [
  { id: 1, icon: CloudLightning, color: "text-rose-400", bg: "bg-rose-500/5", border: "border-rose-500/20", title: "Tormenta eléctrica en Ecuador (Temporada Invernal)", message: "Riesgo de picos de voltaje por rayos en la red interconectada. Acción: Desconecta televisores, PCs y equipos sensibles que no tengan supresor de picos." },
  { id: 2, icon: Flame, color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/20", title: "Ola de calor intensa (Estiaje)", message: "El sistema nacional está bajo estrés por sequía en hidroeléctricas. Acción: Ajusta tu aire acondicionado a 24°C y evita usar lavadoras o planchas entre las 18:00 y 21:00." },
  { id: 3, icon: CloudRain, color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/20", title: "Lluvias extremas y alta humedad", message: "La humedad puede generar arcos eléctricos en cableado expuesto o desgastado. Acción: Revisa aislamientos exteriores y asegúrate de secar bien los enchufes antes de usar." },
  { id: 4, icon: ShieldAlert, color: "text-orange-400", bg: "bg-orange-500/5", border: "border-orange-500/20", title: "Alerta de racionamiento programado", message: "Posibles cortes de energía en tu sector debido al estiaje. Acción: Mantén dispositivos móviles cargados al 100% y evita abrir la refrigeradora para conservar el frío." }
];

function Sparkline({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={44}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="watts" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function StatusPill({ status }) {
  const map = {
    ok: { text: "Normal", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    danger: { text: "Posible falla", cls: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
    off: { text: "Apagado", cls: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
  };
  const m = map[status] || map.ok;
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${m.cls}`} style={mono}>{m.text}</span>
  );
}

const QUESTION_POOL = [
  "¿Cómo bajo el consumo del aire acondicionado?",
  "¿Qué hago ante un corte de luz?",
  "¿Cómo sé si mi refrigerador está fallando?",
  "¿Cómo puedo ahorrar energía en casa?",
  "¿Qué equipos consumen energía en stand-by?",
  "¿Algún consejo para el uso de la lavadora?"
];

export default function WattIA() {
  const [token, setToken] = useState(localStorage.getItem('wattia_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('wattia_user')) || null);
  const [tab, setTab] = useState("resumen");
  const [isLightMode, setIsLightMode] = useState(() => localStorage.getItem("wattia_theme") === "light");

  useEffect(() => {
    localStorage.setItem("wattia_theme", isLightMode ? "light" : "dark");
  }, [isLightMode]);

  const [appliances, setAppliances] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [log, setLog] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newAppl, setNewAppl] = useState({ name: "", type: "otro", watts: "", hoursUse: "" });
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "¡Hola! Soy el asistente de WattIA. Pregúntame sobre ahorro de energía o cuidado de tus equipos." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [suggestedQ, setSuggestedQ] = useState(QUESTION_POOL.slice(0, 3));
  const [isUploading, setIsUploading] = useState(false);
  const pdfInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Login form state
  const [authEmail, setAuthEmail] = useState("ale.zambrano@wattia.com");
  const [authPassword, setAuthPassword] = useState("123456");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");

  const reqOpts = () => ({ headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } });

  const login = async () => {
    try {
      setAuthError("");
      const url = isRegistering ? `${API_URL}/auth/register` : `${API_URL}/auth/login`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isRegistering ? { email: authEmail, password: authPassword, name: authName } : { email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error de autenticación");
      localStorage.setItem('wattia_token', data.token);
      localStorage.setItem('wattia_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (e) {
      setAuthError(e.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('wattia_token');
    localStorage.removeItem('wattia_user');
    setToken(null);
    setUser(null);
  };

  const loadData = async () => {
    if (!token) return;
    try {
      const [appRes, billRes, logRes] = await Promise.all([
        fetch(`${API_URL}/appliances`, reqOpts()),
        fetch(`${API_URL}/bills`, reqOpts()),
        fetch(`${API_URL}/logs`, reqOpts())
      ]);
      if(appRes.ok) setAppliances(await appRes.json());
      if(billRes.ok) setPaymentHistory(await billRes.json());
      if(logRes.ok) setLog(await logRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Efecto de tiempo real para los electrodomésticos (visual drift)
  const tick = useRef(0);
  useEffect(() => {
    if (!token || appliances.length === 0) return;
    const interval = setInterval(() => {
      tick.current += 1;
      setAppliances(prev => prev.map(a => {
        if (a.status === "off") return a;
        const baseWatts = a.baseWatts || a.watts; // Guarda el valor base si no existe
        const drift = a.status === "danger" ? 1.28 : 1;
        const nextW = Math.max(0, Math.round(baseWatts * drift * (0.88 + Math.random() * 0.28)));
        
        // Actualizar el historial visual
        const hist = a.history ? [...a.history] : [];
        if (hist.length > 12) hist.shift();
        hist.push({ watts: nextW, recordedAt: new Date().toISOString() });
        
        return { ...a, baseWatts, watts: nextW, history: hist };
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, [token, appliances.length]);

  // Periodic log calculator
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(async () => {
      try {
         const currentTotalWatts = appliances.reduce((s, a) => s + (a.status !== "off" ? a.watts : 0), 0);
         const res = await fetch(`${API_URL}/logs/calculate`, { 
            method: "POST", 
            ...reqOpts(),
            body: JSON.stringify({ currentTotalWatts })
         });
         if (res.ok) {
            const newLog = await res.json();
            setLog(prev => [newLog, ...prev].slice(0, 10));
         }
      } catch (e) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [token, appliances]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const addAppliance = async () => {
    if (!newAppl.type || !newAppl.watts) return;
    const selectedMeta = typeMeta(newAppl.type);
    const finalName = selectedMeta ? selectedMeta.label : "Equipo";
    try {
      const res = await fetch(`${API_URL}/appliances`, {
        method: "POST",
        ...reqOpts(),
        body: JSON.stringify({ ...newAppl, name: finalName })
      });
      if (res.ok) {
        const created = await res.json();
        setAppliances([...appliances, created]);
        setShowAdd(false);
        setNewAppl({ name: "", type: "", watts: "", hoursUse: "" });
      }
    } catch (e) { console.error(e); }
  };

  const deleteAppliance = async (id) => {
    try {
      const res = await fetch(`${API_URL}/appliances/${id}`, {
        method: "DELETE",
        ...reqOpts()
      });
      if (res.ok) {
        setAppliances(appliances.filter(a => a.id !== id));
      }
    } catch (e) { console.error(e); }
  };

  const uploadBill = async (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch(`${API_URL}/bills/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }, // Sin Content-Type, fetch lo pone con boundary
        body: formData
      });
      if (res.ok) {
        const created = await res.json();
        setPaymentHistory(prev => [created, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
      // Limpiar input
      if (type === 'pdf' && pdfInputRef.current) pdfInputRef.current.value = "";
      if (type === 'photo' && photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const toggleBillStatus = async (id, currentStatus) => {
     const newStatus = currentStatus === 'pagada' ? 'pendiente' : 'pagada';
     try {
       const res = await fetch(`${API_URL}/bills/${id}`, {
         method: "PUT",
         ...reqOpts(),
         body: JSON.stringify({ status: newStatus })
       });
       if (res.ok) {
         setPaymentHistory(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
       }
     } catch(e) {
       console.error(e);
     }
  };

  const sendChat = async (textOverride) => {
    const text = (textOverride ?? chatInput).trim();
    if (!text || chatLoading) return;
    const nextMessages = [...chatMessages, { role: "user", content: text }];
    setChatMessages(nextMessages);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        ...reqOpts(),
        body: JSON.stringify({ messages: nextMessages })
      });
      const data = await res.json();
      const textBlocks = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
      setChatMessages((prev) => [...prev, { role: "assistant", content: textBlocks || "Error" }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Error de red" }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSuggestedClick = (q) => {
    sendChat(q);
    setSuggestedQ(prev => {
       const others = QUESTION_POOL.filter(x => !prev.includes(x) && x !== q);
       const nextQ = others.length > 0 ? others[Math.floor(Math.random() * others.length)] : null;
       const filtered = prev.filter(x => x !== q);
       if (nextQ) filtered.push(nextQ);
       return filtered;
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden" style={body}>
        <style>{FONT_IMPORT}</style>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, #38bdf8 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
        <div className="relative z-10 w-full max-w-sm mx-4">
          <div className="flex items-center gap-2 mb-8 justify-center">
             <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30"><Zap className="w-6 h-6 text-amber-400" /></div>
             <span className="text-2xl font-bold text-white" style={disp}>WattIA</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-7 shadow-2xl">
            <h1 className="text-white text-lg font-semibold mb-1" style={disp}>{isRegistering ? "Crear cuenta" : "Ingresar a tu panel"}</h1>
            {authError && <div className="text-xs text-rose-400 mb-2">{authError}</div>}
            <div className="space-y-3">
              {isRegistering && (
                 <div>
                    <label className="text-xs text-slate-400 mb-1 block">Nombre</label>
                    <input value={authName} onChange={e=>setAuthName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 text-sm outline-none focus:border-amber-500/60" />
                 </div>
              )}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Correo</label>
                <input value={authEmail} onChange={e=>setAuthEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 text-sm outline-none focus:border-amber-500/60" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Contraseña</label>
                <input type="password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 text-sm outline-none focus:border-amber-500/60" />
              </div>
            </div>
            <button onClick={login} className="mt-6 w-full bg-amber-500 hover:bg-amber-400 transition-colors text-slate-950 font-semibold rounded-lg py-2.5 text-sm">{isRegistering ? "Registrarse" : "Ingresar"}</button>
            <p className="text-[11px] text-slate-400 text-center mt-4 hover:text-amber-400 cursor-pointer" onClick={() => setIsRegistering(!isRegistering)}>
               {isRegistering ? "¿Ya tienes cuenta? Ingresa aquí" : "¿No tienes cuenta? Regístrate"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const NAV = [
    { id: "resumen", label: "Resumen", icon: LayoutDashboard },
    { id: "electrodomesticos", label: "Mis electrodomésticos", icon: Package },
    { id: "planilla", label: "Planilla y pagos", icon: FileText },
    { id: "log", label: "Log de corriente", icon: Activity },
    { id: "alertas", label: "Alertas y clima", icon: CloudLightning },
    { id: "recomendaciones", label: "Recomendaciones IA", icon: Wand2 },
  ];

  const totalWatts = appliances.reduce((s, a) => s + (a.status !== "off" ? a.watts : 0), 0);
  // Cálculo mensual en Ecuador: kWh = (Watts / 1000) * HorasDiarias * 30 días. Tarifa prom = $0.10 / kWh
  const estCost = appliances.reduce((sum, a) => {
     if (a.status === "off") return sum;
     const dailyHours = a.hoursUse || 6; // Por defecto 6h si no se especificó
     const monthlyKwh = (a.watts / 1000) * dailyHours * 30;
     return sum + (monthlyKwh * 0.102); // Tarifa residencial promedio $0.102/kWh CNEL
  }, 0).toFixed(2);
  const dangerCount = appliances.filter(a => a.status === 'danger').length;
  const totalAlertsCount = dangerCount;

  return (
    <div className="min-h-screen w-full bg-slate-950 flex text-slate-200 relative transition-all duration-300" style={{...body, filter: isLightMode ? "invert(1) hue-rotate(180deg)" : "none"}}>
      <style>{FONT_IMPORT} {isLightMode ? "img, video { filter: invert(1) hue-rotate(180deg) !important; }" : ""}</style>
      {/* Sidebar */}
      <div className="w-56 shrink-0 border-r border-slate-800 bg-slate-900/60 flex flex-col">
        <div className="flex items-center gap-3 px-5 py-5">
          <img src="/logo.png" className="w-8 h-8 object-contain drop-shadow-md" alt="Psister Logo" />
          <span className="font-bold text-white text-xl tracking-wide" style={disp}>Psister</span>
        </div>
        <div className="flex-1 px-3 space-y-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => setTab(n.id)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? "bg-amber-500/15 text-amber-400 border border-amber-500/25" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"}`}>
                <Icon className="w-4 h-4" /> {n.label}
              </button>
            );
          })}
        </div>
        <button onClick={logout} className="mx-3 mb-4 flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800/60"><LogOut className="w-4 h-4" /> Cerrar sesión</button>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        <div className="absolute top-6 right-6 z-10">
           <button onClick={() => setIsLightMode(!isLightMode)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors" title="Cambiar tema">
              {isLightMode ? <Moon className="w-5 h-5"/> : <Sun className="w-5 h-5"/>}
           </button>
        </div>
        
        {tab === "resumen" && (
          <div className="space-y-5">
            <div><h1 className="text-white text-xl font-bold" style={disp}>Resumen en tiempo real</h1><p className="text-slate-500 text-sm">Datos simulados actualizándose cada pocos segundos</p></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-2"><Gauge className="w-3.5 h-3.5" /> CONSUMO ACTUAL</div>
                <div className="text-2xl font-bold text-amber-400" style={mono}>{totalWatts} W</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-2"><TrendingUp className="w-3.5 h-3.5" /> COSTO ESTIMADO / MES</div>
                <div className="text-2xl font-bold text-emerald-400" style={mono}>${estCost}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-2"><ShieldAlert className="w-3.5 h-3.5" /> ALERTAS ACTIVAS</div>
                <div className="text-2xl font-bold text-rose-400" style={mono}>{totalAlertsCount}</div>
              </div>
            </div>
            
            <div className="space-y-4">
               <h2 className="text-white font-bold" style={disp}>Consumo por electrodoméstico</h2>
               <div className="grid grid-cols-2 gap-4">
                  {appliances.map(a => {
                     const meta = typeMeta(a.type);
                     const Icon = meta.icon;
                     const cColor = a.status === 'danger' ? 'text-rose-500' : (a.status === 'off' ? 'text-slate-500' : 'text-amber-400');
                     const sColor = a.status === 'danger' ? '#f43f5e' : (a.status === 'off' ? '#64748b' : (a.type === 'aire' || a.type === 'television' ? '#fbbf24' : '#10b981'));
                     return (
                        <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                           <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-3">
                                 <div className={`p-2 rounded-xl bg-slate-800 ${cColor}`}><Icon className="w-6 h-6"/></div>
                                 <div><div className="text-sm text-slate-100 font-medium">{a.name}</div><div className="text-xs text-slate-500">{meta.label}</div></div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <StatusPill status={a.status} />
                                 <button onClick={() => deleteAppliance(a.id)} className="p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-colors" title="Eliminar equipo"><Trash2 className="w-4 h-4" /></button>
                              </div>
                           </div>
                           <div className="flex justify-between items-end mb-1">
                              <div className={`text-xl font-bold ${cColor}`} style={mono}>{a.watts} W</div>
                           </div>
                           <Sparkline data={a.history || []} color={sColor} />
                        </div>
                     );
                  })}
               </div>
            </div>
          </div>
        )}
        
        {tab === "electrodomesticos" && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
               <div><h1 className="text-white text-xl font-bold" style={disp}>Mis electrodomésticos</h1><p className="text-slate-500 text-sm">Visualiza el consumo en tiempo real por equipo</p></div>
               <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-amber-500 text-slate-950 font-semibold px-3 py-2 rounded-lg text-sm"><Plus className="w-4 h-4" /> Agregar</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {appliances.map(a => {
                  const meta = typeMeta(a.type);
                  const Icon = meta.icon;
                  const cColor = a.status === 'danger' ? 'text-rose-500' : (a.status === 'off' ? 'text-slate-500' : 'text-amber-400');
                  const sColor = a.status === 'danger' ? '#f43f5e' : (a.status === 'off' ? '#64748b' : (a.type === 'aire' || a.type === 'television' ? '#fbbf24' : '#10b981'));
                  return (
                     <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl bg-slate-800 ${cColor}`}><Icon className="w-6 h-6"/></div>
                              <div><div className="text-sm text-slate-100 font-medium">{a.name}</div><div className="text-xs text-slate-500">{meta.label}</div></div>
                           </div>
                           <div className="flex items-center gap-2">
                              <StatusPill status={a.status} />
                              <button onClick={() => deleteAppliance(a.id)} className="p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-colors" title="Eliminar equipo"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </div>
                        <div className="flex justify-between items-end mb-1">
                           <div className={`text-xl font-bold ${cColor}`} style={mono}>{a.watts} W</div>
                           <div className="text-[10px] text-slate-500" style={mono}>base {a.baseWatts || a.watts} W</div>
                        </div>
                        <Sparkline data={a.history || []} color={sColor} />
                     </div>
                  );
               })}
            </div>
          </div>
        )}

        {tab === "planilla" && (
           <div className="space-y-5">
              <div><h1 className="text-white text-xl font-bold" style={disp}>Planilla y pagos</h1><p className="text-slate-500 text-sm">Sube tu planilla, revisa tu historial y no te pierdas un vencimiento</p></div>
              
              {/* Lógica dinámica de recordatorio */}
              {(() => {
                 const pendingBills = paymentHistory.filter(p => p.status === 'pendiente').sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
                 if (pendingBills.length > 0) {
                    const nearest = pendingBills[0];
                    const daysLeft = Math.ceil((new Date(nearest.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                       <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 flex gap-3">
                          <BellRing className="w-5 h-5 text-rose-400 shrink-0 mt-0.5"/>
                          <div>
                             <div className="text-rose-400 font-medium text-sm mb-1">
                                Recordatorio: planilla de {nearest.month} vence en {daysLeft > 0 ? `${daysLeft} días` : (daysLeft === 0 ? 'hoy' : 'está vencida')}
                             </div>
                             <div className="text-rose-400/80 text-xs">Monto: ${nearest.amount.toFixed(2)} - Vencimiento: {new Date(nearest.dueDate).toLocaleDateString('es-ES', {day:'numeric', month:'short'})}. Págala pronto para evitar recargos.</div>
                          </div>
                       </div>
                    );
                 } else {
                    const paidBills = paymentHistory.filter(p => p.status === 'pagada').sort((a,b) => new Date(b.dueDate) - new Date(a.dueDate));
                    if (paidBills.length > 0) {
                       const lastPaid = paidBills[0];
                       const nextPredictedDate = new Date(lastPaid.dueDate);
                       nextPredictedDate.setMonth(nextPredictedDate.getMonth() + 1);
                       return (
                          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex gap-3">
                             <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5"/>
                             <div>
                                <div className="text-emerald-400 font-medium text-sm mb-1">Estás al día con tus pagos</div>
                                <div className="text-emerald-400/80 text-xs">Tu próxima planilla estimada llegaría cerca del {nextPredictedDate.toLocaleDateString('es-ES', {day:'numeric', month:'short'})}.</div>
                             </div>
                          </div>
                       );
                    }
                 }
                 return null;
              })()}

              <div>
                 <div className="flex justify-between items-end mb-3">
                    <h2 className="text-white font-semibold flex items-center gap-2 text-sm"><CalendarClock className="w-4 h-4 text-amber-500"/> Historial de planillas</h2>
                    <span className="text-xs text-slate-500">{paymentHistory.filter(p=>p.status==='pendiente').length} pendiente(s)</span>
                 </div>
                 <div className="space-y-2">
                    {paymentHistory.length === 0 && <div className="text-sm text-slate-500 text-center py-4">No hay planillas registradas.</div>}
                    {paymentHistory.map((p, i) => (
                       <div key={p.id || i} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center group">
                          <div className="flex items-center gap-3">
                             <button onClick={() => toggleBillStatus(p.id, p.status)} className={`p-1.5 rounded-full transition-colors cursor-pointer ${p.status==='pagada'?'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20':'bg-rose-500/10 text-rose-400 hover:bg-emerald-500/10 hover:text-emerald-400'}`} title="Haz clic para marcar como pagada/pendiente">
                                {p.status==='pagada' ? <CheckCircle2 className="w-4 h-4"/> : <Clock3 className="w-4 h-4"/>}
                             </button>
                             <div>
                                <div className="text-sm font-medium text-slate-200">{p.month}</div>
                                <div className="text-xs text-slate-500">Vence {new Date(p.dueDate).toLocaleDateString('es-ES', {day:'numeric', month:'short'})}</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <span className="text-sm font-bold text-slate-200" style={mono}>${p.amount.toFixed(2)}</span>
                             <span className={`text-[10px] px-2 py-0.5 rounded-full border ${p.status==='pagada'?'border-emerald-500/30 text-emerald-400':'border-rose-500/30 text-rose-400'}`}>{p.status==='pagada'?'Pagada':'Pendiente'}</span>
                             {p.fileUrl && (
                                <a href={`http://localhost:3001${p.fileUrl}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-800 text-slate-400 hover:text-amber-400 rounded-lg transition-colors" title="Ver PDF">
                                   <Eye className="w-4 h-4" />
                                </a>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              
              <h2 className="text-white font-semibold text-sm pt-2">Subir nueva planilla</h2>
              <div>
                 <input type="file" accept=".pdf" className="hidden" ref={pdfInputRef} onChange={(e) => uploadBill(e, 'pdf')} />
                 <button disabled={isUploading} onClick={() => pdfInputRef.current.click()} className="w-full border border-slate-800 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-800/30 cursor-pointer transition-colors disabled:opacity-50">
                    <Upload className={`w-6 h-6 mb-2 ${isUploading ? 'animate-bounce' : ''}`}/>
                    <span className="text-xs">{isUploading ? 'Procesando...' : 'Subir planilla electrónica (PDF/XML)'}</span>
                 </button>
              </div>
           </div>
        )}

        {tab === "log" && (
           <div className="space-y-5">
              <div><h1 className="text-white text-xl font-bold" style={disp}>Log de corriente</h1><p className="text-slate-500 text-sm">Lecturas de amperaje en vivo por equipo</p></div>
              <div className="space-y-2">
                 {appliances.length === 0 && <div className="text-sm text-slate-500 text-center py-4">No hay equipos registrados.</div>}
                 {appliances.map(a => {
                    const Icon = typeMeta(a.type).icon;
                    const amps = a.status !== "off" ? (a.watts / 120) : 0;
                    return (
                       <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3 w-1/3">
                             <div className="p-1.5 rounded-lg bg-slate-800 text-amber-500"><Icon className="w-4 h-4"/></div>
                             <div className="text-sm font-medium text-slate-200">{a.name}</div>
                          </div>
                          <div className="flex gap-[2px] items-end h-4 w-1/3 justify-center">
                             {a.status !== "off" ? [1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="w-1 bg-amber-500/80 rounded-t-sm eq-bar" style={{height: '100%', animationDelay: `${i * 0.15}s`, animationDuration: `${0.8 + (i%3)*0.2}s`}}/>) : <div className="text-xs text-slate-600">Apagado</div>}
                          </div>
                          <div className="flex items-center justify-end gap-4 w-1/3">
                             <div className="text-xs text-slate-500">{a.hoursUse || 6} h/día</div>
                             <span className="text-sm font-bold text-amber-400 w-16 text-right" style={mono}>{amps.toFixed(2)} A</span>
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>
        )}

        {tab === "alertas" && (
           <div className="space-y-5">
              <div><h1 className="text-white text-xl font-bold" style={disp}>Alertas y clima</h1><p className="text-slate-500 text-sm">Riesgo de cortes y señales de posible daño en tus equipos</p></div>
              
              <div className="space-y-3">
                 {CLIMATE_ALERTS.map(alert => {
                    const Icon = alert.icon;
                    return (
                       <div key={alert.id} className={`${alert.bg} border ${alert.border} rounded-xl p-4 flex gap-3`}>
                          <Icon className={`w-5 h-5 ${alert.color} shrink-0 mt-0.5`}/>
                          <div>
                              <div className={`${alert.color} font-medium text-sm mb-1`}>{alert.title}</div>
                              <div className="text-slate-400 text-xs">{alert.message}</div>
                          </div>
                       </div>
                    );
                 })}
              </div>
              
              <h2 className="text-white font-semibold text-sm pt-2">Señales de posible daño</h2>
              {appliances.filter(a => a.status === 'danger' || a.status === 'warning').length > 0 ? (
                 appliances.filter(a => a.status === 'danger' || a.status === 'warning').map(a => {
                    const Icon = typeMeta(a.type).icon;
                    return (
                       <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-3">
                          <div className={`p-2 rounded-xl ${a.status==='danger'?'bg-rose-500/10 text-rose-400':'bg-amber-500/10 text-amber-500'} shrink-0 h-10`}><Icon className="w-6 h-6"/></div>
                          <div>
                             <div className="text-slate-100 font-medium text-sm mb-1">{a.name}</div>
                             <div className="text-slate-400 text-xs mb-2">
                                {a.status === 'danger' 
                                   ? "Consumo superior a su promedio histórico durante los últimos ciclos. Patrón asociado a desgaste."
                                   : "Se detectaron fluctuaciones inusuales. Mantente atento."}
                             </div>
                             <div className={`${a.status==='danger'?'text-rose-400':'text-amber-500'} text-xs flex items-center gap-1.5`}><AlertTriangle className="w-3.5 h-3.5"/> Recomendamos revisión técnica preventiva</div>
                          </div>
                       </div>
                    );
                 })
              ) : (
                 <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm italic">
                    No tienes alertas de equipos en este momento.
                 </div>
              )}
           </div>
        )}

        {tab === "recomendaciones" && (
           <div className="space-y-5">
              <div><h1 className="text-white text-xl font-bold" style={disp}>Recomendaciones IA</h1><p className="text-slate-500 text-sm">Sugerencias personalizadas según tu consumo y el clima</p></div>
              
              <div className="space-y-3">
                 {appliances.some(a => a.type === 'lavadora') && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-3">
                       <div className="p-2 rounded-xl bg-slate-800 text-amber-500 shrink-0 h-10"><TrendingDown className="w-6 h-6"/></div>
                       <div>
                          <div className="text-slate-100 font-medium text-sm mb-1">Adelanta el uso de la lavadora</div>
                          <div className="text-slate-500 text-xs">El pico tarifario de CNEL inicia a las 18h00. Lavar antes de esa hora bajará tu planilla.</div>
                       </div>
                    </div>
                 )}
                 {appliances.some(a => a.type === 'refrigerador') && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-3">
                       <div className="p-2 rounded-xl bg-slate-800 text-amber-500 shrink-0 h-10"><AlertTriangle className="w-6 h-6"/></div>
                       <div>
                          <div className="text-slate-100 font-medium text-sm mb-1">Revisa el sello del refrigerador</div>
                          <div className="text-slate-500 text-xs">Mantén el termostato a nivel medio y revisa que las gomas de la puerta sellen bien.</div>
                       </div>
                    </div>
                 )}
                 {appliances.some(a => a.type === 'iluminacion') && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-3">
                       <div className="p-2 rounded-xl bg-slate-800 text-amber-500 shrink-0 h-10"><Lightbulb className="w-6 h-6"/></div>
                       <div>
                          <div className="text-slate-100 font-medium text-sm mb-1">Aprovecha la luz solar ecuatorial</div>
                          <div className="text-slate-500 text-xs">La iluminación de tus espacios se enciende muy temprano. Intenta abrir las ventanas hasta las 18h30.</div>
                       </div>
                    </div>
                 )}
                 {appliances.some(a => a.type === 'aire') && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-3">
                       <div className="p-2 rounded-xl bg-slate-800 text-amber-500 shrink-0 h-10"><AirVent className="w-6 h-6"/></div>
                       <div>
                          <div className="text-slate-100 font-medium text-sm mb-1">Optimiza tu Aire Acondicionado</div>
                          <div className="text-slate-500 text-xs">Ajustarlo a 24°C en climas cálidos de la costa ecuatoriana es el balance perfecto entre confort y ahorro.</div>
                       </div>
                    </div>
                 )}
                 
                 {/* Tips Generales Siempre Visibles */}
                 <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 text-amber-500 shrink-0 h-10"><ShieldAlert className="w-6 h-6"/></div>
                    <div>
                       <div className="text-slate-100 font-medium text-sm mb-1">Protege tus equipos de los apagones</div>
                       <div className="text-slate-500 text-xs">Mantente atento a los cronogramas de racionamiento de CNEL EP. Usa un regulador de voltaje para tu TV o computadora y desconéctalos al primer corte preventivo.</div>
                    </div>
                 </div>

                 <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 text-emerald-500 shrink-0 h-10"><Zap className="w-6 h-6"/></div>
                    <div>
                       <div className="text-slate-100 font-medium text-sm mb-1">Elimina el consumo "Vampiro"</div>
                       <div className="text-slate-500 text-xs">Cargadores conectados sin teléfono y electrodomésticos en stand-by aumentan tu planilla. Usa regletas con interruptor para apagarlos por completo de noche.</div>
                    </div>
                 </div>

                 {appliances.length === 0 && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm italic">
                       Agrega electrodomésticos para recibir más recomendaciones personalizadas de la IA.
                    </div>
                 )}
              </div>
              
              <div className="flex items-center gap-2 pt-4 text-xs text-slate-500">
                 <Bot className="w-4 h-4 text-amber-500" />
                 <span>¿Tienes otra duda? Abre el asistente en el círculo inferior derecho.</span>
              </div>
           </div>
        )}
      </div>

      {showAdd && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-80">
              <h3 className="text-white mb-4">Agregar equipo</h3>
              <select value={newAppl.type} onChange={e=>setNewAppl({...newAppl, type: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 mb-3">
                 <option value="" disabled>Seleccionar una categoría</option>
                 {APPLIANCE_TYPES.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
              </select>
              <input type="number" placeholder="Potencia (Watts)" value={newAppl.watts} onChange={e=>setNewAppl({...newAppl, watts: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 mb-3" />
              <input type="number" placeholder="Horas uso/día" value={newAppl.hoursUse} onChange={e=>setNewAppl({...newAppl, hoursUse: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 mb-4" />
              <div className="flex gap-2">
                 <button onClick={()=>setShowAdd(false)} className="flex-1 border border-slate-700 text-slate-300 rounded-lg py-2 text-sm">Cancelar</button>
                 <button onClick={addAppliance} className="flex-1 bg-amber-500 text-slate-950 font-semibold rounded-lg py-2 text-sm">Agregar</button>
              </div>
           </div>
         </div>
      )}

      {/* Floating Chat */}
      <div className="absolute bottom-5 right-5 z-50 flex flex-col items-end">
        {chatOpen && (
          <div className="mb-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
             <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <img src="/logo.png" className="w-5 h-5 object-contain" alt="Psister" />
                   <span className="text-sm text-white" style={disp}>Asistente Psister</span>
                </div>
                <button onClick={()=>setChatOpen(false)}><X className="w-4 h-4 text-slate-400"/></button>
             </div>
             <div className="h-64 overflow-y-auto p-3 space-y-3">
                {chatMessages.map((m, i) => (
                   <div key={i} className={`flex gap-2 ${m.role==="user"?"justify-end":"justify-start"}`}>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${m.role==="user"?"bg-amber-500 text-slate-950":"bg-slate-800 text-slate-200"}`}>{m.content}</div>
                   </div>
                ))}
                {chatLoading && <div className="text-xs text-slate-500 italic">Escribiendo...</div>}
                <div ref={chatEndRef} />
             </div>

             <div className="px-3 pb-2 flex flex-col gap-2">
              {suggestedQ.map((q, idx) => (
                <button
                  key={q}
                  onClick={() => handleSuggestedClick(q)}
                  className={`w-full text-[11px] px-3 py-1.5 rounded-full border text-left transition-colors ${idx === 0 ? "border-amber-500 text-amber-500 hover:bg-amber-500/10" : "border-slate-700 text-slate-400 hover:border-amber-500 hover:text-amber-500 hover:bg-amber-500/10"}`}
                >
                  {q}
                </button>
              ))}
             </div>


          </div>
        )}
        <button onClick={()=>setChatOpen(!chatOpen)} className="w-14 h-14 rounded-full bg-amber-500 shadow-2xl flex items-center justify-center text-slate-950"><Bot className="w-6 h-6"/></button>
      </div>
    </div>
  );
}
