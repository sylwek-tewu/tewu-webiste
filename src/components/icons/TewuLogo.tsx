"use client";

import React from "react";
import { IconProps } from "./index";
import { TEWU_LOGO_PATH, TEWU_LOGO_TRANSFORM, TEWU_LOGO_VIEW_BOX } from "./tewu-logo-path";

export function TewuLogo(props: IconProps) {
  const { size, width, height, color, className, title = "Biuro rachunkowe TEWU Szczecin", style, ...rest } = props;
  const w = width ?? (size !== undefined ? size : undefined) ?? "1em";
  const h = height ?? (size !== undefined ? size : undefined);

  return (
    <svg
      viewBox={TEWU_LOGO_VIEW_BOX}
      width={w}
      height={h}
      preserveAspectRatio="xMidYMid meet"
      role={title ? "img" : "presentation"}
      aria-label={title}
      className={className}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        ...(color ? { color } : {}),
        ...style,
      }}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path
        id="path13"
        fill="currentColor"
        stroke="none"
        transform={TEWU_LOGO_TRANSFORM}
        d={TEWU_LOGO_PATH}
      />
    </svg>
  );
}
