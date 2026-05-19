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
import Kreate from "./pages/Kreate";
import Konnect from "./pages/Konnect";
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
            <Route path="/kreate" element={<Kreate />} />
            <Route path="/konnect" element={<Konnect />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
