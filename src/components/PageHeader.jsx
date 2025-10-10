import React from "react";
import "../styles/PageHeader.css";

export default function PageHeader({ title, children }) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      <div className="header-line"></div>
      {children && <div className="page-header-content">{children}</div>}
    </div>
  );
}
