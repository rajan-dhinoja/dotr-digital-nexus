import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import SubServiceDetail from "./pages/SubServiceDetail";
import Portfolio from "./pages/Portfolio";
import ProjectDetail from "./pages/ProjectDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Testimonials from "./pages/Testimonials";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminServices from "./pages/admin/Services";
import AdminServiceCategories from "./pages/admin/ServiceCategories";
import AdminProjects from "./pages/admin/Projects";
import AdminBlogPosts from "./pages/admin/BlogPosts";
import AdminTeam from "./pages/admin/Team";
import AdminTestimonials from "./pages/admin/Testimonials";
import AdminLeads from "./pages/admin/Leads";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:category" element={<ServiceDetail />} />
              <Route path="/services/:category/:service" element={<SubServiceDetail />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/portfolio/:slug" element={<ProjectDetail />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/services" element={<ProtectedRoute><AdminServices /></ProtectedRoute>} />
              <Route path="/admin/service-categories" element={<ProtectedRoute><AdminServiceCategories /></ProtectedRoute>} />
              <Route path="/admin/projects" element={<ProtectedRoute><AdminProjects /></ProtectedRoute>} />
              <Route path="/admin/blog" element={<ProtectedRoute><AdminBlogPosts /></ProtectedRoute>} />
              <Route path="/admin/team" element={<ProtectedRoute><AdminTeam /></ProtectedRoute>} />
              <Route path="/admin/testimonials" element={<ProtectedRoute><AdminTestimonials /></ProtectedRoute>} />
              <Route path="/admin/leads" element={<ProtectedRoute><AdminLeads /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
