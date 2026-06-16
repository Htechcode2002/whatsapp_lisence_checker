import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';
import { verifyAdminAuth } from '@/lib/auth';

// 使用 nanoid 生成高质量随机密钥（碰撞概率极低，无需预先检查）
const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 16);

function generateLicenseKey() {
  // 生成16位随机字符串，然后格式化为 XXXX-XXXX-XXXX-XXXX
  const key = nanoid();
  return key.match(/.{1,4}/g).join('-');
}

// 获取所有许可证
export async function GET(request) {
  // 验证管理员权限
  const authError = verifyAdminAuth(request);
  if (authError) return authError;
  
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        license_key,
        valid_days,
        expires_at,
        hardware_fingerprint,
        client_id,
        max_accounts,
        remark,
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
  // 验证管理员权限
  const authError = verifyAdminAuth(request);
  if (authError) return authError;
  
  try {
    const { days = 365, max_accounts = 10, quantity = 1, remark = null } = await request.json();
    
    const parsedDays = parseInt(days);
    const parsedMaxAccounts = parseInt(max_accounts);
    const parsedQuantity = Math.max(1, Math.min(100, parseInt(quantity) || 1)); // 限制单次最多100个
    
    const generatedKeys = [];
    
    for (let i = 0; i < parsedQuantity; i++) {
      let inserted = false;
      let retries = 0;
      
      while (!inserted && retries < 3) {
        try {
          const licenseKey = generateLicenseKey();
          await pool.query(
            'INSERT INTO licenses (license_key, valid_days, max_accounts, remark) VALUES (?, ?, ?, ?)',
            [licenseKey, parsedDays, parsedMaxAccounts, remark]
          );
          generatedKeys.push({
            license_key: licenseKey,
            valid_days: parsedDays,
            max_accounts: parsedMaxAccounts,
            remark: remark
          });
          inserted = true;
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log('密钥重复，重新生成...');
            retries++;
          } else {
            throw error;
          }
        }
      }
      
      if (!inserted) {
        throw new Error('生成密钥冲突次数过多');
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      data: generatedKeys,
      message: `成功生成 ${parsedQuantity} 个许可证`
    });
  } catch (error) {
    console.error('创建许可证错误:', error);
    return NextResponse.json({ success: false, error: error.message || '创建失败' }, { status: 500 });
  }
}

