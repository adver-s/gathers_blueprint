/** API User.Gender: MALE=0, FEMALE=1, OTHER=2 */
export const GENDERS = [
  { value: 0, label: "男性" },
  { value: 1, label: "女性" },
  { value: 2, label: "その他" },
] as const;

export function genderLabel(value: number): string {
  const row = GENDERS.find((g) => g.value === value);
  return row?.label ?? String(value);
}
