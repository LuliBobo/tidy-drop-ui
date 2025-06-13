
const DropTidyLogo = ({ size = 36 }: { size?: number }) => (
  <span
    aria-label="DropTidy logo"
    className={`inline-flex items-center justify-center select-none`}
    style={{ height: size, width: size }}
  >
    {/* SVG traced from uploaded image: "D" in a circle, purple color */}
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="32" r="30" fill="#6366F1" />
      <path
        d="M26 18h9.5c6.075 0 10.5 4.13 10.5 9.85 0 5.713-4.423 9.852-10.5 9.852H30.9V46H26V18Zm10 13c3.037 0 5-1.796 5-4.154 0-2.352-1.963-4.146-5-4.146h-5.1V31H36Z"
        fill="white"
      />
    </svg>
  </span>
);

export default DropTidyLogo;
