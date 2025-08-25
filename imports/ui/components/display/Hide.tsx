import React from "react";

interface Props {
  hide: boolean;
  children: React.ReactNode;
}

export function Hide({ hide, children }: Props) {
  return hide ? null : <>{children}</>;
}
