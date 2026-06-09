-- ============================================================
-- FlowRev DB Migration 0007: RLSポリシー（§9 / セキュリティ強化版）
-- 前提: 0006 を実行済み
-- 全主要テーブルに USING（参照）と WITH CHECK（書き込み）を設定しテナント越えを二重防止。
-- 仕様書 §9 に対し以下を強化:
--   * white_label_owner 向け参照に role チェックを追加（client_owner の越境を遮断）
--   * scenario_steps を親シナリオの所有クライアントで厳密化
--   * customer に purchases の参照ポリシーを追加（購入済み講座の閲覧を可能に）
--   * user_profiles 更新で role / テナントID の改竄を禁止
--   * 全ポリシーを DROP ... IF EXISTS で再実行可能に
-- ============================================================

-- ========================================
-- user_profiles
-- ========================================
DROP POLICY IF EXISTS "自分のプロフィール参照" ON user_profiles;
CREATE POLICY "自分のプロフィール参照" ON user_profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "system_admin：全参照" ON user_profiles;
CREATE POLICY "system_admin：全参照" ON user_profiles
  FOR SELECT USING (get_user_role() = 'system_admin');

-- 本人は更新できるが、role / white_label_id / client_id は変更不可（権限・テナント昇格防止）。
-- get_user_*() はコミット済みの自分の行を返すため、NEW 値が現在値と一致する場合のみ許可。
DROP POLICY IF EXISTS "自分のプロフィール更新" ON user_profiles;
CREATE POLICY "自分のプロフィール更新" ON user_profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = get_user_role()
    AND white_label_id IS NOT DISTINCT FROM get_user_white_label_id()
    AND client_id IS NOT DISTINCT FROM get_user_client_id()
  );

DROP POLICY IF EXISTS "system_admin：プロフィール全操作" ON user_profiles;
CREATE POLICY "system_admin：プロフィール全操作" ON user_profiles
  FOR ALL USING (get_user_role() = 'system_admin')
  WITH CHECK (get_user_role() = 'system_admin');

-- ========================================
-- white_labels
-- ========================================
DROP POLICY IF EXISTS "white_label_owner：自テナント参照" ON white_labels;
CREATE POLICY "white_label_owner：自テナント参照" ON white_labels
  FOR SELECT USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "client_owner：所属テナント参照" ON white_labels;
CREATE POLICY "client_owner：所属テナント参照" ON white_labels
  FOR SELECT USING (id = get_user_white_label_id());

DROP POLICY IF EXISTS "system_admin：全操作" ON white_labels;
CREATE POLICY "system_admin：全操作" ON white_labels
  FOR ALL USING (get_user_role() = 'system_admin')
  WITH CHECK (get_user_role() = 'system_admin');

-- ========================================
-- clients
-- ========================================
DROP POLICY IF EXISTS "client_owner：自クライアント参照" ON clients;
CREATE POLICY "client_owner：自クライアント参照" ON clients
  FOR SELECT USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "white_label_owner：配下クライアント参照" ON clients;
CREATE POLICY "white_label_owner：配下クライアント参照" ON clients
  FOR SELECT USING (
    white_label_id = get_user_white_label_id()
    AND get_user_role() = 'white_label_owner'
  );

DROP POLICY IF EXISTS "white_label_owner：配下クライアント作成" ON clients;
CREATE POLICY "white_label_owner：配下クライアント作成" ON clients
  FOR INSERT WITH CHECK (
    white_label_id = get_user_white_label_id()
    AND get_user_role() = 'white_label_owner'
  );

DROP POLICY IF EXISTS "system_admin：全操作" ON clients;
CREATE POLICY "system_admin：全操作" ON clients
  FOR ALL USING (get_user_role() = 'system_admin')
  WITH CHECK (get_user_role() = 'system_admin');

-- ========================================
-- invitations
-- ========================================
DROP POLICY IF EXISTS "white_label_owner：自テナントの招待管理" ON invitations;
CREATE POLICY "white_label_owner：自テナントの招待管理" ON invitations
  FOR ALL
  USING (
    white_label_id = get_user_white_label_id()
    AND get_user_role() = 'white_label_owner'
  )
  WITH CHECK (
    white_label_id = get_user_white_label_id()
    AND get_user_role() = 'white_label_owner'
  );

