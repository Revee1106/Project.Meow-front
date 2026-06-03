import { t } from "../../i18n/strings";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";

type QueryErrorStateProps = {
  onRetry: () => void;
};

export function QueryLoadingState() {
  return <div className="page-loading" aria-label={t("state.loading")} />;
}

export function QueryErrorState({ onRetry }: QueryErrorStateProps) {
  return (
    <EmptyState
      title={t("state.error.title")}
      body={t("state.error.body")}
      action={
        <Button small variant="secondary" onClick={onRetry}>
          {t("common.retry")}
        </Button>
      }
    />
  );
}
