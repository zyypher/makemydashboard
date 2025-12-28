// components/images/logo.tsx
import * as React from "react";

type LogoProps = React.SVGProps<SVGSVGElement> & {
  title?: string;
};

export default function Logo({ className, title = "BuildMyDashboard", ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 57.31 47.22"
      role="img"
      aria-label={title}
      className={className}
      {...props}
    >
      <path
        d="M57.17 6a6.55 6.55 0 0 0-3-4.42A11.23 11.23 0 0 0 47.94 0H13.66l-3.28 11.35h28.54c1.61 0 2.55.7 2.8 2.1a2.3 2.3 0 0 1-.06 1.24l-.27.92A4.4 4.4 0 0 1 39.63 18a4.79 4.79 0 0 1-2.89 1H22.49l1.19-4.15H9.38L0 47.22h39.1a11.37 11.37 0 0 0 6.71-2.1 18.49 18.49 0 0 0 4.95-5.21 21.45 21.45 0 0 0 2.83-6.69 16 16 0 0 0 .28-6.59 7.92 7.92 0 0 0-3-5.24 10.81 10.81 0 0 0 2.67-2.75 19.59 19.59 0 0 0 2.21-4.07 22.55 22.55 0 0 0 1.33-4.49A11.06 11.06 0 0 0 57.17 6zm-17.9 25.46l-.32 1a4.16 4.16 0 0 1-1.69 2.3 4.89 4.89 0 0 1-2.89 1H17.63l2.24-7.67h16.74c1.61 0 2.53.63 2.76 1.9a3.52 3.52 0 0 1-.1 1.47z"
        fill="currentColor"
      />
    </svg>
  );
}