DROP POLICY IF EXISTS "system_admin：全操作" ON invitations;
CREATE POLICY "system_admin：全操作" ON invitations
  FOR ALL USING (get_user_role() = 'system_admin')
  WITH CHECK (get_user_role() = 'system_admin');

-- ========================================
-- products
-- ========================================
DROP POLICY IF EXISTS "client_owner：自商品のみ操作" ON products;
CREATE POLICY "client_owner：自商品のみ操作" ON products
  FOR ALL
  USING (
    client_id = get_user_client_id()
    AND get_user_role() = 'client_owner'
  )
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
    AND get_user_role() = 'client_owner'
  );

DROP POLICY IF EXISTS "white_label_owner：配下商品参照" ON products;
CREATE POLICY "white_label_owner：配下商品参照" ON products
  FOR SELECT USING (
    white_label_id = get_user_white_label_id()
    AND get_user_role() = 'white_label_owner'
  );

DROP POLICY IF EXISTS "system_admin：全参照" ON products;
CREATE POLICY "system_admin：全参照" ON products
  FOR SELECT USING (get_user_role() = 'system_admin');

-- ========================================
-- landing_pages
-- ========================================
DROP POLICY IF EXISTS "client_owner：自LPのみ操作" ON landing_pages;
CREATE POLICY "client_owner：自LPのみ操作" ON landing_pages
  FOR ALL
  USING (
    client_id = get_user_client_id()
    AND get_user_role() = 'client_owner'
  )
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
    AND get_user_role() = 'client_owner'
  );

DROP POLICY IF EXISTS "white_label_owner：配下LP参照" ON landing_pages;
CREATE POLICY "white_label_owner：配下LP参照" ON landing_pages
  FOR SELECT USING (
    white_label_id = get_user_white_label_id()
    AND get_user_role() = 'white_label_owner'
  );

-- ========================================
-- customers
-- ========================================
DROP POLICY IF EXISTS "client_owner：自顧客のみ操作" ON customers;
CREATE POLICY "client_owner：自顧客のみ操作" ON customers
  FOR ALL
  USING (
    client_id = get_user_client_id()
    AND get_user_role() = 'client_owner'
  )
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
    AND get_user_role() = 'client_owner'
  );

DROP POLICY IF EXISTS "customer：自分のレコード参照" ON customers;
CREATE POLICY "customer：自分のレコード参照" ON customers
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "white_label_owner：配下顧客参照" ON customers;
CREATE POLICY "white_label_owner：配下顧客参照" ON customers
  FOR SELECT USING (
    white_label_id = get_user_white_label_id()
    AND get_user_role() = 'white_label_owner'
  );

-- ========================================
-- purchases
-- ========================================
DROP POLICY IF EXISTS "client_owner：自購入記録のみ操作" ON purchases;
CREATE POLICY "client_owner：自購入記録のみ操作" ON purchases
  FOR ALL
  USING (
    client_id = get_user_client_id()
    AND get_user_role() = 'client_owner'
  )
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
    AND get_user_role() = 'client_owner'
  );

DROP POLICY IF EXISTS "white_label_owner：配下購入記録参照" ON purchases;
CREATE POLICY "white_label_owner：配下購入記録参照" ON purchases
  FOR SELECT USING (
    white_label_id = get_user_white_label_id()
    AND get_user_role() = 'white_label_owner'
  );

-- 顧客が自分の購入記録を参照可能に（courses/lessons の購入済み判定に必須）
DROP POLICY IF EXISTS "customer：自分の購入記録参照" ON purchases;
CREATE POLICY "customer：自分の購入記録参照" ON purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = purchases.customer_id AND c.user_id = auth.uid()
    )
  );

-- ========================================
-- courses
-- ========================================
DROP POLICY IF EXISTS "client_owner：コース操作" ON courses;
CREATE POLICY "client_owner：コース操作" ON courses
  FOR ALL
  USING (
    client_id = get_user_client_id()
    AND get_user_role() = 'client_owner'
  )
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
    AND get_user_role() = 'client_owner'
  );

DROP POLICY IF EXISTS "white_label_owner：配下コース参照" ON courses;
CREATE POLICY "white_label_owner：配下コース参照" ON courses
  FOR SELECT USING (
    white_label_id = get_user_white_label_id()
    AND get_user_role() = 'white_label_owner'
  );

