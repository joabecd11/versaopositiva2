
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import ParameterCapture from "./pages/ParameterCapture";
import Index from "./pages/Index";
import Navigation from "./components/Navigation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/parameter-capture" element={<ParameterCapture />} />
            {navItems.map(({ to, page }) => (
              <Route key={to} path={to} element={page} />
            ))}
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
