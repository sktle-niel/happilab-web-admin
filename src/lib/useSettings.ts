import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SettingKey, Settings } from "../data/types";
import { api } from "./api";
import { snakeKey, toCamel, toSnake } from "./case";

const URL = "/v1/admin/settings";
const KEY = ["settings"];

/** Every setting, as the API merges what was stored over its defaults; refreshed after each save. */
export function useSettings() {
  const { data, isLoading } = useQuery({ queryKey: KEY, queryFn: () => api.get(URL).then((body) => toCamel<Settings>(body)) });
  return { settings: data, loading: isLoading };
}

/** Stores one key with `PUT /v1/admin/settings/:key`; the API validates the shape and keeps the audit line. */
export function useSaveSetting() {
  const client = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ key, value }: { key: SettingKey; value: Settings[SettingKey] }) => api.put(`${URL}/${snakeKey(key)}`, toSnake(value)),
    onSuccess: () => client.invalidateQueries({ queryKey: KEY }),
  });
  return { save: mutateAsync, saving: isPending };
}
