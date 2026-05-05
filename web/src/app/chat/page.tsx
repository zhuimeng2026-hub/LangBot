import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import langbotIcon from '@/app/assets/langbot-logo.webp';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function ChatPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Configure Dify chatbot
    (window as any).difyChatbotConfig = {
      token: 'Z20XkDBTuvs5doNk',
      baseUrl: 'https://xchat.aixifs.com/dify',
      dynamicScript: true,
    };

    // Load Dify embed script
    const script = document.createElement('script');
    script.src = 'https://xchat.aixifs.com/dify/embed.min.js';
    script.defer = true;
    script.id = 'dify-chatbot-script';
    document.body.appendChild(script);

    return () => {
      const s = document.getElementById('dify-chatbot-script');
      if (s) s.remove();
    };
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('login_method');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  }

  return (
    <div className="h-svh flex flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between px-4 border-b">
        <div className="flex items-center gap-2">
          <img src={langbotIcon} alt="LangBot" className="size-7 rounded-lg" />
          <span className="font-semibold text-sm">LangBot</span>
        </div>
        <div className="flex items-center gap-1">
          <LanguageSelector />
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout} title={t('common.logout')}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {/* Dify chatbot loads bubble button and iframe here */}
      <div className="flex-1 min-h-0" />
    </div>
  );
}
