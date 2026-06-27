"use client";

import React from "react";
import { IconProps } from "./index";

export function TewuLogo(props: IconProps) {
  const { size, width, height, color, className, title = "Biuro rachunkowe TEWU Szczecin", style, ...rest } = props;
  const w = width ?? (size !== undefined ? size : undefined) ?? "1em";
  const h = height ?? (size !== undefined ? size : undefined);

  return (
    <svg
      viewBox="0 0 15103.041 2950"
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
        transform="translate(-1454,-1635.0001)"
        d="m 13681,2065 v 829 c 0,140 -2,235 -2,285 0,172 7,293 19,363 19,98 60,171 122,221 63,50 154,83 274,99 63,7 223,13 478,19 376,-4 601,-9 676,-15 74,-5 145,-23 211,-52 79,-33 132,-91 161,-175 29,-85 43,-224 43,-417 l -2,-254 V 1635 h 896 v 1525 c 1,341 -16,593 -50,756 -72,289 -266,485 -581,587 -108,36 -224,58 -348,66 -124,8 -439,13 -945,16 -448,-3 -765,-8 -949,-26 -423,-39 -692,-275 -808,-577 z M 7511,2288 H 6034 v 501 h 1681 l 235,581 H 6034 v 522 h 2128 l 270,667 H 5152 V 1635 H 7247 Z M 2763,4559 V 2346 H 1454 v -711 h 3464 v 711 H 3658 v 2213 z m 5638,-2924 849,2225 755,-2225 h 1090 l 729,2225 875,-2225 h 901 L 12371,4559 H 11200 L 10548,2445 9862,4559 H 8693 L 7508,1635 Z"
      />
    </svg>
  );
}
