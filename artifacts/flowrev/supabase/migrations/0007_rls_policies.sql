-- ============================================================
-- FlowRev DB Migration 0007: RLSポリシー（§9）
-- 前提: 0006 を実行済み
-- 全主要テーブルに USING（参照）と WITH CHECK（書き込み）を設定しテナント越えを二重防止
-- ============================================================

-- ========================================
-- user_profiles
-- ========================================
CREATE POLICY "自分のプロフィール参照" ON user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "system_admin：全参照" ON user_profiles
  FOR SELECT USING (get_user_role() = 'system_admin');

CREATE POLICY "自分のプロフィール更新" ON user_profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ========================================
-- white_labels
-- ========================================
CREATE POLICY "white_label_owner：自テナント参照" ON white_labels
  FOR SELECT USING (owner_user_id = auth.uid());

CREATE POLICY "client_owner：所属テナント参照" ON white_labels
  FOR SELECT USING (id = get_user_white_label_id());

CREATE POLICY "system_admin：全操作" ON white_labels
  FOR ALL USING (get_user_role() = 'system_admin')
  WITH CHECK (get_user_role() = 'system_admin');

-- ========================================
-- clients
-- ========================================
CREATE POLICY "client_owner：自クライアント参照" ON clients
  FOR SELECT USING (owner_user_id = auth.uid());

CREATE POLICY "white_label_owner：配下クライアント参照" ON clients
  FOR SELECT USING (
    white_label_id = get_user_white_label_id()
    AND get_user_role() = 'white_label_owner'
  );

CREATE POLICY "white_label_owner：配下クライアント作成" ON clients
  FOR INSERT WITH CHECK (
    white_label_id = get_user_white_label_id()
    AND get_user_role() = 'white_label_owner'
  );

CREATE POLICY "system_admin：全操作" ON clients
  FOR ALL USING (get_user_role() = 'system_admin')
  WITH CHECK (get_user_role() = 'system_admin');

-- ========================================
-- invitations
-- ========================================
CREATE POLICY "white_label_owner：自テナントの招待管理" ON invitations
  FOR ALL
  USING (white_label_id = get_user_white_label_id())
  WITH CHECK (white_label_id = get_user_white_label_id());

CREATE POLICY "system_admin：全操作" ON invitations
  FOR ALL USING (get_user_role() = 'system_admin')
  WITH CHECK (get_user_role() = 'system_admin');

-- ========================================
-- products
-- ========================================
CREATE POLICY "client_owner：自商品のみ操作" ON products
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

CREATE POLICY "white_label_owner：配下商品参照" ON products
  FOR SELECT USING (white_label_id = get_user_white_label_id());

CREATE POLICY "system_admin：全参照" ON products
  FOR SELECT USING (get_user_role() = 'system_admin');

-- ========================================
-- landing_pages
-- ========================================
CREATE POLICY "client_owner：自LPのみ操作" ON landing_pages
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

CREATE POLICY "white_label_owner：配下LP参照" ON landing_pages
  FOR SELECT USING (white_label_id = get_user_white_label_id());

-- ========================================
-- customers
-- ========================================
CREATE POLICY "client_owner：自顧客のみ操作" ON customers
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

CREATE POLICY "customer：自分のレコード参照" ON customers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "white_label_owner：配下顧客参照" ON customers
  FOR SELECT USING (white_label_id = get_user_white_label_id());

-- ========================================
-- purchases
-- ========================================
CREATE POLICY "client_owner：自購入記録のみ操作" ON purchases
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

CREATE POLICY "white_label_owner：配下購入記録参照" ON purchases
  FOR SELECT USING (white_label_id = get_user_white_label_id());

-- ========================================
-- courses
-- ========================================
CREATE POLICY "client_owner：コース操作" ON courses
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

CREATE POLICY "customer：購入済みコース参照" ON courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM purchases p
      JOIN customers c ON c.id = p.customer_id
      WHERE p.product_id = courses.product_id
        AND c.user_id = auth.uid()
        AND p.payment_status = 'paid'
    )
  );

-- ========================================
-- lessons
-- ========================================
CREATE POLICY "client_owner：レッスン操作" ON lessons
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

CREATE POLICY "customer：購入済みレッスン参照" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses co
      JOIN purchases p ON p.product_id = co.product_id
      JOIN customers c ON c.id = p.customer_id
      WHERE co.id = lessons.course_id
        AND c.user_id = auth.uid()
        AND p.payment_status = 'paid'
    )
  );

-- ========================================
-- lesson_progress
-- ========================================
CREATE POLICY "customer：自分の進捗のみ操作" ON lesson_progress
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = lesson_progress.customer_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = lesson_progress.customer_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "client_owner：進捗参照" ON lesson_progress
  FOR SELECT USING (white_label_id = get_user_white_label_id());

-- ========================================
-- follow_scenarios
-- ========================================
CREATE POLICY "client_owner：シナリオ操作" ON follow_scenarios
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

-- ========================================
-- scenario_steps
-- ========================================
CREATE POLICY "client_owner：ステップ操作" ON scenario_steps
  FOR ALL
  USING (white_label_id = get_user_white_label_id())
  WITH CHECK (white_label_id = get_user_white_label_id());

-- ========================================
-- payment_providers / bank_transfer_settings
-- ========================================
CREATE POLICY "client_owner：決済設定操作" ON payment_providers
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

CREATE POLICY "client_owner：銀行振込設定操作" ON bank_transfer_settings
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

-- ========================================
-- stripe_accounts / payment_logs はRLS有効化のみ（ポリシーは決済実装フェーズ）
-- ========================================
