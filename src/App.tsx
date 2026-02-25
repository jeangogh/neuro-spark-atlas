import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { usePreferences } from "@/hooks/usePreferences";

const Index = lazy(() => import("./pages/Index"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const AhsdQuizPage = lazy(() => import("./pages/AhsdQuizPage"));
const DimensionalQuizPage = lazy(() => import("./pages/DimensionalQuizPage"));
const TestSelectionPage = lazy(() => import("./pages/TestSelectionPage"));
const ResultsPage = lazy(() => import("./pages/ResultsPage"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const PrefsAnalyticsPage = lazy(() => import("./pages/PrefsAnalyticsPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function ThemeProvider({ children }: { children: React.ReactNode }) {
  usePreferences();
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeProvider>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/selecionar-teste" element={<TestSelectionPage />} />
              <Route path="/triagem" element={<QuizPage />} />
              <Route path="/triagem/dimensional" element={<DimensionalQuizPage />} />
              <Route path="/triagem/:testKey" element={<AhsdQuizPage />} />
              <Route path="/resultados" element={<ResultsPage />} />
              <Route path="/explorar" element={<ExplorePage />} />
              <Route path="/historico" element={<HistoryPage />} />
              <Route path="/admin/preferencias" element={<PrefsAnalyticsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
