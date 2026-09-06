import { EventClosed } from "@/components/event-closed";
import { WeddingGreeting } from "@/components/wedding-greeting";
import { weddingConfig } from "@/config/wedding";

export default function HomePage() {
  return (
    <main className="min-h-svh">
      {weddingConfig.eventEnded ? <EventClosed /> : <WeddingGreeting />}
    </main>
  );
}
