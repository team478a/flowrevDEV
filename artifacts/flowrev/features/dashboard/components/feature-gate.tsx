interface Props {
  featureName: string;
}

export function FeatureDisabledMessage({ featureName }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <span className="text-3xl">🔒</span>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">
          このプランでは使用できません
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          「{featureName}」はご利用のプランに含まれていません。<br />
          アップグレードについては管理者にお問い合わせください。
        </p>
      </div>
    </div>
  );
}
