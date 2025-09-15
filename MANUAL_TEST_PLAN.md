# Koncept Studio - Definition of Done & Manual Test Plan

## Definition of Done (DoD)

A feature is considered DONE when:

### ✅ Functional Requirements
- [ ] All user stories are implemented according to specifications
- [ ] All happy path scenarios work correctly
- [ ] Error handling is implemented for all edge cases
- [ ] Data validation works on both client and server side
- [ ] Database operations complete successfully
- [ ] Authentication and authorization work correctly

### ✅ Technical Requirements
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] No 404 errors on navigation
- [ ] Database queries are optimized (no N+1 problems)
- [ ] RLS policies work correctly without infinite recursion
- [ ] Responsive design works on mobile and desktop
- [ ] Loading states are implemented where needed
- [ ] Success/error messages are displayed appropriately

### ✅ Security Requirements
- [ ] User can only access their own data
- [ ] Admin can access all data appropriately
- [ ] No sensitive data exposed in client-side code
- [ ] Authentication is required for protected routes
- [ ] SQL injection is prevented through parameterized queries

---

# MANUAL TEST PLAN

## 🌐 **1. PUBLIC PAGES (Unauthenticated)**

### 1.1 Homepage (`/`)
**Test Steps:**
1. Navigate to `http://localhost:3000/`
2. Verify page loads without errors
3. Check navbar shows "Connexion" and "Inscription" buttons
4. Verify no duplicate navbar appears
5. Test responsive design (mobile/desktop)
6. Click "Get Started" button → should redirect to `/signup`
7. Click "Learn More" button → should scroll or navigate appropriately

**Expected Results:**
- [ ] Page loads within 3 seconds
- [ ] Single navbar visible (no duplicates)
- [ ] All buttons work correctly
- [ ] No console errors
- [ ] Responsive design works

### 1.2 Signup Page (`/signup`)
**Test Steps:**
1. Navigate to `/signup`
2. Verify subscription plans load correctly (no "Erreurs de validation")
3. Fill out form with valid data:
   - Full name: "Test User"
   - Email: "test@example.com"
   - Phone: "+212612345678" (optional)
   - Password: "SecurePass123!"
   - Select a subscription plan
4. Submit form
5. Test validation errors:
   - Submit with empty required fields
   - Submit with invalid email
   - Submit with weak password
   - Submit without selecting plan

**Expected Results:**
- [ ] No "Erreurs de validation" on page load
- [ ] Subscription plans load and display correctly
- [ ] Form validation works
- [ ] Successful signup redirects to `/espace`
- [ ] User profile created in database
- [ ] No Radix UI SelectItem errors

### 1.3 Login Page (`/login`)
**Test Steps:**
1. Navigate to `/login`
2. Test with valid credentials
3. Test with invalid credentials
4. Test with empty fields

**Expected Results:**
- [ ] Valid login redirects to `/espace`
- [ ] Invalid login shows error message
- [ ] Form validation works
- [ ] No console errors

---

## 🔐 **2. USER PROTECTED AREA (`/espace`)**

### 2.1 User Dashboard (`/espace`)
**Prerequisites:** Login as regular user

**Test Steps:**
1. Login and navigate to `/espace`
2. Verify user profile information displays
3. Check subscription status
4. View recent bookings
5. View upcoming classes
6. Test navigation to other espace pages

**Expected Results:**
- [ ] Dashboard loads correctly
- [ ] User data displays accurately
- [ ] Subscription information is correct
- [ ] Navigation works to all espace sub-pages
- [ ] No admin-only features visible

### 2.2 Class Planning (`/espace/planning`)
**Test Steps:**
1. Navigate to `/espace/planning`
2. View available classes
3. Try to book a class (if user has active subscription)
4. Try to join waitlist if class is full
5. Test different class types and times

**Expected Results:**
- [ ] Classes display correctly
- [ ] Booking functionality works
- [ ] Waitlist functionality works
- [ ] Only available classes are bookable
- [ ] Credits are deducted correctly

### 2.3 User Reservations (`/espace/reservations`)
**Test Steps:**
1. Navigate to `/espace/reservations`
2. View current bookings
3. Cancel a booking (if allowed - 24h+ before class)
4. Try to cancel a booking too close to class time

**Expected Results:**
- [ ] Reservations display correctly
- [ ] Cancellation works within policy
- [ ] Credits are refunded on cancellation
- [ ] Cancellation blocked when too late

