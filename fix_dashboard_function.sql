-- Fix the get_user_dashboard_data function to resolve GROUP BY issue
CREATE OR REPLACE FUNCTION public.get_user_dashboard_data(user_uuid uuid) RETURNS jsonb AS $$

DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'profile', (
      SELECT jsonb_build_object(
        'id', id,
        'email', email,
        'full_name', full_name,
        'phone', phone,
        'subscription_status', subscription_status,
        'role', role
      )
      FROM public.profiles WHERE id = user_uuid
    ),
    'active_subscription', (
      SELECT jsonb_build_object(
        'id', us.id,
        'status', us.status,
        'credits_remaining', us.credits_remaining,
        'weekly_credits_used', us.weekly_credits_used,
        'end_date', us.end_date,
        'start_date', us.start_date,
        'plan', jsonb_build_object(
          'id', sp.id,
          'name', sp.name,
          'type', sp.type,
          'weekly_limit', sp.weekly_limit,
          'credits', sp.credits,
          'price_dhs', sp.price_dhs
        )
      )
      FROM public.user_subscriptions us
      JOIN public.subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = user_uuid
        AND us.status = 'active'
        AND us.end_date > NOW()
      ORDER BY us.end_date DESC
      LIMIT 1
    ),
    'recent_bookings', (
      SELECT CASE
        WHEN COUNT(*) > 0 THEN jsonb_agg(booking_data)
        ELSE '[]'::jsonb
      END
      FROM (
        SELECT jsonb_build_object(
          'id', cb.id,
          'status', cb.status,
          'booked_at', cb.booked_at,
          'cancelled_at', cb.cancelled_at,
          'class_title', c.title,
          'start_datetime', cs.start_datetime,
          'end_datetime', cs.end_datetime,
          'coach', c.coach,
          'location', c.location
        ) as booking_data
        FROM public.class_bookings cb
        JOIN public.class_schedules cs ON cb.schedule_id = cs.id
        JOIN public.classes c ON cs.class_id = c.id
        WHERE cb.user_id = user_uuid
        ORDER BY cb.booked_at DESC
        LIMIT 10
      ) recent_bookings_sub
    ),
    'upcoming_classes', (
      SELECT CASE
        WHEN COUNT(*) > 0 THEN jsonb_agg(class_data)
        ELSE '[]'::jsonb
      END
      FROM (
        SELECT jsonb_build_object(
          'id', cs.id,
          'title', c.title,
          'description', c.description,
          'start_datetime', cs.start_datetime,
          'end_datetime', cs.end_datetime,
          'coach', c.coach,
          'location', c.location,
          'difficulty_level', c.difficulty_level,
          'current_bookings', cs.current_bookings,
          'max_capacity', c.max_capacity,
          'user_booked', (cb.id IS NOT NULL),
          'user_booking_id', cb.id,
          'user_waitlist_position', cw.position
        ) as class_data
        FROM public.class_schedules cs
        JOIN public.classes c ON cs.class_id = c.id
        LEFT JOIN public.class_bookings cb ON cs.id = cb.schedule_id AND cb.user_id = user_uuid AND cb.status = 'confirmed'
        LEFT JOIN public.class_waitlist cw ON cs.id = cw.schedule_id AND cw.user_id = user_uuid
        WHERE cs.start_datetime >= NOW()
          AND NOT cs.is_cancelled
          AND NOT cs.is_exception
        ORDER BY cs.start_datetime
        LIMIT 20
      ) upcoming_classes_sub
    )
  ) INTO result;

  RETURN result;
END;

$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;