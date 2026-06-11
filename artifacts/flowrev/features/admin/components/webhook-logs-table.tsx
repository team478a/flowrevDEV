import type { CloudflareWebhookLog, WebhookLogResult } from "@/lib/repositories/cloudflare-webhook-logs";

const RESULT_LABELS: Record<WebhookLogResult, { label: string; className: string }> = {
  success: { label: "成功", className: "bg-green-100 text-green-800" },
  sig_error: { label: "署名エラー", className: "bg-red-100 text-red-800" },
  db_error: { label: "DB エラー", className: "bg-orange-100 text-orange-800" },
  parse_error: { label: "パースエラー", className: "bg-yellow-100 text-yellow-800" },
};

interface WebhookLogsTableProps {
  logs: CloudflareWebhookLog[];
}

export function WebhookLogsTable({ logs }: WebhookLogsTableProps) {
  if (logs.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        まだ Webhook を受信していません。
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">受信日時</th>
            <th className="pb-2 pr-4 font-medium">動画 ID</th>
            <th className="pb-2 pr-4 font-medium">ステータス</th>
            <th className="pb-2 pr-4 font-medium">結果</th>
            <th className="pb-2 font-medium">詳細</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const resultMeta = RESULT_LABELS[log.result] ?? {
              label: log.result,
              className: "bg-gray-100 text-gray-700",
            };
            const receivedAt = new Date(log.received_at).toLocaleString("ja-JP", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
            return (
              <tr key={log.id} className="border-b border-border/50 last:border-0">
                <td className="py-2 pr-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {receivedAt}
                </td>
                <td className="py-2 pr-4 font-mono text-xs max-w-[9rem] truncate" title={log.video_id ?? ""}>
                  {log.video_id ?? <span className="text-muted-foreground">—</span>}
                </td>
                <td className="py-2 pr-4 text-xs">
                  {log.status ?? <span className="text-muted-foreground">—</span>}
                </td>
                <td className="py-2 pr-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${resultMeta.className}`}
                  >
                    {resultMeta.label}
                  </span>
                </td>
                <td className="py-2 text-xs text-muted-foreground max-w-[12rem] truncate" title={log.detail ?? ""}>
                  {log.detail ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
