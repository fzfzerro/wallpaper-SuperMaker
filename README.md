# Project Title: Mockup Generator

## Overview
A web application that allows users to generate device mockups by placing their images onto predefined templates. It features a frontend for user interaction and a backend for managing mockup templates. This project is inspired by tools like taojuju.com/mockup.

## Features
- **Dynamic Template Selection:** Users can choose from various device mockup templates.
- **Custom Wallpaper Upload:** Users can upload their own images to be used as wallpapers in the mockups.
- **Real-time Color Customization:** Interface colors and potentially some template elements can be customized.
- **Live Preview:** Changes are reflected in real-time in a mockup preview area.
- **Backend Template Management:** CRUD API for managing mockup templates (device frames, screen coordinates, etc.).
- **Responsive Design (Frontend):** The user interface is designed to adapt to different screen sizes.

## Project Structure
```
/
├── frontend/
│   ├── css/
│   │   └── style.css         # Frontend styles
│   ├── js/
│   │   └── app.js            # Frontend JavaScript logic
│   ├── index.html            # Main HTML file for the user interface
│   └── package.json          # Frontend dependencies (if any in future)
├── backend/
│   ├── database_schema.sql   # SQL schema for the mockup_templates table
│   ├── index.js              # Main backend server file (Express.js)
│   ├── package.json          # Backend dependencies (Express, pg, cors)
│   └── .env.example          # Example environment file (user should create .env)
└── README.md                 # This file
```

## Setup and Installation

### Prerequisites
- Node.js (v14.x or later recommended)
- npm (usually comes with Node.js)
- PostgreSQL (running instance)

### Backend Setup
1.  **Clone the repository (if applicable).**
2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Setup PostgreSQL Database:**
    *   Ensure your PostgreSQL server is running.
    *   Create a database (e.g., `mockup_generator_db`).
    *   Create a user with permissions to connect to and modify this database.
    *   Execute the `database_schema.sql` script in your PostgreSQL database to create the `mockup_templates` table and the `update_updated_at_column` trigger function. You can use a tool like `psql` or pgAdmin.
        ```bash
        psql -U your_postgres_user -d your_database_name -f database_schema.sql
        ```
5.  **Configure Environment Variables:**
    *   In the `backend` directory, create a `.env` file by copying `.env.example` (if one is provided, otherwise create it manually).
    *   Edit the `.env` file with your PostgreSQL connection details:
        ```env
        PGUSER=your_db_user
        PGHOST=localhost
        PGDATABASE=your_db_name
        PGPASSWORD=your_db_password
        PGPORT=5432
        PORT=3000 # Port for the backend server
        ```
6.  **Run the backend server:**
    ```bash
    npm start 
    ```
    (Assuming you add `"start": "node index.js"` to `backend/package.json` scripts). If not, use `node index.js`.
    The server should start, typically on `http://localhost:3000`.

### Frontend Setup
1.  **Navigate to the frontend directory (optional if no build step):**
    ```bash
    cd frontend 
    ```
    (If you added any frontend-specific npm packages or build tools, you might run `npm install` here as well).
2.  **Open `index.html`:**
    *   Open the `frontend/index.html` file directly in your web browser.
    *   Alternatively, use a live server extension from your code editor (e.g., VS Code's "Live Server") for a better development experience with auto-reloading.

## Usage
1.  Ensure the backend server is running.
2.  Open `frontend/index.html` in your browser.
3.  Select a mockup template from the available options.
4.  Upload your desired wallpaper image using the file selector.
5.  Use the color pickers to customize theme colors.
6.  The preview will update in real-time.

## API Endpoints (Backend)
The backend provides the following API endpoints for template management:
- `GET /api/templates`: Fetches all mockup templates.
- `POST /api/templates`: Adds a new mockup template.
    - Body should be JSON with: `name`, `description` (optional), `image_url`, `screen_x`, `screen_y`, `screen_width`, `screen_height`, `css_class`.
- `GET /api/templates/:id`: Fetches a single template by its ID.
- `PUT /api/templates/:id`: Updates an existing template by ID.
- `DELETE /api/templates/:id`: Deletes a template by ID.

*(Further development could include an admin interface for easier management of these templates).*
