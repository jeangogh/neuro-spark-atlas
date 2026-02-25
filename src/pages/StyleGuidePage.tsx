import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";

const PALETTE = [
  { token: "--background", label: "Background", hex: "#f3efe6", usage: "Fundo global" },
  { token: "--foreground", label: "Foreground", hex: "#3c2c1e", usage: "Texto principal" },
  { token: "--primary", label: "Primary", hex: "#4a7a65", usage: "CTAs, links, badges" },
  { token: "--accent", label: "Accent", hex: "#d4a574", usage: "Destaques, gold" },
  { token: "--muted-foreground", label: "Muted", hex: "#818578", usage: "Texto secundário" },
  { token: "--card", label: "Card", hex: "#FFFFFF", usage: "Superfícies elevadas" },
  { token: "--border", label: "Border", hex: "—", usage: "Separadores, inputs" },
  { token: "--destructive", label: "Destructive", hex: "—", usage: "Erros, alertas" },
];

export default function StyleGuidePage() {
  const navigate = useNavigate();
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg">Style Guide</h1>
        <div className="ml-auto flex items-center gap-2">
          <Sun className="w-4 h-4 text-muted-foreground" />
          <Switch checked={isDark} onCheckedChange={toggle} />
          <Moon className="w-4 h-4 text-muted-foreground" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-10">
        {/* ── Paleta de cores ── */}
        <section>
          <h2 className="mb-4">Paleta de Cores</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PALETTE.map((c) => (
              <div key={c.token} className="flex flex-col gap-1.5">
                <div
                  className="w-full aspect-square rounded-lg border border-border shadow-sm"
                  style={{ backgroundColor: `hsl(var(${c.token}))` }}
                />
                <span className="text-xs font-medium">{c.label}</span>
                <span className="text-[10px] text-muted-foreground">{c.hex}</span>
                <span className="text-[10px] text-muted-foreground">{c.usage}</span>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── Tipografia ── */}
        <section>
          <h2 className="mb-4">Tipografia</h2>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Títulos — Sora</span>
              <h1 className="mt-1">Heading 1 — Sora 700</h1>
              <h2 className="mt-2">Heading 2 — Sora 600</h2>
              <h3 className="mt-2">Heading 3 — Sora 600</h3>
              <h4 className="mt-2">Heading 4 — Sora 600</h4>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Corpo — DM Sans</span>
              <p className="mt-1">
                Texto regular de corpo em DM Sans 400. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Vivamus in urna eu leo interdum dapibus vel sed risus.
              </p>
              <p className="mt-2 font-medium">Texto medium (500) em DM Sans.</p>
              <p className="mt-2 font-bold">Texto bold (700) em DM Sans.</p>
              <p className="mt-2 font-light">Texto light (300) em DM Sans.</p>
            </div>
          </div>
        </section>

        <Separator />

        {/* ── Botões ── */}
        <section>
          <h2 className="mb-4">Botões</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Primário</Button>
            <Button variant="secondary">Secundário</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destrutivo</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        <Separator />

        {/* ── Badges ── */}
        <section>
          <h2 className="mb-4">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge className="bg-primary/10 text-primary border-0">Fase 1</Badge>
            <Badge className="bg-accent/10 text-accent border-0">Fase 2</Badge>
          </div>
        </section>

        <Separator />

        {/* ── Cards ── */}
        <section>
          <h2 className="mb-4">Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Card Padrão</CardTitle>
                <CardDescription>Superfície elevada com sombra sutil</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Conteúdo do card com texto secundário.</p>
              </CardContent>
            </Card>
            <Card className="border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle>Card Destaque</CardTitle>
                <CardDescription>Com borda primária e sombra</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Card com ênfase visual.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* ── Inputs ── */}
        <section>
          <h2 className="mb-4">Inputs</h2>
          <div className="space-y-3 max-w-sm">
            <div>
              <Label htmlFor="demo-input">Label</Label>
              <Input id="demo-input" placeholder="Placeholder text" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="demo-disabled">Desabilitado</Label>
              <Input id="demo-disabled" placeholder="Disabled" disabled className="mt-1" />
            </div>
          </div>
        </section>

        <Separator />

        {/* ── Tokens CSS ── */}
        <section>
          <h2 className="mb-4">Tokens CSS</h2>
          <Card>
            <CardContent className="pt-6">
              <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
{`:root {
  --background: 41 35% 93%;
  --foreground: 28 33% 18%;
  --primary: 154 24% 38%;
  --accent: 31 53% 64%;
  --muted: 41 20% 90%;
  --muted-foreground: 79 5% 50%;
  --card: 0 0% 100%;
  --border: 41 20% 88%;
  --radius: 0.625rem;
}`}
              </pre>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
