// Import service classes
import { AuthService } from './auth.service'
import { BookingService } from './booking.service'
import { ClassService } from './class.service'
import { SubscriptionService } from './subscription.service'

// Export service classes
export { AuthService, BookingService, ClassService, SubscriptionService }

// Export service instances (singletons)
export const authService = new AuthService()
export const bookingService = new BookingService()
export const classService = new ClassService()
export const subscriptionService = new SubscriptionService()