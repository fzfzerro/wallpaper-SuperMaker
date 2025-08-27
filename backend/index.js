const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer'); // For file uploads
const path = require('path');   // For path manipulation
const fs = require('fs');       // For file system operations (like creating directories)
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- Multer Configuration for Template Frame Image Uploads ---
const UPLOAD_DIR = 'uploads/template_frames/';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter, limits: { fileSize: 1024 * 1024 * 5 } }); // 5MB limit

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// PostgreSQL Pool setup
const pool = new Pool({
  user: process.env.PGUSER || 'db_user_placeholder',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'mockup_db_placeholder',
  password: process.env.PGPASSWORD || 'db_password_placeholder',
  port: process.env.PGPORT || 5432,
});

// Test DB connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Successfully connected to the database. Current time from DB:', res.rows[0].now);
  }
});

app.get('/', (req, res) => {
  res.send('Backend server is running');
});

// --- API Endpoints for Mockup Templates ---

// POST /api/templates - Create a new template
// Now uses upload.single('templateImage') for file upload
app.post('/api/templates', upload.single('templateImage'), async (req, res) => {
  // Handle multer errors explicitly if any
  if (req.fileValidationError) {
    return res.status(400).json({ error: req.fileValidationError });
  }
  if (!req.file) {
    // This case might occur if the file filter rejected the file, or no file was sent.
    // If 'templateImage' is optional, this check might need adjustment.
    // For now, assume 'templateImage' is required.
    return res.status(400).json({ error: 'Template image file is required.' });
  }

  const { name, description, screen_x, screen_y, screen_width, screen_height, css_class } = req.body;
  const image_url = `/uploads/template_frames/${req.file.filename}`; // Path to the uploaded file

  // Basic validation for other fields
  if (!name || !css_class) {
    // image_url is now handled by multer, so remove from this check if it was there
    return res.status(400).json({ error: 'Missing required fields: name, css_class' });
  }

  const query = `
    INSERT INTO mockup_templates (name, description, image_url, screen_x, screen_y, screen_width, screen_height, css_class)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const values = [name, description, image_url, screen_x, screen_y, screen_width, screen_height, css_class];

  try {
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating template:', err.stack);
    res.status(500).json({ error: 'Database error while creating template' });
  }
});

// GET /api/templates - Read all templates
app.get('/api/templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mockup_templates ORDER BY id ASC;');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching templates:', err.stack);
    res.status(500).json({ error: 'Database error while fetching templates' });
  }
});

// GET /api/templates/:id - Read a single template by ID
app.get('/api/templates/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM mockup_templates WHERE id = $1;', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(`Error fetching template ${id}:`, err.stack);
    res.status(500).json({ error: 'Database error while fetching template' });
  }
});

// PUT /api/templates/:id - Update a template by ID
app.put('/api/templates/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, image_url, screen_x, screen_y, screen_width, screen_height, css_class } = req.body;

  // Basic validation (at least one field should be present for an update, though usually more robust logic is needed)
  if (!name && !description && !image_url && !screen_x && !screen_y && !screen_width && !screen_height && !css_class) {
    return res.status(400).json({ error: 'No update fields provided' });
  }

  // Construct the query dynamically based on provided fields
  // For simplicity, this example updates all provided fields. A more robust solution
  // might only update fields that are actually present in the request body.
  // COALESCE is used to keep existing values if a field is not provided in the request.
  const query = `
    UPDATE mockup_templates
    SET 
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      image_url = COALESCE($3, image_url),
      screen_x = COALESCE($4, screen_x),
      screen_y = COALESCE($5, screen_y),
      screen_width = COALESCE($6, screen_width),
      screen_height = COALESCE($7, screen_height),
      css_class = COALESCE($8, css_class),
      updated_at = NOW()
    WHERE id = $9
    RETURNING *;
  `;
  const values = [name, description, image_url, screen_x, screen_y, screen_width, screen_height, css_class, id];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found for update' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(`Error updating template ${id}:`, err.stack);
    res.status(500).json({ error: 'Database error while updating template' });
  }
});

// DELETE /api/templates/:id - Delete a template by ID
app.delete('/api/templates/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM mockup_templates WHERE id = $1 RETURNING *;', [id]);
    if (result.rowCount === 0) { // Or result.rows.length === 0 if RETURNING * was not used effectively
      return res.status(404).json({ error: 'Template not found for deletion' });
    }
    // Successfully deleted
    res.status(200).json({ message: `Template with ID ${id} deleted successfully`, deletedTemplate: result.rows[0] });
    // Or use 204 No Content, but then you shouldn't send a body
    // res.status(204).send(); 
  } catch (err) {
    console.error(`Error deleting template ${id}:`, err.stack);
    res.status(500).json({ error: 'Database error while deleting template' });
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
