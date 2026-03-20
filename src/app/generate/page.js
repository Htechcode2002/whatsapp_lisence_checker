'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isLoggedIn, removeToken, authFetch } from '@/lib/authClient';
import { Calendar, Copy, Check, ArrowLeft, PlusCircle, Info, Sparkles } from 'lucide-react';

export default function GeneratePage() {
  const router = useRouter();
  const [days, setDays] = useState(365);
  const [generating, setGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [copied, setCopied] = useState(false);

  // 检查登录状态
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
    }
  }, [router]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setGeneratedKey('');
      setCopied(false);
      
      const response = await authFetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: parseInt(days) })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setGeneratedKey(result.data.license_key);
      } else if (response.status === 401 || response.status === 403) {
        alert('登录已过期，请重新登录');
        removeToken();
        router.push('/login');
      } else {
        alert('生成失败: ' + result.error);
      }
    } catch (error) {
      console.error('生成错误:', error);
      alert('生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [
    { label: '1个月', value: 30 },
    { label: '3个月', value: 90 },
    { label: '半年', value: 180 },
    { label: '1年', value: 365 },
    { label: '永久', value: 9999 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回管理后台
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <PlusCircle className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">生成新许可证</h1>
              <p className="text-gray-500 text-sm">为您的客户创建一个全新的授权凭证</p>
            </div>
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <div className="h-2 bg-blue-600 w-full" />
            <CardHeader>
              <CardTitle className="text-lg">配置权限</CardTitle>
              <CardDescription>设置许可证的有效期及生成的参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* 有效天数配置 */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <Label htmlFor="days" className="text-sm font-semibold">有效时长 (天)</Label>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">即刻生效</span>
                </div>
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="days"
                      type="number"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      min="1"
                      className="pl-10 h-11"
                      placeholder="输入天数"
                    />
                  </div>
                </div>

                {/* 预设按钮 */}
                <div className="flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <Button 
                      key={p.value} 
                      variant={parseInt(days) === p.value ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setDays(p.value.toString())}
                      className="h-8 text-xs bg-white"
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
                
                <p className="text-xs flex items-center gap-1.5 text-gray-400 mt-1">
                  <Info className="w-3 h-3" />
                  生成后，计费将在客户首次激活时正式开始。
                </p>
              </div>

              {/* 生成按钮 */}
              <Button 
                onClick={handleGenerate} 
                disabled={generating || !days}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-[0.98]"
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    密钥生成中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    立即生成授权密钥
                  </span>
                )}
              </Button>

              {/* 结果显示 */}
              {generatedKey && (
                <div className="mt-8 relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative p-6 bg-white border border-green-100 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">成功生成密钥</h3>
                      </div>
                      <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">可直接复制</span>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 mb-6 text-center select-all">
                      <p className="text-2xl font-mono font-bold text-gray-900 break-all tracking-[0.1em]">
                        {generatedKey}
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={copyToClipboard} 
                        className={`flex-1 h-10 transition-colors ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                      >
                        {copied ? (
                          <><Check className="w-4 h-4 mr-2" /> 已复制到剪贴板</>
                        ) : (
                          <><Copy className="w-4 h-4 mr-2" /> 复制密钥</>
                        )}
                      </Button>
                      <Button 
                        onClick={() => router.push('/')} 
                        variant="outline" 
                        className="flex-1 h-10"
                      >
                        返回列表中心
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

