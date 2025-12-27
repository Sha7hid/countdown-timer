import { useState, useCallback } from 'react';
import {
    Modal,
    TextField,
    Select,
    Stack,
    ColorPicker,
    Text,
    Box,
} from '@shopify/polaris';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useAppBridge } from '@shopify/app-bridge-react';
import { hsbToHex } from '../utils/colorUtils';

export function TimerCreateModal({ open, onClose, onSuccess }) {
    const fetch = useAuthenticatedFetch();
    const shopify = useAppBridge();

    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        startDate: '', // YYYY-MM-DD
        startTime: '', // HH:MM
        endDate: '',
        endTime: '',
        description: '',
        // Display Options
        position: 'top',
        fontSize: 'medium',
        textColor: {
            hue: 120,
            brightness: 1,
            saturation: 1,
        },
        // Urgency
        urgencyType: 'pulse', // 'pulse', 'none', etc.
    });

    // Handlers
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleColorChange = (value) => {
        setFormData(prev => ({ ...prev, textColor: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // 1. Construct payload
            const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00`).toISOString();
            const endDateTime = new Date(`${formData.endDate}T${formData.endTime}:00`).toISOString();

            // Convert HSB to Hex
            const colorHex = hsbToHex(formData.textColor);

            const payload = {
                title: formData.title,
                description: formData.description,
                startDate: startDateTime,
                endDate: endDateTime,
                isActive: true, // Default active
                displayOptions: {
                    position: formData.position,
                    fontSize: formData.fontSize,
                    backgroundColor: colorHex,
                    textColor: '#FFFFFF', // Default white text
                },
                urgencySettings: {
                    enabled: formData.urgencyType !== 'none',
                    pulseEffect: formData.urgencyType === 'pulse',
                    threshold: 5,
                    showBanner: true,
                    bannerText: "Hurry! Ends soon!",
                }
            };

            const response = await fetch("/api/timers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                shopify.toast.show("Timer created successfully");
                onSuccess();
                onClose();
                // Reset form or keeping it as is since modal closes
            } else {
                const data = await response.json();
                shopify.toast.show(data.error || "Failed to create timer", { isError: true });
            }
        } catch (err) {
            console.error(err);
            shopify.toast.show("Error creating timer", { isError: true });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Create New Timer"
            primaryAction={{
                content: 'Create timer',
                onAction: handleSubmit,
                loading: isLoading,
            }}
            secondaryActions={[
                {
                    content: 'Cancel',
                    onAction: onClose,
                },
            ]}
        >
            <Modal.Section>
                <Stack vertical spacing="loose">
                    <TextField
                        label={<Text as="span" tone="critical">Timer name *</Text>}
                        value={formData.title}
                        onChange={(val) => handleChange('title', val)}
                        placeholder="Enter timer name"
                        autoComplete="off"
                    />

                    <Stack distribution="fill" spacing="loose">
                        <div style={{ flex: 1 }}>
                            <TextField
                                label="Start date"
                                type="date"
                                value={formData.startDate}
                                onChange={(val) => handleChange('startDate', val)}
                                autoComplete="off"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <TextField
                                label="Start time"
                                type="time"
                                value={formData.startTime}
                                onChange={(val) => handleChange('startTime', val)}
                                autoComplete="off"
                            />
                        </div>
                    </Stack>

                    <Stack distribution="fill" spacing="loose">
                        <div style={{ flex: 1 }}>
                            <TextField
                                label="End date"
                                type="date"
                                value={formData.endDate}
                                onChange={(val) => handleChange('endDate', val)}
                                autoComplete="off"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <TextField
                                label="End time"
                                type="time"
                                value={formData.endTime}
                                onChange={(val) => handleChange('endTime', val)}
                                autoComplete="off"
                            />
                        </div>
                    </Stack>

                    <TextField
                        label="Promotion description"
                        value={formData.description}
                        onChange={(val) => handleChange('description', val)}
                        placeholder="Enter promotion details"
                        multiline={3}
                        autoComplete="off"
                    />

                    <Box>
                        <Text>Timer Color</Text>
                        <div style={{ marginTop: '0.5rem' }}>
                            <ColorPicker onChange={handleColorChange} color={formData.textColor} />
                        </div>
                    </Box>

                    <Stack distribution="fill" spacing="loose">
                        <div style={{ flex: 1 }}>
                            <Select
                                label="Timer size"
                                options={[
                                    { label: 'Small', value: 'small' },
                                    { label: 'Medium', value: 'medium' },
                                    { label: 'Large', value: 'large' },
                                ]}
                                value={formData.fontSize}
                                onChange={(val) => handleChange('fontSize', val)}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Select
                                label="Timer position"
                                options={[
                                    { label: 'Top of page', value: 'top' },
                                    { label: 'Bottom of page', value: 'bottom' },
                                    { label: 'Above Price', value: 'above-price' },
                                ]}
                                value={formData.position}
                                onChange={(val) => handleChange('position', val)}
                            />
                        </div>
                    </Stack>

                    <Select
                        label="Urgency notification"
                        options={[
                            { label: 'Color pulse', value: 'pulse' },
                            { label: 'None', value: 'none' },
                        ]}
                        value={formData.urgencyType}
                        onChange={(val) => handleChange('urgencyType', val)}
                    />
                </Stack>
            </Modal.Section>
        </Modal>
    );
}
