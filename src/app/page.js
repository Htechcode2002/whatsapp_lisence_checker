'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { isLoggedIn, removeToken, authFetch } from '@/lib/authClient';
import { 
  Pencil, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Key, 
  ShieldCheck, 
  ShieldAlert, 
  Monitor, 
  Unlink, 
  Copy, 
  Check, 
  Search, 
  PlusCircle, 
  X,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpDown,
  ListChecks
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editDays, setEditDays] = useState('');
  const [editRemark, setEditRemark] = useState('');
  const [genRemark, setGenRemark] = useState('');
  
  // Search, Filter & Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, activated, inactive, expired
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [copiedId, setCopiedId] = useState(null);

  // Batch Selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Quick Generate Modal state
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [genDays, setGenDays] = useState(365);
  const [genQuantity, setGenQuantity] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [newlyGeneratedKeys, setNewlyGeneratedKeys] = useState([]);
  const [modalCopied, setModalCopied] = useState(false);

  // Check Login
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
    }
  }, [router]);

  // Load Licenses
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

  // Delete Single License
  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个许可证吗？删除后将无法恢复。')) return;
    
    try {
      const response = await authFetch(`/api/licenses/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        loadLicenses();
      } else {
        alert(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除错误:', error);
    }
  };

  // Update Single License
  const handleUpdate = async (id) => {
    if (!editDays || isNaN(editDays)) {
      alert('请输入有效的数字');
      return;
    }

    try {
      const response = await authFetch(`/api/licenses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          valid_days: parseInt(editDays),
          remark: editRemark || null
        }),
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

  // Unbind Hardware Single License
  const handleUnbind = async (id) => {
    if (!window.confirm('确定要解绑该设备的硬件指纹吗？解绑后许可证可在新机器上激活。')) return;

    try {
      const response = await authFetch(`/api/licenses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ hardware_fingerprint: null, client_id: null }),
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

  // Renew Single License
  const handleRenew = async (id, currentValidDays) => {
    const addDaysStr = window.prompt('请输入要增加或减少的天数：\n\n(输入正数增加天数，输入负数减少天数，例如：30 或 -30)');
    if (!addDaysStr) return;
    const addDays = parseInt(addDaysStr);
    if (isNaN(addDays) || addDays === 0) {
      alert('请输入有效的非零整数天数');
      return;
    }

    if (currentValidDays + addDays < 1) {
      alert(`天数扣减后总授权时长不能小于 1 天！\n(当前总时长：${currentValidDays}天，欲扣减：${Math.abs(addDays)}天)`);
      return;
    }

    try {
      setLoading(true);
      const response = await authFetch(`/api/licenses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          valid_days: currentValidDays + addDays
        }),
      });
      const result = await response.json();
      if (result.success) {
        loadLicenses();
      } else {
        alert(result.error || '更新失败');
      }
    } catch (error) {
      console.error('更新错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- BATCH OPERATIONS ---
  const handleBatchDelete = async () => {
    if (!window.confirm(`确定要删除选中的 ${selectedIds.length} 个许可证吗？此操作不可逆。`)) return;
    try {
      setLoading(true);
      await Promise.all(selectedIds.map(id => authFetch(`/api/licenses/${id}`, { method: 'DELETE' })));
      setSelectedIds([]);
      loadLicenses();
    } catch (err) {
      alert('批量删除部分或全部失败，请刷新查看。');
      loadLicenses();
    }
  };

  const handleBatchUnbind = async () => {
    if (!window.confirm(`确定要解绑选中的 ${selectedIds.length} 个许可证吗？`)) return;
    try {
      setLoading(true);
      await Promise.all(selectedIds.map(id => 
        authFetch(`/api/licenses/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ hardware_fingerprint: null, client_id: null }),
        })
      ));
      setSelectedIds([]);
      loadLicenses();
    } catch (err) {
      alert('批量解绑部分或全部失败，请刷新查看。');
      loadLicenses();
    }
  };

  const handleBatchExtend = async () => {
    const daysStr = window.prompt(`请输入要为选中的 ${selectedIds.length} 个许可证设置的授权天数：\n\n(输入数字即可，例如：365)`);
    if (!daysStr) return;
    const days = parseInt(daysStr);
    if (isNaN(days) || days <= 0) {
      alert('请输入有效的正整数');
      return;
    }
    try {
      setLoading(true);
      await Promise.all(selectedIds.map(id => 
        authFetch(`/api/licenses/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ valid_days: days }),
        })
      ));
      setSelectedIds([]);
      loadLicenses();
    } catch (err) {
      alert('批量修改部分或全部失败，请刷新查看。');
      loadLicenses();
    }
  };

  // Logout
  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  useEffect(() => {
    loadLicenses();
  }, []);

  // Helpers
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

  const calculateDaysRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getRemainingDaysStyle = (days) => {
    if (days === null) return 'text-slate-400';
    if (days <= 0) return 'text-rose-600 font-bold';
    if (days <= 7) return 'text-orange-500 font-bold';
    return 'text-emerald-600 font-bold';
  };

  const handleCopyKey = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAllKeys = () => {
    const allKeysStr = newlyGeneratedKeys.map(k => k.license_key).join('\n');
    navigator.clipboard.writeText(allKeysStr);
    setModalCopied(true);
    setTimeout(() => setModalCopied(false), 3000);
  };

  // Quick Generate logic (Batch)
  const handleQuickGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!genDays || isNaN(genDays)) return;
    if (!genQuantity || isNaN(genQuantity) || genQuantity < 1 || genQuantity > 100) {
      alert('请输入1-100之间的生成数量');
      return;
    }

    setGenerating(true);
    setNewlyGeneratedKeys([]);
    setModalCopied(false);

    try {
      const response = await authFetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          days: parseInt(genDays), 
          quantity: parseInt(genQuantity),
          remark: genRemark || null
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setNewlyGeneratedKeys(result.data); // array of keys
        loadLicenses();
      } else {
        alert('生成失败: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const presets = [
    { label: '30天 (1个月)', value: 30 },
    { label: '90天 (3个月)', value: 90 },
    { label: '180天 (半年)', value: 180 },
    { label: '365天 (1年)', value: 365 },
    { label: '9999天 (永久)', value: 9999 },
  ];

  const totalCount = licenses.length;
  const activatedCount = licenses.filter(l => l.hardware_fingerprint && calculateDaysRemaining(l.expires_at) > 0).length;
  const inactiveCount = licenses.filter(l => !l.hardware_fingerprint).length;
  const expiredCount = licenses.filter(l => {
    const d = calculateDaysRemaining(l.expires_at);
    return l.hardware_fingerprint && d !== null && d <= 0;
  }).length;

  // Filtering
  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = 
      license.license_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (license.client_id && license.client_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (license.remark && license.remark.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (license.hardware_fingerprint && license.hardware_fingerprint.toLowerCase().includes(searchTerm.toLowerCase()));

    const daysRemaining = calculateDaysRemaining(license.expires_at);
    const isExpired = license.hardware_fingerprint && daysRemaining !== null && daysRemaining <= 0;

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'activated') return matchesSearch && !!license.hardware_fingerprint && !isExpired;
    if (statusFilter === 'inactive') return matchesSearch && !license.hardware_fingerprint;
    if (statusFilter === 'expired') return matchesSearch && isExpired;

    return matchesSearch;
  });

  // Sorting
  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedLicenses = [...filteredLicenses].sort((a, b) => {
    if (sortConfig.key === 'created_at') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortConfig.key === 'valid_days') {
      return sortConfig.direction === 'asc' ? a.valid_days - b.valid_days : b.valid_days - a.valid_days;
    }
    if (sortConfig.key === 'expires_at') {
      const timeA = a.expires_at ? new Date(a.expires_at).getTime() : 0;
      const timeB = b.expires_at ? new Date(b.expires_at).getTime() : 0;
      return sortConfig.direction === 'asc' ? timeA - timeB : timeB - timeA;
    }
    return 0;
  });

  // Batch Selection Checks
  const isAllSelected = sortedLicenses.length > 0 && selectedIds.length === sortedLicenses.length;
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedLicenses.map(l => l.id));
    }
  };

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans antialiased text-slate-800 pb-24 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-black tracking-tight text-slate-900">许可证管理中心</h1>
            </div>
            <p className="text-slate-500 text-sm mt-1.5">发放、监控与一键批量管理您的授权密钥</p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button 
              onClick={() => {
                setGenDays(365);
                setGenQuantity(1);
                setGenRemark('');
                setNewlyGeneratedKeys([]);
                setModalCopied(false);
                setIsGenModalOpen(true);
              }}
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 active:scale-98 transition-all font-bold text-white shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              生成新许可证
            </Button>
            <Link href="/announcements">
              <Button size="lg" variant="outline" className="bg-white border-slate-200 hover:bg-slate-50 font-semibold cursor-pointer">
                公告管理
              </Button>
            </Link>
            <Button size="lg" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold cursor-pointer" onClick={handleLogout}>
              登出
            </Button>
          </div>
        </div>

        {/* Stats Metrics Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-xs bg-white rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500" />
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">总计许可证</CardDescription>
                <CardTitle className="text-2xl font-extrabold text-slate-800 mt-1">{totalCount}</CardTitle>
              </div>
              <div className="bg-blue-50 p-2.5 rounded-xl">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-xs bg-white rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">使用中 (激活)</CardDescription>
                <CardTitle className="text-2xl font-extrabold text-emerald-600 mt-1">{activatedCount}</CardTitle>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-xs bg-white rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-400" />
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">待激活 (闲置)</CardDescription>
                <CardTitle className="text-2xl font-extrabold text-slate-500 mt-1">{inactiveCount}</CardTitle>
              </div>
              <div className="bg-slate-50/80 p-2.5 rounded-xl">
                <Clock className="w-5 h-5 text-slate-400" />
              </div>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-xs bg-white rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">已过期</CardDescription>
                <CardTitle className="text-2xl font-extrabold text-rose-600 mt-1">{expiredCount}</CardTitle>
              </div>
              <div className="bg-rose-50 p-2.5 rounded-xl">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Content & Action Hub */}
        <Card className="border-none shadow-xs bg-white rounded-2xl overflow-hidden relative">
          <CardHeader className="border-b border-slate-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
              
              {/* Tabs Section */}
              <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
                {[
                  { id: 'all', label: '全部', count: totalCount },
                  { id: 'activated', label: '已激活', count: activatedCount },
                  { id: 'inactive', label: '待使用', count: inactiveCount },
                  { id: 'expired', label: '已过期', count: expiredCount }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStatusFilter(tab.id);
                      setSelectedIds([]); // clear selection on tab change
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      statusFilter === tab.id 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                    <span className="ml-1.5 opacity-60 font-mono">({tab.count})</span>
                  </button>
                ))}
              </div>

              {/* Search & Refresh Actions */}
              <div className="flex items-center gap-3">
                <div className="relative max-w-xs w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input 
                    type="text" 
                    placeholder="输入密钥 / Client ID / HWID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 text-xs border-slate-200 outline-none rounded-xl focus:ring-2 focus:ring-blue-500/25 bg-slate-50/50"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadLicenses} 
                  disabled={loading} 
                  className="h-10 px-4 text-xs font-semibold border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                  刷新列表
                </Button>
              </div>

            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading && licenses.length === 0 ? (
              <div className="text-center py-24 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-400" />
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider animate-pulse">正在加载授权数据...</p>
              </div>
            ) : sortedLicenses.length === 0 ? (
              <div className="text-center py-24 bg-slate-50/30">
                <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs border border-slate-100">
                  <Search className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-400 text-sm font-medium">没有找到匹配的许可证记录</p>
                {searchTerm && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSearchTerm('')} 
                    className="text-blue-600 font-bold text-xs mt-2 cursor-pointer"
                  >
                    清除搜索关键字
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto relative">
                <Table>
                  <TableHeader className="bg-slate-50/50 sticky top-0 z-10">
                    <TableRow className="hover:bg-transparent border-b border-slate-100">
                      <TableHead className="w-12 pl-6 py-4">
                        <div className="flex items-center h-full">
                          <input 
                            type="checkbox" 
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                          />
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider py-4">
                        许可证密钥 (KEY)
                      </TableHead>
                      <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider py-4">设备指纹 (HWID)</TableHead>
                      <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider py-4">绑定账号 (CLIENT ID)</TableHead>
                      <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider py-4">备注</TableHead>
                      <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider py-4">状态</TableHead>
                      <TableHead 
                        className="font-bold text-slate-500 text-[10px] uppercase tracking-wider py-4 cursor-pointer hover:bg-slate-100/50 transition-colors"
                        onClick={() => handleSort('valid_days')}
                      >
                        <div className="flex items-center gap-1">
                          授权时长 <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="font-bold text-slate-500 text-[10px] uppercase tracking-wider py-4 cursor-pointer hover:bg-slate-100/50 transition-colors"
                        onClick={() => handleSort('expires_at')}
                      >
                        <div className="flex items-center gap-1">
                          过期日期 <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-wider py-4">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedLicenses.map((license) => {
                      const daysRemaining = calculateDaysRemaining(license.expires_at);
                      const isEditing = editingId === license.id;
                      const isActivated = !!license.hardware_fingerprint;
                      const isExpired = isActivated && daysRemaining !== null && daysRemaining <= 0;
                      const isSelected = selectedIds.includes(license.id);
                      
                      return (
                        <TableRow 
                          key={license.id} 
                          className={`group transition-all duration-150 border-b border-slate-100 ${
                            isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <TableCell className="pl-6 py-4.5">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => toggleSelection(license.id)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                            />
                          </TableCell>

                          <TableCell className="py-4.5">
                            <div className="flex items-center gap-2">
                              <code className={`px-2.5 py-1.5 text-slate-700 rounded-lg font-mono text-xs font-bold border select-all transition-colors ${
                                isSelected ? 'bg-white border-blue-200' : 'bg-slate-100 border-slate-250/70 group-hover:bg-white'
                              }`}>
                                {license.license_key}
                              </code>
                              <button
                                onClick={() => handleCopyKey(license.license_key, license.id)}
                                className={`p-1.5 rounded-lg border transition-all active:scale-90 flex items-center justify-center cursor-pointer ${
                                  copiedId === license.id
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 shadow-xs'
                                }`}
                                title="复制密钥"
                              >
                                {copiedId === license.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </TableCell>

                          <TableCell className="py-4.5">
                            {isActivated ? (
                              <div className="flex items-center gap-1.5 max-w-[130px]" title={license.hardware_fingerprint}>
                                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs font-mono text-slate-600 truncate">{license.hardware_fingerprint}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-350 italic">尚未激活绑定</span>
                            )}
                          </TableCell>

                          <TableCell className="py-4.5">
                            {license.client_id ? (
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {license.client_id.split(',').map((id) => (
                                  <span key={id} className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50/80 border border-blue-100 px-1.5 py-0.5 rounded-md" title={id}>
                                    {id}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-350 italic">未绑定</span>
                            )}
                          </TableCell>

                          <TableCell className="py-4.5">
                            {isEditing ? (
                              <Input 
                                type="text" 
                                value={editRemark} 
                                onChange={(e) => setEditRemark(e.target.value)}
                                className="h-8 w-32 text-xs px-2 bg-white border-blue-200"
                                placeholder="添加备注..."
                              />
                            ) : license.remark ? (
                              <span className="text-xs font-semibold text-slate-700 max-w-[150px] truncate block" title={license.remark}>
                                {license.remark}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-350 italic">无</span>
                            )}
                          </TableCell>

                          <TableCell className="py-4.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-xs border ${
                              isExpired 
                                ? 'bg-rose-50 border-rose-200 text-rose-700' 
                                : isActivated 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                  : 'bg-slate-100 border-slate-200 text-slate-500'
                            }`}>
                              {isExpired ? (
                                <><ShieldAlert className="w-3.5 h-3.5" />已过期</>
                              ) : isActivated ? (
                                <><ShieldCheck className="w-3.5 h-3.5" />使用中</>
                              ) : (
                                <><Clock className="w-3.5 h-3.5" />待激活</>
                              )}
                            </span>
                          </TableCell>

                          <TableCell className="py-4.5">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800">{license.valid_days} 天</span>
                              <span className={`text-[10px] mt-0.5 ${getRemainingDaysStyle(daysRemaining)}`}>
                                {daysRemaining !== null 
                                  ? (daysRemaining <= 0 ? '效期到期' : `剩 ${daysRemaining} 天`) 
                                  : '计费待启动'}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="py-4.5 font-medium text-slate-400 text-xs">
                            {formatDate(license.expires_at)}
                          </TableCell>

                          <TableCell className="text-right pr-6 py-4.5">
                            <div className="flex justify-end gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                              {isEditing ? (
                                <div className="flex items-center gap-1 bg-blue-50/50 p-1.5 rounded-xl border border-blue-100 shadow-inner">
                                  <Input 
                                    type="number" 
                                    value={editDays} 
                                    onChange={(e) => setEditDays(e.target.value)}
                                    className="h-8 w-16 text-xs px-2.5 bg-white border-blue-200"
                                    placeholder="天数"
                                    min="1"
                                  />
                                  <Button size="sm" className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs cursor-pointer" onClick={() => handleUpdate(license.id)}>确定</Button>
                                  <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs text-slate-500 cursor-pointer" onClick={() => setEditingId(null)}>取消</Button>
                                </div>
                              ) : (
                                <>
                                  {isActivated && (
                                    <>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8.5 w-8.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                        onClick={() => handleRenew(license.id, license.valid_days)}
                                        title="续期许可证"
                                      >
                                        <Calendar className="w-4.5 h-4.5" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8.5 w-8.5 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg cursor-pointer"
                                        onClick={() => handleUnbind(license.id)}
                                        title="解绑硬件及微信号"
                                      >
                                        <Unlink className="w-4.5 h-4.5" />
                                      </Button>
                                    </>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8.5 w-8.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                                    onClick={() => {
                                      setEditingId(license.id);
                                      setEditDays(license.valid_days.toString());
                                      setEditRemark(license.remark || '');
                                    }}
                                    title="修改有效天数及备注"
                                  >
                                    <Pencil className="w-4.5 h-4.5" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8.5 w-8.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                    onClick={() => handleDelete(license.id)}
                                    title="删除许可证"
                                  >
                                    <Trash2 className="w-4.5 h-4.5" />
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Batch Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 shadow-2xl rounded-2xl border border-slate-700 px-5 py-3.5 flex items-center gap-6 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex items-center gap-3 border-r border-slate-700 pr-6">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <ListChecks className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">已选择</p>
              <p className="text-sm font-black text-white">{selectedIds.length} <span className="font-normal text-slate-300 text-xs">个许可证</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBatchExtend}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-blue-400 hover:text-blue-300 h-9 font-bold cursor-pointer"
            >
              <Calendar className="w-4 h-4 mr-1.5" /> 批量续期
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBatchUnbind}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-orange-400 hover:text-orange-300 h-9 font-bold cursor-pointer"
            >
              <Unlink className="w-4 h-4 mr-1.5" /> 批量解绑
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleBatchDelete}
              className="bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white h-9 font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> 批量删除
            </Button>
            <button onClick={() => setSelectedIds([])} className="p-2 ml-1 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Inline Quick Generate Modal Component */}
      {isGenModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full mx-auto overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="h-1.5 bg-blue-600 w-full" />
            <div className="p-6">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <PlusCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">生成授权密钥</h3>
                    <p className="text-xs text-slate-400 mt-0.5">创建新授权以分发给客户 (支持批量)</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsGenModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Body */}
              {newlyGeneratedKeys.length === 0 ? (
                <form onSubmit={handleQuickGenerate} className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">授权时长 (天)</label>
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">计费从激活算起</span>
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="number"
                        value={genDays}
                        onChange={(e) => setGenDays(e.target.value)}
                        min="1"
                        required
                        placeholder="输入有效天数 (例如 365)"
                        className="pl-10 h-11 border-slate-200 outline-none rounded-xl focus:ring-2 focus:ring-blue-500/25 text-sm font-semibold"
                      />
                    </div>
                    {/* Preset Buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {presets.map((p) => (
                        <button 
                          key={p.value} 
                          type="button"
                          onClick={() => setGenDays(p.value)}
                          className={`h-7 px-3 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                            parseInt(genDays) === p.value 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-xs' 
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {p.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">生成数量</label>
                    <div className="relative">
                      <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="number"
                        value={genQuantity}
                        onChange={(e) => setGenQuantity(e.target.value)}
                        min="1"
                        max="100"
                        required
                        placeholder="生成多少个密钥 (1-100)"
                        className="pl-10 h-11 border-slate-200 outline-none rounded-xl focus:ring-2 focus:ring-blue-500/25 text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">备注 (可选)</label>
                    <div className="relative">
                      <Pencil className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="text"
                        value={genRemark}
                        onChange={(e) => setGenRemark(e.target.value)}
                        placeholder="输入备注，记录使用者或用途"
                        className="pl-10 h-11 border-slate-200 outline-none rounded-xl focus:ring-2 focus:ring-blue-500/25 text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit"
                      disabled={generating}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:scale-98 transition-all font-bold text-white shadow-md shadow-blue-500/20 text-sm cursor-pointer"
                    >
                      {generating ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                          生成密钥中...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4.5 h-4.5" />
                          {genQuantity > 1 ? `批量生成 ${genQuantity} 个授权密钥` : '生成授权密钥'}
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                /* Key Output Screen */
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                  <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-extrabold text-emerald-800">成功生成 {newlyGeneratedKeys.length} 个密钥</h4>
                      <p className="text-xs text-emerald-600/80 mt-1">您可以点击下方按钮一键复制全部，或者单独复制某一个密钥分发给客户。</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                    <div className="max-h-52 overflow-y-auto p-2 custom-scrollbar">
                      {newlyGeneratedKeys.map((k, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded-lg group">
                          <code className="text-[13px] font-mono font-bold text-blue-300 break-all select-all">
                            {k.license_key}
                          </code>
                          <button 
                            onClick={() => handleCopyKey(k.license_key, `modal-${idx}`)}
                            className="text-slate-400 hover:text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title="复制"
                          >
                            {copiedId === `modal-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <Button 
                      onClick={handleCopyAllKeys} 
                      className={`flex-1 h-11 font-bold active:scale-98 transition-all text-white cursor-pointer shadow-md ${
                        modalCopied
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' 
                          : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                      }`}
                    >
                      {modalCopied ? (
                        <><Check className="w-4 h-4 mr-2" />复制全部成功</>
                      ) : (
                        <><Copy className="w-4 h-4 mr-2" />一键复制全部 ({newlyGeneratedKeys.length})</>
                      )}
                    </Button>
                    <Button 
                      onClick={() => setIsGenModalOpen(false)} 
                      variant="outline" 
                      className="flex-1 h-11 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                    >
                      关闭返回列表
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for custom scrollbar inside modal */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}
