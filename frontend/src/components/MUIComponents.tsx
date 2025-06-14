import React from "react";
import {
  Alert as MUIAlert,
  AlertProps,
  Box as MUIBox,
  BoxProps,
  Button as MUIButton,
  ButtonProps,
  Divider as MUIDivider,
  DividerProps,
  Paper as MUIPaper,
  PaperProps,
  TextField as MUITextField,
  TextFieldProps,
  Typography as MUITypography,
  TypographyProps,
  CircularProgress as MUICircularProgress,
  CircularProgressProps,
  Snackbar as MUISnackbar,
  SnackbarProps,
  Dialog as MUIDialog,
  DialogProps,
  DialogTitle as MUIDialogTitle,
  DialogTitleProps,
  DialogContent as MUIDialogContent,
  DialogContentProps,
  DialogActions as MUIDialogActions,
  DialogActionsProps,
  Checkbox as MUICheckbox,
  CheckboxProps,
  FormControlLabel as MUIFormControlLabel,
  FormControlLabelProps,
  IconButton as MUIIconButton,
  IconButtonProps,
  Menu as MUIMenu,
  MenuProps,
  MenuItem as MUIMenuItem,
  MenuItemProps,
} from "@mui/material";

// Re-export MUI components with proper typing
export const Alert = (props: AlertProps) => <MUIAlert {...props} />;
export const Box = (props: BoxProps) => <MUIBox {...props} />;
export const Button = (props: ButtonProps) => <MUIButton {...props} />;
export const Divider = (props: DividerProps) => <MUIDivider {...props} />;
export const Paper = (props: PaperProps) => <MUIPaper {...props} />;
export const TextField = (props: TextFieldProps) => <MUITextField {...props} />;
export const Typography = (props: TypographyProps) => (
  <MUITypography {...props} />
);
export const CircularProgress = (props: CircularProgressProps) => (
  <MUICircularProgress {...props} />
);
export const Snackbar = (props: SnackbarProps) => <MUISnackbar {...props} />;
export const Dialog = (props: DialogProps) => <MUIDialog {...props} />;
export const DialogTitle = (props: DialogTitleProps) => (
  <MUIDialogTitle {...props} />
);
export const DialogContent = (props: DialogContentProps) => (
  <MUIDialogContent {...props} />
);
export const DialogActions = (props: DialogActionsProps) => (
  <MUIDialogActions {...props} />
);
export const Checkbox = (props: CheckboxProps) => <MUICheckbox {...props} />;
export const FormControlLabel = (props: FormControlLabelProps) => (
  <MUIFormControlLabel {...props} />
);
export const IconButton = (props: IconButtonProps) => (
  <MUIIconButton {...props} />
);
export const Menu = (props: MenuProps) => <MUIMenu {...props} />;
export const MenuItem = (props: MenuItemProps) => <MUIMenuItem {...props} />;
