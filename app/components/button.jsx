import Link from "next/link";

export const buttonClassName =
  "inline-flex h-[80px] w-[255px] items-center justify-center bg-brand text-[20px] font-bold leading-[56px] text-white md:text-[24px] transition-opacity hover:opacity-90 disabled:opacity-50";

export default function Button({ href = "/bid/remodel", children = "Get your bid" }) {
  return (
    <Link href={href} className={buttonClassName}>
      {children}
    </Link>
  );
}
