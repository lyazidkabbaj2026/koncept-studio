# 🏗️ Koncept Studio Architecture

## 📁 Project Structure

```
koncept-studio-2/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   ├── admin/                    # Admin dashboard pages
│   ├── espace/                   # User dashboard pages
│   ├── login/                    # Authentication pages
│   └── signup/
├── components/                   # React Components
│   ├── layouts/                  # Reusable layout components
│   ├── nav/                      # Navigation components
│   ├── ui/                       # shadcn/ui components
│   └── user/                     # User-specific components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
│   ├── services/                 # Business logic layer
│   └── supabase/                 # Database client config
├── sql/                          # Database migrations
└── public/                       # Static assets
```

## 🎯 Architecture Principles

### 1. **Service Layer Architecture**
- **Services** (`lib/services/`): Centralized business logic
- **Components**: Pure UI logic, no direct database calls
- **Hooks**: State management and side effects
- **Actions**: Server-side operations only

### 2. **Separation of Concerns**

#### **Authentication Service** (`lib/services/auth.service.ts`)
```typescript
export class AuthService {
  async signIn(credentials: LoginCredentials): Promise<AuthResult>
  async signUp(data: SignupData): Promise<AuthResult>
  async signOut(): Promise<{ error: AuthError | null }>
  // ... other auth methods
}
```

#### **Booking Service** (`lib/services/booking.service.ts`)
```typescript
export class BookingService {
  async bookClass(data: BookingData): Promise<BookingResult>
  async cancelBooking(bookingId: string): Promise<BookingResult>
  async joinWaitlist(data: BookingData): Promise<WaitlistResult>
  // ... other booking methods
}
```

#### **Class Service** (`lib/services/class.service.ts`)
```typescript
export class ClassService {
  async getAllClasses(): Promise<Class[]>
  async getUpcomingClasses(limit?: number): Promise<CalendarEvent[]>
  async searchClasses(query: string): Promise<Class[]>
  // ... other class methods
}
```

#### **Subscription Service** (`lib/services/subscription.service.ts`)
```typescript
export class SubscriptionService {
  async getUserSubscriptions(userId: string): Promise<SubscriptionWithPlan[]>
  async getActiveUserSubscription(userId: string): Promise<SubscriptionWithPlan | null>
  async createSubscription(planId: string): Promise<UserSubscription>
  // ... other subscription methods
}
```

### 3. **Custom Hooks Pattern**

#### **useAuth Hook** (`hooks/use-auth.ts`)
```typescript
export function useAuth() {
  return {
    user: User | null,
    loading: boolean,
    isAuthenticated: boolean,
    signOut: () => Promise<void>
  }
}
```

#### **useSubscription Hook** (`hooks/use-subscription.ts`)
```typescript
export function useSubscription() {
  return {
    subscription: SubscriptionWithPlan | null,
    loading: boolean,
    hasValidSubscription: boolean,
    creditsRemaining: number,
    isUnlimited: boolean
  }
}
```

### 4. **Layout Components**

#### **AuthLayout** (`components/layouts/auth-layout.tsx`)
- Consistent styling for login/signup pages
- Automatic navigation links
- Responsive design

#### **DashboardLayout** (`components/layouts/dashboard-layout.tsx`)
- Standard dashboard structure
- Action buttons support
- Consistent typography

### 5. **Type Safety**

#### **Database Types** (`lib/database.types.ts`)
- Generated from Supabase schema
- Full TypeScript support
- Relationship mapping

## 🔄 Data Flow

### 1. **User Authentication**
```
Component → useAuth Hook → AuthService → Supabase Auth → Database
```

### 2. **Class Booking**
```
Component → BookingService → Supabase RPC → Database Functions → Response
```

### 3. **Dashboard Data**
```
Component → Service Layer → Optimized DB Functions → Single Query Result
```

## 🗄️ Database Architecture

### **Optimized Functions**
- `get_user_dashboard_data()`: Single query for all dashboard data
- `get_admin_users_data()`: Paginated admin users with subscriptions
- `book_class()`: Atomic booking with credit deduction
- `cancel_booking()`: Booking cancellation with waitlist promotion

### **Performance Indexes**
- Foreign key indexes on all relationships
- Composite indexes for common query patterns
- Optimized views for calendar data

### **Security**
- Row Level Security (RLS) enabled on all tables
- Function search_path hardening
- Admin role-based access control

## 🎨 Design Patterns

### 1. **Repository Pattern**
Services act as repositories, abstracting database operations.

### 2. **Hook Pattern**
Custom hooks encapsulate stateful logic and side effects.

### 3. **Layout Pattern**
Consistent layouts reduce duplication and ensure UX consistency.

### 4. **Service Singleton Pattern**
Service instances are exported as singletons for consistent state.

### 5. **Error Boundary Pattern**
Comprehensive error handling at component and service levels.

## 🚀 Performance Optimizations

### **Database Level**
- ✅ Critical foreign key indexes added
- ✅ Composite indexes for common queries
- ✅ Optimized database functions (eliminates N+1 queries)
- ✅ Efficient views for calendar data

### **Application Level**
- ✅ Service layer reduces prop drilling
- ✅ Custom hooks prevent unnecessary re-renders
- ✅ Optimized imports and tree shaking
- ✅ Consistent component patterns

### **Security Level**
- ✅ Row Level Security enabled
- ✅ Function injection protection
- ✅ Proper authentication flows
- ✅ Admin access control

## 🎯 Benefits

### **Maintainability**
- Clear separation of concerns
- Consistent code patterns
- Easy to test and debug

### **Performance**
- Optimized database queries
- Reduced client-server round trips
- Efficient component updates

### **Scalability**
- Service layer can be easily extended
- Database functions handle complex operations
- Modular component architecture

### **Developer Experience**
- Full TypeScript support
- Consistent API patterns
- Comprehensive error handling

This architecture ensures **Koncept Studio** is maintainable, performant, and ready for production scale! 🚀