import { h, render } from 'preact';
import { useState, useEffect } from 'preact/hooks';

function CountdownTimer({ config }) {
  const [timerData, setTimerData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimerData();
  }, []);

  useEffect(() => {
    if (!timerData) return;

    const interval = setInterval(() => {
      updateTimeLeft();
    }, 1000);

    return () => clearInterval(interval);
  }, [timerData]);

  const fetchTimerData = async () => {
    try {
      const { shop, productId } = config;
      // App Proxy subpath 'countdown-timer' maps to the configured proxy URL.
      // If Proxy URL is .../api/public, then we just need /timers/active here.
      const apiUrl = `/apps/countdown-timer/timers/active?shop=${shop}&product_id=${productId}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      setTimerData(data.timer);
      setLoading(false);

      // Break out of stacking context for Top/Bottom positions
      if (data.timer && (data.timer.displayOptions.position === 'top' || data.timer.displayOptions.position === 'bottom')) {
        const container = document.querySelector('#countdown-timer-widget');
        if (container && container.parentNode !== document.body) {
          document.body.appendChild(container);
        }
      }
    } catch (error) {
      console.error('Error fetching timer:', error);
      setLoading(false);
    }
  };

  const updateTimeLeft = () => {
    if (!timerData) return;

    const now = new Date().getTime();
    const endDate = new Date(timerData.endDate).getTime();
    const diff = endDate - now;

    if (diff <= 0) {
      setTimeLeft(null);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const urgencyThreshold = timerData.urgencySettings.threshold * 60 * 1000;
    setIsUrgent(timerData.urgencySettings.enabled && diff <= urgencyThreshold);

    setTimeLeft({ days, hours, minutes, seconds });
  };

  if (loading) {
    return h('div', { class: 'countdown-timer-loading' }, 'Loading timer...');
  }

  if (!timerData) {
    return null;
  }

  if (!timeLeft) {
    return h('div', { class: 'countdown-timer-expired' }, 'This promotion has ended');
  }

  const { displayOptions, urgencySettings, description } = timerData;
  const urgencyClass = isUrgent && urgencySettings.pulseEffect ? 'urgency-mode' : '';
  const sizeClass = `size-${displayOptions.fontSize}`;
  const positionClass = `pos-${displayOptions.position}`;

  return h('div', {
    class: `countdown-timer ${urgencyClass} ${sizeClass} ${positionClass}`,
    style: {
      backgroundColor: displayOptions.backgroundColor,
      backgroundImage: 'none', // Override default CSS gradient
      color: displayOptions.textColor,
      borderColor: displayOptions.textColor // Optional: make border match text
    }
  }, [
    isUrgent && urgencySettings.showBanner && h('div', {
      class: 'countdown-timer-banner'
    }, urgencySettings.bannerText),

    h('div', { class: 'countdown-timer-description' }, description),

    h('div', { class: 'countdown-timer-clock' }, [
      displayOptions.showDays && timeLeft.days > 0 && h(TimeUnit, { value: timeLeft.days, label: 'Days' }),
      displayOptions.showHours && h(TimeUnit, { value: timeLeft.hours, label: 'Hours' }),
      displayOptions.showMinutes && h(TimeUnit, { value: timeLeft.minutes, label: 'Minutes' }),
      displayOptions.showSeconds && h(TimeUnit, { value: timeLeft.seconds, label: 'Seconds' })
    ])
  ]);
}

function TimeUnit({ value, label }) {
  const paddedValue = String(value).padStart(2, '0');

  return h('div', { class: 'countdown-timer-unit' }, [
    h('div', { class: 'countdown-timer-value' }, paddedValue),
    h('div', { class: 'countdown-timer-label' }, label)
  ]);
}

// Auto-initialize on load
if (typeof window !== 'undefined') {
  const initWidget = () => {
    const containers = document.querySelectorAll('#countdown-timer-widget');

    containers.forEach(container => {
      console.log('Initializing Countdown Widget on container:', container);
      const enabled = container.getAttribute('data-enabled') === 'true';
      if (!enabled) {
        container.style.display = 'none';
        return;
      }

      const config = {
        shop: container.getAttribute('data-shop'),
        productId: container.getAttribute('data-product-id'),
        position: container.getAttribute('data-position')
      };

      if (config.shop && config.productId) {
        render(h(CountdownTimer, { config }), container);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  // Shopify theme editor support
  if (window.Shopify && window.Shopify.designMode) {
    document.addEventListener('shopify:section:load', initWidget);
  }
}
