Project Development

1. Main Dashboard

The Main Dashboard serves as the central hub of the system, providing healthcare personnel with a comprehensive overview of clinic operations. It features a summary section displaying key metrics, including the total number of patients, total visits, total diagnoses, and current medicine inventory. This allows doctors and staff to quickly assess the overall status of the clinic at a glance.

Additionally, the dashboard includes a Recent Records Table, which presents the most recent patient entries and visits. This enables doctors to efficiently review ongoing cases, monitor patient progress, and make timely diagnoses. The dashboard is designed to streamline workflow, improve decision-making, and ensure that critical patient information is readily accessible in real-time.

Start:
a. Designing the UI layout using Figma by creating templates to follow for the dashboard interface including the view record button, add record button, and the logout button.
b. Setting up the project environment by initializing the React JS project and configuring Tailwind CSS for styling.
c. Developing React components such as Dashboard, DashboardCard, and RecentRecordsTable.
d. Connecting the frontend to the backend (Node.js/Express) API to fetch real-time data for all dashboard metrics.
e. Implementing sorting and pagination for the Recent Records Table to enhance usability.
f. Performing unit and integration testing to ensure all dashboard components display accurate and updated information.
g. Conducting user acceptance testing to verify that doctors can efficiently access and interpret critical clinic data.
h. Ensuring that all displayed data adheres to security protocols and is accessible only by authorized personnel.
i. Deploying the Main Dashboard as the central monitoring interface within the overall system.
End:

2. Patient Registration Portal

The Patient Registration Portal is a public-facing landing page that allows students to register themselves at the clinic without requiring login credentials. The portal collects essential patient information such as student ID, full name, department, date of birth, address, and contact details. For returning students, the system provides auto-fill functionality by detecting an existing student ID once 11 characters are entered, automatically populating the form with previously saved information to streamline the registration process.

Start:
a. Designing the registration portal layout using Figma, including form fields, auto-fill indicators, and submission confirmation feedback.
b. Developing React components such as LandingPage and patient registration form elements with real-time validation.
c. Configuring Tailwind CSS for responsive styling to ensure the portal renders correctly on shared kiosk or tablet devices.
d. Implementing auto-fill functionality that triggers a student ID lookup after detecting 11 characters and populates the form with existing patient data.
e. Connecting the frontend to the backend (Node.js/Express) API to submit new patient records and retrieve existing patient information for auto-fill.
f. Implementing input validation and sanitization to ensure submitted data is accurate and secure.
g. Performing unit testing to validate form submissions, auto-fill behavior, and API interactions.
h. Conducting user acceptance testing to verify that students can register efficiently without assistance from clinic staff.
i. Ensuring that the registration portal does not expose any authenticated data or internal system information.
j. Deploying the Patient Registration Portal as the public entry point of the TechClinic system.
End:

3. Adding Patient Record

The Adding Patient Record section allows nurses to create new visit records for registered patients. The nurse enters patient details and visit information, which will be saved and added to the patient records. The record is initially marked as Incomplete until a doctor adds a diagnosis.

Start:
a. Designing the Add Patient Record layout in Figma, including form fields for patient information and visit details.
b. Developing React components such as NewPatient to handle data entry and form validation.
c. Configuring Tailwind CSS for consistent styling and responsive design across different devices.
d. Connecting the frontend to the backend (Node.js/Express) API to submit new patient visit records.
e. Implementing validation rules to ensure required fields are completed before submission.
f. Performing unit and integration testing to ensure patient records are correctly created and stored in the database.
g. Conducting user acceptance testing to verify that nurses can efficiently add patient records.
h. Ensuring that only authorized personnel with the Nurse role can access and submit new patient records.
i. Deploying the Add Patient Record module as part of the overall system.
End:

4. Patient Record Page

The Patient Record Page displays a comprehensive list of all patient records in the system. The table is dynamically updated and sortable, allowing users to organize the data efficiently. Additionally, the page includes a search bar and a department filter dropdown, enabling quick and streamlined navigation through the records.

Start:
a. Designing the Patient Record Page layout using Figma, including a sortable table for displaying patient data.
b. Implementing a search bar to allow users to find records quickly by patient name or other identifiers.
c. Adding a department filter dropdown to enable users to view records by specific departments.
d. Continuing the existing React JS project and creating or updating components to display patient records dynamically.
e. Configuring Tailwind CSS for consistent styling of the table, search bar, and dropdown filters.
f. Connecting the frontend components to the backend (Node.js/Express) API to fetch, sort, and filter patient records.
g. Performing unit testing to ensure the table, search, and filter functionalities work correctly.
h. Conducting user acceptance testing to verify that navigation and data retrieval are intuitive and efficient.
i. Ensuring that data privacy and security measures are in place so only authorized personnel can access patient records.
j. Deploying the Patient Record Page as part of the overall system for real-time access to patient information.
End:

5. Individual Record and Diagnosis

The Individual Record Page provides a detailed view of a specific patient's visit, including personal information, visit history, and diagnosis details. From this page, doctors can add a diagnosis to an incomplete record by specifying the disease, treatment plan, and prescribed medication. Once a diagnosis is added, the record status is updated from Incomplete to Complete. The page also allows staff to generate printable medical certificates and prescriptions.

