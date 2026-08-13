import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wyxyrehrpsohkaoanldm.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5eHlyZWhycHNvaGthb2FubGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTY5NDUsImV4cCI6MjA4NjU3Mjk0NX0.placeholder';
  return createBrowserClient(url, key)
}
