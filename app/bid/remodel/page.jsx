import { Suspense } from "react";
import BidShell from "../bid-shell";
import RemodelFlow from "./remodel-flow";

export const metadata = { title: "Get your remodel bid | CC Builders" };

export default function RemodelBidPage() {
  return (
    <BidShell>
      <Suspense>
        <RemodelFlow />
      </Suspense>
    </BidShell>
  );
}
