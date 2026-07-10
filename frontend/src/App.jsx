import { useState, useEffect, useRef } from "react";
import {
  Zap, Refrigerator, Tv, AirVent, Waves, Lightbulb, Router, Laptop, Fan, Flame,
  Upload, FileText, Camera, Plus, X, AlertTriangle, CloudLightning, CloudRain,
  ShieldAlert, Sparkles, Activity, Gauge, LogOut, LayoutDashboard, Package,
  ListTree, BellRing, Wand2, ChevronRight, CheckCircle2, TrendingUp, TrendingDown,
  CalendarClock, CircleDollarSign, Clock3, Bot, Send, User
} from "lucide-react";
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend
} from "recharts";

const API_URL = "http://localhost:3001/api";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');`;
const disp = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };
const body = { fontFamily: "'Inter', sans-serif" };

const APPLIANCE_TYPES = [
  { type: "refrigerador", label: "Refrigerador", icon: Refrigerator, baseWatts: 150 },
  { type: "television", label: "Televisor", icon: Tv, baseWatts: 90 },
  { type: "aire", label: "Aire acondicionado", icon: AirVent, baseWatts: 1200 },
  { type: "lavadora", label: "Lavadora", icon: Waves, baseWatts: 500 },
  { type: "iluminacion", label: "Iluminación", icon: Lightbulb, baseWatts: 60 },
  { type: "router", label: "Router / Módem", icon: Router, baseWatts: 12 },
  { type: "laptop", label: "Laptop / PC", icon: Laptop, baseWatts: 65 },
  { type: "ventilador", label: "Ventilador", icon: Fan, baseWatts: 55 },
  { type: "calefactor", label: "Calefactor", icon: Flame, baseWatts: 900 },
  { type: "otro", label: "Otro", icon: Zap, baseWatts: 100 },
];
const typeMeta = (type) => APPLIANCE_TYPES.find((t) => t.type === type) || APPLIANCE_TYPES[APPLIANCE_TYPES.length - 1];

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

