import Logo from "../components/logo";

// Page frame shared by the bid flows: logo top left, narrow content column.
export default function BidShell({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 pt-6">
        <Logo dark />
      </header>
      <main className="mx-auto max-w-[480px] px-4 pb-24 pt-10 md:pt-16">{children}</main>
    </div>
  );
}
