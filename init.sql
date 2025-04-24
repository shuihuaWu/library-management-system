-- 启用UUID扩展（确保能使用UUID类型）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建 authors 表
CREATE TABLE IF NOT EXISTS authors (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    biography TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建 categories 表
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建 profiles 表（扩展用户信息）
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建 books 表
CREATE TABLE IF NOT EXISTS books (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author_id BIGINT NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    isbn TEXT,
    publisher TEXT,
    publication_date DATE,
    description TEXT,
    cover_image_url TEXT,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建 borrow_records 表
CREATE TABLE IF NOT EXISTS borrow_records (
    id BIGSERIAL PRIMARY KEY,
    book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 为常用查询字段创建索引
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_borrow_records_book_id ON borrow_records(book_id);
CREATE INDEX IF NOT EXISTS idx_borrow_records_user_id ON borrow_records(user_id);
CREATE INDEX IF NOT EXISTS idx_borrow_records_return_date ON borrow_records(return_date);

-- 启用行级安全策略(RLS)
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrow_records ENABLE ROW LEVEL SECURITY;

-- 所有表的通用查询策略：允许所有认证用户查询数据
CREATE POLICY "允许所有认证用户查询作者" ON authors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "允许所有认证用户查询分类" ON categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "允许所有认证用户查询图书" ON books FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "允许所有认证用户查询借阅记录" ON borrow_records FOR SELECT USING (auth.role() = 'authenticated');

-- profiles表特殊策略：用户只能查看/编辑自己的资料
CREATE POLICY "用户只能查看自己的资料" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "用户只能更新自己的资料" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "允许用户创建自己的资料" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 管理员角色的策略（取决于你的角色管理方式）
CREATE POLICY "管理员可以对作者进行增删改" ON authors FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "管理员可以对分类进行增删改" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "管理员可以对图书进行增删改" ON books FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "管理员可以管理所有借阅记录" ON borrow_records FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 用户对自己借阅记录的管理策略
CREATE POLICY "用户可以查看自己的借阅记录" ON borrow_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户可以创建自己的借阅记录" ON borrow_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户可以更新自己的借阅记录" ON borrow_records FOR UPDATE USING (auth.uid() = user_id);

-- 触发器：更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_authors_updated_at
BEFORE UPDATE ON authors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at
BEFORE UPDATE ON books
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_borrow_records_updated_at
BEFORE UPDATE ON borrow_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 为新注册用户自动创建profile记录的触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, role, created_at, updated_at)
    VALUES (NEW.id, NEW.email, 'user', now(), now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();




-- 添加权限

-- 1. 确保所有表启用了 RLS
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrow_records ENABLE ROW LEVEL SECURITY;

-- 2. 为 authors 表添加策略
CREATE POLICY "允许所有用户查看作者" ON authors
  FOR SELECT USING (true);

CREATE POLICY "允许认证用户插入作者" ON authors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "允许认证用户更新作者" ON authors
  FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "允许认证用户删除作者" ON authors
  FOR DELETE USING (auth.role() = 'authenticated');

-- 3. 为 books 表添加策略  
CREATE POLICY "允许所有用户查看图书" ON books
  FOR SELECT USING (true);

CREATE POLICY "允许认证用户插入图书" ON books
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "允许认证用户更新图书" ON books
  FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "允许认证用户删除图书" ON books
  FOR DELETE USING (auth.role() = 'authenticated');

-- 4. 为 categories 表添加策略
CREATE POLICY "允许所有用户查看分类" ON categories
  FOR SELECT USING (true);

CREATE POLICY "允许认证用户插入分类" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "允许认证用户更新分类" ON categories
  FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "允许认证用户删除分类" ON categories
  FOR DELETE USING (auth.role() = 'authenticated');

-- 5. 为 borrow_records 表添加策略
CREATE POLICY "允许所有用户查看借阅记录" ON borrow_records
  FOR SELECT USING (true);

CREATE POLICY "允许认证用户插入借阅记录" ON borrow_records
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "允许认证用户更新借阅记录" ON borrow_records
  FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "允许认证用户删除借阅记录" ON borrow_records
  FOR DELETE USING (auth.role() = 'authenticated');


-- 1. 确保启用profiles表的RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. 创建一个允许匿名用户查询所有profiles记录的策略
CREATE POLICY "允许匿名读取所有用户信息" 
ON profiles FOR SELECT 
TO anon
USING (true);

-- 3. 创建允许已认证用户查询所有profiles记录的策略
CREATE POLICY "允许已认证用户读取所有用户信息" 
ON profiles FOR SELECT 
TO authenticated
USING (true);

-- 4. 创建只允许用户更新自己profile的策略
CREATE POLICY "用户只能更新自己的信息" 
ON profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. 创建只允许用户删除自己profile的策略
CREATE POLICY "用户只能删除自己的信息" 
ON profiles FOR DELETE 
TO authenticated
USING (auth.uid() = id);

-- 6. 创建允许已认证用户创建自己profile的策略
CREATE POLICY "用户只能创建自己的信息" 
ON profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);