import { WarningOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { Component, type ErrorInfo, type ReactNode } from "react";

type State = { failed: boolean };

/**
 * The last thing between a thrown render and a white page. Whatever broke,
 * the person sees what happened and two ways on: the page again, or the
 * sign-in. The error itself goes to the console, where it can be read.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("The admin could not draw this page.", error, info.componentStack);
  }

  override render() {
    if (!this.state.failed) return this.props.children;
    return <ErrorPage />;
  }
}

/** Reloading draws the page again from nothing; signing in again starts the session over. */
function ErrorPage() {
  return (
    <div className="card no-access" style={{ margin: "80px auto", maxWidth: 440 }}>
      <span className="card__icon"><WarningOutlined /></span>
      <h2>Something went wrong</h2>
      <p>This page could not be drawn. Reload it, or sign in again if the problem stays.</p>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <Button type="primary" onClick={() => window.location.reload()}>Reload</Button>
        <Button onClick={() => window.location.assign("/login")}>Go to sign in</Button>
      </div>
    </div>
  );
}
