/**
 * Real-time Notification Service — MongoDB Backed
 */

const { Notification } = require('../config/database');

class NotificationService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  /**
   * Initialize Socket.IO
   */
  initialize(io) {
    this.io = io;

    io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      socket.on('authenticate', async (userId) => {
        this.connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log(`✅ User ${userId} authenticated`);
        await this.sendPendingNotifications(userId, socket);
      });

      socket.on('disconnect', () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
      });

      socket.on('mark_read', async (notificationId) => {
        await this.markAsRead(notificationId);
      });
    });
  }

  /**
   * Send pending notifications to newly connected user
   */
  async sendPendingNotifications(userId, socket) {
    try {
      const pending = await Notification.find({ userId, read: false }).sort({ createdAt: -1 }).limit(50);
      if (pending.length > 0) {
        socket.emit('pending_notifications', pending);
      }
    } catch (error) {
      console.error('Error sending pending notifications:', error);
    }
  }

  /**
   * Send notification to specific user
   */
  async sendToUser(userId, notification) {
    try {
      const notif = await Notification.create({
        userId,
        ...notification,
        read: false,
      });

      // Send via WebSocket if user is connected
      const socketId = this.connectedUsers.get(userId);
      if (socketId && this.io) {
        this.io.to(socketId).emit('notification', notif);
      }

      return notif;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendToMultiple(userIds, notification) {
    const results = [];
    for (const userId of userIds) {
      const result = await this.sendToUser(userId, notification);
      if (result) results.push(result);
    }
    return results;
  }

  /**
   * Notify about AI match
   */
  async notifyAIMatch(lostUserId, foundUserId, matchDetails) {
    const { lostItemId, foundItemId, confidence, matchReason } = matchDetails;

    await this.sendToUser(lostUserId, {
      type: 'match',
      title: '🎯 High Confidence Match Found!',
      description: `Your lost item has been matched with ${confidence.toFixed(1)}% confidence`,
      actionUrl: `/matches?item=${lostItemId}`,
      metadata: { lostItemId, foundItemId, confidence, matchReason },
    });

    await this.sendToUser(foundUserId, {
      type: 'match',
      title: '🎯 Your Found Item Matched!',
      description: `Match confidence: ${confidence.toFixed(1)}%`,
      actionUrl: `/matches?item=${foundItemId}`,
      metadata: { lostItemId, foundItemId, confidence, matchReason },
    });
  }

  /**
   * Notify nearby users about emergency
   */
  async notifyEmergency(emergencyDetails, nearbyUserIds) {
    const { title, location, urgency } = emergencyDetails;
    await this.sendToMultiple(nearbyUserIds, {
      type: 'emergency',
      title: `🚨 ${urgency.toUpperCase()} Emergency`,
      description: `${title} at ${location}`,
      actionUrl: '/emergency',
      metadata: emergencyDetails,
    });
  }

  /**
   * Notify pharmacies about medical request
   */
  async notifyPharmacies(medicalRequest, pharmacyUserIds) {
    await this.sendToMultiple(pharmacyUserIds, {
      type: 'medical',
      title: '💊 New Medicine Request',
      description: `${medicalRequest.medicines.length} medicines needed at ${medicalRequest.location}`,
      actionUrl: '/medical',
      metadata: medicalRequest,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      await Notification.findByIdAndUpdate(notificationId, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, limit = 50) {
    try {
      return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit);
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }
}

module.exports = new NotificationService();