Start:
a. Designing the Individual Record Page layout using Figma, including sections for patient details, visit information, and diagnosis data.
b. Developing React components such as IndividualRecord and AddDiagnosis to handle record viewing and diagnosis input.
c. Implementing the diagnosis form with fields for disease selection, treatment plan, prescribed medication, and clinical notes.
d. Connecting the frontend to the backend (Node.js/Express) API to fetch individual patient records and submit diagnosis data.
e. Implementing logic to update record status from Incomplete to Complete upon successful diagnosis submission.
f. Integrating medical certificate and prescription generation functionality accessible from the individual record view.
g. Performing unit and integration testing to validate diagnosis creation, record status updates, and document generation.
h. Conducting user acceptance testing to verify that doctors can efficiently diagnose patients and generate certificates.
i. Ensuring that only authorized personnel with the Doctor role can add diagnoses to patient records.
j. Deploying the Individual Record and Diagnosis module as part of the overall system.
End:

6. Medicine Inventory and Reporting

The Medicine Inventory and Reporting feature allows healthcare personnel to manage the clinic's medicine stock. Staff can add, update, and delete medicines from the inventory while tracking stock levels, expiry dates, and usage. When stock falls below a defined threshold, the system automatically triggers a low-stock notification to alert clinic staff.

Start:
a. Designing the medicine inventory interface using Figma, including a table view for medicines and a form for adding or editing entries.
b. Continuing the existing React JS project and developing components such as MedicineInventory and AddMedicine.
c. Configuring Tailwind CSS for consistent styling of the inventory table and form fields.
d. Developing React components to handle input and validation of medicine data including name, quantity, dosage, and expiry date.
e. Updating the backend (Node.js/Express) API to handle CRUD operations for medicine records, ensuring data is securely stored in the database.
f. Implementing low-stock detection logic that triggers notifications when inventory falls below the minimum threshold.
g. Performing unit testing to validate form functionality and API calls, as well as user acceptance testing to ensure medicine management is intuitive and properly saved.
h. Ensuring the inventory data is visible and accessible only by authorized users with proper credentials.
i. Deploying the Medicine Inventory and Reporting module as part of the overall system.
End:

7. Analytics Page

The Analytics Page consists of four graphical charts that provide visual representations of the system's data. Each chart includes its own time-frame option, allowing users to filter and analyze data based on a selected period. The graphs presented are Most Used Medicine Stocks, Patient Record Count, Patient Records per Department, and Top Diagnoses. These visualizations ensure a clearer understanding of trends, patterns, and distributions within the healthcare data, supporting informed decision-making and effective monitoring of the clinic's operations.

Start:
a. Designing the layout and interface of the Analytics Page using Figma, ensuring a clear, user-friendly visualization of the four charts.
b. Integrating charting libraries (Apex Charts) into the existing React JS project to render dynamic and interactive graphs.
c. Configuring Tailwind CSS for consistent styling of chart containers, filters, and page components to match the overall system design.
d. Developing React components to handle data fetching, chart rendering, and user-selected time-frame filters for each graph.
e. Updating the backend API (Node.js/Express) to provide aggregated data required for each chart, such as medicine usage, patient counts, departmental statistics, and diagnosis frequencies.
f. Implementing data validation and error handling to ensure that charts display accurate and up-to-date information.
g. Performing unit testing to validate API calls and chart rendering, followed by user acceptance testing to confirm that the Analytics Page is functional, intuitive, and responsive.
h. Ensuring that the Analytics Page integrates seamlessly with the rest of the TechClinic system and supports authorized user access only.
i. Deploying the Analytics Page module as part of the overall system to provide ongoing, real-time insights into clinic operations.
End:

8. Notification Page

The Notification Page provides healthcare personnel with real-time alerts about critical updates in the clinic. It notifies users when a disease reaches the top 10% threshold, indicating a potential outbreak, and when medicine stock levels are low, ensuring timely restocking. The page allows personnel to view, mark as read, or delete notifications, helping them stay informed and respond quickly to urgent issues. Notifications are automatically generated by the system based on data from patient records, disease statistics, and medicine inventory.

Start:
a. Designing the notification interface in Figma, including alert cards, read/unread indicators, and action buttons.
b. Integrating the notification component into the existing React JS dashboard.
c. Implementing API calls using Axios to fetch notifications from the backend and update their read status.
d. Developing backend logic (Node.js/Express) to automatically create notifications when diseases cross the 10% threshold or medicine stocks fall below minimum levels.
e. Ensuring notifications are linked to the appropriate users and stored securely in the database.
f. Adding search, filter, and sorting functionality for easier navigation of notifications.
g. Performing testing to ensure alerts are correctly generated, displayed, and updated in real-time.
h. Verifying user permissions to make sure notifications are only accessible to authorized personnel.
i. Deploying the Notification Page as part of the overall TechClinic System.
j. Ensuring the system continues to generate and display alerts accurately and efficiently, helping staff respond promptly to critical situations.
End:

