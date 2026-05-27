import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import AdminMemberDetail from "./pages/AdminMemberDetail";
import AdminMap from "./pages/AdminMap";
import AdminKores from "./pages/AdminKores";
import AdminKonnect from "./pages/AdminKonnect";
import AdminKoreads from "./pages/AdminKoreads";
import Kreate from "./pages/Kreate";
import Konnect from "./pages/Konnect";
import Koreads from "./pages/Koreads";
import KoreadsBook from "./pages/KoreadsBook";
import KoreadsReader from "./pages/KoreadsReader";
import KoreadsTask from "./pages/KoreadsTask";
import KoreadsCredits from "./pages/KoreadsCredits";
import KoreadsTimeline from "./pages/KoreadsTimeline";
import KoreadsCommunity from "./pages/KoreadsCommunity";
import AuthorDashboard from "./pages/AuthorDashboard";
import AuthorBookDetail from "./pages/AuthorBookDetail";
import NotFound from "./pages/NotFound";

import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/users/:id" element={<AdminMemberDetail />} />
            <Route path="/admin/map" element={<AdminMap />} />
            <Route path="/admin/kores" element={<AdminKores />} />
            <Route path="/admin/konnect" element={<AdminKonnect />} />
            <Route path="/admin/koreads" element={<AdminKoreads />} />
            <Route path="/kreate" element={<Kreate />} />
            <Route path="/konnect" element={<Konnect />} />
            <Route path="/koreads" element={<Koreads />} />
            <Route path="/koreads/books/:bookId" element={<KoreadsBook />} />
            <Route path="/koreads/books/:bookId/tasks/:taskId" element={<KoreadsTask />} />
            <Route path="/koreads/books/:bookId/credits" element={<KoreadsCredits />} />
            <Route path="/koreads/books/:bookId/timeline" element={<KoreadsTimeline />} />
            <Route path="/koreads/books/:bookId/community" element={<KoreadsCommunity />} />
            <Route path="/koreads/books/:bookId/chapters/:chapterId" element={<KoreadsReader />} />
            <Route path="/author" element={<AuthorDashboard />} />
            <Route path="/author/books/:bookId" element={<AuthorBookDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
