import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// 激活许可证（桌面应用调用）
export async function POST(request) {
  try {
    const { license_key, hardware_fingerprint } = await request.json();
    
    if (!license_key || !hardware_fingerprint) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数' 
      }, { status: 400 });
    }
    
    // 查询许可证
    const [licenses] = await pool.query(
      'SELECT * FROM licenses WHERE license_key = ?',
      [license_key]
    );
    
    if (licenses.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '许可证不存在' 
      }, { status: 404 });
    }
    
    const license = licenses[0];
    
    // 检查是否已经绑定其他机器
    if (license.hardware_fingerprint && license.hardware_fingerprint !== hardware_fingerprint) {
      return NextResponse.json({ 
        success: false, 
        error: '许可证已绑定其他设备' 
      }, { status: 403 });
    }
    
    // 检查是否过期（只有已激活的才检查）
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: '许可证已过期' 
      }, { status: 403 });
    }
    
    // 首次激活：绑定硬件指纹并计算过期时间
    if (!license.hardware_fingerprint) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + license.valid_days);
      
      await pool.query(
        'UPDATE licenses SET hardware_fingerprint = ?, activated_at = NOW(), expires_at = ? WHERE id = ?',
        [hardware_fingerprint, expiresAt, license.id]
      );
      
      license.expires_at = expiresAt;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '激活成功',
      data: {
        license_key: license.license_key,
        expires_at: license.expires_at
      }
    });
  } catch (error) {
    console.error('激活错误:', error);
    return NextResponse.json({ success: false, error: '激活失败' }, { status: 500 });
  }
}

