import type { ButtonProps } from '@mantine/core';

/**
 * Mantine Button labels never wrap, so a long label is cut off or makes the page wider than a
 * phone screen. These styles let the label wrap onto more lines instead. They are inline styles,
 * so they win over Mantine's own CSS regardless of stylesheet order.
 */
export const wrappingButtonStyles = {
  root: { height: 'auto', minHeight: 'var(--button-height)', maxWidth: '100%' },
  label: { whiteSpace: 'normal', height: 'auto', textAlign: 'center', lineHeight: 1.3 },
} satisfies ButtonProps['styles'];
