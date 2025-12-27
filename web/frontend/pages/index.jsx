import { useState, useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Page, Box, Text, Stack, Button, Icon } from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";
import { TimerList } from "../components/TimerList";
import { TimerCreateModal } from "../components/TimerCreateModal";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

export default function HomePage() {
  const shopify = useAppBridge();
  const fetch = useAuthenticatedFetch();

  const [timers, setTimers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchTimers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/timers");
      if (response.ok) {
        const data = await response.json();
        setTimers(data.timers);
      } else {
        shopify.toast.show("Failed to fetch timers", { isError: true });
      }
    } catch (error) {
      shopify.toast.show("Error fetching timers", { isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimers();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/timers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        shopify.toast.show("Timer deleted successfully");
        fetchTimers();
      } else {
        shopify.toast.show("Failed to delete timer", { isError: true });
      }
    } catch (error) {
      shopify.toast.show("Error deleting timer", { isError: true });
    }
  };

  const handleToggle = async (id) => {
    try {
      const response = await fetch(`/api/timers/${id}/toggle`, {
        method: "PATCH",
      });

      if (response.ok) {
        shopify.toast.show("Timer status updated");
        fetchTimers();
      } else {
        shopify.toast.show("Failed to update timer status", { isError: true });
      }
    } catch (error) {
      shopify.toast.show("Error toggling timer", { isError: true });
    }
  };

  if (isLoading) {
    return null;
  }

  const createButton = (
    <div className="custom-black-button">
      <Button
        onClick={() => setIsCreateModalOpen(true)}
        icon={PlusIcon}
      >
        <span>Create Timer</span>
      </Button>
      <style>{`
        .custom-black-button button {
          background: black !important;
          border-color: black !important;
          box-shadow: none !important;
        }
        .custom-black-button button:hover {
          background: #333 !important;
        }
        .custom-black-button * {
          color: white !important;
          fill: white !important;
        }
      `}</style>
    </div>
  );

  return (
    <Page
      title="Countdown Timer Manager"
      subtitle="create and manage countdown timers for your promotions"
      primaryAction={createButton}
    >
      <TimerList
        timers={timers}
        onDelete={handleDelete}
        onToggle={handleToggle}
        onCreate={() => setIsCreateModalOpen(true)}
      />

      <TimerCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchTimers}
      />
    </Page>
  );
}
