const db = require('../config/database');

// Toggle like on a milestone (user's feed item)
exports.toggleMilestoneLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { milestone_user_id } = req.body;

    if (!milestone_user_id) {
      return res.status(400).json({
        status: 'error',
        message: 'milestone_user_id is required'
      });
    }

    // Check if already liked
    const [existing] = await db.query(
      'SELECT * FROM social_likes WHERE user_id = ? AND milestone_user_id = ?',
      [userId, milestone_user_id]
    );

    if (existing.length > 0) {
      // Unlike
      await db.query(
        'DELETE FROM social_likes WHERE user_id = ? AND milestone_user_id = ?',
        [userId, milestone_user_id]
      );

      // Get updated count
      const [countResult] = await db.query(
        'SELECT COUNT(*) as count FROM social_likes WHERE milestone_user_id = ?',
        [milestone_user_id]
      );

      return res.json({
        status: 'success',
        data: {
          liked: false,
          count: countResult[0]?.count || 0
        }
      });
    } else {
      // Like
      await db.query(
        'INSERT INTO social_likes (user_id, milestone_user_id) VALUES (?, ?)',
        [userId, milestone_user_id]
      );

      // Get updated count
      const [countResult] = await db.query(
        'SELECT COUNT(*) as count FROM social_likes WHERE milestone_user_id = ?',
        [milestone_user_id]
      );

      return res.json({
        status: 'success',
        data: {
          liked: true,
          count: countResult[0]?.count || 0
        }
      });
    }
  } catch (error) {
    console.error('Toggle milestone like error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to toggle like'
    });
  }
};

// Get milestone likes status for current user
exports.getMilestoneLikes = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all milestone user IDs that current user has liked
    const [likes] = await db.query(
      'SELECT milestone_user_id FROM social_likes WHERE user_id = ?',
      [userId]
    );

    // Get like counts for all users
    const [counts] = await db.query(
      `SELECT milestone_user_id, COUNT(*) as count 
       FROM social_likes 
       GROUP BY milestone_user_id`
    );

    const likedUserIds = likes.map(l => l.milestone_user_id);
    const likeCounts = {};
    counts.forEach(c => {
      likeCounts[c.milestone_user_id] = c.count;
    });

    res.json({
      status: 'success',
      data: {
        liked: likedUserIds,
        counts: likeCounts
      }
    });
  } catch (error) {
    console.error('Get milestone likes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get likes'
    });
  }
};

// Create a new tip
exports.createTip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, tip_type = 'general' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Content is required'
      });
    }

    const [result] = await db.query(
      'INSERT INTO social_tips (user_id, content, tip_type) VALUES (?, ?, ?)',
      [userId, content.trim(), tip_type]
    );

    res.status(201).json({
      status: 'success',
      data: {
        id: result.insertId,
        user_id: userId,
        content: content.trim(),
        tip_type,
        likes_count: 0,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Create tip error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create tip'
    });
  }
};

// Get all tips with user info
exports.getTips = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const [tips] = await db.query(
      `SELECT 
        st.id,
        st.content,
        st.tip_type,
        st.likes_count,
        st.created_at,
        u.id as user_id,
        u.username,
        up.profile_picture
      FROM social_tips st
      JOIN users u ON st.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      ORDER BY st.created_at DESC
      LIMIT ?`,
      [limit]
    );

    // Get current user's liked tips
    const [userLikes] = await db.query(
      'SELECT tip_id FROM social_tip_likes WHERE user_id = ?',
      [userId]
    );

    const likedTipIds = userLikes.map(l => l.tip_id);

    const tipsWithLikeStatus = tips.map(tip => ({
      ...tip,
      liked: likedTipIds.includes(tip.id)
    }));

    res.json({
      status: 'success',
      data: {
        tips: tipsWithLikeStatus
      }
    });
  } catch (error) {
    console.error('Get tips error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get tips'
    });
  }
};

// Toggle like on a tip
exports.toggleTipLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tip_id } = req.body;

    if (!tip_id) {
      return res.status(400).json({
        status: 'error',
        message: 'tip_id is required'
      });
    }

    // Check if already liked
    const [existing] = await db.query(
      'SELECT * FROM social_tip_likes WHERE user_id = ? AND tip_id = ?',
      [userId, tip_id]
    );

    if (existing.length > 0) {
      // Unlike
      await db.query(
        'DELETE FROM social_tip_likes WHERE user_id = ? AND tip_id = ?',
        [userId, tip_id]
      );

      // Decrement count
      await db.query(
        'UPDATE social_tips SET likes_count = GREATEST(0, likes_count - 1) WHERE id = ?',
        [tip_id]
      );

      const [tip] = await db.query(
        'SELECT likes_count FROM social_tips WHERE id = ?',
        [tip_id]
      );

      return res.json({
        status: 'success',
        data: {
          liked: false,
          count: tip[0]?.likes_count || 0
        }
      });
    } else {
      // Like
      await db.query(
        'INSERT INTO social_tip_likes (user_id, tip_id) VALUES (?, ?)',
        [userId, tip_id]
      );

      // Increment count
      await db.query(
        'UPDATE social_tips SET likes_count = likes_count + 1 WHERE id = ?',
        [tip_id]
      );

      const [tip] = await db.query(
        'SELECT likes_count FROM social_tips WHERE id = ?',
        [tip_id]
      );

      return res.json({
        status: 'success',
        data: {
          liked: true,
          count: tip[0]?.likes_count || 0
        }
      });
    }
  } catch (error) {
    console.error('Toggle tip like error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to toggle like'
    });
  }
};
