import React from "react";
import {
  Button as MTButton,
  Card as MTCard,
  CardBody as MTCardBody,
  CardFooter as MTCardFooter,
  CardHeader as MTCardHeader,
  Drawer as MTDrawer,
  IconButton as MTIconButton,
  Input as MTInput,
  List as MTList,
  ListItem as MTListItem,
  ListItemPrefix as MTListItemPrefix,
  Navbar as MTNavbar,
  Typography as MTTypography,
} from "@material-tailwind/react";

// Create wrapper components with partial props
export const Button = (props: any) => <MTButton {...props} />;
export const Card = (props: any) => <MTCard {...props} />;
export const CardBody = (props: any) => <MTCardBody {...props} />;
export const CardFooter = (props: any) => <MTCardFooter {...props} />;
export const CardHeader = (props: any) => <MTCardHeader {...props} />;
export const Drawer = (props: any) => <MTDrawer {...props} />;
export const IconButton = (props: any) => <MTIconButton {...props} />;
export const Input = (props: any) => <MTInput {...props} />;
export const List = (props: any) => <MTList {...props} />;
export const ListItem = (props: any) => <MTListItem {...props} />;
export const ListItemPrefix = (props: any) => <MTListItemPrefix {...props} />;
export const Navbar = (props: any) => <MTNavbar {...props} />;
export const Typography = (props: any) => <MTTypography {...props} />;
