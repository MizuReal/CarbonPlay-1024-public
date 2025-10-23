const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middlewares/auth');

// Protect all admin routes (optionally add admin-role check later)
router.use(authenticate);

// --- Users ---
router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 200'
    );
    res.json({ status: 'success', data: rows });
  } catch (e) {
    console.error('admin GET /users error', e);
    res.status(500).json({ status: 'error', message: 'Failed to load users' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { username, email, password, role = 'user', is_active = 1 } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'username, email, password are required' });
    }

    const [exists] = await db.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (exists.length) {
      return res.status(400).json({ status: 'error', message: 'Username or email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)',
      [username, email, hash, role, is_active ? 1 : 0]
    );

    res.status(201).json({ status: 'success', data: { id: result.insertId, username, email, role, is_active: !!is_active } });
  } catch (e) {
    console.error('admin POST /users error', e);
    res.status(500).json({ status: 'error', message: 'Failed to create user' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role, is_active } = req.body || {};

    // Build dynamic update
    const fields = [];
    const vals = [];
    if (username) { fields.push('username = ?'); vals.push(username); }
    if (email) { fields.push('email = ?'); vals.push(email); }
    if (typeof role !== 'undefined') { fields.push('role = ?'); vals.push(role); }
    if (typeof is_active !== 'undefined') { fields.push('is_active = ?'); vals.push(is_active ? 1 : 0); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      fields.push('password_hash = ?'); vals.push(hash);
    }

    if (!fields.length) {
      return res.status(400).json({ status: 'error', message: 'No fields to update' });
    }

    vals.push(id);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, vals);
    res.json({ status: 'success', message: 'User updated' });
  } catch (e) {
    console.error('admin PUT /users/:id error', e);
    res.status(500).json({ status: 'error', message: 'Failed to update user' });
  }
});

