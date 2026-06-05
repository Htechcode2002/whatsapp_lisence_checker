import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// 解绑许可证（当桌面应用删除本地账号时调用，释放该 Key 供同设备的下一个账号使用）
export async function POST(request) {
  try {
    const { license_key, hardware_fingerprint, client_id } = await request.json();
    
    if (!license_key || !hardware_fingerprint || !client_id) {
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
    
    const activeClientIds = license.client_id 
      ? license.client_id.split(',').map(id => id.trim()).filter(Boolean) 
      : [];

    // 安全检查：只有该设备且该客户端的请求才能解绑自己
    if (license.hardware_fingerprint !== hardware_fingerprint || !activeClientIds.includes(client_id)) {
      return NextResponse.json({ 
        success: false, 
        error: '无权解绑此许可证（绑定的设备或账号不匹配）' 
      }, { status: 403 });
    }
    
    // 执行解绑：从列表中移除当前 client_id，保留其他账号
    const updatedClientIds = activeClientIds.filter(id => id !== client_id);
    const updatedClientIdStr = updatedClientIds.length > 0 ? updatedClientIds.join(',') : null;

    await pool.query(
      'UPDATE licenses SET client_id = ? WHERE id = ?',
      [updatedClientIdStr, license.id]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: '解绑成功'
    });
  } catch (error) {
    console.error('解绑错误:', error);
    return NextResponse.json({ success: false, error: '解绑失败' }, { status: 500 });
  }
}
