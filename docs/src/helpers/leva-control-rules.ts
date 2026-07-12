export type ControlCondition =
  | { moreThan: number }
  | { is: string | number | boolean }
  | { isNot: string | number | boolean };

export type ControlRule = {
  showWhen: Record<string, ControlCondition>;
};

export type ControlRules = Record<string, ControlRule>;

function evaluateCondition(value: unknown, condition: ControlCondition): boolean {
  if ('moreThan' in condition) return typeof value === 'number' && value > condition.moreThan;
  if ('is' in condition) return value === condition.is;
  return value !== condition.isNot;
}

/** Adds Leva `render` callbacks from `rules`; controls not in `rules` pass through. */
export function applyControlRules(
  schema: Record<string, any>,
  rules: ControlRules
): Record<string, any> {
  const result: Record<string, any> = { ...schema };

  for (const [name, rule] of Object.entries(rules)) {
    const control = result[name];
    if (control == null || typeof control !== 'object') continue;

    const passesRule = (get: (key: string) => unknown) =>
      Object.entries(rule.showWhen).every(([dep, condition]) => evaluateCondition(get(dep), condition));

    result[name] = {
      ...control,
      label: `↳ ${name}`,
      render: control.render
        ? (get: (key: string) => unknown) => control.render(get) && passesRule(get)
        : passesRule,
    };
  }

  return result;
}