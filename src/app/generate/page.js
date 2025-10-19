'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function GeneratePage() {
  const router = useRouter();
  const [days, setDays] = useState(365);
  const [generating, setGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setGeneratedKey('');
      
      const response = await fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: parseInt(days) })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setGeneratedKey(result.data.license_key);
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
    alert('已复制到剪贴板！');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline">← 返回列表</Button>
          </Link>
        </div>

        {/* 生成表单 */}
        <Card>
          <CardHeader>
            <CardTitle>生成新许可证</CardTitle>
            <CardDescription>创建一个新的许可证密钥</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 有效天数 */}
            <div className="space-y-2">
              <Label htmlFor="days">有效天数</Label>
              <Input
                id="days"
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                min="1"
                placeholder="365"
              />
              <p className="text-sm text-gray-500">
                许可证将在 {days} 天后过期
              </p>
            </div>

            {/* 生成按钮 */}
            <Button 
              onClick={handleGenerate} 
              disabled={generating || !days}
              className="w-full"
              size="lg"
            >
              {generating ? '生成中...' : '生成许可证'}
            </Button>

            {/* 显示生成的密钥 */}
            {generatedKey && (
              <div className="mt-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-3">
                  ✅ 生成成功！
                </h3>
                <div className="bg-white p-4 rounded border border-green-300">
                  <p className="text-sm text-gray-600 mb-2">许可证密钥：</p>
                  <p className="text-2xl font-mono font-bold text-gray-900 mb-4">
                    {generatedKey}
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={copyToClipboard} variant="outline" size="sm">
                      复制密钥
                    </Button>
                    <Button 
                      onClick={() => router.push('/')} 
                      variant="outline" 
                      size="sm"
                    >
                      查看列表
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>1. 生成密钥：</strong>点击"生成许可证"按钮创建新密钥
            </div>
            <div>
              <strong>2. 发送给客户：</strong>将生成的密钥发送给您的客户
            </div>
            <div>
              <strong>3. 客户激活：</strong>客户在桌面应用中输入密钥完成激活
            </div>
            <div>
              <strong>4. 硬件绑定：</strong>首次激活时自动绑定客户的硬件指纹
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

