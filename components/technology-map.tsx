import { BrainCircuit, Cloud, Code2, Network } from "lucide-react";

const layers = [
  {
    number: "01",
    key: "intelligence",
    title: "Data & intelligence",
    description: "AI and analytics grounded in useful, well-structured data.",
    icon: BrainCircuit,
  },
  {
    number: "02",
    key: "experiences",
    title: "Digital experiences",
    description: "Products and interfaces shaped around people and real workflows.",
    icon: Code2,
  },
  {
    number: "03",
    key: "systems",
    title: "Connected systems",
    description: "APIs, databases and services working together as one product.",
    icon: Network,
  },
  {
    number: "04",
    key: "infrastructure",
    title: "Cloud & delivery",
    description: "Flexible foundations for releasing, observing and improving software.",
    icon: Cloud,
  },
];

export default function TechnologyMap({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`technology-map${compact ? " technology-map-compact" : ""}`}>
      <div className="architecture-flow" role="list" aria-label="GritGrid technology layers">
        {layers.map(({ number, key, title, description, icon: Icon }) => (
          <article className={`architecture-layer architecture-layer-${key}`} key={key} role="listitem">
            <div className="architecture-layer-top">
              <span className="architecture-layer-number">{number} / 04</span>
              <Icon aria-hidden="true" />
            </div>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
            <span className="architecture-layer-trace" aria-hidden="true" />
          </article>
        ))}
      </div>
    </div>
  );
}
