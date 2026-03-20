'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { isLoggedIn, removeToken, authFetch } from '@/lib/authClient';
import { Pencil, Trash2, Clock, CheckCircle2, XCircle, RefreshCw, Key, ShieldCheck, ShieldAlert, Monitor, Unlink } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editDays, setEditDays] = useState('');

  // 检查登录状态
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
    }
  }, [router]);

  // 加载许可证列表
  const loadLicenses = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/licenses');
      const result = await response.json();
      if (result.success) {
        setLicenses(result.data);
      } else if (response.status === 401 || response.status === 403) {
        removeToken();
        router.push('/login');
      }
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除许可证
  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个许可证吗？删除后将无法恢复。')) return;
    
    try {
      const response = await authFetch(`/api/licenses/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        loadLicenses();
      } else {
        alert(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除错误:', error);
    }
  };

  // 更新许可证
  const handleUpdate = async (id) => {
    if (!editDays || isNaN(editDays)) {
      alert('请输入有效的数字');
      return;
    }

    try {
      const response = await authFetch(`/api/licenses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ valid_days: parseInt(editDays) }),
      });
      const result = await response.json();
      if (result.success) {
        setEditingId(null);
        loadLicenses();
      } else {
        alert(result.error || '更新失败');
      }
    } catch (error) {
      console.error('更新错误:', error);
    }
  };

  // 解绑硬件
  const handleUnbind = async (id) => {
    if (!window.confirm('确定要解绑该设备的硬件指纹吗？解绑后许可证可在新机器上激活。')) return;

    try {
      const response = await authFetch(`/api/licenses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ hardware_fingerprint: null }),
      });
      const result = await response.json();
      if (result.success) {
        loadLicenses();
      } else {
        alert(result.error || '解绑失败');
      }
    } catch (error) {
      console.error('解绑错误:', error);
    }
  };

  // 登出功能
  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  useEffect(() => {
    loadLicenses();
  }, []);

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 计算剩余天数
  const calculateDaysRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // 获取状态样式
  const getRemainingDaysStyle = (days) => {
    if (days === null) return 'text-gray-400';
    if (days <= 0) return 'text-red-600 font-bold';
    if (days <= 7) return 'text-orange-500 font-bold';
    return 'text-green-600 font-bold';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">许可证管理中心</h1>
            </div>
            <p className="text-gray-600 mt-2">集中管理、发放及监控您的应用许可证状态</p>
          </div>
          <div className="flex gap-3">
            <Link href="/generate">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-md">生成新许可证</Button>
            </Link>
            <Link href="/announcements">
              <Button size="lg" variant="outline" className="bg-white">公告管理</Button>
            </Link>
            <Button size="lg" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
              登出
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3 text-center">
              <div className="flex justify-between items-center mb-1">
                <CardDescription className="font-semibold">总许可证</CardDescription>
                <div className="bg-blue-50 p-1.5 rounded-lg">
                  <Key className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-3xl text-left">{licenses.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center mb-1">
                <CardDescription className="font-semibold text-green-700">已激活</CardDescription>
                <div className="bg-green-50 p-1.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-3xl text-green-600">
                {licenses.filter(l => l.hardware_fingerprint).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3 text-center">
              <div className="flex justify-between items-center mb-1">
                <CardDescription className="font-semibold">未激活</CardDescription>
                <div className="bg-gray-50 p-1.5 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <CardTitle className="text-3xl text-gray-400 text-left">
                {licenses.filter(l => !l.hardware_fingerprint).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center mb-1">
                <CardDescription className="font-semibold text-red-700">已过期</CardDescription>
                <div className="bg-red-50 p-1.5 rounded-lg">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-3xl text-red-600">
                {licenses.filter(l => l.expires_at && new Date(l.expires_at) < new Date()).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* 许可证列表 */}
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b bg-white">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  许可证列表
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
                    共 {licenses.length} 个
                  </span>
                </CardTitle>
                <CardDescription>管理密钥生命周期及设备绑定</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={loadLicenses} disabled={loading} className="text-gray-500">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新列表数据
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading && licenses.length === 0 ? (
              <div className="text-center py-24 text-gray-500">
                <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-200" />
                <p className="text-blue-400 font-medium">正在加载授权数据...</p>
              </div>
            ) : licenses.length === 0 ? (
              <div className="text-center py-24 bg-gray-50/30">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                  <Key className="w-10 h-10 text-gray-200" />
                </div>
                <p className="text-gray-400 mb-6">暂无许可证记录</p>
                <Link href="/generate">
                  <Button variant="outline" className="border-blue-100 text-blue-600 hover:bg-blue-50">立即生成第一个密钥</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="pl-6 w-[220px] font-bold text-gray-600 uppercase text-[11px] tracking-wider">许可证密钥</TableHead>
                    <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider">设备 ID (HWID)</TableHead>
                    <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider">状态</TableHead>
                    <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider">期限 / 剩余</TableHead>
                    <TableHead className="hidden lg:table-cell font-bold text-gray-600 uppercase text-[11px] tracking-wider">过期时间</TableHead>
                    <TableHead className="text-right pr-6 font-bold text-gray-600 uppercase text-[11px] tracking-wider">操作中心</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses.map((license) => {
                    const daysRemaining = calculateDaysRemaining(license.expires_at);
                    const isEditing = editingId === license.id;
                    const isActivated = !!license.hardware_fingerprint;
                    
                    return (
                      <TableRow key={license.id} className="group hover:bg-blue-50/30 transition-all border-b border-gray-50">
                        <TableCell className="pl-6 py-5">
                          <code className="px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-md font-mono text-xs font-bold border border-gray-200 group-hover:bg-white group-hover:border-blue-200 transition-colors">
                            {license.license_key}
                          </code>
                        </TableCell>
                        <TableCell>
                          {isActivated ? (
                            <div className="flex items-center gap-2 group/hwid">
                              <Monitor className="w-3.5 h-3.5 text-blue-400" />
                              <span className="text-xs font-mono text-gray-500 max-w-[120px] truncate" title={license.hardware_fingerprint}>
                                {license.hardware_fingerprint}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-300 italic flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                              尚未绑定设备
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight shadow-sm ${
                            license.status === '已激活' 
                              ? (daysRemaining <= 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100')
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}>
                            {license.status === '已激活' && daysRemaining <= 0 ? (
                                <><ShieldAlert className="w-3 h-3" />已过期</>
                              ) : (
                                <>{license.status === '已激活' ? <ShieldCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{license.status}</>
                              )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium text-gray-900">{license.valid_days} 天</span>
                            <span className={`text-[11px] ${getRemainingDaysStyle(daysRemaining)}`}>
                              {daysRemaining !== null 
                                ? (daysRemaining <= 0 ? '效期已结束' : `剩 ${daysRemaining} 天`) 
                                : '待激活'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-gray-400 text-[11px]">
                          {formatDate(license.expires_at)}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            {isEditing ? (
                              <div className="flex items-center gap-1 bg-blue-50 p-1 rounded-md">
                                <Input 
                                  type="number" 
                                  value={editDays} 
                                  onChange={(e) => setEditDays(e.target.value)}
                                  className="h-8 w-16 text-xs px-2 bg-white"
                                />
                                <Button size="sm" className="h-8 px-2 bg-blue-600 hover:bg-blue-700" onClick={() => handleUpdate(license.id)}>确定</Button>
                                <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setEditingId(null)}>取消</Button>
                              </div>
                            ) : (
                              <>
                                {isActivated && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                                    onClick={() => handleUnbind(license.id)}
                                    title="解绑硬件"
                                  >
                                    <Unlink className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                  onClick={() => {
                                    setEditingId(license.id);
                                    setEditDays(license.valid_days.toString());
                                  }}
                                  title="修改期限"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                  onClick={() => handleDelete(license.id)}
                                  title="永久删除"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
