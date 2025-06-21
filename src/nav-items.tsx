
import { HomeIcon, Target, Activity } from "lucide-react";
import Index from "./pages/Index.tsx";
import ParameterCapture from "./pages/ParameterCapture.tsx";
import CampaignManager from "./pages/CampaignManager.tsx";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Parameter Capture",
    to: "/parameter-capture",
    icon: <Target className="h-4 w-4" />,
    page: <ParameterCapture />,
  },
  {
    title: "Campaign Manager",
    to: "/campaign-manager",
    icon: <Activity className="h-4 w-4" />,
    page: <CampaignManager />,
  },
];
