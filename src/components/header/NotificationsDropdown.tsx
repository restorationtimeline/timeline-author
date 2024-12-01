import React from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HeaderActionButton } from "./HeaderActionButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export const NotificationsDropdown = () => {
  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Notification[];
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    refetch();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <HeaderActionButton
            icon={<Bell className="h-6 w-6 md:h-4 md:w-4" />}
            onClick={() => {}}
            tooltip="Notifications"
          />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-4 space-y-1 cursor-pointer ${
                  !notification.read ? "bg-accent/50" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="font-medium">{notification.title}</div>
                <div className="text-sm text-gray-500">{notification.message}</div>
                <div className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                  })}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};