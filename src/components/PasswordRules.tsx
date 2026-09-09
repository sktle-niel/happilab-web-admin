import { CheckOutlined } from "@ant-design/icons";
import { PASSWORD_RULES } from "../lib/password";

/** One chip per rule, ticking as the password meets it. */
export function PasswordRules({ password }: { password: string }) {
  return (
    <ul className="rules" aria-label="Password rules">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.passes(password);
        return (
          <li key={rule.label} className={`rules__item${met ? " is-met" : ""}`}>
            <span className="rules__mark">{met ? <CheckOutlined /> : null}</span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