// --- Profiles ---
router.get('/profiles', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, u.username FROM user_profiles p JOIN users u ON p.user_id = u.id ORDER BY p.updated_at DESC LIMIT 200`
    );
    res.json({ status: 'success', data: rows });
  } catch (e) {
    console.error('admin GET /profiles error', e);
    res.status(500).json({ status: 'error', message: 'Failed to load profiles' });
  }
});

router.post('/profiles', async (req, res) => {
  try {
    const { user_id, country = 'US', household_size = 1, baseline_calculated = 0, baseline_co2e = 0 } = req.body || {};
    if (!user_id) return res.status(400).json({ status: 'error', message: 'user_id is required' });

    const [result] = await db.query(
      'INSERT INTO user_profiles (user_id, country, household_size, baseline_calculated, baseline_co2e) VALUES (?, ?, ?, ?, ?)',
      [user_id, country, household_size, baseline_calculated ? 1 : 0, baseline_co2e]
    );
    res.status(201).json({ status: 'success', data: { id: result.insertId } });
  } catch (e) {
    console.error('admin POST /profiles error', e);
    res.status(500).json({ status: 'error', message: 'Failed to create profile' });
  }
});

router.put('/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { country, household_size, baseline_calculated, baseline_co2e } = req.body || {};
    const fields = [];
    const vals = [];
    if (typeof country !== 'undefined') { fields.push('country = ?'); vals.push(country); }
    if (typeof household_size !== 'undefined') { fields.push('household_size = ?'); vals.push(household_size); }
    if (typeof baseline_calculated !== 'undefined') { fields.push('baseline_calculated = ?'); vals.push(baseline_calculated ? 1 : 0); }
    if (typeof baseline_co2e !== 'undefined') { fields.push('baseline_co2e = ?'); vals.push(baseline_co2e); }
    if (!fields.length) return res.status(400).json({ status: 'error', message: 'No fields to update' });
    vals.push(id);
    await db.query(`UPDATE user_profiles SET ${fields.join(', ')} WHERE id = ?`, vals);
    res.json({ status: 'success', message: 'Profile updated' });
  } catch (e) {
    console.error('admin PUT /profiles/:id error', e);
    res.status(500).json({ status: 'error', message: 'Failed to update profile' });
  }
});

// --- Challenges ---
router.get('/challenges', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM challenges ORDER BY created_at DESC LIMIT 200');
    res.json({ status: 'success', data: rows });
  } catch (e) {
    console.error('admin GET /challenges error', e);
    res.status(500).json({ status: 'error', message: 'Failed to load challenges' });
  }
});

router.post('/challenges', async (req, res) => {
  try {
    const { 
      name, 
      description = null, 
      challenge_type = 'daily_limit',
      target_value = null,
      target_unit = 'kg_co2e',
      duration_days = 7, 
      badge_name = null, 
      is_active = 1 
    } = req.body || {};
    
    if (!name || typeof target_value === 'undefined') {
      return res.status(400).json({ status: 'error', message: 'name and target_value are required' });
    }
    
    const [result] = await db.query(
      'INSERT INTO challenges (name, description, challenge_type, target_value, target_unit, duration_days, badge_name, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, challenge_type, target_value, target_unit, duration_days, badge_name, is_active ? 1 : 0]
    );
    res.status(201).json({ status: 'success', data: { id: result.insertId } });
  } catch (e) {
    console.error('admin POST /challenges error', e);
    res.status(500).json({ status: 'error', message: 'Failed to create challenge: ' + e.message });
  }
});

router.put('/challenges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, challenge_type, target_value, target_unit, duration_days, badge_name, is_active } = req.body || {};
    const fields = [];
    const vals = [];
    if (typeof name !== 'undefined') { fields.push('name = ?'); vals.push(name); }
    if (typeof description !== 'undefined') { fields.push('description = ?'); vals.push(description); }
    if (typeof challenge_type !== 'undefined') { fields.push('challenge_type = ?'); vals.push(challenge_type); }
    if (typeof target_value !== 'undefined') { fields.push('target_value = ?'); vals.push(target_value); }
    if (typeof target_unit !== 'undefined') { fields.push('target_unit = ?'); vals.push(target_unit); }
    if (typeof duration_days !== 'undefined') { fields.push('duration_days = ?'); vals.push(duration_days); }
    if (typeof badge_name !== 'undefined') { fields.push('badge_name = ?'); vals.push(badge_name); }
    if (typeof is_active !== 'undefined') { fields.push('is_active = ?'); vals.push(is_active ? 1 : 0); }
    if (!fields.length) return res.status(400).json({ status: 'error', message: 'No fields to update' });
    vals.push(id);
    await db.query(`UPDATE challenges SET ${fields.join(', ')} WHERE id = ?`, vals);
    res.json({ status: 'success', message: 'Challenge updated' });
  } catch (e) {
    console.error('admin PUT /challenges/:id error', e);
    res.status(500).json({ status: 'error', message: 'Failed to update challenge: ' + e.message });
  }
});

router.delete('/challenges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Check if challenge has user enrollments
    const [enrollments] = await db.query('SELECT COUNT(*) as count FROM user_challenges WHERE challenge_id = ?', [id]);
    const count = enrollments[0]?.count || 0;
    
    if (count > 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Cannot delete: ${count} user(s) have joined this challenge. Hide it instead.` 
      });
    }
    
    await db.query('DELETE FROM challenges WHERE id = ?', [id]);
    res.json({ status: 'success', message: 'Challenge deleted' });
  } catch (e) {
    console.error('admin DELETE /challenges/:id error', e);
    res.status(500).json({ status: 'error', message: 'Failed to delete challenge' });
  }
});

// --- Emission Factors ---
router.get('/emission-factors', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM emission_factors ORDER BY last_updated DESC LIMIT 500');
    res.json({ status: 'success', data: rows });
  } catch (e) {
    console.error('admin GET /emission-factors error', e);
    res.status(500).json({ status: 'error', message: 'Failed to load emission factors' });
  }
});

router.post('/emission-factors', async (req, res) => {
  try {
    const { category, activity_type, region = 'global', co2e_per_unit, unit, source = null } = req.body || {};
    if (!category || !activity_type || typeof co2e_per_unit === 'undefined' || !unit) {
      return res.status(400).json({ status: 'error', message: 'category, activity_type, co2e_per_unit, unit are required' });
    }
    const [result] = await db.query(
      'INSERT INTO emission_factors (category, activity_type, region, co2e_per_unit, unit, source) VALUES (?, ?, ?, ?, ?, ?)',
      [category, activity_type, region, co2e_per_unit, unit, source]
    );
    res.status(201).json({ status: 'success', data: { id: result.insertId } });
  } catch (e) {
    console.error('admin POST /emission-factors error', e);
    const msg = e.code === 'ER_DUP_ENTRY' ? 'Duplicate factor for category/activity/region' : 'Failed to create factor';
    res.status(500).json({ status: 'error', message: msg });
  }
});

