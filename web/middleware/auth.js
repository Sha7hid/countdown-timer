const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');

// Verify that the request is coming from a valid Shopify store
const verifyShopifyRequest = async (req, res, next) => {
  try {
    const session = await Shopify.Utils.loadCurrentSession(req, res);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    req.shop = session.shop;
    req.session = session;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = { verifyShopifyRequest };