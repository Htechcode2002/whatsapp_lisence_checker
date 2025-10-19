'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Home() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 加载许可证列表
  const loadLicenses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/licenses');
      const result = await response.json();
      if (result.success) {
        setLicenses(result.data);
      }
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLicenses();
  }, []);

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">许可证管理系统</h1>
            <p className="text-gray-600 mt-2">管理和生成应用许可证密钥</p>
          </div>
          <Link href="/generate">
            <Button size="lg">生成新许可证</Button>
          </Link>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>总许可证数</CardDescription>
              <CardTitle className="text-4xl">{licenses.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>已激活</CardDescription>
              <CardTitle className="text-4xl text-green-600">
                {licenses.filter(l => l.hardware_fingerprint).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>未激活</CardDescription>
              <CardTitle className="text-4xl text-gray-400">
                {licenses.filter(l => !l.hardware_fingerprint).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* 许可证列表 */}
        <Card>
          <CardHeader>
            <CardTitle>许可证列表</CardTitle>
            <CardDescription>查看所有生成的许可证密钥</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">加载中...</div>
            ) : licenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                暂无许可证，点击上方按钮生成
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>许可证密钥</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>有效天数</TableHead>
                    <TableHead>过期时间</TableHead>
                    <TableHead>激活时间</TableHead>
                    <TableHead>创建时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses.map((license) => (
                    <TableRow key={license.id}>
                      <TableCell className="font-mono font-semibold">
                        {license.license_key}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          license.status === '已激活' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {license.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-blue-600">
                          {license.valid_days} 天
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(license.expires_at)}</TableCell>
                      <TableCell>{formatDate(license.activated_at)}</TableCell>
                      <TableCell>{formatDate(license.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
