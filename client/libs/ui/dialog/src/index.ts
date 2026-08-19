import {
  BrnDialog,
  BrnDialogClose,
  BrnDialogContent,
  BrnDialogDescription,
  BrnDialogOverlay,
  BrnDialogTitle,
  BrnDialogTrigger,
} from '@spartan-ng/brain/dialog';

export {
  BrnDialog as HlmDialog,
  BrnDialogClose as HlmDialogClose,
  BrnDialogContent as HlmDialogContent,
  BrnDialogDescription as HlmDialogDescription,
  BrnDialogOverlay as HlmDialogOverlay,
  BrnDialogTitle as HlmDialogTitle,
  BrnDialogTrigger as HlmDialogTrigger,
};

export const HlmDialogImports = [
  BrnDialog,
  BrnDialogOverlay,
  BrnDialogTrigger,
  BrnDialogClose,
  BrnDialogContent,
  BrnDialogTitle,
  BrnDialogDescription,
] as const;
