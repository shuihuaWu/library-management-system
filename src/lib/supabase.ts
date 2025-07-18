import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
// 导入数据库类型
import { Database } from './database.types'

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// 创建服务器端Supabase客户端
export const createServerClient = () => {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        // 添加debug选项，启用SQL日志
        debug: true
      }
    }
  );
  return supabase;
}

// 创建浏览器端Supabase客户端
export const createBrowserSupabaseClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
} 