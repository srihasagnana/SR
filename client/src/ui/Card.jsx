import * as React from "react";

export function Card({ children }) {
  return <div className="bg-white shadow-md p-4 rounded-lg">{children}</div>;
}

export function CardContent({ children }) {
  return <div className="p-2">{children}</div>;
}
