import { Icon } from "./Icon";
export function Encyclopedia({ onBack }: { onBack: () => void }) {
  return (
    <section className="encyclopedia paper-page">
      <button className="text-button" onClick={onBack}>
        <Icon name="ArrowLeft" />
        Кері қайту
      </button>
      <h1>Энциклопедия</h1>
    </section>
  );
}
