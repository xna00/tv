import { useEffect, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  {
    init,
    parser,
    stringfy,
  }: {
    init: T;
    parser?: (a: string | null) => T;
    stringfy?: (a: T) => string;
  }
) {
  const t = localStorage.getItem(key);
  const [v, setV] = useState<T>(t ? (parser ?? JSON.parse)(t) : init);

  useEffect(() => {
    localStorage.setItem(key, (stringfy ?? JSON.stringify)(v));
  }, [v]);

  return [v, setV] as const;
}
