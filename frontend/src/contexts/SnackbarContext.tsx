import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
} from "react";
import { Alert, Snackbar } from "../components/MUIComponents";
import { AlertColor } from "@mui/material";
import { SafeFade } from "../components/ui/SafeTransition";

interface SnackbarContextProps {
  showSnackbar: (message: string, severity?: AlertColor) => void;
  closeSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextProps>({
  showSnackbar: () => {},
  closeSnackbar: () => {},
});

interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("info");
  const alertRef = useRef(null);

  const showSnackbar = (message: string, severity: AlertColor = "info") => {
    setMessage(message);
    setSeverity(severity);
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      setOpen(true);
    }, 100);
  };

  const closeSnackbar = () => {
    setOpen(false);
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    closeSnackbar();
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar, closeSnackbar }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        disableWindowBlurListener
        TransitionComponent={SafeFade}
      >
        <div ref={alertRef}>
          <Alert
            onClose={handleClose}
            severity={severity}
            sx={{ width: "100%" }}
            variant="filled"
          >
            {message}
          </Alert>
        </div>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
