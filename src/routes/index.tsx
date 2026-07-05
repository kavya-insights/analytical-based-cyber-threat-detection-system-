import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import {
  Shield, AlertTriangle, Lock, Activity, Search,
  TrendingUp, MapPin, Bug,
} from "lucide-react";
import rawData from "@/data/cyber.json";

type Row = Record<string, number | string>;
const data = rawData as Row[];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CyberShield — Threat Detection Dashboard" },
      { name: "description", content: "Analytical dashboard for state-wise cybercrime & threat detection across India." },
    ],
  }),
  component: Dashboard,
});

const STATE_ROWS = data.filter((r) => r.state !== "Total All India");
const TOTAL_ROW = data.find((r) => r.state === "Total All India")!;

const THREAT_TYPES = [
  { key: "ransomware", label: "Ransomware", icon: Bug },
  { key: "identityTheft", label: "Identity Theft", icon: Lock },
  { key: "cheatingPersonation", label: "Phishing / Personation", icon: AlertTriangle },
  { key: "fraudOnlineBanking", label: "Banking Fraud", icon: Activity },
  { key: "fraudOTP", label: "OTP Fraud", icon: Shield },
  { key: "cyberTerrorism", label: "Cyber Terrorism", icon: AlertTriangle },
  { key: "cyberStalking", label: "Cyber Stalking", icon: MapPin },
  { key: "dataTheft", label: "Data Theft", icon: Lock },
] as const;

const COLORS = ["#00e5ff", "#ff3d71", "#ffaa00", "#7c4dff", "#00e676", "#ff6ec7", "#40c4ff", "#ffea00"];

function num(v: unknown) { return typeof v === "number" ? v : 0; }

