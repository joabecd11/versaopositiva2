
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HomeIcon, Target, Activity } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">Cloaker Hunter Tool</h1>
            
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button 
                  variant={isActive('/') ? 'default' : 'ghost'} 
                  className="flex items-center space-x-2"
                >
                  <HomeIcon className="h-4 w-4" />
                  <span>Cloaker Analyzer</span>
                </Button>
              </Link>
              
              <Link to="/parameter-capture">
                <Button 
                  variant={isActive('/parameter-capture') ? 'default' : 'ghost'} 
                  className="flex items-center space-x-2"
                >
                  <Target className="h-4 w-4" />
                  <span>Parameter Capture</span>
                </Button>
              </Link>
              
              <Link to="/campaign-manager">
                <Button 
                  variant={isActive('/campaign-manager') ? 'default' : 'ghost'} 
                  className="flex items-center space-x-2"
                >
                  <Activity className="h-4 w-4" />
                  <span>Campaign Manager</span>
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="text-sm text-gray-500">
              Análise avançada e captura de parâmetros reais
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
