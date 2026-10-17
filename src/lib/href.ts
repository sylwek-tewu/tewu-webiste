/** An address on another site (official sources), as opposed to a path on ours. */
export const isExternalHref = (href: string) => /^https?:\/\//.test(href);