export default function WattIA() {
  const [token, setToken] = useState(localStorage.getItem('wattia_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('wattia_user')) || null);
  const [tab, setTab] = useState("resumen");
  const [appliances, setAppliances] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [log, setLog] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newAppl, setNewAppl] = useState({ name: "", type: "otro", watts: "", hoursUse: "" });
  const [planillaState, setPlanillaState] = useState("idle");
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "¡Hola! Soy el asistente de WattIA. Pregúntame sobre ahorro de energía o cuidado de tus equipos." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
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
         const res = await fetch(`${API_URL}/logs/calculate`, { method: "POST", ...reqOpts() });
         if (res.ok) {
            const newLog = await res.json();
            setLog(prev => [newLog, ...prev].slice(0, 10));
         }
      } catch (e) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const addAppliance = async () => {
    if (!newAppl.name || !newAppl.watts) return;
    try {
      const res = await fetch(`${API_URL}/appliances`, {
        method: "POST",
        ...reqOpts(),
        body: JSON.stringify(newAppl)
      });
      if (res.ok) {
        const created = await res.json();
        setAppliances([...appliances, created]);
        setShowAdd(false);
        setNewAppl({ name: "", type: "otro", watts: "", hoursUse: "" });
      }
    } catch (e) { console.error(e); }
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
  const estCost = ((totalWatts / 1000) * 0.10 * 24 * 30).toFixed(2);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex text-slate-200 relative" style={body}>
      <style>{FONT_IMPORT}</style>
      {/* Sidebar */}
      <div className="w-56 shrink-0 border-r border-slate-800 bg-slate-900/60 flex flex-col">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30"><Zap className="w-5 h-5 text-amber-400" /></div>
          <span className="font-bold text-white text-lg" style={disp}>WattIA</span>
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
      <div className="flex-1 overflow-y-auto p-6">
        {tab === "resumen" && (
          <div className="space-y-5">
            <div><h1 className="text-white text-xl font-bold" style={disp}>Resumen {user?.name ? `de ${user.name}` : ''}</h1></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-2"><Gauge className="w-3.5 h-3.5" /> CONSUMO ACTUAL</div>
                <div className="text-2xl font-bold text-amber-400" style={mono}>{totalWatts} W</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-2"><TrendingUp className="w-3.5 h-3.5" /> COSTO EST. MES</div>
                <div className="text-2xl font-bold text-emerald-400" style={mono}>${estCost}</div>
              </div>
            </div>
          </div>
        )}
        
        {tab === "electrodomesticos" && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
               <h1 className="text-white text-xl font-bold" style={disp}>Mis equipos</h1>
               <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-amber-500 text-slate-950 font-semibold px-3 py-2 rounded-lg text-sm"><Plus className="w-4 h-4" /> Agregar</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {appliances.map(a => {
                  const meta = typeMeta(a.type);
                  const Icon = meta.icon;
                  return (
                     <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="p-2 rounded-xl bg-slate-800 text-amber-400"><Icon className="w-6 h-6"/></div>
                           <div><div className="text-sm text-slate-100">{a.name}</div><div className="text-xs text-slate-500">{meta.label}</div></div>
                        </div>
                        <div className="text-xl font-bold text-amber-400" style={mono}>{a.watts} W</div>
                        <Sparkline data={a.history || []} color="#fbbf24" />
                     </div>
                  );
               })}
            </div>
          </div>
        )}

        {tab === "log" && (
           <div className="space-y-5">
              <h1 className="text-white text-xl font-bold" style={disp}>Log de corriente</h1>
              <div className="space-y-2">
                 {log.map(entry => (
                    <div key={entry.id} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex justify-between">
                       <span className="text-xs text-slate-500" style={mono}>{new Date(entry.recordedAt).toLocaleTimeString()}</span>
                       <span className="text-sm font-bold text-amber-400" style={mono}>{entry.amps.toFixed(2)} A</span>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </div>

      {showAdd && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-80">
              <h3 className="text-white mb-4">Agregar equipo</h3>
              <input placeholder="Nombre" value={newAppl.name} onChange={e=>setNewAppl({...newAppl, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 mb-3" />
              <input type="number" placeholder="Potencia (Watts)" value={newAppl.watts} onChange={e=>setNewAppl({...newAppl, watts: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 mb-3" />
              <input type="number" placeholder="Horas uso/día" value={newAppl.hoursUse} onChange={e=>setNewAppl({...newAppl, hoursUse: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 mb-3" />
              <select value={newAppl.type} onChange={e=>setNewAppl({...newAppl, type: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 mb-4">
                 {APPLIANCE_TYPES.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
              </select>
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
             <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex justify-between">
                <span className="text-sm text-white" style={disp}>Asistente WattIA</span>
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

             <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {["¿Cómo bajo el consumo del aire acondicionado?", "¿Qué hago ante un corte de luz?", "¿Cómo sé si mi refrigerador está fallando?"].map((q) => (
                <button
                  key={q}
                  onClick={() => sendChat(q)}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-slate-700 text-slate-400 hover:border-amber-500/50 hover:text-amber-400 text-left"
                >
                  {q}
                </button>
              ))}
             </div>

             <div className="p-3 border-t border-slate-800 flex gap-2">
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200" placeholder="Pregunta..." disabled={chatLoading} />
                <button onClick={()=>sendChat()} disabled={chatLoading} className="p-2 bg-amber-500 rounded-lg text-slate-950 disabled:opacity-50"><Send className="w-4 h-4"/></button>
             </div>
          </div>
        )}
        <button onClick={()=>setChatOpen(!chatOpen)} className="w-14 h-14 rounded-full bg-amber-500 shadow-2xl flex items-center justify-center text-slate-950"><Bot className="w-6 h-6"/></button>
      </div>
    </div>
  );
}