router.put('/emission-factors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, activity_type, region, co2e_per_unit, unit, source } = req.body || {};
    const fields = [];
    const vals = [];
    if (typeof category !== 'undefined') { fields.push('category = ?'); vals.push(category); }
    if (typeof activity_type !== 'undefined') { fields.push('activity_type = ?'); vals.push(activity_type); }
    if (typeof region !== 'undefined') { fields.push('region = ?'); vals.push(region); }
    if (typeof co2e_per_unit !== 'undefined') { fields.push('co2e_per_unit = ?'); vals.push(co2e_per_unit); }
    if (typeof unit !== 'undefined') { fields.push('unit = ?'); vals.push(unit); }
    if (typeof source !== 'undefined') { fields.push('source = ?'); vals.push(source); }
    if (!fields.length) return res.status(400).json({ status: 'error', message: 'No fields to update' });
    vals.push(id);
    await db.query(`UPDATE emission_factors SET ${fields.join(', ')} WHERE id = ?`, vals);
    res.json({ status: 'success', message: 'Emission factor updated' });
  } catch (e) {
    console.error('admin PUT /emission-factors/:id error', e);
    res.status(500).json({ status: 'error', message: 'Failed to update factor' });
  }
});

// --- Scenarios (overview) ---
router.get('/scenarios', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, u.username FROM scenarios s JOIN users u ON s.user_id = u.id WHERE s.is_active = 1 ORDER BY s.updated_at DESC LIMIT 200`
    );
    res.json({ status: 'success', data: rows });
  } catch (e) {
    console.error('admin GET /scenarios error', e);
    res.status(500).json({ status: 'error', message: 'Failed to load scenarios' });
  }
});

// --- Helper: Get emission estimates for challenge target suggestions ---
router.get('/emission-estimates', async (req, res) => {
  try {
    // Calculate average emissions from existing user data
    const [avgData] = await db.query(`
      SELECT 
        AVG(daily_avg) as avg_daily_emissions,
        MIN(daily_avg) as min_daily,
        MAX(daily_avg) as max_daily
      FROM (
        SELECT 
          s.user_id,
          COALESCE(SUM(sa.co2e_amount) / GREATEST(DATEDIFF(MAX(sa.created_at), MIN(sa.created_at)), 1), 0) as daily_avg
        FROM scenarios s
        LEFT JOIN scenario_activities sa ON s.id = sa.scenario_id
        WHERE s.is_active = 1
        GROUP BY s.user_id
        HAVING COUNT(sa.id) > 0
      ) as user_averages
    `);
    
    // Get category-specific averages
    const [categoryData] = await db.query(`
      SELECT 
        category,
        AVG(co2e_amount) as avg_emission,
        COUNT(*) as activity_count
      FROM scenario_activities
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY category
    `);
    
    const estimates = {
      overall: {
        avg_daily: Number(avgData[0]?.avg_daily_emissions || 10.0).toFixed(2),
        min_daily: Number(avgData[0]?.min_daily || 2.0).toFixed(2),
        max_daily: Number(avgData[0]?.max_daily || 20.0).toFixed(2)
      },
      by_category: categoryData.reduce((acc, row) => {
        acc[row.category] = {
          avg_emission: Number(row.avg_emission).toFixed(2),
          activity_count: row.activity_count
        };
        return acc;
      }, {}),
      suggestions: {
        daily_limit_low: 3.0,
        daily_limit_moderate: 7.0,
        daily_limit_high: 12.0,
        total_week_low: 21.0,
        total_week_moderate: 49.0,
        total_month_low: 90.0,
        total_month_moderate: 210.0
      }
    };
    
    res.json({ status: 'success', data: estimates });
  } catch (e) {
    console.error('admin GET /emission-estimates error', e);
    res.status(500).json({ status: 'error', message: 'Failed to load estimates' });
  }
});

// --- Climatiq Activity Search & Challenge Generation ---
router.post('/climatiq-search', async (req, res) => {
  try {
    const { query, category } = req.body || {};
    const apiKey = process.env.CLIMATIQ_API_KEY;
    
    if (!apiKey) {
      // Fallback to local database
      const [factors] = await db.query(
        'SELECT *, activity_type as name FROM emission_factors WHERE activity_type LIKE ? OR category = ? LIMIT 20',
        [`%${query || ''}%`, category || '']
      );

      return res.json({ 
        status: 'success',
        data: factors.map(f => ({
          id: `local_${f.id}`,
          name: f.activity_type,
          category: f.category,
          source: f.source || 'local',
          region: f.region,
          co2e_per_unit: parseFloat(f.co2e_per_unit),
          unit: f.unit,
          description: `${f.activity_type} (${f.region})`,
          source_type: 'local'
        })),
        fallback: true,
        message: 'Using local database. Add CLIMATIQ_API_KEY to .env for live data.'
      });
    }

    // Search Climatiq API
    const axios = require('axios');
    const response = await axios.get('https://api.climatiq.io/data/v1/search', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      params: {
        query: query || '',
        category: category || undefined,
        year: 2024,
        region: 'US'
      }
    });

    const activities = response.data.results.slice(0, 20).map(item => ({
      id: item.id,
      name: item.name || item.activity_id,
      category: item.category,
      source: item.source,
      region: item.region,
      co2e_per_unit: parseFloat(item.factor),
      unit: item.unit_type,
      description: item.activity_name || item.name,
      source_type: 'climatiq'
    }));

    res.json({ status: 'success', data: activities });
  } catch (e) {
    console.error('admin POST /climatiq-search error', e.response?.data || e.message);
    
    // Fallback on error
    try {
      const [factors] = await db.query(
        'SELECT *, activity_type as name FROM emission_factors WHERE activity_type LIKE ? LIMIT 20',
        [`%${req.body.query || ''}%`]
      );

      res.json({ 
        status: 'success',
        data: factors.map(f => ({
          id: `local_${f.id}`,
          name: f.activity_type,
          category: f.category,
          source: f.source || 'local',
          region: f.region,
          co2e_per_unit: parseFloat(f.co2e_per_unit),
          unit: f.unit,
          description: `${f.activity_type} (${f.region})`,
          source_type: 'local'
        })),
        fallback: true,
        message: 'Climatiq API error. Using local database.'
      });
    } catch (dbError) {
      res.status(500).json({ status: 'error', message: 'Failed to search activities' });
    }
  }
});

// --- Generate Challenge from Activity ---
router.post('/generate-challenge', async (req, res) => {
  try {
    const { activity_id, activity_name, co2e_per_unit, unit, category } = req.body || {};

    if (!activity_name || !co2e_per_unit) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Missing required fields: activity_name, co2e_per_unit' 
      });
    }

    const emissionFactor = parseFloat(co2e_per_unit);
    
    // Generate intelligent challenge suggestions
    const suggestions = {
      daily_limit: {
        name: `Daily ${activity_name} Limit`,
        description: `Keep your daily ${activity_name.toLowerCase()} emissions under ${(emissionFactor * 10).toFixed(1)} kg CO2e`,
        challenge_type: 'daily_limit',
        target_value: (emissionFactor * 10).toFixed(2),
        target_unit: 'kg_co2e',
        duration_days: 7,
        badge_name: `${activity_name.split(' ')[0]} Saver`,
        reasoning: `Based on ${emissionFactor} kg CO2e per unit, allowing ~10 units/day`
      },
      weekly_total: {
        name: `Weekly ${activity_name} Challenge`,
        description: `Limit total ${activity_name.toLowerCase()} to ${(emissionFactor * 50).toFixed(1)} kg CO2e this week`,
        challenge_type: 'total_limit',
        target_value: (emissionFactor * 50).toFixed(2),
        target_unit: 'kg_co2e',
        duration_days: 7,
        badge_name: `${activity_name.split(' ')[0]} Warrior`,
        reasoning: `Weekly target allowing ~50 units total`
      },
      monthly_total: {
        name: `Month of ${activity_name} Awareness`,
        description: `Stay under ${(emissionFactor * 200).toFixed(1)} kg CO2e from ${activity_name.toLowerCase()} this month`,
        challenge_type: 'total_limit',
        target_value: (emissionFactor * 200).toFixed(2),
        target_unit: 'kg_co2e',
        duration_days: 30,
        badge_name: `${activity_name.split(' ')[0]} Champion`,
        reasoning: `Monthly target for sustainable habits`
      },
      activity_tracker: {
        name: `Track ${activity_name}`,
        description: `Log 15 ${activity_name.toLowerCase()} activities to build awareness`,
        challenge_type: 'activity_count',
        target_value: 15,
        target_unit: 'activities',
        duration_days: 14,
        badge_name: `${activity_name.split(' ')[0]} Tracker`,
        reasoning: `Focus on tracking behavior before reduction`
      }
    };

    res.json({ 
      status: 'success',
      data: {
        suggestions,
        activity_info: {
          activity_id,
          activity_name,
          co2e_per_unit: emissionFactor,
          unit,
          category
        }
      }
    });
  } catch (e) {
    console.error('admin POST /generate-challenge error', e);
    res.status(500).json({ status: 'error', message: 'Failed to generate challenge' });
  }
});

module.exports = router;