function Dashboard() {
  const [query, setQuery] = useState("");
  const [selectedThreat, setSelectedThreat] = useState<string>("totalCyber");

  const filtered = useMemo(
    () => STATE_ROWS.filter((r) => String(r.state).toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const topStates = useMemo(
    () => [...STATE_ROWS]
      .sort((a, b) => num(b[selectedThreat]) - num(a[selectedThreat]))
      .slice(0, 10)
      .map((r) => ({ state: String(r.state), value: num(r[selectedThreat]) })),
    [selectedThreat]
  );

  const threatBreakdown = useMemo(
    () => THREAT_TYPES.map((t) => ({ name: t.label, value: num(TOTAL_ROW[t.key]) })),
    []
  );

  const categoryMix = [
    { name: "IT Act", value: num(TOTAL_ROW.totalITAct) },
    { name: "IPC r/w IT", value: num(TOTAL_ROW.totalIPC) },
    { name: "SLL r/w IT", value: num(TOTAL_ROW.totalSLL) },
  ];

  const fraudBreakdown = [
    { name: "Card", value: num(TOTAL_ROW.fraudCard) },
    { name: "ATM", value: num(TOTAL_ROW.fraudATM) },
    { name: "Online Banking", value: num(TOTAL_ROW.fraudOnlineBanking) },
    { name: "OTP", value: num(TOTAL_ROW.fraudOTP) },
  ];

  const radarData = THREAT_TYPES.slice(0, 6).map((t) => ({
    threat: t.label,
    A: Math.log10(num(TOTAL_ROW[t.key]) + 1) * 20,
  }));

  const riskIndex = (r: Row) => {
    const total = num(r.totalCyber);
    if (total > 5000) return { level: "Critical", color: "text-[#ff3d71]", bg: "bg-[#ff3d71]/10 border-[#ff3d71]/40" };
    if (total > 1500) return { level: "High", color: "text-[#ffaa00]", bg: "bg-[#ffaa00]/10 border-[#ffaa00]/40" };
    if (total > 300) return { level: "Medium", color: "text-[#00e5ff]", bg: "bg-[#00e5ff]/10 border-[#00e5ff]/40" };
    return { level: "Low", color: "text-[#00e676]", bg: "bg-[#00e676]/10 border-[#00e676]/40" };
  };

  const kpis = [
    { label: "Total Incidents", value: num(TOTAL_ROW.totalCyber).toLocaleString(), icon: Activity, tint: "#00e5ff" },
    { label: "Ransomware Attacks", value: num(TOTAL_ROW.ransomware).toLocaleString(), icon: Bug, tint: "#ff3d71" },
    { label: "Identity Theft", value: num(TOTAL_ROW.identityTheft).toLocaleString(), icon: Lock, tint: "#ffaa00" },
    { label: "Banking Fraud", value: num(TOTAL_ROW.fraudOnlineBanking).toLocaleString(), icon: TrendingUp, tint: "#7c4dff" },
  ];

  return (
    <div className="min-h-screen bg-[#05070f] text-slate-100 font-mono">
      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 py-6">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#00e5ff]/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md border border-[#00e5ff]/40 bg-[#00e5ff]/10 text-[#00e5ff]">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-widest text-[#00e5ff]">CYBERSHIELD // THREAT INTEL</h1>
              <p className="text-xs uppercase tracking-widest text-slate-400">
                Analytical Cyber Threat Detection · India State-wise NCRB Dataset
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#00e676]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00e676] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00e676]" />
              </span>
              System Live
            </div>
            <div className="text-xs text-slate-400">
              {new Date().toUTCString().slice(5, 25)} UTC
            </div>
          </div>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="relative overflow-hidden rounded-md border border-white/10 bg-white/[0.02] p-4"
              style={{ boxShadow: `inset 0 0 40px ${k.tint}15` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-slate-400">{k.label}</span>
                <k.icon className="h-4 w-4" style={{ color: k.tint }} />
              </div>
              <div className="mt-3 text-3xl font-bold" style={{ color: k.tint }}>
                {k.value}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                cases · nationwide
              </div>
            </div>
          ))}
        </section>

        {/* Main grid */}
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Top states */}
          <Panel title="Top 10 States by Threat Volume" className="lg:col-span-2">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {[
                { k: "totalCyber", l: "All Threats" },
                { k: "ransomware", l: "Ransomware" },
                { k: "identityTheft", l: "Identity Theft" },
                { k: "fraudOnlineBanking", l: "Banking Fraud" },
                { k: "cyberStalking", l: "Stalking" },
              ].map((o) => (
                <button
                  key={o.k}
                  onClick={() => setSelectedThreat(o.k)}
                  className={`rounded border px-2.5 py-1 text-[10px] uppercase tracking-widest transition ${
                    selectedThreat === o.k
                      ? "border-[#00e5ff] bg-[#00e5ff]/10 text-[#00e5ff]"
                      : "border-white/10 text-slate-400 hover:border-white/30 hover:text-slate-200"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topStates} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis type="category" dataKey="state" tick={{ fill: "#cbd5e1", fontSize: 11 }} width={110} />
                <Tooltip contentStyle={{ background: "#0a0f1c", border: "1px solid #00e5ff40", borderRadius: 4 }} />
                <Bar dataKey="value" fill="#00e5ff" radius={[0, 3, 3, 0]}>
                  {topStates.map((_, i) => (
                    <Cell key={i} fill={`rgba(0, 229, 255, ${0.4 + (topStates.length - i) * 0.06})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          {/* Threat radar */}
          <Panel title="Threat Vector Signature">
            <ResponsiveContainer width="100%" height={360}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#00e5ff30" />
                <PolarAngleAxis dataKey="threat" tick={{ fill: "#cbd5e1", fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fill: "#64748b", fontSize: 9 }} />
                <Radar name="Volume" dataKey="A" stroke="#ff3d71" fill="#ff3d71" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </Panel>
        </section>

        {/* Second row */}
        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel title="Threat Category Distribution">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={threatBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {threatBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#05070f" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0a0f1c", border: "1px solid #00e5ff40" }} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Financial Fraud Breakdown">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={fraudBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#0a0f1c", border: "1px solid #00e5ff40" }} />
                <Bar dataKey="value" fill="#ffaa00" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Legal Framework Mix">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryMix} dataKey="value" nameKey="name" outerRadius={90}>
                  {categoryMix.map((_, i) => (
                    <Cell key={i} fill={["#00e5ff", "#7c4dff", "#00e676"][i]} stroke="#05070f" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0a0f1c", border: "1px solid #00e5ff40" }} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </Panel>
        </section>

        {/* Trend by state */}
        <section className="mt-4">
          <Panel title="Threat Detection Trend Across States (All Threats)">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={STATE_ROWS.map((r) => ({ state: String(r.state).slice(0, 6), v: num(r.totalCyber) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="state" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#0a0f1c", border: "1px solid #00e5ff40" }} />
                <Line type="monotone" dataKey="v" stroke="#00e5ff" strokeWidth={2} dot={{ fill: "#ff3d71", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </section>

        {/* Live threat log */}
        <section className="mt-4">
          <Panel
            title="State/UT Risk Register"
            action={
              <div className="flex items-center gap-2 rounded border border-white/10 bg-black/40 px-2 py-1">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="filter state..."
                  className="w-48 bg-transparent text-xs outline-none placeholder:text-slate-600"
                />
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-widest text-slate-500">
                    <th className="py-2">State / UT</th>
                    <th className="py-2 text-right">Total</th>
                    <th className="py-2 text-right">Ransomware</th>
                    <th className="py-2 text-right">Identity Theft</th>
                    <th className="py-2 text-right">Banking Fraud</th>
                    <th className="py-2 text-right">Stalking</th>
                    <th className="py-2 text-center">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const risk = riskIndex(r);
                    return (
                      <tr key={String(r.state)} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 text-slate-200">{String(r.state)}</td>
                        <td className="py-2 text-right font-bold text-[#00e5ff]">{num(r.totalCyber).toLocaleString()}</td>
                        <td className="py-2 text-right text-slate-300">{num(r.ransomware)}</td>
                        <td className="py-2 text-right text-slate-300">{num(r.identityTheft)}</td>
                        <td className="py-2 text-right text-slate-300">{num(r.fraudOnlineBanking)}</td>
                        <td className="py-2 text-right text-slate-300">{num(r.cyberStalking)}</td>
                        <td className="py-2 text-center">
                          <span className={`inline-block rounded border px-2 py-0.5 text-[10px] uppercase tracking-widest ${risk.bg} ${risk.color}`}>
                            {risk.level}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="py-6 text-center text-slate-500">No matching state.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </section>

        <footer className="mt-6 border-t border-white/10 pt-4 text-center text-[10px] uppercase tracking-widest text-slate-600">
          Source: NCRB State-wise Cyber Crime dataset · CyberShield Analytical Dashboard
        </footer>
      </div>
    </div>
  );
}

function Panel({
  title, children, className = "", action,
}: { title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <div className={`relative rounded-md border border-white/10 bg-white/[0.02] p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#00e5ff]">
          &gt; {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}
