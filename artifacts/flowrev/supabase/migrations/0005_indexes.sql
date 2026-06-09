-- ============================================================
-- FlowRev DB Migration 0005: インデックス定義（§15）
-- 前提: 0001〜0004 を実行済み
-- ============================================================

-- 商品
CREATE INDEX idx_products_client_id ON products(client_id);
CREATE INDEX idx_products_white_label_id ON products(white_label_id);
CREATE INDEX idx_products_status ON products(status);

-- LP
CREATE INDEX idx_landing_pages_client_id ON landing_pages(client_id);
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);

-- 顧客
CREATE INDEX idx_customers_client_id ON customers(client_id);
CREATE INDEX idx_customers_white_label_id ON customers(white_label_id);
CREATE INDEX idx_customers_last_action_at ON customers(last_action_at);  -- 未アクション顧客抽出
CREATE INDEX idx_customers_email ON customers(email);

-- 購入
CREATE INDEX idx_purchases_customer_id ON purchases(customer_id);
CREATE INDEX idx_purchases_client_id ON purchases(client_id);
CREATE INDEX idx_purchases_payment_status ON purchases(payment_status);

-- 会員サイト
CREATE INDEX idx_courses_client_id ON courses(client_id);
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lesson_progress_customer_id ON lesson_progress(customer_id);
CREATE INDEX idx_lesson_progress_course_id ON lesson_progress(course_id);

-- シナリオログ
CREATE INDEX idx_scenario_logs_customer_id ON scenario_logs(customer_id);
CREATE INDEX idx_scenario_logs_status ON scenario_logs(status);
CREATE INDEX idx_scenario_logs_created_at ON scenario_logs(created_at);

-- 招待
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_status ON invitations(status);

-- レートリミット
CREATE INDEX idx_rate_limits_key ON rate_limits(key);
CREATE INDEX idx_rate_limits_window_start ON rate_limits(window_start);
