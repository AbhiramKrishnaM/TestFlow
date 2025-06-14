import React from "react";
import { Fade, FadeProps } from "@mui/material";

/**
 * A safe transition component that avoids the "Cannot read properties of null (reading 'scrollTop')" error
 * by disabling the appear animation and adding a small timeout
 */
export const SafeFade: React.FC<FadeProps> = (props) => {
  // Extract timeout from props or use default
  const { timeout: propsTimeout, ...otherProps } = props;

  // Create a merged timeout object
  const timeout = {
    enter: 300,
    exit: 100,
    ...(typeof propsTimeout === "object" ? propsTimeout : {}),
  };

  return <Fade {...otherProps} appear={false} timeout={timeout} />;
};
