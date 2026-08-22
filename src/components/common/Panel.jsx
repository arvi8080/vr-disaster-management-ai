import React from "react";

export default function Panel({
  title,
  action,
  children,
  className = "",
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <h2>{title}</h2>

        {action && (
          <button className="text-link">
            {action} →
          </button>
        )}
      </div>

      {children}
    </section>
  );
}