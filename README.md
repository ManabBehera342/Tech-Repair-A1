# Electronic Repair Service Portal

A comprehensive platform to streamline device repair management for customers, partners, and service teams.

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [User Roles & Workflows](#user-roles--workflows)
- [Architecture & Data Flow](#architecture--data-flow)
- [Technology Stack](#technology-stack)
- [Third-Party Integrations](#third-party-integrations)
- [Setup & Installation](#setup--installation)
- [Security Considerations](#security-considerations)
- [How to Use](#how-to-use)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Project Overview

The **Electronic Repair Service Portal** is a web platform that simplifies and manages electronic device repair requests for multiple stakeholders, including customers, channel partners, service teams, and electronic repair (EPR) teams. The portal features secure authentication, detailed ticket creation, multi-phase ticket management, analytics, and Gemini API-powered chatbot support—all integrated with scalable cloud services.

## Key Features

- **Multi-role Authentication:** Custom workflows and dashboards for Customers, Channel Partners, System Integrators, Service Teams, and EPR Teams.
- **Secure User Management:** Password hashing using bcrypt and session handling via JWT.
- **Detailed Repair Ticket Submission:** Form to collect contact info, product details, problem description, and media uploads.
- **Robust Ticket Workflow:** Tickets progress through well-defined stages, from creation to closure.
- **Real-Time Dashboard:** Dynamic ticket overviews and status updates.
- **Analytics Module:** Visualizes KPIs like resolution time, satisfaction, and issue frequency.
- **AI Chatbot Support:** Gemini API-enabled help available on every portal page.
- **Cloud-Based Media Handling:** Image/video uploads to Cloudinary, URLs tracked via Google Sheets.
- **Data Management:** Accounts stored in MongoDB Atlas; tickets and analytics via Google Sheets API.

## User Roles & Workflows

### Customers & Channel Partners

- Register or log in.
- Fill out a query form with product info and a detailed problem description.
- Upload photos/videos via Cloudinary.
- Review and submit tickets (stored in Google Sheets).

### Service Team & EPR Team

- Log in to access role-based dashboards.
- Manage tickets through these stages:
  - New → Under Validation → Awaiting Dispatch → Assigned to EPR → Estimate Provided → Under Repair → Ready to Return → Closed
- Update tickets (add costs, assign engineers, add comments).
- Receive real-time updates (synced with Google Sheets).

## Architecture & Data Flow

- **Frontend:** Landing page, login/signup, dashboard, ticket forms, analytics.
- **Authentication Layer:** Stores hashed passwords via bcrypt and issues JWTs for sessions.
- **Role-based Routing:** Backend determines user roles and UI/workflow.
- **API Calls:**
  - User data: MongoDB Atlas
  - Ticket data/analytics: Google Sheets API
  - Media uploads: Cloudinary (URLs linked with tickets)
  - Chatbot: Gemini API on every page
- **Ticket & Workflow States:** State transition logic with updates pushed to Google Sheets.
- **Analytics:** Aggregated from ticket data and visualized in dashboard.

## Technology Stack

| Layer         | Technology (Choose/Adapt)           |
|---------------|-------------------------------------|
| Frontend      | React.js / Angular / Vue.js         |
| Backend       | Node.js (Express) / Flask / Django  |
| Database      | MongoDB Atlas (user accounts)       |
| Third-Party   | Google Sheets API (tickets, analytics)<br>Cloudinary (media)<br>Gemini API (chatbot) |
| Auth/Security | JWT (sessions), bcrypt (passwords)  |

## Third-Party Integrations

| Service         | Purpose                              |
|-----------------|--------------------------------------|
| MongoDB Atlas   | User account storage and management  |
| Google Sheets   | Ticket storage and analytics         |
| Cloudinary      | Media uploads (photos/videos)        |
| Gemini API      | AI Chatbot support                   |

## Setup & Installation

1. **Clone the Repository**
    ```
    git clone <your-repo-url>
    cd electronic-repair-service-portal
    ```

2. **Install Dependencies**
    ```
    npm install
    # or
    yarn install
    ```

3. **Configure Environment Variables**

    Create a `.env` file in root with:
    ```
    MONGODB_URI=your_mongodb_atlas_connection_string
    JWT_SECRET=your_jwt_secret_key
    GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    GEMINI_API_KEY=your_gemini_api_key
    ```

4. **Run the Application**
    ```
    npm start
    # or
    yarn start
    ```
## Backend Prerequisites

Before running the backend server, ensure that **Node.js** and **npm** (Node Package Manager) are installed on your system.

### How to Install Node.js & npm

#### Windows / macOS / Linux

1. **Download Node.js:**
   - Visit [https://nodejs.org/](https://nodejs.org/) and download the **LTS (Long Term Support)** version for your operating system.
2. **Run the installer** and follow the setup instructions.
3. **Verify Installation:**
    ```
    node -v
    npm -v
    ```
   Both commands should print version numbers, confirming successful installation.

#### Alternatively, for advanced users (Linux):

If you prefer, you may use a version manager like **nvm**:

5. **Access the Portal**

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Security Considerations

- Passwords hashed (bcrypt) before storage. Never stored in plain text.
- JWT tokens for session management.
- All media files uploaded to Cloudinary (only URLs stored).
- API calls use REST with proper authentication headers.
- Backend role enforcement restricts workflow/data access.

## How to Use

- **Customer/Channel Partner:** Register, complete the repair ticket form with required details, upload media, review, and submit.
- **Service/EPR Team Member:** Log in to dashboard, track service tickets, update status, assign engineers, add comments, and close repairs.
- **Analytics:** Monitor KPIs/performance in the analytics dashboard.
- **Chatbot Help:** Click the chatbot to get instant assistance any time.

## Contributing

- Fork the repo, create a feature branch, and open a pull request.
- Please lint and test your code before submitting contributions.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For questions or support, please contact:

- **Name:** Your Name
- **Email:** your.email@example.com
- **Project Repo:** [GitHub repository link]
- **Website:** yourprojectwebsite.com

Thank you for exploring the Electronic Repair Service Portal!