### 2.4 Subscription Management (`/espace/abonnement`)
**Test Steps:**
1. Navigate to `/espace/abonnement`
2. View current subscription details
3. View subscription history
4. Check credit balance and usage

**Expected Results:**
- [ ] Subscription details are accurate
- [ ] Credit balance matches database
- [ ] Usage tracking is correct

---

## 👑 **3. ADMIN PROTECTED AREA (`/admin`)**

### 3.1 Admin Access Control
**Prerequisites:** Login as admin user

**Test Steps:**
1. Navigate to `/admin` as regular user → should be redirected
2. Navigate to `/admin` as admin → should access admin panel
3. Verify navbar is hidden in admin area (only sidebar visible)

**Expected Results:**
- [ ] Regular users cannot access admin area
- [ ] Admin users can access admin area
- [ ] No navbar visible in admin (no brief flash/disappear)
- [ ] Sidebar navigation works correctly

### 3.2 Admin Dashboard (`/admin`)
**Test Steps:**
1. Navigate to `/admin`
2. Verify admin dashboard loads
3. Check key metrics and statistics
4. Test navigation to other admin sections

**Expected Results:**
- [ ] Dashboard loads without errors
- [ ] Statistics are accurate
- [ ] Navigation works correctly
- [ ] No infinite recursion errors

### 3.3 Users Management Dropdown
**Test Steps:**
1. In admin sidebar, locate "Users" menu item
2. Click to expand dropdown
3. Verify three submenu options:
   - "All active user info" → `/admin/users`
   - "Pending users to contact" → `/admin/users/pending`
   - "Contacted users to assign" → `/admin/users/contacted`
4. Test navigation to each submenu item
5. Verify dropdown closes/opens correctly
6. Check badge count on Users menu

**Expected Results:**
- [ ] Users dropdown expands/collapses correctly
- [ ] All three submenu options are visible
- [ ] Navigation works to each page
- [ ] Badge count reflects unresolved users
- [ ] No TypeScript errors
- [ ] Dropdown stays open when on users pages

### 3.4 All Active User Info (`/admin/users`)
**Test Steps:**
1. Navigate to `/admin/users`
2. Verify page title is "All Active User Info"
3. Test user data loading (no GROUP BY errors)
4. Test pagination if many users
5. Test user actions (activate/deactivate)

**Expected Results:**
- [ ] No "Erreur lors du chargement des utilisateurs"
- [ ] User data loads correctly
- [ ] Pagination works if applicable
- [ ] User actions work correctly
- [ ] No GROUP BY clause errors

### 3.5 Pending Users (`/admin/users/pending`)
**Test Steps:**
1. Navigate to `/admin/users/pending`
2. Verify page loads correctly
3. Check that it shows users with subscription_status = 'pending'

**Expected Results:**
- [ ] Page loads without errors
- [ ] Shows correct pending users
- [ ] Placeholder content displays properly

### 3.6 Contacted Users (`/admin/users/contacted`)
**Test Steps:**
1. Navigate to `/admin/users/contacted`
2. Verify page loads correctly
3. Check that it shows users with subscription_status = 'contacted'

**Expected Results:**
- [ ] Page loads without errors
- [ ] Shows correct contacted users
- [ ] Placeholder content displays properly

### 3.7 Subscription Plans (`/admin/subscription-plans`)
**Test Steps:**
1. Navigate to `/admin/subscription-plans`
2. Verify no "infinite recursion detected" errors
3. Test CRUD operations on subscription plans
4. Test plan creation and editing

**Expected Results:**
- [ ] No infinite recursion errors
- [ ] Plans load correctly
- [ ] CRUD operations work
- [ ] RLS policies work correctly

### 3.8 Classes Management (`/admin/classes`)
**Test Steps:**
1. Navigate to `/admin/classes`
2. Test creating new classes
3. Test editing existing classes
4. Test class scheduling

**Expected Results:**
- [ ] Classes load correctly
- [ ] Create/edit functionality works
- [ ] Scheduling works correctly

### 3.9 Calendar/Planning (`/admin/calendar`)
**Test Steps:**
1. Navigate to `/admin/calendar`
2. View class schedules
3. Test calendar navigation
4. Test creating/editing scheduled classes

**Expected Results:**
- [ ] Calendar loads correctly
- [ ] Schedules display properly
- [ ] Navigation works smoothly

---

## 🔄 **4. AUTHENTICATION FLOWS**

