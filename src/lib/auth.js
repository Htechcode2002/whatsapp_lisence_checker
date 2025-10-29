import { NextResponse } from 'next/server';

/**
 * 验证管理员 API 密钥
 * @param {Request} request - Next.js 请求对象
 * @returns {NextResponse|null} - 如果验证失败返回错误响应，成功返回 null
 */
export function verifyAdminAuth(request) {
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.ADMIN_API_KEY;
  
  // 检查环境变量是否配置
  if (!apiKey) {
    console.error('⚠️ ADMIN_API_KEY 未在环境变量中配置');
    return NextResponse.json(
      { success: false, error: '服务器配置错误' },
      { status: 500 }
    );
  }
  
  // 检查是否提供了认证头
  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: '缺少认证信息' },
      { status: 401 }
    );
  }
  
  // 验证格式: "Bearer your-api-key"
  const token = authHeader.replace('Bearer ', '');
  
  if (token !== apiKey) {
    return NextResponse.json(
      { success: false, error: '无效的 API 密钥' },
      { status: 403 }
    );
  }
  
  // 验证通过
  return null;
}

