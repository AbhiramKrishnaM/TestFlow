import React from "react";
import { Button, CircularProgress } from "../MUIComponents";
import { ButtonProps } from "@mui/material";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  loading = false,
  loadingText,
  disabled,
  ...rest
}) => {
  return (
    <Button disabled={loading || disabled} {...rest}>
      {loading ? (
        <>
          <CircularProgress size={24} color="inherit" className="mr-2" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </Button>
  );
};
