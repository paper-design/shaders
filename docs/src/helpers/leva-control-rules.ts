/**
 * Conditional visibility rules for Leva controls.
 *
 * Each rule maps a control name to the conditions under which it should be
 * visible. Conditions reference other controls by name and support simple
 * comparison operators.
 */

export type ControlCondition =
  | { gt: number }
  | { eq: string | number };

export type ControlRule = {
  /** All conditions must be met for the control to be shown. */
  showWhen: Record<string, ControlCondition>;
  /** Custom label override. Defaults to "↳ {controlName}". */
  label?: string;
};

export type ControlRules = Record<string, ControlRule>;

function evaluateCondition(value: unknown, condition: ControlCondition): boolean {
  if ('gt' in condition) return typeof value === 'number' && value > condition.gt;
  if ('eq' in condition) return value === condition.eq;
  return true;
}

/**
 * Adds Leva `render` callbacks to controls based on declarative rules.
 * Controls not mentioned in `rules` are returned unchanged.
 */
export function applyControlRules(
  schema: Record<string, any>,
  rules: ControlRules
): Record<string, any> {
  const result: Record<string, any> = { ...schema };

  for (const [controlName, rule] of Object.entries(rules)) {
    if (result[controlName] != null && typeof result[controlName] === 'object') {
      result[controlName] = {
        ...result[controlName],
        label: rule.label ?? `↳ ${controlName}`,
        render: (get: (key: string) => unknown) =>
          Object.entries(rule.showWhen).every(([dep, condition]) =>
            evaluateCondition(get(dep), condition)
          ),
      };
    }
  }

  return result;
}
