import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// 激活许可证（桌面应用调用）
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
    
    // 检查是否已经绑定其他机器
    if (license.hardware_fingerprint && license.hardware_fingerprint !== hardware_fingerprint) {
      return NextResponse.json({ 
        success: false, 
        error: '许可证已绑定其他设备' 
      }, { status: 403 });
    }

    // 解析已绑定的账号 ID
    const activeClientIds = license.client_id 
      ? license.client_id.split(',').map(id => id.trim()).filter(Boolean) 
      : [];

    const isAlreadyBound = activeClientIds.includes(client_id);
    const maxAccounts = Math.max(license.max_accounts || 10, 10);

    if (!isAlreadyBound && activeClientIds.length >= maxAccounts) {
      return NextResponse.json({
        success: false,
        error: `该许可证最多只能绑定 ${maxAccounts} 个 WhatsApp 账号，第 11 个需要使用另一个许可证`
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
      
      const updatedClientIds = [client_id];
      const updatedClientIdStr = updatedClientIds.join(',');
      
      await pool.query(
        'UPDATE licenses SET hardware_fingerprint = ?, client_id = ?, activated_at = NOW(), expires_at = ? WHERE id = ?',
        [hardware_fingerprint, updatedClientIdStr, expiresAt, license.id]
      );
      
      license.expires_at = expiresAt;
      license.client_id = updatedClientIdStr;
    } else if (!isAlreadyBound) {
      // 同一台设备绑定新账号
      const updatedClientIds = [...activeClientIds, client_id];
      const updatedClientIdStr = updatedClientIds.join(',');
      
      await pool.query(
        'UPDATE licenses SET client_id = ? WHERE id = ?',
        [updatedClientIdStr, license.id]
      );
      
      license.client_id = updatedClientIdStr;
    }
    
    // Generate signature
    const privateKey = process.env.LICENSE_PRIVATE_KEY
      ? process.env.LICENSE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : '';
    
    let signature = '';
    if (privateKey) {
      try {
        const formattedDate = new Date(license.expires_at).toISOString();
        const signData = `${license.license_key}|${formattedDate}|${hardware_fingerprint}|${client_id}`;
        signature = crypto.sign("sha256", Buffer.from(signData), privateKey).toString('base64');
      } catch (signErr) {
        console.error('Error generating signature:', signErr);
      }
    } else {
      console.error('LICENSE_PRIVATE_KEY is missing on server!');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '激活成功',
      data: {
        license_key: license.license_key,
        expires_at: license.expires_at,
        client_id: client_id,
        max_accounts: license.max_accounts,
        signature: signature
      }
    });
  } catch (error) {
    console.error('激活错误:', error);
    return NextResponse.json({ success: false, error: '激活失败' }, { status: 500 });
  }
}

