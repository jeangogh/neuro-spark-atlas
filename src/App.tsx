import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { usePreferences } from "@/hooks/usePreferences";

const Index = lazy(() => import("./pages/Index"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const ResultsPage = lazy(() => import("./pages/ResultsPage"));
const PrefsAnalyticsPage = lazy(() => import("./pages/PrefsAnalyticsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function ThemeProvider({ children }: { children: React.ReactNode }) {
  usePreferences(); // aplica data-theme e data-font no <html> globalmente
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
              <Route path="/triagem" element={<QuizPage />} />
              <Route path="/resultados" element={<ResultsPage />} />
              <Route path="/admin/preferencias" element={<PrefsAnalyticsPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
