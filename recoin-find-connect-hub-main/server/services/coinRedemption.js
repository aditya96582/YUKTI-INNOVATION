/**
 * Coin Redemption Service
 * Handles real-world coin redemption with partner integrations
 */

const { db } = require('../data/db');

// Partner Integration APIs (Mock for now, replace with real APIs)
const PARTNERS = {
  'jan-aushadhi': {
    name: 'Jan Aushadhi Kendra',
    type: 'pharmacy',
    apiEndpoint: 'https://api.janaushadhi.gov.in/voucher',
    minRedemption: 50,
    conversionRate: 1, // 1 coin = ₹1
    active: true
  },
  'campus-canteen': {
    name: 'Campus Canteen',
    type: 'food',
    apiEndpoint: 'https://api.campuscanteen.com/voucher',
    minRedemption: 20,
    conversionRate: 1,
    active: true
  },
  'library': {
    name: 'Library Services',
    type: 'education',
    apiEndpoint: 'https://api.library.edu/pass',
    minRedemption: 30,
    conversionRate: 1,
    active: true
  },
  'print-shop': {
    name: 'Print Shop',
    type: 'services',
    apiEndpoint: 'https://api.printshop.com/credits',
    minRedemption: 10,
    conversionRate: 1,
    active: true
  },
  'amazon': {
    name: 'Amazon Gift Card',
    type: 'ecommerce',
    apiEndpoint: 'https://api.amazon.in/giftcard',
    minRedemption: 100,
    conversionRate: 0.9, // 10% platform fee
    active: true
  },
  'flipkart': {
    name: 'Flipkart Voucher',
    type: 'ecommerce',
    apiEndpoint: 'https://api.flipkart.com/voucher',
    minRedemption: 100,
    conversionRate: 0.9,
    active: true
  }
};

class CoinRedemptionService {
  /**
   * Get available redemption partners
   */
  getPartners() {
    return Object.entries(PARTNERS)
      .filter(([_, partner]) => partner.active)
      .map(([id, partner]) => ({
        id,
        name: partner.name,
        type: partner.type,
        minRedemption: partner.minRedemption,
        conversionRate: partner.conversionRate
      }));
  }

  /**
   * Validate redemption request
   */
  validateRedemption(userId, partnerId, coins) {
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return { valid: false, error: 'User not found' };
    }

    const partner = PARTNERS[partnerId];
    if (!partner || !partner.active) {
      return { valid: false, error: 'Invalid or inactive partner' };
    }

    if (coins < partner.minRedemption) {
      return { valid: false, error: `Minimum ${partner.minRedemption} coins required` };
    }

    if (user.tokens < coins) {
      return { valid: false, error: 'Insufficient coins' };
    }

    return { valid: true, partner, user };
  }

  /**
   * Process redemption with partner API
   */
  async processPartnerRedemption(partner, amount, userDetails) {
    // Simulate API call to partner
    // In production, replace with actual API integration
    
    try {
      // Mock API call
      const response = await this.mockPartnerAPI(partner, amount, userDetails);
      
      if (response.success) {
        return {
          success: true,
          voucherCode: response.voucherCode,
          voucherUrl: response.voucherUrl,
          expiryDate: response.expiryDate,
          instructions: response.instructions
        };
      } else {
        return {
          success: false,
          error: response.error || 'Partner API failed'
        };
      }
    } catch (error) {
      console.error('Partner API error:', error);
      return {
        success: false,
        error: 'Failed to connect to partner service'
      };
    }
  }

  /**
   * Mock partner API (replace with real integration)
   */
  async mockPartnerAPI(partner, amount, userDetails) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate voucher code
    const voucherCode = `${partner.type.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    return {
      success: true,
      voucherCode,
      voucherUrl: `https://${partner.name.toLowerCase().replace(/\s/g, '')}.com/redeem/${voucherCode}`,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      instructions: `Use code ${voucherCode} at ${partner.name} to redeem ₹${amount}`
    };
  }

  /**
   * Redeem coins for partner voucher
   */
  async redeemCoins(userId, partnerId, coins) {
    // Validate
    const validation = this.validateRedemption(userId, partnerId, coins);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const { partner, user } = validation;

    // Calculate redemption value
    const redemptionValue = Math.floor(coins * partner.conversionRate);

    // Process with partner
    const partnerResult = await this.processPartnerRedemption(
      partner,
      redemptionValue,
      {
        userId: user.id,
        userName: user.name,
        email: user.email
      }
    );

    if (!partnerResult.success) {
      return { success: false, error: partnerResult.error };
    }

    // Deduct coins from user
    user.tokens -= coins;

    // Record transaction
    const transaction = {
      id: `txn_${Date.now()}`,
      userId: user.id,
      partnerId,
      partnerName: partner.name,
      coinsRedeemed: coins,
      redemptionValue,
      voucherCode: partnerResult.voucherCode,
      voucherUrl: partnerResult.voucherUrl,
      expiryDate: partnerResult.expiryDate,
      status: 'completed',
      timestamp: new Date().toISOString()
    };

    if (!db.redemptions) db.redemptions = [];
    db.redemptions.push(transaction);

    return {
      success: true,
      transaction,
      remainingCoins: user.tokens,
      voucher: {
        code: partnerResult.voucherCode,
        url: partnerResult.voucherUrl,
        value: redemptionValue,
        expiryDate: partnerResult.expiryDate,
        instructions: partnerResult.instructions
      }
    };
  }

  /**
   * Get user redemption history
   */
  getRedemptionHistory(userId) {
    if (!db.redemptions) return [];
    return db.redemptions
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Get redemption statistics
   */
  getRedemptionStats() {
    if (!db.redemptions) return { totalRedemptions: 0, totalValue: 0, byPartner: {} };

    const stats = {
      totalRedemptions: db.redemptions.length,
      totalValue: db.redemptions.reduce((sum, r) => sum + r.redemptionValue, 0),
      byPartner: {}
    };

    db.redemptions.forEach(r => {
      if (!stats.byPartner[r.partnerId]) {
        stats.byPartner[r.partnerId] = {
          name: r.partnerName,
          count: 0,
          totalValue: 0
        };
      }
      stats.byPartner[r.partnerId].count++;
      stats.byPartner[r.partnerId].totalValue += r.redemptionValue;
    });

    return stats;
  }
}

module.exports = new CoinRedemptionService();
