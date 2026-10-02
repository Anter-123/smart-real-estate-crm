import { useState, useEffect } from "react";
import type { Reminder } from "../types";
import * as api from "../api";

export const playReminderChime = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch {}
};

export const useReminderAlerts = (
  setToastMessage: (msg: { text: string; type: "success" | "info" } | null) => void
) => {
  const [dueReminderAlert, setDueReminderAlert] = useState<Reminder | null>(null);
  const [dismissedReminderIds, setDismissedReminderIds] = useState<string[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const data = await api.getReminders();
        setReminders(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchReminders();
    const intId = setInterval(fetchReminders, 30000); // refresh every 30s
    return () => clearInterval(intId);
  }, []);

  useEffect(() => {
    // Check every 5 seconds for due PENDING reminders
    const intervalId = setInterval(() => {
      if (dueReminderAlert) return; // Wait until current alert is closed
      
      const now = new Date();
      const due = reminders.find((r) => {
        if (r.status !== "PENDING") return false;
        if (dismissedReminderIds.includes(r.id)) return false;
        const rTime = new Date(r.time);
        return rTime <= now; // It's past due
      });

      if (due) {
        setDueReminderAlert(due);
        playReminderChime();
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`Reminder: ${due.title}`, {
            body: due.description || "",
            icon: "/favicon.ico",
          });
        } else if ("Notification" in window && Notification.permission !== "denied") {
          Notification.requestPermission();
        }
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [reminders, dismissedReminderIds, dueReminderAlert]);

  const handleToggleReminderStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "PENDING" ? "COMPLETED" : "PENDING";
      await api.updateReminder(id, { status: newStatus });
      setReminders(reminders.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
      setToastMessage({ text: "Reminder status updated", type: "success" });
      setTimeout(() => setToastMessage(null), 3000);
      if (dueReminderAlert?.id === id) {
        setDueReminderAlert(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return {
    reminders,
    dueReminderAlert,
    setDueReminderAlert,
    dismissedReminderIds,
    setDismissedReminderIds,
    handleToggleReminderStatus
  };
};
