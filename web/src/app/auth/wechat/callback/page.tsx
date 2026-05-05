import { useEffect, useState, useCallback, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { httpClient } from '@/app/infra/http/HttpClient';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import langbotIcon from '@/app/assets/langbot-logo.webp';

function WeChatOAuthCallbackContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleOAuthCallback = useCallback(
    async (openid: string) => {
      try {
        const response = await httpClient.exchangeWeChatOpenId(openid);
        localStorage.setItem('token', response.token);
        localStorage.setItem('login_method', 'wechat');
        setStatus('success');
        toast.success(t('common.wechatLoginSuccess'));

        const wizardState = localStorage.getItem('langbot_wizard_state');
        const redirectTo = wizardState ? '/wizard' : '/chat';
        setTimeout(() => {
          navigate(redirectTo);
        }, 1000);
      } catch (err) {
        setStatus('error');
        const errorObj = err as { msg?: string };
        setErrorMessage(errorObj?.msg || t('common.wechatLoginFailed'));
      }
    },
    [navigate, t],
  );

  useEffect(() => {
    const openid = searchParams.get('openid');

    if (!openid) {
      setStatus('error');
      setErrorMessage(t('common.wechatLoginNoCode'));
      return;
    }

    handleOAuthCallback(openid);
  }, [searchParams, handleOAuthCallback, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
      <Card className="w-[400px] shadow-lg dark:shadow-white/10">
        <CardHeader className="text-center">
          <img
            src={langbotIcon}
            alt="LangBot"
            className="w-16 h-16 mb-4 mx-auto"
          />
          <CardTitle className="text-xl">
            {status === 'loading' && t('common.wechatLoginProcessing')}
            {status === 'success' && t('common.wechatLoginSuccess')}
            {status === 'error' && t('common.wechatLoginError')}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && t('common.wechatLoginProcessingDesc')}
            {status === 'success' && t('common.wechatLoginSuccessDesc')}
            {status === 'error' && errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === 'loading' && <LoadingSpinner size="lg" text="" />}
          {status === 'success' && (
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          )}
          {status === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 text-red-500" />
              <Button
                onClick={() => navigate('/login')}
                className="w-full mt-4"
              >
                {t('common.backToLogin')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
      <Card className="w-[400px] shadow-lg dark:shadow-white/10">
        <CardContent className="flex flex-col items-center py-12">
          <LoadingSpinner size="lg" text="" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function WeChatOAuthCallback() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WeChatOAuthCallbackContent />
    </Suspense>
  );
}
