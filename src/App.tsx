import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { usePreferences } from "@/hooks/usePreferences";
import { AmbientSoundProvider } from "@/contexts/AmbientSoundContext";
import AmbientSoundFab from "@/components/AmbientSoundFab";
import FeedbackFab from "@/components/FeedbackFab";

const Index = lazy(() => import("./pages/Index"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const AhsdQuizPage = lazy(() => import("./pages/AhsdQuizPage"));
const DimensionalQuizPage = lazy(() => import("./pages/DimensionalQuizPage"));
const TestSelectionPage = lazy(() => import("./pages/TestSelectionPage"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const AprenderPage = lazy(() => import("./pages/AprenderPage"));
const AprenderReadPage = lazy(() => import("./pages/AprenderReadPage"));
const AnalysesPage = lazy(() => import("./pages/AnalysesPage"));
const NEFTestPage = lazy(() => import("./pages/NEFTestPage"));
const MinitesteQuizPage = lazy(() => import("./pages/MinitesteQuizPage"));
const PrefsAnalyticsPage = lazy(() => import("./pages/PrefsAnalyticsPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const SharePage = lazy(() => import("./pages/SharePage"));
const GuestInvitePage = lazy(() => import("./pages/GuestInvitePage"));
const BonusTestPage = lazy(() => import("./pages/BonusTestPage"));
const ConsentPage = lazy(() => import("./pages/ConsentPage"));
const BonusReportPage = lazy(() => import("./pages/BonusReportPage"));
const QualificationPage = lazy(() => import("./pages/QualificationPage"));
const StyleGuidePage = lazy(() => import("./pages/StyleGuidePage"));
const NovoPsychQuizPage = lazy(() => import("./pages/NovoPsychQuizPage"));
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
          <AmbientSoundProvider>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/qualificacao" element={<QualificationPage />} />
                <Route path="/selecionar-teste" element={<TestSelectionPage />} />
                <Route path="/triagem" element={<QuizPage />} />
                <Route path="/triagem/dimensional" element={<DimensionalQuizPage />} />
                <Route path="/triagem/:testKey" element={<AhsdQuizPage />} />
                <Route path="/explorar" element={<ExplorePage />} />
                <Route path="/aprender" element={<AprenderPage />} />
                <Route path="/aprender/:id" element={<AprenderReadPage />} />
                <Route path="/analises" element={<AnalysesPage />} />
                <Route path="/nef" element={<NEFTestPage />} />
                <Route path="/miniteste/:id" element={<MinitesteQuizPage />} />
                <Route path="/psych/:testKey" element={<NovoPsychQuizPage />} />
                <Route path="/historico" element={<HistoryPage />} />
                <Route path="/compartilhar" element={<SharePage />} />
                <Route path="/convite/:code" element={<GuestInvitePage />} />
                <Route path="/teste-bonus" element={<BonusTestPage />} />
                <Route path="/consentimento" element={<ConsentPage />} />
                <Route path="/teste-bonus/relatorio" element={<BonusReportPage />} />
                <Route path="/admin/preferencias" element={<PrefsAnalyticsPage />} />
                <Route path="/style-guide" element={<StyleGuidePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <AmbientSoundFab />
            <FeedbackFab />
          </AmbientSoundProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
