/**
 * Real-time Notification Service
 * Handles WebSocket connections and push notifications
 */

const { db } = require('../data/db');

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

      // User authentication
      socket.on('authenticate', (userId) => {
        this.connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log(`✅ User ${userId} authenticated`);
        
        // Send pending notifications
        this.sendPendingNotifications(userId, socket);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          console.log(`❌ User ${socket.userId} disconnected`);
        }
      });

      // Mark notification as read
      socket.on('mark_read', (notificationId) => {
        this.markAsRead(notificationId);
      });
    });
  }

  /**
   * Send pending notifications to newly connected user
   */
  sendPendingNotifications(userId, socket) {
    if (!db.notifications) db.notifications = [];
    
    const pending = db.notifications.filter(
      n => n.userId === userId && !n.read
    );

    if (pending.length > 0) {
      socket.emit('pending_notifications', pending);
    }
  }

  /**
   * Send notification to specific user
   */
  async sendToUser(userId, notification) {
    // Store in database
    if (!db.notifications) db.notifications = [];
    
    const notif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...notification,
      read: false,
      timestamp: new Date().toISOString()
    };
    
    db.notifications.push(notif);

    // Send via WebSocket if user is connected
    const socketId = this.connectedUsers.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit('notification', notif);
    }

    // Send push notification (if enabled)
    await this.sendPushNotification(userId, notif);

    return notif;
  }

  /**
   * Send notification to multiple users
   */
  async sendToMultiple(userIds, notification) {
    const results = [];
    for (const userId of userIds) {
      const result = await this.sendToUser(userId, notification);
      results.push(result);
    }
    return results;
  }

  /**
   * Notify about AI match (98%+ confidence)
   */
  async notifyAIMatch(lostUserId, foundUserId, matchDetails) {
    const { lostItemId, foundItemId, confidence, matchReason } = matchDetails;

    // Notify lost item owner
    await this.sendToUser(lostUserId, {
      type: 'match',
      title: '🎯 High Confidence Match Found!',
      description: `Your lost item has been matched with ${confidence.toFixed(1)}% confidence`,
      actionUrl: `/matches?item=${lostItemId}`,
      metadata: { lostItemId, foundItemId, confidence, matchReason }
    });

    // Notify found item owner
    await this.sendToUser(foundUserId, {
      type: 'match',
      title: '🎯 Your Found Item Matched!',
      description: `Match confidence: ${confidence.toFixed(1)}%`,
      actionUrl: `/matches?item=${foundItemId}`,
      metadata: { lostItemId, foundItemId, confidence, matchReason }
    });
  }

  /**
   * Notify nearby users about emergency
   */
  async notifyEmergency(emergencyDetails, nearbyUserIds) {
    const { type, title, location, urgency } = emergencyDetails;

    await this.sendToMultiple(nearbyUserIds, {
      type: 'emergency',
      title: `🚨 ${urgency.toUpperCase()} Emergency`,
      description: `${title} at ${location}`,
      actionUrl: `/emergency?id=${emergencyDetails.id}`,
      metadata: emergencyDetails
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
      actionUrl: `/medical?request=${medicalRequest.id}`,
      metadata: medicalRequest
    });
  }

  /**
   * Notify about coin reward
   */
  async notifyReward(userId, amount, reason) {
    await this.sendToUser(userId, {
      type: 'reward',
      title: `🎉 +${amount} Coins Earned!`,
      description: reason,
      actionUrl: '/rewards',
      metadata: { amount, reason }
    });
  }

  /**
   * Send push notification (FCM/APNs)
   */
  async sendPushNotification(userId, notification) {
    // Mock implementation - replace with actual FCM/APNs
    const user = db.users?.find(u => u.id === userId);
    if (!user?.pushToken) return;

    // In production, integrate with Firebase Cloud Messaging or Apple Push Notification Service
    console.log(`📱 Push notification sent to ${userId}:`, notification.title);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId) {
    if (!db.notifications) return;
    
    const notif = db.notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.read = true;
    }
  }

  /**
   * Get user notifications
   */
  getUserNotifications(userId, limit = 50) {
    if (!db.notifications) return [];
    
    return db.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get unread count
   */
  getUnreadCount(userId) {
    if (!db.notifications) return 0;
    
    return db.notifications.filter(n => n.userId === userId && !n.read).length;
  }
}

module.exports = new NotificationService();
