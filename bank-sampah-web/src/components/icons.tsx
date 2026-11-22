import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconDashboard = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
  </Base>
);

export const IconUsers = (p: IconProps) => (
  <Base {...p}>
    <path d="M16 21v-1.8a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V21" />
    <circle cx="9" cy="7.5" r="3.5" />
    <path d="M22 21v-1.8a4 4 0 0 0-3-3.87" />
    <path d="M16.5 4.2a3.5 3.5 0 0 1 0 6.6" />
  </Base>
);

export const IconRecycle = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 19H4.8a2 2 0 0 1-1.7-3l2.3-3.8" />
    <path d="m9.6 5.9 1.2-2a2 2 0 0 1 3.4 0l2.3 3.8" />
    <path d="M14.5 19h4.7a2 2 0 0 0 1.7-3l-2.4-4" />
    <path d="m8 15-3 4 4 1" />
    <path d="m17 9 3-1-1-4" />
    <path d="m9 19 3-3-3-2.5" />
  </Base>
);

export const IconScale = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v18" />
    <path d="M6 21h12" />
    <path d="M4 7h16" />
    <path d="m4 7-2.5 6a3.6 3.6 0 0 0 5 0L4 7Z" />
    <path d="m20 7-2.5 6a3.6 3.6 0 0 0 5 0L20 7Z" />
  </Base>
);

export const IconWallet = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 8.5V6.8A2.8 2.8 0 0 0 17.2 4H5.8A2.8 2.8 0 0 0 3 6.8v10.4A2.8 2.8 0 0 0 5.8 20h11.4a2.8 2.8 0 0 0 2.8-2.8v-1.7" />
    <path d="M21 9.5h-4.2a3 3 0 0 0 0 6H21v-6Z" />
    <circle cx="16.8" cy="12.5" r=".6" fill="currentColor" stroke="none" />
  </Base>
);

export const IconChart = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 3v17a1 1 0 0 0 1 1h17" />
    <path d="M7.5 15.5V11" />
    <path d="M12 15.5V6.5" />
    <path d="M16.5 15.5v-6" />
    <path d="M21 15.5V8" />
  </Base>
);

export const IconPlus = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const IconSearch = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </Base>
);

export const IconArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);

export const IconArrowLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </Base>
);

export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="m4.5 12.5 4.5 4.5L19.5 6.5" />
  </Base>
);

export const IconAlert = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 2.5 20h19L12 3Z" />
    <path d="M12 9v5" />
    <circle cx="12" cy="17" r=".6" fill="currentColor" stroke="none" />
  </Base>
);

export const IconTrash = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h16M9 7V4.5h6V7M6.5 7l.8 13h9.4l.8-13" />
    <path d="M10 11v5.5M14 11v5.5" />
  </Base>
);

export const IconPencil = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
    <path d="m14.5 5.5 3 3" />
  </Base>
);

export const IconDownload = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v12M7 11l5 5 5-5" />
    <path d="M4 20h16" />
  </Base>
);

export const IconMenu = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
);

export const IconClose = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Base>
);

export const IconLeaf = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 4c-8.5 0-15 4-15 11a5 5 0 0 0 5 5c8 0 10-8.5 10-16Z" />
    <path d="M4 21c2.5-6 6.5-9.5 11-12" />
  </Base>
);

export const IconBox = (p: IconProps) => (
  <Base {...p}>
    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
    <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
  </Base>
);

export const IconCoins = (p: IconProps) => (
  <Base {...p}>
    <ellipse cx="9" cy="7" rx="6" ry="3" />
    <path d="M3 7v4c0 1.7 2.7 3 6 3 1.2 0 2.3-.2 3.2-.5" />
    <path d="M3 11v4c0 1.7 2.7 3 6 3h1" />
    <circle cx="16.5" cy="15.5" r="4.5" />
    <path d="M16.5 13.5v4M15 15.5h3" />
  </Base>
);

export const IconTrend = (p: IconProps) => (
  <Base {...p}>
    <path d="m3 17 5.5-5.5 4 4L21 6" />
    <path d="M15 6h6v6" />
  </Base>
);

export const IconClock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);

export const IconLeafSmall = (p: IconProps) => (
  <Base {...p}>
    <path d="M18 5c-6 0-11 2.5-11 7.5A4.5 4.5 0 0 0 11.5 17C16 17 18 11 18 5Z" />
    <path d="M5 20c1.5-4 4-6.5 7-8.5" />
  </Base>
);
