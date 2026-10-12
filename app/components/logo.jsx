import Link from "next/link";

// The logo is white by default; `dark` renders it in ink for light backgrounds.
export default function Logo({ dark = false }) {
  return (
    <Link
      href="/"
      aria-label="CC Builders home"
      className={`relative block h-[80px] w-[86px] ${dark ? "text-ink" : "text-white"}`}
    >
      <img
        src="/images/logo-mark.svg"
        alt=""
        width={83.3944}
        height={62.8155}
        className={`absolute left-[1.12px] top-[-1.26px] ${dark ? "invert" : ""}`}
      />
      <span className="absolute left-[9.67px] top-[29.13px] text-[29.157px] font-bold leading-none">C</span>
      <span className="absolute left-[40.91px] top-[33.76px] h-[23.168px] w-[1.488px] bg-current opacity-55" />
      <span className="absolute left-[52.81px] top-[29.13px] text-[29.157px] font-bold leading-none">C</span>
      <span className="absolute left-0 top-[64.87px] text-[14.755px] leading-none tracking-[1.623px] opacity-50">
        BUILDERS
      </span>
    </Link>
  );
}