9. Personnel Management

The Personnel Management feature allows administrators to view and manage the clinic's staff directory. The page displays a table of all registered personnel with details including name, role, email, sex, and account status. Administrators can add new staff members through an inline modal form that creates both a Supabase authentication account and a corresponding user profile in the database.

Start:
a. Designing the Personnel List layout using Figma, including a staff table with role badges, search functionality, and role filter dropdown.
b. Developing React components such as PersonnelList with an inline modal for adding new personnel.
c. Configuring Tailwind CSS for consistent styling of the personnel table, role badges, and modal form.
d. Implementing form fields with validation for First Name, Last Name, Email, Password, Confirm Password, Address, Date of Birth, Role, and Sex.
e. Connecting the frontend to the backend (Node.js/Express) API for creating new Supabase Auth users and inserting user profiles into the users table.
f. Implementing role-based access control to ensure that only administrators can access the Personnel List and add new staff members.
g. Performing unit and integration testing to validate user creation, form submissions, and role restrictions.
h. Conducting user acceptance testing to verify that administrators can efficiently manage clinic personnel.
i. Deploying the Personnel Management module as part of the overall system.
End:

10. Activity Log

The Activity Log page provides administrators with a detailed audit trail of all significant actions performed within the system. It records user activities such as login events, record creation, diagnosis submissions, medicine updates, and personnel changes. The log includes timestamps, user information, and action descriptions to support accountability and system monitoring.

Start:
a. Designing the Activity Log interface using Figma, including a chronological table of system events.
b. Developing React components to display audit trail entries with sorting and filtering capabilities.
c. Configuring Tailwind CSS for consistent styling of the activity log table and filter controls.
d. Connecting the frontend to the backend (Node.js/Express) API to fetch audit trail data.
e. Implementing backend logic to automatically record system events and store them in the audit_trail table.
f. Performing unit and integration testing to ensure all system actions are correctly logged and displayed.
g. Conducting user acceptance testing to verify that administrators can effectively monitor system activity.
h. Ensuring that audit trail data is only accessible to authorized personnel.
i. Deploying the Activity Log module as part of the overall system.
End:

11. Admin Dashboard

The Admin Dashboard provides system administrators with an overview of system management functions. It displays user account statistics, recent system activity, and quick access links to personnel management, activity logs, and system settings. This centralized interface enables administrators to efficiently oversee system operations and user management.

Start:
a. Designing the Admin Dashboard layout using Figma, including metric cards, recent activity feeds, and navigation shortcuts.
b. Developing React components such as AdminDashboard with dynamic data rendering and interactive elements.
c. Configuring Tailwind CSS for consistent styling that matches the overall system design.
d. Connecting the frontend to the backend (Node.js/Express) API to fetch administrative data including user statistics and recent activity.
e. Implementing role-based access control to ensure that only administrators can access the Admin Dashboard.
f. Performing unit and integration testing to ensure all administrative components display accurate information.
g. Conducting user acceptance testing to verify that administrators can efficiently navigate and manage the system.
h. Deploying the Admin Dashboard module as part of the overall system.
End:

12. Settings Page

The Settings Page allows personnel to view and manage their account information, including updating personal details and changing their password securely.

Start:
a. Designing the settings interface using Figma, ensuring clear sections for personal information and password management.
b. Integrating the existing React JS project and creating a Settings component to display user information fetched from the backend.
c. Configuring Tailwind CSS for consistent styling with the rest of the application.
d. Implementing form fields with validation for updating personal details such as name, email, and contact information.
e. Developing a secure password change form with current password verification and strong password requirements.
f. Updating the backend (Node.js/Express) API to handle updates to user information and password changes, ensuring proper authentication and authorization.
g. Performing unit testing and user acceptance testing to verify the functionality, security, and usability of the settings page.
h. Ensuring that updated information is correctly saved and reflected across the system, including in user-specific views.
i. Deploying the Settings module as part of the overall system, ensuring personnel can securely update their account information and change passwords.
End:

13. Authentication and Login

The Authentication and Login module provides secure access to the TechClinic system for authorized clinic personnel. It uses Supabase authentication to manage user sessions, JWT tokens, and role-based access. Upon successful login, users are redirected to their role-appropriate dashboard, and their session is persisted across page reloads.

Start:
a. Designing the login page interface using Figma, including email and password fields with validation feedback.
b. Developing React components such as Login and ProtectedRoute to handle authentication flow and route protection.
c. Configuring Supabase client integration for authentication, session management, and JWT token generation.
d. Implementing role-based redirection logic to direct users to the correct dashboard based on their assigned role (Doctor, Nurse, or Admin).
e. Developing backend middleware for JWT verification and role-based authorization on protected API endpoints.
f. Implementing Row Level Security (RLS) policies in Supabase to enforce data access restrictions at the database level.
g. Performing unit and integration testing to verify authentication flows, session persistence, and unauthorized access prevention.
h. Conducting user acceptance testing to ensure the login process is intuitive and secure for all user roles.
i. Deploying the Authentication and Login module as the security gateway of the TechClinic system.
End:
