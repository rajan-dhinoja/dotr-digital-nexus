import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { SectionClipboardProvider } from "@/contexts/SectionClipboardContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";

// Public pages - loaded normally
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

// Admin pages - lazy loaded for better performance
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminServices = lazy(() => import("./pages/admin/Services"));
const AdminServiceCategories = lazy(() => import("./pages/admin/ServiceCategories"));
const AdminProjects = lazy(() => import("./pages/admin/Projects"));
const AdminBlogPosts = lazy(() => import("./pages/admin/BlogPosts"));
const AdminTeam = lazy(() => import("./pages/admin/Team"));
const AdminTestimonials = lazy(() => import("./pages/admin/Testimonials"));
const AdminLeads = lazy(() => import("./pages/admin/Leads"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminPageSections = lazy(() => import("./pages/admin/PageSections"));
const AdminPages = lazy(() => import("./pages/admin/Pages"));
const AdminMedia = lazy(() => import("./pages/admin/Media"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminActivityLog = lazy(() => import("./pages/admin/ActivityLog"));
const AdminBlogCategories = lazy(() => import("./pages/admin/BlogCategories"));
const AdminFormSubmissions = lazy(() => import("./pages/admin/FormSubmissions"));
const AdminMenus = lazy(() => import("./pages/admin/Menus"));

// Loading fallback for admin pages
const AdminLoadingFallback = () => (
  <div className="min-h-screen flex bg-background">
    <div className="w-64 bg-card border-r border-border p-4">
      <Skeleton className="h-8 w-32 mb-6" />
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
    <div className="flex-1 p-6">
      <Skeleton className="h-10 w-48 mb-6" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // Default 1 minute stale time
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <SectionClipboardProvider>
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
                
                {/* Admin Routes - wrapped in Suspense for lazy loading */}
                <Route path="/admin/login" element={<Suspense fallback={<AdminLoadingFallback />}><AdminLogin /></Suspense>} />
                <Route path="/admin" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminDashboard /></Suspense></ProtectedRoute>} />
                <Route path="/admin/pages" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminPages /></Suspense></ProtectedRoute>} />
                <Route path="/admin/page-sections" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminPageSections /></Suspense></ProtectedRoute>} />
                <Route path="/admin/services" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminServices /></Suspense></ProtectedRoute>} />
                <Route path="/admin/service-categories" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminServiceCategories /></Suspense></ProtectedRoute>} />
                <Route path="/admin/projects" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminProjects /></Suspense></ProtectedRoute>} />
                <Route path="/admin/blog" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminBlogPosts /></Suspense></ProtectedRoute>} />
                <Route path="/admin/blog-categories" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminBlogCategories /></Suspense></ProtectedRoute>} />
                <Route path="/admin/form-submissions" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminFormSubmissions /></Suspense></ProtectedRoute>} />
                <Route path="/admin/team" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminTeam /></Suspense></ProtectedRoute>} />
                <Route path="/admin/testimonials" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminTestimonials /></Suspense></ProtectedRoute>} />
                <Route path="/admin/leads" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminLeads /></Suspense></ProtectedRoute>} />
                <Route path="/admin/menus" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminMenus /></Suspense></ProtectedRoute>} />
                <Route path="/admin/media" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminMedia /></Suspense></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminUsers /></Suspense></ProtectedRoute>} />
                <Route path="/admin/activity-log" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminActivityLog /></Suspense></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminSettings /></Suspense></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SectionClipboardProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