DROP POLICY IF EXISTS "customer：購入済みコース参照" ON courses;
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
DROP POLICY IF EXISTS "client_owner：レッスン操作" ON lessons;
CREATE POLICY "client_owner：レッスン操作" ON lessons
  FOR ALL
  USING (
    client_id = get_user_client_id()
    AND get_user_role() = 'client_owner'
  )
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
    AND get_user_role() = 'client_owner'
  );

DROP POLICY IF EXISTS "white_label_owner：配下レッスン参照" ON lessons;
CREATE POLICY "white_label_owner：配下レッスン参照" ON lessons
  FOR SELECT USING (
    white_label_id = get_user_white_label_id()
    AND get_user_role() = 'white_label_owner'
  );

DROP POLICY IF EXISTS "customer：購入済みレッスン参照" ON lessons;
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
DROP POLICY IF EXISTS "customer：自分の進捗のみ操作" ON lesson_progress;
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

DROP POLICY IF EXISTS "client_owner：進捗参照" ON lesson_progress;
CREATE POLICY "client_owner：進捗参照" ON lesson_progress
  FOR SELECT USING (
    white_label_id = get_user_white_label_id()
    AND get_user_role() IN ('client_owner', 'white_label_owner')
  );

-- ========================================
-- follow_scenarios
-- ========================================
DROP POLICY IF EXISTS "client_owner：シナリオ操作" ON follow_scenarios;
CREATE POLICY "client_owner：シナリオ操作" ON follow_scenarios
  FOR ALL
  USING (
    client_id = get_user_client_id()
    AND get_user_role() = 'client_owner'
  )
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
    AND get_user_role() = 'client_owner'
  );

DROP POLICY IF EXISTS "white_label_owner：配下シナリオ参照" ON follow_scenarios;
CREATE POLICY "white_label_owner：配下シナリオ参照" ON follow_scenarios
  FOR SELECT USING (
    white_label_id = get_user_white_label_id()
    AND get_user_role() = 'white_label_owner'
  );

-- ========================================
-- scenario_steps（親シナリオの所有クライアントで厳密化）
-- ========================================
DROP POLICY IF EXISTS "client_owner：ステップ操作" ON scenario_steps;
CREATE POLICY "client_owner：ステップ操作" ON scenario_steps
  FOR ALL
  USING (
    get_user_role() = 'client_owner'
    AND EXISTS (
      SELECT 1 FROM follow_scenarios s
      WHERE s.id = scenario_steps.scenario_id
        AND s.client_id = get_user_client_id()
    )
  )
  WITH CHECK (
    get_user_role() = 'client_owner'
    AND EXISTS (
      SELECT 1 FROM follow_scenarios s
      WHERE s.id = scenario_steps.scenario_id
        AND s.client_id = get_user_client_id()
        AND s.white_label_id = get_user_white_label_id()
    )
  );

DROP POLICY IF EXISTS "white_label_owner：配下ステップ参照" ON scenario_steps;
CREATE POLICY "white_label_owner：配下ステップ参照" ON scenario_steps
  FOR SELECT USING (
    white_label_id = get_user_white_label_id()
    AND get_user_role() = 'white_label_owner'
  );

-- ========================================
-- payment_providers / bank_transfer_settings
-- ========================================
DROP POLICY IF EXISTS "client_owner：決済設定操作" ON payment_providers;
CREATE POLICY "client_owner：決済設定操作" ON payment_providers
  FOR ALL
  USING (
    client_id = get_user_client_id()
    AND get_user_role() = 'client_owner'
  )
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
    AND get_user_role() = 'client_owner'
  );

DROP POLICY IF EXISTS "client_owner：銀行振込設定操作" ON bank_transfer_settings;
CREATE POLICY "client_owner：銀行振込設定操作" ON bank_transfer_settings
  FOR ALL
  USING (
    client_id = get_user_client_id()
    AND get_user_role() = 'client_owner'
  )
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
    AND get_user_role() = 'client_owner'
  );

-- ========================================
-- stripe_accounts / payment_logs はRLS有効化のみ（ポリシーは決済実装フェーズ）
-- ========================================
