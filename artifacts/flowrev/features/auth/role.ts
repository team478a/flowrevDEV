export type UserRole =
  | "system_admin"
  | "white_label_owner"
  | "client_owner"
  | "customer";

/**
 * ロールごとのホーム画面パス。
 * ログイン後のリダイレクト先、および権限外アクセス時の戻り先に使用する。
 * 不明なロール・未設定の場合は client_owner のダッシュボードを既定とする。
 */
export function roleHomePath(role: string | null | undefined): string {
  switch (role) {
    case "system_admin":
      return "/admin/dashboard";
    case "white_label_owner":
      return "/wl/dashboard";
    case "customer":
      return "/my";
    case "client_owner":
    default:
      return "/dashboard";
  }
}
