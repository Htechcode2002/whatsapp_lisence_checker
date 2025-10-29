import { NextResponse } from 'next/server';

// 登录 API - 验证管理员密码
export async function POST(request) {
  try {
    const { password } = await request.json();
    
    const adminApiKey = process.env.ADMIN_API_KEY;
    
    if (!adminApiKey) {
      return NextResponse.json(
        { success: false, error: '服务器配置错误' },
        { status: 500 }
      );
    }
    
    // 验证密码是否匹配 API 密钥
    if (password === adminApiKey) {
      return NextResponse.json({ 
        success: true, 
        token: adminApiKey,
        message: '登录成功'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: '密码错误' 
      }, { status: 401 });
    }
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: '登录失败' 
    }, { status: 500 });
  }
}

