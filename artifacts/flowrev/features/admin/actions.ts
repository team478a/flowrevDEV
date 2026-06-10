/**
 * admin/actions.ts — バレルファイル
 * 後方互換のため、機能別モジュールからすべてを再エクスポートする。
 * ※ "use server" はここに書かず、各実装ファイルに委ねる。
 */
export type {
  CreateWhiteLabelState,
  UpdateWhiteLabelState,
  DeleteWhiteLabelState,
  ToggleWLStatusState,
} from "./actions/white-label-actions";
export {
  createWhiteLabelAction,
  updateWhiteLabelAction,
  deleteWhiteLabelAction,
  toggleWhiteLabelStatusAction,
} from "./actions/white-label-actions";
export type { CreatePlanState } from "./actions/plan-actions";
export { createPlanAction } from "./actions/plan-actions";
export type { SaveEmailSettingState } from "./actions/email-actions";
export { saveEmailSettingAction } from "./actions/email-actions";
