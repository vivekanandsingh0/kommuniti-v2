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
import AdminAbout from "./pages/AdminAbout";
import Konnect from "./pages/Konnect";
import KonnectEventPage from "./pages/KonnectEventPage";
import KonnectFeaturedPage from "./pages/KonnectFeaturedPage";
import About from "./pages/About";
import Volunteer from "./pages/Volunteer";
import Koreads from "./pages/Koreads";
import KoreadsBook from "./pages/KoreadsBook";
import KoreadsReader from "./pages/KoreadsReader";
import KoreadsTask from "./pages/KoreadsTask";
import KoreadsCredits from "./pages/KoreadsCredits";
import KoreadsTimeline from "./pages/KoreadsTimeline";
import KoreadsCommunity from "./pages/KoreadsCommunity";
import AuthorDashboard from "./pages/AuthorDashboard";
import AuthorBookDetail from "./pages/AuthorBookDetail";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";
import { COMING_SOON_ROUTES } from "./config/comingSoonPages";
import AdminRoute from "./components/admin/AdminRoute";
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
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/users/:id" element={<AdminRoute><AdminMemberDetail /></AdminRoute>} />
            <Route path="/admin/map" element={<AdminRoute><AdminMap /></AdminRoute>} />
            <Route path="/admin/kores" element={<AdminRoute><AdminKores /></AdminRoute>} />
            <Route path="/admin/konnect" element={<AdminRoute><AdminKonnect /></AdminRoute>} />
            <Route path="/admin/koreads" element={<AdminRoute><AdminKoreads /></AdminRoute>} />
            <Route path="/admin/about" element={<AdminRoute><AdminAbout /></AdminRoute>} />
            <Route path="/konnect" element={<Konnect />} />
            <Route path="/konnect/events/:eventId" element={<KonnectEventPage />} />
            <Route path="/konnect/featured" element={<KonnectFeaturedPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/koreads" element={<Koreads />} />
            <Route path="/koreads/books/:bookId" element={<KoreadsBook />} />
            <Route path="/koreads/books/:bookId/tasks/:taskId" element={<KoreadsTask />} />
            <Route path="/koreads/books/:bookId/credits" element={<KoreadsCredits />} />
            <Route path="/koreads/books/:bookId/timeline" element={<KoreadsTimeline />} />
            <Route path="/koreads/books/:bookId/community" element={<KoreadsCommunity />} />
            <Route path="/koreads/books/:bookId/chapters/:chapterId" element={<KoreadsReader />} />
            <Route path="/author" element={<AuthorDashboard />} />
            <Route path="/author/books/:bookId" element={<AuthorBookDetail />} />
            {COMING_SOON_ROUTES.map(({ path }) => (
              <Route key={path} path={path} element={<ComingSoon />} />
            ))}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
