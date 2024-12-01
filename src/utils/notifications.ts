import { supabase } from "@/integrations/supabase/client";

export const createNotification = async (title: string, message: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  await supabase
    .from("notifications")
    .insert({
      user_id: session.user.id,
      title,
      message,
    });
};