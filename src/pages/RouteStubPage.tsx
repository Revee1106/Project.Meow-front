import { useParams } from "react-router-dom";
import { t, type StringKey } from "../i18n/strings";

type RouteStubPageProps = {
  titleKey: StringKey;
  bodyKey: StringKey;
};

export function RouteStubPage({ titleKey, bodyKey }: RouteStubPageProps) {
  const { floorId } = useParams();
  const vars = { floorId: floorId ?? "" };

  return (
    <section className="route-stub">
      <p className="route-stub__eyebrow">{t("app.name")}</p>
      <h1 className="tw-display route-stub__title">{t(titleKey, vars)}</h1>
      <p className="route-stub__body">{t(bodyKey, vars)}</p>
    </section>
  );
}
