# 🧪 Comprehensive Testing Strategy for Booking System

Based on the detailed analysis of the booking, cancellation, waitlist, and credit management system, here's the comprehensive testing strategy and implementation plan.

## 📊 System Analysis Summary

### Core Booking Flow
The booking system implements a sophisticated multi-subscription logic:

1. **Authentication Check**: Verifies user is authenticated
2. **Schedule Validation**: Confirms the schedule exists in database
3. **Smart Subscription Selection**:
   - Filters to valid subscriptions (only `abonnement` and `carnet`, excludes `personal_training`)
   - Prioritizes `abonnement` first (checks weekly limit)
   - Falls back to `carnet` if abonnement limit reached or unavailable
   - Validates credit availability
4. **Duplicate Prevention**: Checks for existing bookings and updates them instead of creating new ones
5. **Booking Creation/Update**: Creates new booking or updates existing cancelled booking to confirmed
6. **Credit Deduction**: Uses database RPC function `update_booking_credits` to bypass RLS issues
7. **Waitlist Promotion**: Automatically promotes users from waitlist when spots become available

### Key Business Rules
- **Subscription Types**: `abonnement` (weekly limits), `carnet` (finite credits), `personal_training` (excluded from group classes)
- **Credit Management**: Atomic operations with proper rollback mechanisms
- **Waitlist**: FIFO promotion with upfront credit charging
- **Cancellation**: 1-hour policy with automatic credit refunds
- **Time Restrictions**: Various time-based validations throughout

## 🎯 Testing Framework Setup

### Recommended Tech Stack
- **Vitest** - Faster than Jest for Vite/Next.js projects
- **@testing-library/react** - Component testing
- **Playwright** - E2E testing
- **Supabase Test Database** - Integration tests with real database
- **MSW (Mock Service Worker)** - API mocking for unit tests

### Development Dependencies
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@playwright/test": "^1.40.0",
    "msw": "^2.0.0",
    "happy-dom": "^12.0.0"
  }
}
```

## 📋 Test Categories & Priority

### 🔴 Critical Path Tests (Unit + Integration)

#### 1. Core Booking Logic
```typescript
describe('BookingService', () => {
  describe('bookClass', () => {
    it('should successfully book with abonnement when under weekly limit')
    it('should fallback to carnet when abonnement limit reached')
    it('should prevent booking when no valid subscriptions')
    it('should handle concurrent booking attempts correctly')
    it('should update existing cancelled booking instead of creating new')
    it('should prevent booking personal training users for group classes')
  })
})
```

#### 2. Credit Management System
```typescript
describe('Credit Management', () => {
  it('should deduct weekly credits for abonnement correctly')
  it('should deduct remaining credits for carnet correctly')
  it('should maintain credit consistency across transactions')
  it('should handle weekly credit reset for abonnements')
  it('should prevent negative credits')
  it('should handle subscription expiration during booking')
})
```

#### 3. Cancellation System
```typescript
describe('Cancellation Logic', () => {
  it('should enforce 1-hour cancellation policy')
  it('should refund credits correctly by subscription type')
  it('should trigger waitlist promotion after cancellation')
  it('should prevent cancellation of already cancelled bookings')
  it('should handle cancellation of expired subscriptions')
})
```

#### 4. Waitlist Management
```typescript
describe('Waitlist System', () => {
  it('should assign correct position when joining waitlist')
  it('should charge credit upfront when joining waitlist')
  it('should promote users in FIFO order')
  it('should handle admin force promotion correctly')
  it('should clean up expired waitlist entries')
  it('should prevent duplicate waitlist entries')
})
```

### 🟡 Edge Cases & Error Scenarios (Integration)

#### 1. Race Conditions
- Concurrent bookings for last available spot
- Simultaneous waitlist promotions
- Multiple users cancelling simultaneously
- Credit deduction during concurrent operations

#### 2. Business Rule Validation
- Subscription expiration during active booking flow
- Personal training restriction enforcement
- Time window validation edge cases
- Class capacity overflow scenarios

#### 3. Data Integrity
- Atomic transaction verification
- Credit consistency after failed operations
- Booking status consistency across related tables
- Waitlist position integrity after promotions

### 🟢 User Experience Tests (E2E)

#### 1. Complete User Journeys
- **New User Flow**: Signup → Plan Selection → First Booking
- **Regular User Flow**: Login → Browse Classes → Book → Cancel → Rebook
- **Waitlist Flow**: Join Waitlist → Get Promoted → Confirm Booking
- **Multi-Subscription**: User with both abonnement and carnet

#### 2. Admin Workflows
- User management and subscription assignment
- Class scheduling and capacity management
- Waitlist management and manual promotion
- Credit adjustment and subscription modifications

## 📅 Implementation Plan

### Phase 1: Setup & Unit Tests (Week 1)
**Goals:**
- Configure testing environment with Vitest
- Set up test database and seeding scripts
- Mock Supabase client for isolated unit tests
- Implement core booking service unit tests

**Deliverables:**
- Vitest configuration with TypeScript support
- Database seeding scripts for consistent test data
- Unit tests for `BookingService` core methods
- Mock implementations for Supabase operations

### Phase 2: Integration Tests (Week 2)
**Goals:**
- Set up test database with real Supabase instance
- Test complete booking flows with actual database operations
- Verify atomic transactions and data consistency
- Test credit management across different scenarios

**Deliverables:**
- Integration test suite with real database
- Test cases for all subscription type combinations
- Concurrent operation testing
- Credit consistency verification tests

### Phase 3: E2E Tests (Week 3)
**Goals:**
- Configure Playwright for full user journey testing
- Implement critical user path automation
- Add visual regression testing for booking UI
- Test admin panel booking management features

**Deliverables:**
- Playwright test suite for user journeys
- Admin panel automation tests
- Visual regression test baseline
- Cross-browser compatibility tests

### Phase 4: Performance & Load Tests (Week 4)
**Goals:**
- Test system behavior under concurrent load
- Validate waitlist promotion performance
- Stress test credit management system
- Establish performance baselines

**Deliverables:**
- Load testing scripts
- Performance benchmarks
- Concurrent user scenario tests
- System bottleneck identification

## 🏗️ Test Data Strategy

### Test Database Setup
```sql
-- Sample test data structure
INSERT INTO profiles (id, email, full_name, subscription_status) VALUES
  ('user1-uuid', 'user1@test.com', 'Test User 1', 'active'),
  ('user2-uuid', 'user2@test.com', 'Test User 2', 'active'),
  ('admin-uuid', 'admin@test.com', 'Admin User', 'active');

