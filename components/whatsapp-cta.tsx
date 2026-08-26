import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";

export function WhatsAppCta({ message = "Hello GritGrid, I would like to discuss a project." }: { message?: string }) {
  return <a className="whatsapp-cta" href={whatsappUrl(message)} target="_blank" rel="noreferrer" aria-label="Chat with GritGrid on WhatsApp"><MessageCircle aria-hidden="true" /><span>Chat with GritGrid</span></a>;
}
