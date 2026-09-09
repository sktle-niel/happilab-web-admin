import { CloseOutlined, DownOutlined, TeamOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import { HIT_TYPES, type HitType } from "../lib/search";
import { TYPE_ICONS } from "./SearchRow";

type Props = { types: HitType[]; onChange: (types: HitType[]) => void };

const iconFor = (type: HitType) => (type === "members" ? TeamOutlined : TYPE_ICONS[type]);

/** What the search looks through. A chip's cross leaves that kind out; More brings one back, in the usual order. */
export function TypeChips({ types, onChange }: Props) {
  const left = HIT_TYPES.filter((t) => !types.includes(t.type));
  const add = (type: HitType) => onChange(HIT_TYPES.map((t) => t.type).filter((t) => types.includes(t) || t === type));
  return (
    <div className="search-types">
      <span className="search-types__label">I’m looking for…</span>
      <div className="search-types__row">
        {HIT_TYPES.filter((t) => types.includes(t.type)).map(({ type, label }) => {
          const Icon = iconFor(type);
          return (
            <span key={type} className="search-chip">
              <Icon />
              {label}
              <button type="button" aria-label={`Leave out ${label}`} onClick={() => onChange(types.filter((t) => t !== type))}>
                <CloseOutlined />
              </button>
            </span>
          );
        })}
        {left.length > 0 && (
          <Dropdown
            trigger={["click"]}
            getPopupContainer={(node) => node.parentElement ?? document.body}
            menu={{ items: left.map((t) => ({ key: t.type, label: t.label })), onClick: ({ key }) => add(key as HitType) }}
          >
            <button type="button" className="search-chip search-chip--more">
              More <DownOutlined />
            </button>
          </Dropdown>
        )}
      </div>
    </div>
  );
}
