# Countdown Timer - Shopify App

A professional, fully-featured countdown timer application for Shopify merchants. Create urgency and boost conversions with customizable, high-performance countdown timers that integrate seamlessly with any theme.

## ✨ Features

### 🛠️ Professional Dashboard
- **Management Console**: A unified, premium interface to create, edit, and monitor your timers.
- **Advanced Filtering**: Search by title/description and filter timers by status (Active, Scheduled, Expired, Inactive).
- **Pro Sorting**: Quickly sort by Latest First or Older First based on creation date.
- **Secure Controls**: Integrated confirmation modals for destructive actions (deletions) and instant status toggling.

### 🎨 Customizable Storefront Widget
- **Dynamic Positioning**: Place timers at the top or bottom of the viewport, or inject them above the product price.
- **Custom Styling**: Fully customizable background colors, text colors, and background images.
- **Urgency Mode**: Automatically changes color when the time is running low to drive sales.
- **Sizing Options**: Small, Medium, and Large variations to fit any theme's aesthetic.

## 🛠️ Tech Stack

- **Frontend**: React with Shopify Polaris (Admin UI) and Preact (Storefront Widget).
- **Backend**: Node.js with Express.
- **Database**: MongoDB (Mongoose) for reliable timer and configuration storage.
- **Design**: Shopify Polaris Design System for a native "Shopify" feel.
- **Tunneling**: Cloudflare Tunneling for stable local development.

## 🚀 Installation & Setup

### Requirements
1. **Node.js**: Ensure you have Node.js installed.
2. **Shopify Partner Account**: Required to create and manage the app.
3. **MongoDB**: A running MongoDB instance (Local or Atlas).

### 1. Initialize the Project
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (and `web/` if necessary) with the following:
```env
MONGODB_URI=your_mongodb_connection_string
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=write_products,read_products,write_themes,read_themes
HOST=your_tunnel_url
```

### 3. Build the Widget
The storefront widget is built using Preact. To bundle it:
```bash
cd widget
npm install
npm run build
```

### 4. Run Development Server
Start the Shopify dev server to sync with your partner dashboard:
```bash
npm run dev
```

## 🧹 Project Structure
- **/web**: Backend Express server and Admin React frontend.
- **/widget**: Preact source code for the optimized storefront countdown widget.
- **/extensions**: Shopify Theme App Extension files (assets and liquid blocks).

---
*Built as part of a professional Shopify Development assignment.*
