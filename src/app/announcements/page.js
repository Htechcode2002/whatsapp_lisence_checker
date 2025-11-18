 "use client"

import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { authFetch } from "@/lib/authClient";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  // form state
  const [id, setId] = useState(null);
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [flag, setFlag] = useState(0);
  // admin token will be used from local storage via authFetch

  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      const json = await res.json();
      if (json.success) {
        setAnnouncements(json.data || []);
      } else {
        console.error("获取公告失败", json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  function resetForm() {
    setId(null);
    setContent("");
    setUrl("");
    setFlag(0);
  }

  function loadToForm(item) {
    setId(item.id);
    setContent(item.content || "");
    setUrl(item.url || "");
    setFlag(item.flag === 1 || item.flag === '1' ? 1 : 0);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!content) return alert("content 不能为空");

    const payload = {
      id,
      content,
      url,
      flag,
    };

    try {
      const res = await authFetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        await fetchList();
        resetForm();
        alert(json.message || "操作成功");
      } else {
        alert(json.error || "保存失败");
      }
    } catch (err) {
      console.error(err);
      alert("请求失败，请查看控制台");
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>公告管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label>内容</Label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="公告内容"
                    rows={4}
                    className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm"
                  />
                </div>

                <div>
                  <Label>URL（可选）</Label>
                  <Input value={url} onChange={(e) => setUrl(e.target.value)} type="text" />
                </div>

                <div>
                  <Label>标记 (0/1)</Label>
                  <select
                    value={flag}
                    onChange={(e) => setFlag(parseInt(e.target.value || '0', 10))}
                    className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm"
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">{id ? "更新" : "创建"}</Button>
                  <Button variant="outline" type="button" onClick={resetForm}>
                    新建
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">公告列表</h3>
              <div>
                <Button variant="ghost" onClick={fetchList} disabled={loading}>
                  刷新
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <tr>
                  <TableHead>内容</TableHead>
                  <TableHead>标记</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>操作</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // 显示 5 行加载占位
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={`loading-${idx}`}>
                      <TableCell>
                        <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  announcements.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="whitespace-normal break-words max-w-full">{a.content}</TableCell>
                      <TableCell className="text-center font-mono">{a.flag ?? 0}</TableCell>
                      <TableCell>{a.published_at ? new Date(a.published_at).toLocaleString() : "-"}</TableCell>
                      <TableCell>
                        {a.url ? (
                          <a href={a.url} target="_blank" rel="noreferrer" className="text-primary">
                            链接
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => loadToForm(a)}>
                            编辑
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
}


