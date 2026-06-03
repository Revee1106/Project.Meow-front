import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../../stores/playerStore";
import { t, type StringKey } from "../../i18n/strings";

type BannerState = "free" | "garrisoning" | "battle" | "blocked";

type BannerConfig = {
  tone: "teal" | "purple" | "crimson";
  glyph: string;
  titleKey: StringKey;
  hintKey: StringKey;
};

const BANNER_CONFIG: Record<BannerState, BannerConfig> = {
  free: {
    tone: "teal",
    glyph: "F",
    titleKey: "state.free.title",
    hintKey: "state.free.hint",
  },
  garrisoning: {
    tone: "purple",
    glyph: "G",
    titleKey: "state.garrisoning.title",
    hintKey: "state.garrisoning.hint",
  },
  battle: {
    tone: "crimson",
    glyph: "B",
    titleKey: "state.inBattle.title",
    hintKey: "state.inBattle.hint",
  },
  blocked: {
    tone: "crimson",
    glyph: "!",
    titleKey: "state.blocked.title",
    hintKey: "state.blocked.hint",
  },
};

export function StateBanner() {
  const navigate = useNavigate();
  const player = usePlayerStore((store) => store.player);
  const state = player.state;
  const nodeNameKey = usePlayerStore((store) => store.garrisonNodeNameKey);
  const nodeName = t(nodeNameKey);
  const config = BANNER_CONFIG[state];

  const handleClick = () => {
    if (state === "free") {
      navigate("/floor/2");
      return;
    }

    if (state === "garrisoning") {
      navigate(
        player.garrisonNodeId
          ? `/garrison?nodeId=${player.garrisonNodeId}`
          : "/garrison",
      );
      return;
    }

    navigate("/battle/current");
  };

  return (
    <button
      className={`state-banner state-banner--${config.tone}`}
      type="button"
      onClick={handleClick}
    >
      <span className="state-banner__glyph" aria-hidden="true">
        {config.glyph}
      </span>
      <span className="state-banner__copy">
        <span className="state-banner__title">
          {t(config.titleKey, { nodeName })}
        </span>
        <span className="state-banner__hint">
          {t(config.hintKey, { nodeName })}
        </span>
      </span>
    </button>
  );
}
