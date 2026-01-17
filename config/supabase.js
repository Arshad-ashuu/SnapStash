import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hcbnyanblkfchcpgeete.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjYm55YW5ibGtmY2hjcGdlZXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NDg2NjAsImV4cCI6MjA4NDIyNDY2MH0.-V65cwCs8yfpJVffQ0CXGXKhUdtAOe7yJ4h3mfBsKfw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)