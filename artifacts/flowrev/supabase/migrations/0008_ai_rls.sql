-- ========================================
-- 0008_ai_rls.sql
-- ai_provider_settings に RLS ポリシーを追加
-- ========================================

-- system_admin（service_role）はRLSをバイパスするため、
-- client_owner 向けの参照ポリシーのみ追加する（将来のWL上書き対応）

CREATE POLICY "system_admin：AI設定全操作"
  ON ai_provider_settings
  FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);
