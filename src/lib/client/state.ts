// Mutable page state shared across feature modules. These were free variables
// in the original single-scope inline script; modules read and write them
// through this one object so cross-feature checks (e.g. "is a modal open?")
// keep working unchanged.
export const state: {
  I18N: Record<string, any>;
  currentProfile: any;
  cmdOpen: boolean;
  projOpen: boolean;
  kbdOpen: boolean;
  findNavOpen: boolean;
} = {
  I18N: {},
  currentProfile: null,
  cmdOpen: false,
  projOpen: false,
  kbdOpen: false,
  findNavOpen: false,
};
