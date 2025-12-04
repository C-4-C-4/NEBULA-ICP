DROP TABLE IF EXISTS sites;
DROP TABLE IF EXISTS submission_logs;

-- 站点表 (status字段现在很重要: active, pending, rejected)
CREATE TABLE sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL,
  title TEXT,
  description TEXT,
  owner TEXT,
  email TEXT,
  logo_url TEXT,
  snapshot_url TEXT,
  icp_code TEXT,
  auth_code TEXT,
  status TEXT DEFAULT 'active', -- active(正常), pending(待审核), rejected(黑名单/驳回)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_hidden INTEGER DEFAULT 0
);

-- 提交日志表 (用于限流)
CREATE TABLE submission_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入管理员数据
INSERT INTO sites (domain, title, description, owner, icp_code, auth_code, is_hidden) 
VALUES ('system.admin', '控制台', '系统保留', 'ROOT', '000000', 'ADMINKEY', 1);