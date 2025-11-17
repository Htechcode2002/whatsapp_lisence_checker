import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth';

// 获取所有公告（公开）
export async function GET(request) {
  try {
    const [rows] = await pool.query(
      `SELECT id, content, published_at, url FROM announcements ORDER BY published_at DESC`
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取公告失败:', error);
    return NextResponse.json({ success: false, error: '获取公告失败' }, { status: 500 });
  }
}

// 创建或编辑公告（需要管理员 API key）
export async function POST(request) {
  const authError = verifyAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, content, published_at, url } = body;

    if (!content) {
      return NextResponse.json({ success: false, error: '缺少 content 字段' }, { status: 400 });
    }

    if (id) {
      // 更新已有公告
      await pool.query(
        'UPDATE announcements SET content = ?, published_at = ?, url = ? WHERE id = ?',
        [content, published_at || new Date(), url || null, id]
      );
      return NextResponse.json({ success: true, message: '更新成功' });
    } else {
      // 新建公告
      await pool.query(
        'INSERT INTO announcements (content, published_at, url) VALUES (?, ?, ?)',
        [content, published_at || new Date(), url || null]
      );
      return NextResponse.json({ success: true, message: '创建成功' });
    }
  } catch (error) {
    console.error('保存公告失败:', error);
    return NextResponse.json({ success: false, error: '保存失败' }, { status: 500 });
  }
}


