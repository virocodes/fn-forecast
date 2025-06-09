'use server'

import { createClient } from "@/libs/supabase/server";

export async function getUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null };
  }

  return { user };
}