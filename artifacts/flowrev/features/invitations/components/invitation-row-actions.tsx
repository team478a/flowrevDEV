"use client";

import { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import {
  deleteInvitationAction,
  resendInvitationAction,
  type InvitationMutationState,
} from "../actions";

const initialState: InvitationMutationState = { error: null };

interface Props {
  id: string;
  email: string;
  clientName: string;
  status: string;
}

export function InvitationRowActions({ id, email, clientName, status }: Props) {
  const [resendState, resendFormAction] = useFormState(resendInvitationAction, initialState);
  const [deleteState, deleteFormAction] = useFormState(deleteInvitationAction, initialState);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (status === "accepted") return null;

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        {/* 再送フォーム */}
        <form action={resendFormAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="clientName" value={clientName} />
          <button
            type="submit"
            className="inline-flex h-7 items-center rounded-md border border-input bg-background px-2 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-50"
          >
            再送
          </button>
        </form>

        {/* 削除 */}
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <form action={deleteFormAction}>
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                className="inline-flex h-7 items-center rounded-md bg-destructive px-2 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                削除する
              </button>
            </form>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="inline-flex h-7 items-center rounded-md border border-input bg-background px-2 text-xs font-medium transition-colors hover:bg-accent"
            >
              キャンセル
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex h-7 items-center rounded-md border border-destructive/30 bg-background px-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            削除
          </button>
        )}
      </div>

      {/* 再送エラー */}
      {resendState.error && (
        <p className="text-xs text-destructive">{resendState.error}</p>
      )}
      {/* 削除エラー */}
      {deleteState.error && (
        <p className="text-xs text-destructive">{deleteState.error}</p>
      )}

      {/* 再送成功: 新URL表示 */}
      {resendState.inviteUrl && (
        <div className="flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1">
          <span className="text-xs text-emerald-700 truncate max-w-[200px]">
            {resendState.emailSent ? "✉ 送信済み" : "URL:"}
          </span>
          <input
            readOnly
            value={resendState.inviteUrl}
            className="h-6 flex-1 rounded border border-input bg-background px-1 text-xs"
          />
          <button
            type="button"
            onClick={() => copyUrl(resendState.inviteUrl!)}
            className="shrink-0 text-xs text-emerald-700 hover:underline"
          >
            {copied ? "コピー済み" : "コピー"}
          </button>
        </div>
      )}
    </div>
  );
}
