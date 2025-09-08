# FinkiRanked

This project was developed for the "Internet Technologies" course. FinkiRanked is a competitive programming platform designed for students of the Faculty of Computer Science and Engineering (FINKI). It provides a space for students to solve algorithmic challenges, compete with peers, and improve their problem-solving skills. In addition to challenges, users can engage in discussions, ask questions, and share knowledge on the integrated forum.

## Setup and Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/andrejshuma/finkiRanked.git
    cd finkiRanked
    ```

2.  **Set up the Backend:**

    ```bash
    cd backend
    npm install
    ```

Create a `.env` file in the `backend` directory and add the necessary environment variables.

    ```env
    # For Prisma to connect to the database via connection pooling.
    DATABASE_URL="your_database_url_from_supabase"
    # For Prisma migrations, requires a direct connection to the database.
    DIRECT_URL="your_direct_database_url_from_supabase"

    # Your API key for OpenAI services (used for detecting if the content is appropriate for the forum).
    OPENAI_KEY="your_openai_api_key"

    # Supabase project URL and keys for backend services.
    SUPABASE_URL="your_supabase_project_url"
    SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
    SUPABASE_JWT_SECRET="your_supabase_jwt_secret"

    # Configuration for sending emails with Nodemailer.
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=465
    EMAIL_USER="your_email_for_nodemailer"
    EMAIL_PASS="your_email_password"

    # Google OAuth credentials for user authentication.
    GOOGLE_CLIENT_ID="your_google_client_id"
    GOOGLE_CLIENT_SECRET="your_google_client_secret"
    ```

    Then, apply the database schema:

    ```bash
    npx prisma db push
    ```

    And generate the Prisma client:

    ```bash
    npx prisma generate
    ```

3.  **Set up the Frontend:**

    ```bash
    cd ../client
    npm install
    ```

    Create a `.env` file in the `client` directory and add the necessary environment variables.

    ```env
    # Supabase project URL for client-side access.
    VITE_SUPABASE_URL="your_vite_supabase_url"
    # Supabase anonymous key for client-side access
    VITE_SUPABASE_ANON_KEY="your_vite_supabase_anon_key"

    ```

## Running the Application

1.  **Run the Backend Server:**

    In the `backend` directory:

    ```bash
    npm run dev
    ```

    The server will start on `http://localhost:5001`.

2.  **Run the Frontend Development Server:**

    In the `client` directory:

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:5173`.
