/**
 * Coin Redemption Service — MongoDB Backed
 */

const { User, Redemption } = require('../config/database');

const PARTNERS = {
  'jan-aushadhi': { name: 'Jan Aushadhi Kendra', type: 'pharmacy', minRedemption: 50, conversionRate: 1, active: true },
  'campus-canteen': { name: 'Campus Canteen', type: 'food', minRedemption: 20, conversionRate: 1, active: true },
  'library': { name: 'Library Services', type: 'education', minRedemption: 30, conversionRate: 1, active: true },
  'print-shop': { name: 'Print Shop', type: 'services', minRedemption: 10, conversionRate: 1, active: true },
  'amazon': { name: 'Amazon Gift Card', type: 'ecommerce', minRedemption: 100, conversionRate: 0.9, active: true },
  'flipkart': { name: 'Flipkart Voucher', type: 'ecommerce', minRedemption: 100, conversionRate: 0.9, active: true },
};

class CoinRedemptionService {
  getPartners() {
    return Object.entries(PARTNERS)
      .filter(([_, partner]) => partner.active)
      .map(([id, partner]) => ({
        id,
        name: partner.name,
        type: partner.type,
        minRedemption: partner.minRedemption,
        conversionRate: partner.conversionRate,
      }));
  }

  async validateRedemption(userId, partnerId, coins) {
    const user = await User.findById(userId);
    if (!user) return { valid: false, error: 'User not found' };

    const partner = PARTNERS[partnerId];
    if (!partner || !partner.active) return { valid: false, error: 'Invalid or inactive partner' };

    if (coins < partner.minRedemption) return { valid: false, error: `Minimum ${partner.minRedemption} coins required` };

    if (user.tokens < coins) return { valid: false, error: 'Insufficient coins' };

    return { valid: true, partner, user };
  }

  async mockPartnerAPI(partner, amount) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const voucherCode = `${partner.type.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    return {
      success: true,
      voucherCode,
      voucherUrl: `https://${partner.name.toLowerCase().replace(/\s/g, '')}.com/redeem/${voucherCode}`,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      instructions: `Use code ${voucherCode} at ${partner.name} to redeem ₹${amount}`,
    };
  }

  async redeemCoins(userId, partnerId, coins) {
    const validation = await this.validateRedemption(userId, partnerId, coins);
    if (!validation.valid) return { success: false, error: validation.error };

    const { partner, user } = validation;
    const redemptionValue = Math.floor(coins * partner.conversionRate);

    const partnerResult = await this.mockPartnerAPI(partner, redemptionValue);
    if (!partnerResult.success) return { success: false, error: 'Partner API failed' };

    // Deduct coins
    user.tokens -= coins;
    await user.save();

    // Record transaction
    const transaction = await Redemption.create({
      userId: user._id.toString(),
      partnerId,
      partnerName: partner.name,
      coinsRedeemed: coins,
      redemptionValue,
      voucherCode: partnerResult.voucherCode,
      voucherUrl: partnerResult.voucherUrl,
      expiryDate: partnerResult.expiryDate,
      status: 'completed',
    });

    return {
      success: true,
      transaction,
      remainingCoins: user.tokens,
      voucher: {
        code: partnerResult.voucherCode,
        url: partnerResult.voucherUrl,
        value: redemptionValue,
        expiryDate: partnerResult.expiryDate,
        instructions: partnerResult.instructions,
      },
    };
  }

  async getRedemptionHistory(userId) {
    return Redemption.find({ userId }).sort({ createdAt: -1 });
  }

  async getRedemptionStats() {
    const redemptions = await Redemption.find();
    const stats = {
      totalRedemptions: redemptions.length,
      totalValue: redemptions.reduce((sum, r) => sum + r.redemptionValue, 0),
      byPartner: {},
    };

    redemptions.forEach(r => {
      if (!stats.byPartner[r.partnerId]) {
        stats.byPartner[r.partnerId] = { name: r.partnerName, count: 0, totalValue: 0 };
      }
      stats.byPartner[r.partnerId].count++;
      stats.byPartner[r.partnerId].totalValue += r.redemptionValue;
    });

    return stats;
  }
}

module.exports = new CoinRedemptionService();