### 4.1 Authentication State Management
**Test Steps:**
1. Login as user → verify redirect to `/espace`
2. Login as admin → verify redirect to `/espace` then auto-redirect to `/admin`
3. Logout → verify redirect to homepage
4. Try accessing protected routes while logged out
5. Session persistence (refresh page while logged in)

**Expected Results:**
- [ ] Proper redirects after login
- [ ] Admin auto-redirect works
- [ ] Logout clears session
- [ ] Protected routes require auth
- [ ] Session persists on refresh

### 4.2 Role-Based Access Control
**Test Steps:**
1. Login as regular user:
   - Try to access `/admin/*` → should be blocked
   - Access to `/espace/*` → should work
2. Login as admin:
   - Access to `/admin/*` → should work
   - Access to `/espace/*` → should work

**Expected Results:**
- [ ] Regular users cannot access admin area
- [ ] Admins can access both areas
- [ ] Proper error messages for unauthorized access

---

## 📊 **5. DATABASE & PERFORMANCE**

### 5.1 Database Operations
**Test Steps:**
1. Create user account
2. Book classes
3. Cancel bookings
4. Check audit trails
5. Test subscription operations

**Expected Results:**
- [ ] All database operations complete successfully
- [ ] Data consistency maintained
- [ ] No orphaned records
- [ ] Audit trails work correctly

### 5.2 Performance Testing
**Test Steps:**
1. Load pages and measure load times
2. Test with multiple concurrent users (if possible)
3. Check for N+1 query problems
4. Monitor database query performance

**Expected Results:**
- [ ] Pages load within 3 seconds
- [ ] No N+1 query issues
- [ ] Database queries are optimized
- [ ] No performance degradation

---

## 🚨 **6. ERROR SCENARIOS**

### 6.1 Network Errors
**Test Steps:**
1. Simulate network disconnection
2. Test form submissions with poor connectivity
3. Test page navigation with intermittent connection

**Expected Results:**
- [ ] Graceful error handling
- [ ] User-friendly error messages
- [ ] No data corruption

### 6.2 Database Errors
**Test Steps:**
1. Test with invalid data
2. Test constraint violations
3. Test concurrent booking scenarios

**Expected Results:**
- [ ] Database errors handled gracefully
- [ ] No infinite recursion in RLS policies
- [ ] Proper error messages displayed

---

## 📱 **7. RESPONSIVE DESIGN**

### 7.1 Mobile Testing
**Test Steps:**
1. Test all pages on mobile viewport (320px width)
2. Test touch interactions
3. Test form inputs on mobile
4. Test navigation on mobile

**Expected Results:**
- [ ] All pages are mobile-friendly
- [ ] Touch interactions work
- [ ] Forms are usable on mobile
- [ ] Navigation works on mobile

### 7.2 Tablet & Desktop Testing
**Test Steps:**
1. Test on tablet viewport (768px width)
2. Test on desktop viewport (1200px+ width)
3. Verify layout adapts correctly

**Expected Results:**
- [ ] Responsive breakpoints work
- [ ] Layout is optimized for each screen size
- [ ] No horizontal scrollbars appear

---

## 🔧 **8. BROWSER COMPATIBILITY**

**Test Steps:**
1. Test on Chrome (latest)
2. Test on Firefox (latest)
3. Test on Safari (if available)
4. Test on Edge (latest)

**Expected Results:**
- [ ] Consistent behavior across browsers
- [ ] No browser-specific errors
- [ ] Features work in all tested browsers

---

## ✅ **FINAL CHECKLIST**

Before considering the app "DONE", verify:

- [ ] All test scenarios pass
- [ ] No console errors in any flow
- [ ] No TypeScript compilation errors
- [ ] No 404 errors on any navigation
- [ ] Database operations work correctly
- [ ] RLS policies don't cause infinite recursion
- [ ] Authentication flows work properly
- [ ] Role-based access control works
- [ ] Responsive design works on all screen sizes
- [ ] Performance is acceptable (< 3s page loads)
- [ ] Error handling is implemented everywhere
- [ ] User feedback is provided for all actions

---

## 🐛 **BUG REPORTING TEMPLATE**

When reporting issues, please use this format:

```
**Bug Title:** Brief description
**Page/Feature:** Specific page or feature
**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Result:** What should happen
**Actual Result:** What actually happens
**Browser:** Chrome/Firefox/Safari/Edge version
**Screen Size:** Desktop/Tablet/Mobile
**User Type:** Admin/Regular User/Unauthenticated
**Console Errors:** Any error messages
**Additional Info:** Screenshots, etc.
```

This will help identify and fix issues quickly and systematically.