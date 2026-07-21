import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  Loader2,
  Droplet,
  HeartPulse,
  Ruler,
  Syringe,
  Scale,
  Dna,
  Cake,
  Baby,
  Sparkles,
  Mars,
  Venus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pima Diabetes Predictor" },
      {
        name: "description",
        content:
          "Interactive diabetes risk predictor using the Pima Indians Diabetes dataset and a trained scikit-learn model.",
      },
      { property: "og:title", content: "Pima Diabetes Predictor" },
      {
        property: "og:description",
        content:
          "Enter Glucose, BloodPressure, BMI and more to get a real-time diabetes risk prediction.",
      },
    ],
  }),
  component: Index,
});

type FeatureKey =
  | "Pregnancies"
  | "Glucose"
  | "BloodPressure"
  | "SkinThickness"
  | "Insulin"
  | "BMI"
  | "DiabetesPedigreeFunction"
  | "Age";

type FeatureDef = {
  key: FeatureKey;
  label: string;
  hint: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  default: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
};

const FEATURES: FeatureDef[] = [
  {
    key: "Pregnancies",
    label: "Pregnancies",
    hint: "Number of times pregnant",
    unit: "times",
    min: 0,
    max: 17,
    step: 1,
    default: 1,
    icon: Baby,
    accent: "from-pink-500 to-rose-500",
  },
  {
    key: "Glucose",
    label: "Glucose",
    hint: "Plasma glucose concentration",
    unit: "mg/dL",
    min: 0,
    max: 250,
    step: 1,
    default: 120,
    icon: Droplet,
    accent: "from-amber-500 to-orange-500",
  },
  {
    key: "BloodPressure",
    label: "BloodPressure",
    hint: "Diastolic blood pressure",
    unit: "mm Hg",
    min: 0,
    max: 140,
    step: 1,
    default: 70,
    icon: HeartPulse,
    accent: "from-red-500 to-pink-600",
  },
  {
    key: "SkinThickness",
    label: "SkinThickness",
    hint: "Triceps skin fold thickness",
    unit: "mm",
    min: 0,
    max: 100,
    step: 1,
    default: 20,
    icon: Ruler,
    accent: "from-emerald-500 to-teal-500",
  },
  {
    key: "Insulin",
    label: "Insulin",
    hint: "2-Hour serum insulin",
    unit: "mu U/ml",
    min: 0,
    max: 900,
    step: 1,
    default: 80,
    icon: Syringe,
    accent: "from-cyan-500 to-sky-500",
  },
  {
    key: "BMI",
    label: "BMI",
    hint: "Body mass index",
    unit: "kg/m²",
    min: 0,
    max: 70,
    step: 0.1,
    default: 28.5,
    icon: Scale,
    accent: "from-violet-500 to-purple-600",
  },
  {
    key: "DiabetesPedigreeFunction",
    label: "DiabetesPedigreeFunction",
    hint: "Family history score",
    unit: "score",
    min: 0,
    max: 2.5,
    step: 0.001,
    default: 0.45,
    icon: Dna,
    accent: "from-fuchsia-500 to-pink-600",
  },
  {
    key: "Age",
    label: "Age",
    hint: "Age in years",
    unit: "years",
    min: 1,
    max: 100,
    step: 1,
    default: 33,
    icon: Cake,
    accent: "from-indigo-500 to-blue-600",
  },
];

type Result = {
  prediction: number;
  label: string;
  probability: number | null;
  source: "model" | "demo";
};

type Sex = "female" | "male";

