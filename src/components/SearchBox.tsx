import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";
import { useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 200;

type Props = { initial: string; placeholder: string; onSearch: (value: string) => void };

/** A list's search box: filters as you type, a beat behind the keys; Enter and clear act at once. */
export function SearchBox({ initial, placeholder, onSearch }: Props) {
  const [value, setValue] = useState(initial);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => setValue(initial), [initial]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const commit = (next: string) => {
    window.clearTimeout(timer.current);
    onSearch(next.trim());
  };

  const change = (next: string) => {
    setValue(next);
    window.clearTimeout(timer.current);
    if (next === "") return commit("");
    timer.current = window.setTimeout(() => onSearch(next.trim()), DEBOUNCE_MS);
  };

  return (
    <Input
      className="list-search"
      value={value}
      placeholder={placeholder}
      prefix={<SearchOutlined style={{ color: "var(--muted)" }} />}
      allowClear
      onChange={(event) => change(event.target.value)}
      onPressEnter={() => commit(value)}
      aria-label={placeholder}
    />
  );
}
