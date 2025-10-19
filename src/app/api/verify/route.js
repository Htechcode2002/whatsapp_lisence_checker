import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// 验证许可证（桌面应用每次启动时调用）
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
    
    // 检查是否过期
    if (new Date(license.expires_at) < new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: '许可证已过期' 
      }, { status: 403 });
    }
    
    // 检查硬件指纹是否匹配
    if (license.hardware_fingerprint !== hardware_fingerprint) {
      return NextResponse.json({ 
        success: false, 
        error: '硬件指纹不匹配' 
      }, { status: 403 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '验证通过',
      data: {
        license_key: license.license_key,
        expires_at: license.expires_at
      }
    });
  } catch (error) {
    console.error('验证错误:', error);
    return NextResponse.json({ success: false, error: '验证失败' }, { status: 500 });
  }
}

