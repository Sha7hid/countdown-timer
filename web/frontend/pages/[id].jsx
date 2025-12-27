import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppBridge } from "@shopify/app-bridge-react";
import { TimerForm } from "../components/TimerForm";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { Page, Layout, Card, SkeletonBodyText, SkeletonDisplayText } from "@shopify/polaris";

export default function EditTimer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const shopify = useAppBridge();
    const fetch = useAuthenticatedFetch();

    const [timer, setTimer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchTimer = async () => {
            try {
                const response = await fetch(`/api/timers/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setTimer(data.timer);
                } else {
                    shopify.toast.show("Timer not found", { isError: true });
                    navigate("/");
                }
            } catch (error) {
                console.error("Error fetching timer:", error);
                shopify.toast.show("Error fetching timer", { isError: true });
                navigate("/");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTimer();
    }, [id, fetch, navigate, shopify]);

    const handleSave = async (data) => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/timers/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                shopify.toast.show("Timer updated successfully");
                navigate("/");
            } else {
                const errorData = await response.json();
                shopify.toast.show(errorData.error || "Failed to update timer", { isError: true });
            }
        } catch (error) {
            console.error("Error updating timer:", error);
            shopify.toast.show("Error updating timer", { isError: true });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Page title="Edit Timer">
                <Layout>
                    <Layout.Section>
                        <Card sectioned>
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText />
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    if (!timer) return null;

    return (
        <TimerForm
            timer={timer}
            onSave={handleSave}
            isLoading={isSaving}
        />
    );
}
