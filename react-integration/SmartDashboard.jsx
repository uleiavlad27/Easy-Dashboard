import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import "../src/components/smart-dashboard.js";

export const SmartDashboard = forwardRef(function SmartDashboard(
  {
    title = "Dashboard component",
    initialCards = [],
    onDashboardUpdated,
    onDashboardAction,
    ...rest
  },
  ref
) {
  const elementRef = useRef(null);

  useImperativeHandle(ref, () => elementRef.current, []);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) {
      return undefined;
    }

    const handleUpdated = (event) => {
      if (typeof onDashboardUpdated === "function") {
        onDashboardUpdated(event.detail, event);
      }
    };

    const handleAction = (event) => {
      if (typeof onDashboardAction === "function") {
        onDashboardAction(event.detail, event);
      }
    };

    el.addEventListener("dashboard-updated", handleUpdated);
    el.addEventListener("dashboard-action", handleAction);

    return () => {
      el.removeEventListener("dashboard-updated", handleUpdated);
      el.removeEventListener("dashboard-action", handleAction);
    };
  }, [onDashboardUpdated, onDashboardAction]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) {
      return;
    }

    if (!Array.isArray(initialCards) || initialCards.length === 0) {
      return;
    }

    if (el.getCardsData().length > 0) {
      return;
    }

    initialCards.forEach((card) => {
      el.addCard(card);
    });
  }, [initialCards]);

  return <smart-dashboard ref={elementRef} title={title} {...rest} />;
});
