import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';

// 使用 nanoid 生成高质量随机密钥（碰撞概率极低，无需预先检查）
const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 16);

function generateLicenseKey() {
  // 生成16位随机字符串，然后格式化为 XXXX-XXXX-XXXX-XXXX
  const key = nanoid();
  return key.match(/.{1,4}/g).join('-');
}

// 获取所有许可证
export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        license_key,
        valid_days,
        expires_at,
        hardware_fingerprint,
        CASE 
          WHEN hardware_fingerprint IS NOT NULL THEN '已激活'
          ELSE '未激活'
        END AS status,
        activated_at,
        created_at
      FROM licenses
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('数据库错误:', error);
    return NextResponse.json({ success: false, error: '获取数据失败' }, { status: 500 });
  }
}

// 创建新许可证
export async function POST(request) {
  try {
    const { days = 365 } = await request.json();
    
    // 使用 nanoid 直接生成密钥（无需预先检查数据库）
    const licenseKey = generateLicenseKey();
    
    // 直接插入数据库（只存储有效天数，过期时间在激活时计算）
    await pool.query(
      'INSERT INTO licenses (license_key, valid_days) VALUES (?, ?)',
      [licenseKey, parseInt(days)]
    );
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        license_key: licenseKey,
        valid_days: parseInt(days)
      } 
    });
  } catch (error) {
    // 如果极小概率遇到重复密钥（数据库 UNIQUE 约束报错），递归重试
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('密钥重复，重新生成...');
      return POST(request);
    }
    
    console.error('创建许可证错误:', error);
    return NextResponse.json({ success: false, error: '创建失败' }, { status: 500 });
  }
}

