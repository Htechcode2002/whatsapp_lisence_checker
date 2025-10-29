/**
 * 客户端认证工具
 */

// 保存 token 到本地存储
export function saveToken(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_token', token);
  }
}

// 获取保存的 token
export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token');
  }
  return null;
}

// 删除 token（登出）
export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
  }
}

// 检查是否已登录
export function isLoggedIn() {
  return !!getToken();
}

// 创建带认证的 fetch 请求
export async function authFetch(url, options = {}) {
  const token = getToken();
  
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

