// Server-side service instances
import { WhatsAppService } from './whatsapp.service'

// Export server-side WhatsApp service instance
export const whatsappServerService = new WhatsAppService(true) // Server-side instance