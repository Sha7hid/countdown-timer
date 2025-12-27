require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const { shopifyApp } = require('@shopify/shopify-app-express');
const { LATEST_API_VERSION, DeliveryMethod } = require('@shopify/shopify-api');
const { MongoDBSessionStorage } = require('@shopify/shopify-app-session-storage-mongodb');
const connectDB = require('./utils/db');
const isDevelopment = process.env.NODE_ENV !== 'production';
const timerRoutes = require('./routes/timers');

const publicRoutes = require('./routes/public');


const PORT = parseInt(process.env.PORT || '3000', 10);
if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not set in web/.env file');
}
connectDB();

const shopify = shopifyApp({
  api: {
    apiVersion: "2025-10",
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: process.env.SCOPES?.split(',') || [],
    hostName: process.env.HOST?.replace(/https?:\/\//, '') || '',
  },
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback',
  },
  webhooks: {
    path: '/api/webhooks',
    webhookHandlers: {
      APP_UNINSTALLED: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: '/api/webhooks',
        callback: async (topic, shop, body) => {
          console.log('App uninstalled from', shop);
        },
      },
    },
  },
  sessionStorage: new MongoDBSessionStorage(process.env.MONGODB_URI),
});

const app = express();

// Middleware
app.use('/api/*', express.json());

// Auth routes
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

// Webhooks
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({
    webhookHandlers: {
      APP_UNINSTALLED: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: '/api/webhooks',
        callback: async (topic, shop, body) => {
          console.log('App uninstalled from', shop);
        },
      },
    }
  })
);

// Public routes
app.use('/api/public', publicRoutes);

// Protected routes
app.use('/api/timers', shopify.validateAuthenticatedSession(), (req, res, next) => {
  const shop = res.locals.shopify.session.shop;
  console.log(`[Request] ${req.method} ${req.originalUrl} | Shop: ${shop}`);
  next();
}, timerRoutes);


if (isDevelopment) {
  // In development, frontend runs on its own Vite server
  // This route just ensures the app loads properly in Shopify admin
  // This route proxies requests to the frontend Vite server
  app.get('*', (req, res, next) => {
    // Skip ensureInstalledOnShop if URL doesn't look like a page load and no shop param
    if (!req.query.shop && (req.url.includes('.') || req.url.startsWith('/@'))) {
      // This is likely a static asset or HMR request from Vite
      return next();
    }
    return shopify.ensureInstalledOnShop()(req, res, next);
  }, async (req, res) => {
    const frontendPort = process.env.FRONTEND_PORT || '5173';

    // Proxy request options
    const options = {
      hostname: 'localhost',
      port: frontendPort,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `localhost:${frontendPort}`, // Override host to match backend
      },
    };

    console.log(`[Dev] Proxying ${req.method} ${req.url} -> http://localhost:${frontendPort}`);

    const proxyReq = http.request(options, (proxyRes) => {
      // Pass status and headers to the response
      res.writeHead(proxyRes.statusCode, proxyRes.headers);

      // Pipe the response body
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (e) => {
      console.error(`[Dev] Proxy error: ${e.message}`);
      if (!res.headersSent) {
        res.status(502).send(`Bad Gateway: Could not connect to frontend. Ensure Vite is running on port ${frontendPort}.`);
      }
    });

    // Pipe the request body if any
    req.pipe(proxyReq);
  });
} else {
  // In production, serve the built frontend
  const path = require('path');
  const buildPath = path.join(__dirname, 'frontend', 'build');

  app.use(express.static(buildPath));

  app.get('*', shopify.ensureInstalledOnShop(), async (req, res) => {
    return res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
