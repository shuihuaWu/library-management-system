// 用户角色类型
export type UserRole = 'admin' | 'user' | null;

// 用户信息类型
export interface UserInfo {
  id: string;
  email: string;
  username: string | null;
  role: UserRole;
}

// 权限设置
export const PERMISSIONS = {
  // 图书管理权限
  BOOKS: {
    CREATE: ['admin'],
    UPDATE: ['admin'],
    DELETE: ['admin'],
    READ: ['admin', 'user'],
  },
  // 作者管理权限
  AUTHORS: {
    CREATE: ['admin'],
    UPDATE: ['admin'],
    DELETE: ['admin'],
    READ: ['admin', 'user'],
  },
  // 分类管理权限
  CATEGORIES: {
    CREATE: ['admin'],
    UPDATE: ['admin'],
    DELETE: ['admin'],
    READ: ['admin', 'user'],
  },
  // 借阅记录权限
  BORROW_RECORDS: {
    CREATE: ['admin', 'user'],
    UPDATE: ['admin'],
    DELETE: ['admin'],
    READ_ALL: ['admin'],
    READ_OWN: ['user'],
  },
}; 