import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// 验证许可证（桌面应用每次启动时调用）
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

    // 检查是否过期
    if (new Date(license.expires_at) < new Date()) {
      return NextResponse.json({
        success: false,
        error: '许可证已过期'
      }, { status: 403 });
    }

    // 检查硬件指纹和微信号是否匹配
    if (license.hardware_fingerprint !== hardware_fingerprint) {
      return NextResponse.json({
        success: false,
        error: '硬件指纹不匹配'
      }, { status: 403 });
    }

    const activeClientIds = license.client_id
      ? license.client_id.split(',').map(id => id.trim()).filter(Boolean)
      : [];

    if (!activeClientIds.includes(client_id)) {
      return NextResponse.json({
        success: false,
        error: '账号不匹配'
      }, { status: 403 });
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
      message: '验证通过',
      data: {
        license_key: license.license_key,
        expires_at: license.expires_at,
        client_id: client_id,
        max_accounts: license.max_accounts,
        signature: signature
      }
    });
  } catch (error) {
    console.error('验证错误:', error);
    return NextResponse.json({ success: false, error: '验证失败' }, { status: 500 });
  }
}

