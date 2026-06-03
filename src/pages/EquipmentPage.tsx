import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/game/EmptyState";
import { Button } from "../components/game/Button";
import {
  QueryErrorState,
  QueryLoadingState,
} from "../components/game/QueryState";
import { GearCard } from "../components/GearCard";
import { GearIcon } from "../components/GearIcon";
import { t } from "../i18n/strings";
import { useEquipGearMutation, useEquipmentQuery } from "../services/queries";
import type { Gear, GearSlot } from "../services/types";
import { usePlayerStore } from "../stores/playerStore";

const SLOT_ORDER: GearSlot[] = [
  "weapon",
  "helmet",
  "armor",
  "ring",
  "necklace",
  "boots",
];

export function EquipmentPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const playerCp = usePlayerStore((store) => store.player.cp);
  const equipmentQuery = useEquipmentQuery();
  const equipGear = useEquipGearMutation();
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get("gear"),
  );

  if (equipmentQuery.isLoading) {
    return <QueryLoadingState />;
  }

  if (equipmentQuery.isError || !equipmentQuery.data) {
    return <QueryErrorState onRetry={() => void equipmentQuery.refetch()} />;
  }

  const { equipped, backpack } = equipmentQuery.data;
  const selected = backpack.find((gear) => gear.id === selectedId) ?? null;
  const equippedForSelected = selected ? equipped[selected.slot] : null;
  const betterCount = backpack.filter((gear) => {
    const current = equipped[gear.slot];
    return (gear.cp ?? 0) > (current?.cp ?? 0);
  }).length;

  const selectGear = (gearId: string) => {
    setSelectedId(gearId);
    setSearchParams({ gear: gearId });
  };
  const closeCompare = () => {
    setSelectedId(null);
    setSearchParams({});
  };
  const equip = (gearId: string) => {
    equipGear.mutate(
      { gearId },
      {
        onSuccess: closeCompare,
      },
    );
  };
  const autoEquipBest = () => {
    const bestBySlot = SLOT_ORDER.flatMap((slot) => {
      const current = equipped[slot];
      const best = backpack
        .filter((gear) => gear.slot === slot)
        .sort((a, b) => (b.cp ?? 0) - (a.cp ?? 0))[0];

      return best && (best.cp ?? 0) > (current?.cp ?? 0) ? [best] : [];
    });

    if (bestBySlot[0]) {
      equip(bestBySlot[0].id);
    }
  };

  return (
    <div className="equipment-page">
      <header className="equipment-header">
        <div>
          <span>{t("equip.totalCP")}</span>
          <strong className="tw-display tw-num">{playerCp.toLocaleString()}</strong>
        </div>
        <button
          aria-label={t("settings.language.title")}
          type="button"
          onClick={() => navigate("/settings")}
        >
          ⚙
        </button>
      </header>

      <div className="equipment-scroll tw-scroll">
        <section>
          <div className="equipment-section-head">{t("equip.equipped")}</div>
          <div className="equipment-slot-grid">
            {SLOT_ORDER.map((slot) => (
              <SlotTile
                gear={equipped[slot]}
                key={slot}
                selected={selected?.slot === slot}
                slot={slot}
              />
            ))}
          </div>
        </section>

        <div className="equipment-auto">
          <Button
            disabled={!betterCount || equipGear.isPending}
            fullWidth
            variant="ghost"
            onClick={autoEquipBest}
          >
            {t("equip.autoEquip")}
          </Button>
          {betterCount ? (
            <span>{t("equip.upgradesAvailable", { count: betterCount })}</span>
          ) : null}
        </div>

        <section>
          <div className="equipment-section-head equipment-section-head--row">
            <span>{t("equip.backpack")}</span>
            <span className="tw-num">{backpack.length}</span>
          </div>

          {backpack.length ? (
            <>
              <p className="equipment-hint">{t("equip.tapHint")}</p>
              <div className="equipment-backpack-list">
                {backpack.map((gear) => {
                  const current = equipped[gear.slot];
                  const delta = (gear.cp ?? 0) - (current?.cp ?? 0);

                  return (
                    <GearCard
                      delta={delta}
                      gear={gear}
                      key={gear.id}
                      selected={gear.id === selectedId}
                      onClick={() => selectGear(gear.id)}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <EmptyState
              body={t("equip.emptyBackpack.body")}
              title={t("equip.emptyBackpack.title")}
            />
          )}
        </section>
      </div>

      {selected ? (
        <CompareSheet
          candidate={selected}
          equipped={equippedForSelected}
          pending={equipGear.isPending}
          onClose={closeCompare}
          onEquip={() => equip(selected.id)}
        />
      ) : null}
    </div>
  );
}

function SlotTile({
  slot,
  gear,
  selected,
}: {
  slot: GearSlot;
  gear: Gear | null;
  selected?: boolean;
}) {
  return (
    <div
      className={[
        "slot-tile",
        gear ? `slot-tile--${gear.rarity}` : "",
        selected ? "slot-tile--selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="slot-tile__icon">
        <GearIcon rarity={gear?.rarity} slot={slot} size={19} />
      </span>
      <span className="slot-tile__body">
        <span>{t(`slot.${slot}`)}</span>
        {gear ? (
          <>
            <strong className="tw-display">{t(gear.nameKey)}</strong>
            <em className="tw-num">+{gear.cp} {t("common.cp")}</em>
          </>
        ) : (
          <strong>{t("equip.slotEmpty")}</strong>
        )}
      </span>
    </div>
  );
}

function CompareSheet({
  candidate,
  equipped,
  pending,
  onClose,
  onEquip,
}: {
  candidate: Gear;
  equipped: Gear | null;
  pending?: boolean;
  onClose: () => void;
  onEquip: () => void;
}) {
  const rows = useMemo(() => comparisonRows(candidate, equipped), [candidate, equipped]);
  const delta = (candidate.cp ?? 0) - (equipped?.cp ?? 0);

  return (
    <>
      <button className="sheet-scrim compare-sheet__scrim" type="button" onClick={onClose} />
      <section aria-modal="true" className="compare-sheet" role="dialog">
        <div className="node-sheet__grabber" aria-hidden="true" />
        <div className="compare-sheet__head">
          <span>{t("equip.comparing")}</span>
          <strong>{t(`slot.${candidate.slot}`)}</strong>
        </div>
        <GearCard gear={candidate} />

        <div className="compare-table">
          <div className="compare-table__replace">
            {t("equip.replaces", {
              name: equipped ? t(equipped.nameKey) : t("equip.slotEmpty"),
            })}
          </div>
          {rows.map((row) => (
            <div className="compare-row" key={row.key}>
              <span>{t(`stat.${row.key}`)}</span>
              <em className="tw-num">{row.oldValue ?? "-"}</em>
              <strong>{row.newValue === row.oldValue ? "=" : "→"}</strong>
              <em className="tw-num">{row.newValue ?? "-"}</em>
            </div>
          ))}
          <div className="compare-row compare-row--cp">
            <span>{t("equip.cpDelta")}</span>
            <strong className={delta > 0 ? "is-good" : delta < 0 ? "is-danger" : ""}>
              {delta > 0 ? "+" : ""}
              <span className="tw-num">{delta}</span>
            </strong>
          </div>
        </div>

        <div className="compare-sheet__actions">
          <Button disabled={pending} fullWidth onClick={onEquip}>
            {t("equip.equip")}
          </Button>
          <Button disabled={pending} fullWidth variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
        </div>
      </section>
    </>
  );
}

function comparisonRows(candidate: Gear, equipped: Gear | null) {
  const statKeys = ["atk", "def", "hp", "crit", "spd"] as const;
  const oldStats = new Map(equipped?.stats?.map((stat) => [stat.k, stat.v]) ?? []);
  const newStats = new Map(candidate.stats?.map((stat) => [stat.k, stat.v]) ?? []);

  return statKeys
    .filter((key) => oldStats.has(key) || newStats.has(key))
    .map((key) => ({
      key,
      oldValue: oldStats.get(key),
      newValue: newStats.get(key),
    }));
}