function Index() {
  const [sex, setSex] = useState<Sex | null>(null);
  const [values, setValues] = useState<Record<FeatureKey, number>>(
    () =>
      Object.fromEntries(FEATURES.map((f) => [f.key, f.default])) as Record<FeatureKey, number>,
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeFeatures = useMemo(
    () => (sex === "male" ? FEATURES.filter((f) => f.key !== "Pregnancies") : FEATURES),
    [sex],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    const payload: Record<FeatureKey, number> = {
      ...values,
      Pregnancies: sex === "male" ? 0 : values.Pregnancies,
    };
    
    try {
      // Connects directly to your live Render backend
      const res = await fetch("https://pima-indians-diabetes.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`API responded ${res.status}`);
      const data = await res.json();
      setResult({ ...data, source: "model" });
    } catch {
      const demo = demoPredict(payload);
      setResult({ ...demo, source: "demo" });
      setError(
        "Live model API unreachable. Please check your Render backend.",
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setValues(
      Object.fromEntries(FEATURES.map((f) => [f.key, f.default])) as Record<FeatureKey, number>,
    );
    setResult(null);
    setError(null);
  }

  if (!sex) return <SexPicker onPick={setSex} />;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.18),transparent_60%),radial-gradient(ellipse_at_bottom_right,_rgba(236,72,153,0.15),transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.15),transparent_55%)]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-3 text-white shadow-lg shadow-fuchsia-500/30">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
                Pima Diabetes Predictor
              </h1>
              <p className="text-sm text-muted-foreground">
                Interactive risk assessment using your trained model.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSex(null);
              setResult(null);
              setError(null);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/60 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur transition hover:bg-white"
          >
            {sex === "female" ? (
              <Venus className="h-3.5 w-3.5 text-pink-500" />
            ) : (
              <Mars className="h-3.5 w-3.5 text-blue-500" />
            )}
            {sex === "female" ? "Female" : "Male"} · change
          </button>
        </header>

        <Card className="border-white/60 bg-white/70 shadow-xl shadow-violet-500/10 backdrop-blur-xl">
          <CardContent className="p-5 sm:p-8">
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {activeFeatures.map((f) => (
                <FeatureField
                  key={f.key}
                  def={f}
                  value={values[f.key]}
                  onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))}
                />
              ))}

              <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 px-6 text-base font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition hover:brightness-110 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Predicting…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Predict
                    </>
                  )}
                </Button>
                <Button type="button" variant="ghost" onClick={reset} className="rounded-full">
                  Reset values
                </Button>
              </div>
            </form>

            {(result || error) && (
              <div className="mt-8 space-y-3">
                {result && <ResultCard result={result} />}
                {error && (
                  <p className="rounded-lg border border-amber-300/50 bg-amber-50 px-4 py-2 text-xs text-amber-800">
                    {error}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Features: Pregnancies · Glucose · BloodPressure · SkinThickness · Insulin · BMI ·
          DiabetesPedigreeFunction · Age → Outcome
        </p>
      </div>
    </div>
  );
}

function SexPicker({ onPick }: { onPick: (s: Sex) => void }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(236,72,153,0.2),transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(59,130,246,0.2),transparent_60%)]">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-3 text-white shadow-xl shadow-fuchsia-500/30">
            <Activity className="h-7 w-7" />
          </div>
          <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Pima Diabetes Predictor
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Let's start simple — tell us your sex so we know whether to ask about pregnancies.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => onPick("female")}
            className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-6 text-left shadow-lg shadow-pink-500/10 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pink-500/20"
          >
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-pink-100 via-rose-50 to-fuchsia-100 opacity-70" />
            <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 p-3 text-white shadow-md">
              <Venus className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">Female</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You'll be asked all 8 features including pregnancies.
            </p>
          </button>
          <button
            onClick={() => onPick("male")}
            className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-6 text-left shadow-lg shadow-blue-500/10 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/20"
          >
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 opacity-70" />
            <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 p-3 text-white shadow-md">
              <Mars className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">Male</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pregnancies is skipped and sent as 0 to the model.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureField({
  def,
  value,
  onChange,
}: {
  def: FeatureDef;
  value: number;
  onChange: (v: number) => void;
}) {
  const Icon = def.icon;
  const pct = Math.max(0, Math.min(1, (value - def.min) / (def.max - def.min)));
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur transition hover:shadow-md">
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r opacity-70",
          def.accent,
        )}
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={cn("rounded-lg bg-gradient-to-br p-2 text-white shadow-sm", def.accent)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <Label htmlFor={def.key} className="text-sm font-semibold">
              {def.label}
            </Label>
            <p className="text-[11px] text-muted-foreground">{def.hint}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Input
            id={def.key}
            type="number"
            inputMode="decimal"
            step={def.step}
            min={def.min}
            max={def.max}
            required
            value={Number.isFinite(value) ? value : ""}
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              onChange(Number.isFinite(n) ? n : 0);
            }}
            className="h-9 w-20 rounded-md text-right tabular-nums"
          />
          <span className="w-12 text-[11px] text-muted-foreground">{def.unit}</span>
        </div>
      </div>
      <div className="mt-3">
        <Slider
          value={[Math.max(def.min, Math.min(def.max, value))]}
          min={def.min}
          max={def.max}
          step={def.step}
          onValueChange={(v) => onChange(v[0])}
        />
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
          <span>{def.min}</span>
          <span className="font-medium text-foreground/70">{Math.round(pct * 100)}%</span>
          <span>{def.max}</span>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: Result }) {
  const isDiabetic = result.prediction === 1;
  const pct = result.probability != null ? Math.round(result.probability * 100) : null;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 shadow-lg",
        isDiabetic
          ? "border-rose-200 bg-gradient-to-br from-rose-50 via-red-50 to-orange-50"
          : "border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Prediction {result.source === "demo" && "· demo"}
          </p>
          <p
            className={cn(
              "mt-1 text-3xl font-bold tracking-tight",
              isDiabetic ? "text-rose-700" : "text-emerald-700",
            )}
          >
            {isDiabetic ? "Likely Diabetic" : "Not Diabetic"}
          </p>
        </div>
        {pct != null && (
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Probability
            </p>
            <p
              className={cn(
                "text-3xl font-bold tabular-nums",
                isDiabetic ? "text-rose-700" : "text-emerald-700",
              )}
            >
              {pct}%
            </p>
          </div>
        )}
      </div>
      {pct != null && (
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/70">
          <div
            className={cn(
              "h-full rounded-full bg-gradient-to-r transition-all",
              isDiabetic ? "from-rose-400 to-red-600" : "from-emerald-400 to-teal-600",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function demoPredict(v: Record<FeatureKey, number>): Omit<Result, "source"> {
  const z =
    -8.4 +
    0.035 * v.Glucose +
    0.09 * v.BMI +
    0.018 * v.Age +
    0.9 * v.DiabetesPedigreeFunction +
    0.05 * v.Pregnancies +
    0.005 * v.Insulin +
    -0.01 * v.BloodPressure;
  const p = 1 / (1 + Math.exp(-z));
  const pred = p >= 0.5 ? 1 : 0;
  return {
    prediction: pred,
    label: pred === 1 ? "Diabetic" : "Not Diabetic",
    probability: p,
  };
}
