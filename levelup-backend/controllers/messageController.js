const Message = require('../models/Message');
const User    = require('../models/User');

// ────────────────────────────────────────────
// @route  GET /api/messages/conversations
// @desc   Get all conversations for current user
// @access Private
// ────────────────────────────────────────────
exports.getConversations = async (req, res, next) => {
  try {
    // Get distinct users this person has talked to
    const sent     = await Message.distinct('receiver', { sender:   req.user._id });
    const received = await Message.distinct('sender',   { receiver: req.user._id });

    // Merge unique IDs
    const contactIds = [...new Set([...sent.map(String), ...received.map(String)])];

    // For each contact, get last message + unread count
    const conversations = await Promise.all(
      contactIds.map(async (contactId) => {
        const contact = await User.findById(contactId).select('name avatar level');
        if (!contact) return null;

        const lastMessage = await Message.findOne({
          $or: [
            { sender: req.user._id, receiver: contactId },
            { sender: contactId,   receiver: req.user._id },
          ],
        }).sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          sender: contactId, receiver: req.user._id, read: false,
        });

        return { contact, lastMessage, unreadCount };
      })
    );

    // Filter nulls and sort by last message time
    const valid = conversations
      .filter(Boolean)
      .sort((a, b) => new Date(b.lastMessage?.createdAt) - new Date(a.lastMessage?.createdAt));

    res.status(200).json({ success: true, conversations: valid });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  GET /api/messages/:userId
// @desc   Get messages between current user and another user
// @access Private
// ────────────────────────────────────────────
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    })
      .populate('sender',   'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark received messages as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  POST /api/messages/:userId
// @desc   Send a message (REST fallback – real-time via Socket.io)
// @access Private
// ────────────────────────────────────────────
exports.sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const receiver = await User.findById(req.params.userId);
    if (!receiver) return res.status(404).json({ success: false, message: 'User not found' });

    const message = await Message.create({
      sender:   req.user._id,
      receiver: req.params.userId,
      content,
    });

    await message.populate('sender',   'name avatar');
    await message.populate('receiver', 'name avatar');

    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};
