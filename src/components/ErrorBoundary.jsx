// src/components/ErrorBoundary.jsx
import { Component } from "react";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to an error reporting service here.
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    const { t } = this.props; // t is injected via withTranslation

    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>{t("somethingWentWrong")}</h2>
          <p>{this.state.error && this.state.error.toString()}</p>
          <details style={{ whiteSpace: "pre-wrap" }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <p>{t("PleaseTryRefreshingThePage")}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  t: PropTypes.func.isRequired,
};

// Wrap the component and assign a display name for Fast Refresh
const TranslatedErrorBoundary = withTranslation()(ErrorBoundary);
TranslatedErrorBoundary.displayName = "ErrorBoundary";

export default TranslatedErrorBoundary;
