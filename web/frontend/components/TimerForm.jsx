import React, { useState, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  TextField,
  Select,
  Button,
  Stack,
  ColorPicker,
  Text,
  Box,
} from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import { hsbToHex, hexToHsb } from '../utils/colorUtils';

export function TimerForm({ timer, onSave, isLoading }) {
  const navigate = useNavigate();

  // Initialize state from existing timer or defaults
  const [formData, setFormData] = useState(() => {
    const startDateObj = timer?.startDate ? new Date(timer.startDate) : new Date();
    const endDateObj = timer?.endDate ? new Date(timer.endDate) : new Date();

    return {
      title: timer?.title || '',
      description: timer?.description || '',
      // Split Date and Time
      startDate: timer?.startDate ? startDateObj.toISOString().split('T')[0] : '',
      startTime: timer?.startDate ? startDateObj.toTimeString().slice(0, 5) : '',
      endDate: timer?.endDate ? endDateObj.toISOString().split('T')[0] : '',
      endTime: timer?.endDate ? endDateObj.toTimeString().slice(0, 5) : '',

      // Display Options
      position: timer?.displayOptions?.position || 'top',
      fontSize: timer?.displayOptions?.fontSize || 'medium',
      textColor: timer?.displayOptions?.backgroundColor ? hexToHsb(timer.displayOptions.backgroundColor) : {
        hue: 120,
        brightness: 1,
        saturation: 1,
      },

      // Urgency
      urgencyType: timer?.urgencySettings?.enabled ? 'pulse' : 'none',

      // Keep other fields that might not be in the modal but are in the model
      isActive: timer?.isActive ?? true,
    };
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleColorChange = (value) => {
    setFormData((prev) => ({ ...prev, textColor: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';

    if (formData.startDate && formData.endDate) {
      const start = new Date(`${formData.startDate}T${formData.startTime}:00`);
      const end = new Date(`${formData.endDate}T${formData.endTime}:00`);
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(() => {
    if (!validate()) return;

    // Construct payload matching the Create Modal logic
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00`).toISOString();
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}:00`).toISOString();
    const colorHex = hsbToHex(formData.textColor);

    const payload = {
      title: formData.title,
      description: formData.description,
      startDate: startDateTime,
      endDate: endDateTime,
      isActive: formData.isActive,
      displayOptions: {
        position: formData.position,
        fontSize: formData.fontSize,
        backgroundColor: colorHex,
        textColor: '#FFFFFF', // Default
        // Preserving defaults for hidden fields
        showDays: true,
        showHours: true,
        showMinutes: true,
        showSeconds: true,
      },
      urgencySettings: {
        enabled: formData.urgencyType !== 'none',
        pulseEffect: formData.urgencyType === 'pulse',
        threshold: 5,
        showBanner: true,
        bannerText: "Hurry! Ends soon!",
      },
      targetProducts: 'all', // Defaulting as per Modal
    };

    onSave(payload);
  }, [formData, onSave]);

  return (
    <Page
      title={timer ? 'Edit Timer' : 'Create Timer'}
      breadcrumbs={[{ content: 'Timers', onAction: () => navigate('/') }]}
      primaryAction={{
        content: 'Save',
        loading: isLoading,
        onAction: handleSubmit,
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: () => navigate('/'),
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack vertical spacing="loose">
              <TextField
                label={<Text as="span" tone="critical">Timer name *</Text>}
                value={formData.title}
                onChange={(val) => handleChange('title', val)}
                placeholder="Enter timer name"
                autoComplete="off"
                error={errors.title}
              />

              <Stack distribution="fill" spacing="loose">
                <div style={{ flex: 1 }}>
                  <TextField
                    label="Start date"
                    type="date"
                    value={formData.startDate}
                    onChange={(val) => handleChange('startDate', val)}
                    autoComplete="off"
                    error={errors.startDate}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <TextField
                    label="Start time"
                    type="time"
                    value={formData.startTime}
                    onChange={(val) => handleChange('startTime', val)}
                    autoComplete="off"
                    error={errors.startTime}
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
                    error={errors.endDate}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <TextField
                    label="End time"
                    type="time"
                    value={formData.endTime}
                    onChange={(val) => handleChange('endTime', val)}
                    autoComplete="off"
                    error={errors.endTime}
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
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}