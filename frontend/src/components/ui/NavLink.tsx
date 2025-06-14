import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ListItem, ListItemPrefix } from "../MaterialTailwindFix";

interface NavLinkProps {
  to: string;
  onClick?: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  exact?: boolean;
}

export const NavLink: React.FC<NavLinkProps> = ({
  to,
  onClick,
  icon,
  children,
  exact = true,
}) => {
  const location = useLocation();

  // Check if the current path matches the link path
  const isActive = exact
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <Link to={to} onClick={onClick} className="block">
      <ListItem
        className={`transition-all duration-200 ease-in-out ${
          isActive
            ? "bg-blue-50 text-blue-600 font-medium border-r-4 border-blue-600 shadow-sm translate-x-1"
            : "hover:bg-gray-50 hover:translate-x-1"
        } my-1 rounded-md`}
      >
        <ListItemPrefix>
          <div
            className={`transition-colors ${
              isActive ? "text-blue-600" : "text-gray-600"
            }`}
          >
            {icon}
          </div>
        </ListItemPrefix>
        <span className={isActive ? "font-medium" : ""}>{children}</span>
      </ListItem>
    </Link>
  );
};
