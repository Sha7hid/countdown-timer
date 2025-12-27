import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  Button,
  Stack,
  EmptyState,
  Box,
  TextField,
  Popover,
  ActionList,
  Icon,
  Layout,
  Modal,
  Select,
} from '@shopify/polaris';
import {
  SearchIcon,
  MenuHorizontalIcon,
  PlusIcon
} from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';

export function TimerList({ timers, onDelete, onToggle, onCreate }) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSearchChange = useCallback((value) => setSearchValue(value), []);
  const handleSortChange = useCallback((value) => setSortValue(value), []);
  const handleStatusFilterChange = useCallback((value) => setStatusFilter(value), []);

  const getTimerStatusInfo = (timer) => {
    const now = new Date();
    const start = new Date(timer.startDate);
    const end = new Date(timer.endDate);

    if (!timer.isActive) return { status: 'Inactive', tone: 'warning' };
    if (now < start) return { status: 'Scheduled', tone: 'info' };
    if (now >= start && now <= end) return { status: 'Active', tone: 'success' };
    return { status: 'Expired', tone: 'critical' };
  };

  const sortedAndFilteredTimers = useMemo(() => {
    let result = [...timers];

    // Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(timer => {
        const { status } = getTimerStatusInfo(timer);
        return status.toLowerCase() === statusFilter;
      });
    }

    // Search
    if (searchValue) {
      const lowerSearch = searchValue.toLowerCase();
      result = result.filter(timer =>
        timer.title.toLowerCase().includes(lowerSearch) ||
        timer.description.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.startDate).getTime();
      const dateB = new Date(b.createdAt || b.startDate).getTime();
      return sortValue === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [timers, searchValue, sortValue, statusFilter]);

  const getTimerStatus = getTimerStatusInfo;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const TimerActionMenu = ({ id, isActive }) => {
    const [active, setActive] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);

    const handleDeleteClick = () => {
      setIsDeleteModalOpen(true);
      setActive(false);
    };

    return (
      <div onClick={(e) => e.stopPropagation()}>
        <Popover
          active={active}
          activator={
            <Button
              icon={MenuHorizontalIcon}
              variant="tertiary"
              onClick={(e) => {
                e.stopPropagation();
                toggleActive();
              }}
            />
          }
          onClose={toggleActive}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ActionList
              actionRole="menuitem"
              items={[
                {
                  content: 'Edit',
                  onAction: () => navigate(`/${id}`),
                },
                {
                  content: isActive ? 'Deactivate' : 'Activate',
                  onAction: () => {
                    onToggle(id);
                    toggleActive();
                  },
                },
                {
                  content: 'Delete',
                  destructive: true,
                  onAction: handleDeleteClick,
                },
              ]}
            />
          </div>
        </Popover>

        {isDeleteModalOpen && (
          <TimerDeleteModal
            open={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={() => {
              onDelete(id);
              setIsDeleteModalOpen(false);
            }}
          />
        )}
      </div>
    );
  };

  const TimerDeleteModal = ({ open, onClose, onConfirm }) => (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Timer?"
      primaryAction={{
        content: 'Delete',
        destructive: true,
        onAction: onConfirm,
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <Text as="p">
          Are you sure you want to delete this timer? This action cannot be undone.
        </Text>
      </Modal.Section>
    </Modal>
  );

  const renderItem = (timer) => {
    const { status, tone } = getTimerStatus(timer);
    const { _id: id, title, description, startDate, endDate } = timer;

    return (
      <ResourceItem
        id={id}
        onClick={() => navigate(`/${id}`)}
        accessibilityLabel={`View details for ${title}`}
      >
        <Stack alignment="center" distribution="equalSpacing">
          <Stack vertical spacing="extraTight">
            <Stack alignment="center" spacing="tight">
              <Text variant="bodyMd" fontWeight="bold" as="h3">
                {title}
              </Text>
              <Badge tone={tone}>{status}</Badge>
            </Stack>

            <Box paddingBlockStart="100" paddingBlockEnd="200">
              <Text variant="bodySm" color="subdued" as="p">
                {description}
              </Text>
            </Box>

            <Text variant="bodySm" color="subdued" as="p">
              {formatDate(startDate)} - {formatDate(endDate)}
            </Text>
          </Stack>
          <TimerActionMenu id={id} isActive={timer.isActive} />
        </Stack>
      </ResourceItem>
    );
  };


  return (
    <Layout>
      <Layout.Section>
        <Card>
          <Box paddingInline="400" paddingBlockStart="200" paddingBlockEnd="300">
            <Stack alignment="center" spacing="tight" distribution="leading">
              <div style={{ width: '300px' }}>
                <TextField
                  placeholder="Search timers..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  prefix={<Icon source={SearchIcon} color="base" />}
                  autoComplete="off"
                  clearButton
                  onClearButtonClick={() => setSearchValue('')}
                />
              </div>
              <div style={{ width: '150px' }}>
                <Select
                  options={[
                    { label: 'All Status', value: 'all' },
                    { label: 'Active', value: 'active' },
                    { label: 'Scheduled', value: 'scheduled' },
                    { label: 'Expired', value: 'expired' },
                    { label: 'Inactive', value: 'inactive' },
                  ]}
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                />
              </div>
              <div style={{ width: '150px' }}>
                <Select
                  options={[
                    { label: 'Latest First', value: 'newest' },
                    { label: 'Older First', value: 'oldest' },
                  ]}
                  value={sortValue}
                  onChange={handleSortChange}
                />
              </div>
            </Stack>
          </Box>

          <div style={{ borderTop: '1px solid #dfe3e8' }}>
            {timers.length === 0 ? (
              <Box padding="800">
                <EmptyState
                  heading="Create your first countdown timer"
                  action={{
                    content: 'Create Timer',
                    onAction: onCreate,
                  }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Add countdown timers to your products to create urgency and boost conversions.</p>
                </EmptyState>
              </Box>
            ) : (
              <ResourceList
                resourceName={{ singular: 'timer', plural: 'timers' }}
                items={sortedAndFilteredTimers}
                renderItem={renderItem}
              />
            )}
          </div>
        </Card>
      </Layout.Section>
    </Layout>
  );
}