INSERT INTO subscription_plans (name, type, credits, price_dhs, weekly_limit) VALUES
  ('Abonnement Mensuel', 'abonnement', NULL, 300, 3),
  ('Carnet 10 Séances', 'carnet', 10, 250, NULL),
  ('Personal Training', 'personal_training', 5, 500, NULL);

INSERT INTO user_subscriptions (user_id, plan_id, credits_remaining, weekly_credits_used) VALUES
  ('user1-uuid', 'abonnement-plan-id', NULL, 1),
  ('user2-uuid', 'carnet-plan-id', 8, 0);
```

### Key Test Scenarios
1. **User with active abonnement** (2/3 weekly credits used)
2. **User with carnet** (8/10 credits remaining)
3. **User with both subscription types**
4. **User with expired subscriptions**
5. **Classes at various capacity levels** (empty, half-full, full, with waitlist)

## 🔧 Specific Test Cases

### Booking Service Core Tests
```typescript
describe('BookingService.bookClass', () => {
  beforeEach(async () => {
    await seedTestDatabase()
  })

  it('should successfully book with abonnement when under weekly limit', async () => {
    const user = await createTestUser({ weeklyCreditsUsed: 1, weeklyLimit: 3 })
    const schedule = await createTestSchedule({ availableSpots: 5 })

    const result = await bookingService.bookClass({ scheduleId: schedule.id })

    expect(result.success).toBe(true)
    expect(await getUserWeeklyCredits(user.id)).toBe(2)
  })

  it('should fallback to carnet when abonnement limit reached', async () => {
    const user = await createTestUser({
      weeklyCreditsUsed: 3,
      weeklyLimit: 3,
      carnetCredits: 5
    })
    const schedule = await createTestSchedule({ availableSpots: 5 })

    const result = await bookingService.bookClass({ scheduleId: schedule.id })

    expect(result.success).toBe(true)
    expect(await getUserCarnetCredits(user.id)).toBe(4)
  })

  it('should handle concurrent booking attempts correctly', async () => {
    const schedule = await createTestSchedule({ availableSpots: 1 })
    const user1 = await createTestUser({ carnetCredits: 5 })
    const user2 = await createTestUser({ carnetCredits: 5 })

    const [result1, result2] = await Promise.all([
      bookingService.bookClass({ scheduleId: schedule.id }),
      bookingService.bookClass({ scheduleId: schedule.id })
    ])

    // One should succeed, one should fail or go to waitlist
    expect([result1.success, result2.success]).toContain(true)
    expect(await getClassBookingCount(schedule.id)).toBe(1)
  })
})
```

### Integration Flow Tests
```typescript
describe('Complete Booking Flow Integration', () => {
  it('should handle booking → cancellation → waitlist promotion flow', async () => {
    // Setup: Full class with one booking and one waitlist entry
    const schedule = await createFullClassWithWaitlist()
    const bookedUser = await getBookedUser(schedule.id)
    const waitlistUser = await getWaitlistUser(schedule.id)

    // Action: Cancel the booking
    await bookingService.cancelBooking(bookedUser.bookingId)

    // Verify: Waitlist user should be promoted
    expect(await isUserBooked(waitlistUser.id, schedule.id)).toBe(true)
    expect(await getWaitlistPosition(waitlistUser.id, schedule.id)).toBe(null)
  })

  it('should maintain credit consistency during failed operations', async () => {
    const user = await createTestUser({ carnetCredits: 1 })
    const initialCredits = await getUserCarnetCredits(user.id)

    // Attempt to book a non-existent schedule
    const result = await bookingService.bookClass({ scheduleId: 'invalid-id' })

    expect(result.success).toBe(false)
    expect(await getUserCarnetCredits(user.id)).toBe(initialCredits)
  })
})
```

### E2E Test Examples
```typescript
// tests/e2e/booking-flow.spec.ts
test('User can complete full booking journey', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[data-testid="email"]', 'testuser@example.com')
  await page.fill('[data-testid="password"]', 'password123')
  await page.click('[data-testid="login-button"]')

  await page.goto('/espace/planning')
  await page.click('[data-testid="class-card-1"] [data-testid="book-button"]')

  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
  await expect(page.locator('[data-testid="booking-confirmed"]')).toBeVisible()
})
```

## 📈 Testing Benefits

### Immediate Benefits
- ✅ **System Understanding**: Clear documentation of how each component works
- ✅ **Bug Detection**: Catch edge cases and race conditions before production
- ✅ **Safe Refactoring**: Confidence to improve and optimize code
- ✅ **Regression Prevention**: Automated detection of breaking changes

### Long-term Benefits
- ✅ **Development Velocity**: Faster feature development with confidence
- ✅ **Code Quality**: Enforced patterns and better architecture
- ✅ **Onboarding**: New developers can understand system through tests
- ✅ **Documentation**: Living documentation that stays up-to-date

## 🚀 Getting Started

### 1. Basic Setup Commands
```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @playwright/test

