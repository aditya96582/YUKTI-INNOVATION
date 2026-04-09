/**
 * Chat Routes — MongoDB Backed
 */

const express = require('express');
const router = express.Router();
const { ChatConversation, ChatMessage } = require('../config/database');

/**
 * GET /api/chat/conversations/:userId — Get all conversations for a user
 */
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await ChatConversation.find({
      'participants.id': userId,
    }).sort({ lastMessageTime: -1 });

    // Attach recent messages to each conversation
    const convWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const messages = await ChatMessage.find({ conversationId: conv._id })
          .sort({ createdAt: 1 })
          .limit(100);
        return {
          ...conv.toObject(),
          id: conv._id.toString(),
          messages: messages.map(m => ({
            id: m._id.toString(),
            senderId: m.senderId,
            senderName: m.senderName,
            content: m.content,
            timestamp: m.createdAt.toISOString(),
            type: m.type,
          })),
        };
      })
    );

    res.json({ success: true, conversations: convWithMessages });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/chat/conversations — Create new conversation
 */
router.post('/conversations', async (req, res) => {
  try {
    const { participants, relatedTo } = req.body;

    if (!participants || participants.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 participants are required',
      });
    }

    // Check if conversation already exists between these participants
    const participantIds = participants.map(p => p.id).sort();
    const existingConversations = await ChatConversation.find({
      $and: participantIds.map(id => ({ 'participants.id': id })),
    });

    // Find exact match (same participants)
    const existing = existingConversations.find(conv => {
      const convIds = conv.participants.map(p => p.id).sort();
      return convIds.length === participantIds.length &&
        convIds.every((id, i) => id === participantIds[i]);
    });

    if (existing) {
      return res.json({
        success: true,
        conversation: { ...existing.toObject(), id: existing._id.toString(), messages: [] },
        existing: true,
      });
    }

    const conversation = await ChatConversation.create({
      participants,
      relatedTo: relatedTo || {},
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: 0,
    });

    res.status(201).json({
      success: true,
      conversation: { ...conversation.toObject(), id: conversation._id.toString(), messages: [] },
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/chat/conversations/:id/messages — Send message
 */
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { senderId, senderName, content } = req.body;

    if (!senderId || !content) {
      return res.status(400).json({
        success: false,
        error: 'senderId and content are required',
      });
    }

    const conversation = await ChatConversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const message = await ChatMessage.create({
      conversationId: id,
      senderId,
      senderName: senderName || 'User',
      content,
      type: 'text',
    });

    // Update conversation
    conversation.lastMessage = content;
    conversation.lastMessageTime = new Date();
    conversation.unreadCount += 1;
    await conversation.save();

    res.status(201).json({
      success: true,
      message: {
        id: message._id.toString(),
        senderId: message.senderId,
        senderName: message.senderName,
        content: message.content,
        timestamp: message.createdAt.toISOString(),
        type: message.type,
      },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/chat/conversations/:id/members — Add member to conversation
 */
router.post('/conversations/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { participant } = req.body;

    if (!participant || !participant.id || !participant.name) {
      return res.status(400).json({
        success: false,
        error: 'participant with id and name is required',
      });
    }

    const conversation = await ChatConversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    // Check if already a member
    if (conversation.participants.some(p => p.id === participant.id)) {
      return res.status(400).json({ success: false, error: 'User is already a member' });
    }

    conversation.participants.push(participant);
    await conversation.save();

    // Add system message
    await ChatMessage.create({
      conversationId: id,
      senderId: 'system',
      senderName: 'System',
      content: `${participant.name} has been added to the conversation`,
      type: 'system',
    });

    res.json({ success: true, conversation: conversation.toObject() });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
