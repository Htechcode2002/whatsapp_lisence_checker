import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth';

// 更新许可证（PUT/PATCH）
export async function PATCH(request, { params }) {
  const authError = verifyAdminAuth(request);
  if (authError) return authError;
  
  const { id } = params;
  
  try {
    const body = await request.json();
    const { valid_days, expires_at, hardware_fingerprint } = body;
    
    // 如果更新有效天数，且已经激活，则需要重新计算过期时间
    if (valid_days !== undefined) {
      const [licenses] = await pool.query('SELECT activated_at FROM licenses WHERE id = ?', [id]);
      if (licenses.length > 0 && licenses[0].activated_at) {
        const activatedAt = new Date(licenses[0].activated_at);
        const newExpiresAt = new Date(activatedAt);
        newExpiresAt.setDate(newExpiresAt.getDate() + parseInt(valid_days));
        
        await pool.query(
          'UPDATE licenses SET valid_days = ?, expires_at = ? WHERE id = ?',
          [parseInt(valid_days), newExpiresAt, id]
        );
        return NextResponse.json({ success: true, message: '更新成功并已同步过期时间' });
      }
    }

    // 构建普通更新字段
    const updates = [];
    const values = [];
    
    if (valid_days !== undefined) {
      updates.push('valid_days = ?');
      values.push(parseInt(valid_days));
    }
    
    if (expires_at !== undefined) {
      updates.push('expires_at = ?');
      values.push(expires_at === null ? null : new Date(expires_at));
    }

    if (hardware_fingerprint !== undefined) {
      updates.push('hardware_fingerprint = ?');
      values.push(hardware_fingerprint === null ? null : hardware_fingerprint);
      
      // 如果解绑硬件，通常也需要清空激活时间和过期时间（视业务而定）
      if (hardware_fingerprint === null) {
          updates.push('activated_at = NULL');
          updates.push('expires_at = NULL');
      }
    }
    
    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: '无更新内容' }, { status: 400 });
    }
    
    values.push(id);
    
    await pool.query(
      `UPDATE licenses SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    return NextResponse.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新许可证错误:', error);
    return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 });
  }
}

// 删除许可证
export async function DELETE(request, { params }) {
  const authError = verifyAdminAuth(request);
  if (authError) return authError;
  
  const { id } = params;
  
  try {
    await pool.query('DELETE FROM licenses WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除许可证错误:', error);
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 });
  }
}