# Create test configuration
touch vitest.config.ts playwright.config.ts

# Create test directories
mkdir -p tests/{unit,integration,e2e}
mkdir -p tests/utils tests/mocks tests/fixtures
```

### 2. First Test to Implement
Start with the most critical path:
```typescript
// tests/unit/booking-service.test.ts
describe('BookingService - Critical Path', () => {
  it('should book a class with valid subscription', async () => {
    // This will be our first test to validate the system works
  })
})
```

### 3. Configuration Files
- `vitest.config.ts` - Unit and integration test configuration
- `playwright.config.ts` - E2E test configuration
- `tests/setup.ts` - Global test setup and utilities
- `tests/mocks/` - Mock implementations for external services

## 🎯 Success Criteria

The testing suite will be considered successful when:

1. **Coverage**: >90% coverage on booking, cancellation, and credit management logic
2. **Reliability**: All tests pass consistently across different environments
3. **Performance**: Test suite runs in under 5 minutes for CI/CD
4. **Documentation**: Tests serve as comprehensive documentation of system behavior
5. **Confidence**: Team feels confident making changes to booking system

## 📝 Next Steps

Choose your starting approach:

1. **🔧 Setup First** - Configure testing environment and write first unit tests
2. **🎯 Critical Path Focus** - Start with most important booking flows
3. **🔍 Deep Dive Analysis** - Begin with thorough test case design and edge case identification
4. **🚀 Full Implementation** - Complete setup and begin systematic implementation

The testing suite will provide the foundation for understanding, refining, and perfecting the booking system with confidence.