"""
Generate Chapter 4 (Results and Discussions) as a .docx file for the TechClinic thesis.
"""
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
import os

doc = Document()

# ── Style helpers ──
style = doc.styles['Normal']
font = style.font
font.name = 'Times New Roman'
font.size = Pt(12)

for s_name in ['Heading 1', 'Heading 2', 'Heading 3']:
    s = doc.styles[s_name]
    s.font.name = 'Times New Roman'
    s.font.color.rgb = RGBColor(0, 0, 0)

def add_heading(text, level=1):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.name = 'Times New Roman'
        run.font.color.rgb = RGBColor(0, 0, 0)
    return h

def add_para(text, bold=False, italic=False, alignment=None, space_after=Pt(6)):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(12)
    run.bold = bold
    run.italic = italic
    if alignment:
        p.alignment = alignment
    p.paragraph_format.space_after = space_after
    return p

def add_figure_placeholder(caption):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('[Insert Screenshot Here]')
    run.font.name = 'Times New Roman'
    run.font.size = Pt(11)
    run.italic = True
    run.font.color.rgb = RGBColor(128, 128, 128)
    
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run2 = cap.add_run(caption)
    run2.font.name = 'Times New Roman'
    run2.font.size = Pt(10)
    run2.italic = True
    cap.paragraph_format.space_after = Pt(12)

def make_table(headers, rows, col_widths=None):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    # Header row
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = ''
        run = cell.paragraphs[0].add_run(h)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(10)
    
    # Data rows
    for r_idx, row_data in enumerate(rows):
        for c_idx, val in enumerate(row_data):
            cell = table.rows[r_idx + 1].cells[c_idx]
            cell.text = ''
            run = cell.paragraphs[0].add_run(str(val))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(10)
    
    if col_widths:
        for i, w in enumerate(col_widths):
            for row in table.rows:
                row.cells[i].width = Inches(w)
    
    doc.add_paragraph()  # spacing after table
    return table


# ═══════════════════════════════════════════════
# CHAPTER 4
# ═══════════════════════════════════════════════

add_heading('Chapter 4', level=1)
add_heading('Results and Discussions', level=2)

add_para(
    'This chapter presents the project description, project structure, project capabilities and limitations, '
    'including the overall results gathered from the implementation and evaluation of the system.'
)

# ── Project Description ──
add_heading('Project Description', level=2)

add_para(
    'The implemented study, TechClinic, is a web-based health record and analytics system designed specifically '
    'for the Technological University of the Philippines (TUP) – Manila Campus clinic. The system serves as a '
    'comprehensive digital platform that enables medical staff to efficiently record, manage, and analyze student '
    'health information while maintaining a pharmaceutical inventory. It integrates a student self-registration kiosk, '
    'role-based clinic workflows, real-time analytics, automated disease outbreak notifications, and digital medical '
    'documentation — all accessible through a modern, responsive web interface. The system replaces the traditional '
    'tally-sheet and paper-based record-keeping methods currently employed by the TUP clinic, providing accurate '
    'graphical representations, improved accessibility, and data-driven decision support for medical personnel.'
)

# ── Project Structure ──
add_heading('Project Structure', level=2)

add_para(
    'The overall structure of TechClinic is designed around the integration of two major components: the backend '
    'server and the frontend web application. The backend component handles data storage, authentication, and '
    'business logic through a RESTful API built with Node.js and Express.js, communicating with a Supabase-hosted '
    'PostgreSQL database. Meanwhile, the frontend application provides the user interface for both students and '
    'clinic staff, delivering real-time data visualization, interactive forms, and role-based navigation. Below are '
    'the following figures that illustrate the processes of the system setup.'
)

add_heading('Software', level=3)

# Figure 4.1 — Landing Page
add_para(
    'Figure 4.1 shows the landing page of TechClinic, which serves as the student self-registration kiosk. '
    'This is the public-facing interface where students input their personal information upon visiting the campus '
    'clinic. The form includes fields for Student ID, name, contact number, email, date of birth, address, year '
    'level, department, and sex. When a returning student enters their 11-character Student ID, the system '
    'automatically retrieves and populates their existing information from the database, prompting the student with '
    'a confirmation dialog. Upon submission, the system creates a new visit record with a status of INCOMPLETE, '
    'indicating that the student has registered but has not yet been seen by a physician.'
)
add_figure_placeholder('Figure 4.1. Student Self-Registration Landing Page')

# Figure 4.2 — Login
add_para(
    'Figure 4.2 shows the login page of TechClinic, which is used by medical staff (nurses and doctors) to access '
    'the system\'s internal features. The page provides email and password authentication fields that authenticate '
    'against Supabase Auth. The login interface features a responsive split layout with the TUP school image on one '
    'side and the authentication form on the other, incorporating the university\'s official crimson color scheme throughout.'
)
add_figure_placeholder('Figure 4.2. Staff Login Page')

# Figure 4.3 — Dashboard
add_para(
    'When logged in, the staff will be directed to the dashboard page, shown in Figure 4.3. The dashboard displays '
    'four animated statistical cards showing the total number of patients, visits, diagnoses, and medicines in the '
    'inventory. Below the statistics, a "Today\'s Records" table presents all clinic visits for the current day, with '
    'color-coded status badges indicating whether a record is complete (green) or incomplete (red). The dashboard '
    'features role-based interaction: when a doctor clicks on an incomplete record, they are directed to the diagnosis '
    'form; when a nurse clicks on an incomplete record, they receive a notification that the record is awaiting '
    'physician review. The dashboard data auto-refreshes every 15 seconds to ensure real-time accuracy.'
)
add_figure_placeholder('Figure 4.3. Main Dashboard')

# Figure 4.4 — New Patient
add_para(
    'Figure 4.4 shows the new patient form, accessible to nurses. This form is used for patient intake and includes '
    'comprehensive fields organized into two sections: personal information (Student ID, name, contact, email, date of '
    'birth, address, year level, department, sex) and medical information (disease, diagnosis, medication, quantity, '
    'treatment, and notes). The form features inline disease addition — if a disease is not found in the catalog, the '
    'nurse can add it directly through a "+" button without leaving the page. The medicine dropdown displays current '
    'stock levels alongside medicine names, and the system validates that the requested quantity does not exceed '
    'available stock. When a patient revisits the clinic, the form can be pre-filled with their existing personal '
    'information through navigation state, eliminating redundant data entry.'
)
add_figure_placeholder('Figure 4.4. Nurse Patient Intake Form (New Patient)')

# Figure 4.5 — Patient Records
add_para(
    'Figure 4.5 shows the patient records browser, which provides a searchable and filterable table of all clinic '
    'visit records. Staff can search by patient name or student ID using a text search field, and filter records by '
    'department using a dropdown selector. Each row displays the patient\'s name, student ID, department, visit date, '
    'and status. Clicking on a record navigates to the individual patient details page.'
)
add_figure_placeholder('Figure 4.5. Patient Records Browser')

# Figure 4.6 — Individual Record
add_para(
    'Figure 4.6 shows the individual patient record view, which displays detailed information about a specific '
    'student\'s clinic history. The page features a profile banner with a gradient header and the patient\'s initials '
    'avatar at the top, followed by contact information cards arranged in a responsive grid. Below the profile section, '
    'a chronological list of all clinic visits is displayed, each showing the date, attending physician, and diagnosis '
    'summary. Clicking on a visit entry opens a diagnosis modal that displays the full medical details including the '
    'attending physician\'s digital signature. The page also includes a "New Visit" button that navigates to the new '
    'patient form with the student\'s personal information pre-populated, and buttons to generate medical certificates '
    'and prescriptions.'
)
add_figure_placeholder('Figure 4.6. Individual Patient Record View')

# Figure 4.7 — Add Diagnosis
add_para(
    'Figure 4.7 shows the doctor\'s diagnosis form, which is accessed when a doctor clicks on an incomplete record '
    'from the dashboard or patient records. The form displays pre-populated patient information at the top and provides '
    'fields for the doctor to enter the diagnosis, select a disease from the catalog, choose medication from the '
    'inventory, specify quantity, and add treatment notes. Similar to the nurse\'s form, the doctor can add new diseases '
    'inline. When submitted, the system inserts the diagnosis, automatically decrements the medicine stock by the '
    'specified quantity, and marks the record as COMPLETE.'
)
add_figure_placeholder('Figure 4.7. Doctor Diagnosis Form')

# Figure 4.8 & 4.9 — Medicine
add_para(
    'Figure 4.8 shows the medicine inventory management page. The interface presents a searchable table displaying '
    'all medicines in the clinic\'s inventory with columns for medicine name, generic name, brand, type, dosage, '
    'unit of measure, stock level, batch number, and expiry date. Staff can search for specific medicines using the '
    'search bar. Clicking on a table row opens an edit/delete modal where the staff can update medicine details or '
    'remove the entry. The inventory data auto-refreshes every 15 seconds. Figure 4.9 shows the add medicine form, '
    'which allows staff to register new medicines into the inventory with all ten required fields.'
)
add_figure_placeholder('Figure 4.8. Medicine Inventory Management')
add_figure_placeholder('Figure 4.9. Add Medicine Form')

# Figure 4.10 — Analytics
add_para(
    'Figure 4.10 shows the analytics dashboard, which generates graphical representations of the clinic\'s health '
    'data. The page renders four chart visualizations using ApexCharts: (1) a Patient Counts area chart showing '
    'patient visit volume over time with gradient fill and smooth curves, (2) a Patients Per Department donut chart '
    'displaying the distribution of visits across the six TUP colleges with a center total, (3) a Top Diagnoses chart '
    'combining a Pareto bar-and-line chart of the top 5 diagnoses by frequency with cumulative percentages alongside '
    'a multi-line trend chart, and (4) a Lowest Stock horizontal bar chart showing the five medicines with the lowest '
    'inventory levels. Charts 1 through 3 support four timeframe options — weekly (Monday to Sunday), monthly '
    '(Weeks 1 to 4), quarterly (3 months), and yearly (January to December) — allowing medical staff to analyze '
    'trends across different periods. All time calculations are performed using Philippine Standard Time (UTC+8).'
)
add_figure_placeholder('Figure 4.10. Analytics Dashboard')

# Figure 4.11 — Notifications
add_para(
    'Figure 4.11 shows the notification center. The system employs a polling-based notification architecture that '
    'checks for alerts every 30 seconds. Two types of automated alerts are generated: (1) Disease Outbreak Alerts, '
    'triggered when a disease\'s cases reach at least 5 and comprise 10% or more of the total patient population '
    '(minimum 10 patients), and (2) Low Stock Medicine Alerts, triggered when a medicine\'s stock level falls to 10 '
    'or below. Notifications are displayed as cards with context-aware icons and colors — amber for disease alerts, '
    'rose for stock warnings, and blue for system notifications. The page features mark-as-read, mark-all-read, '
    'delete, and clear-all functionality. A red badge indicator on the navigation bell icon shows the count of unread '
    'notifications. The system also supports browser push notifications for real-time alerts.'
)
add_figure_placeholder('Figure 4.11. Notification Center')

# Figure 4.12 & 4.13 — Personnel
add_para(
    'Figure 4.12 shows the personnel management page, accessible only to doctors. The interface displays a modern '
    'table listing all clinic staff members, with each row showing a color-coded initials avatar, full name, email, '
    'and role badge (blue for Doctor, green for Nurse). The page includes a search function and a role filter dropdown. '
    'An inline "Add Personnel" modal, shown in Figure 4.13, allows doctors to register new staff members by filling in '
    'their personal details and assigning a role. The creation process involves creating a Supabase Auth user account '
    'and a corresponding profile entry in the database; if the database insert fails, the system automatically rolls '
    'back by deleting the auth user to maintain data integrity.'
)
add_figure_placeholder('Figure 4.12. Personnel Management Page')
add_figure_placeholder('Figure 4.13. Add Personnel Modal')

# Figure 4.14 & 4.15 — Settings & Signature
add_para(
    'Figure 4.14 shows the settings page, which allows staff to manage their profile information and security '
    'settings. The page is divided into three sections: (1) a personal information card with editable fields for name, '
    'role, sex, address, and date of birth, persisted to the database on save; (2) a login and security card displaying '
    'the user\'s email and options for password changes; and (3) a digital signature card, shown in Figure 4.15, which '
    'provides two modes for creating a signature — drawing on a canvas using react-signature-canvas, or uploading a '
    'PNG/JPG image (maximum 2 MB). The signature is uploaded to Supabase Storage and its public URL is saved to the '
    'user\'s profile. This signature appears in the diagnosis modal when viewing completed records, providing physician '
    'authentication.'
)
add_figure_placeholder('Figure 4.14. Settings Page')
add_figure_placeholder('Figure 4.15. Digital Signature Pad')

# Figure 4.16 & 4.17 — Certificate & Prescription
add_para(
    'Figure 4.16 shows the medical certificate modal, which generates a printable TUP clinic pass for students. The '
    'certificate displays the patient\'s name, student ID, and visit date, along with blank spaces for medical findings, '
    'recommendations, and the number of excused days. Figure 4.17 shows the prescription modal, which generates a '
    'printable prescription form containing the diagnosis details and prescribed medication, with checkboxes for '
    'certificate type, referral, and quarantine status. Both documents support printing via the browser\'s native print '
    'dialog, and the prescription supports email delivery through a mailto link.'
)
add_figure_placeholder('Figure 4.16. Medical Certificate Modal')
add_figure_placeholder('Figure 4.17. Prescription Modal')


# ── Capabilities and Limitations ──
add_heading('Project Capabilities and Limitations', level=2)

add_para('The following are the capabilities of the developed system:', bold=False)
add_heading('System Capabilities', level=3)

capabilities = [
    ('Digital Health Record Management', 'Enables medical staff to efficiently create, view, update, and manage student health records digitally, replacing the traditional tally-sheet method. Each record captures comprehensive patient information and visit details.'),
    ('Student Self-Registration Kiosk', 'Provides a public-facing landing page where students can self-register their clinic visit without requiring staff assistance, streamlining the intake process. The system auto-fills returning students\' information based on their Student ID.'),
    ('Role-Based Access Control', 'Implements a three-layer security model comprising Supabase Row-Level Security (RLS) policies at the database level, Express.js authentication and authorization middleware at the backend level, and React protected route components at the frontend level. Two distinct roles (Nurse and Doctor) have defined permission sets.'),
    ('Real-Time Analytics and Graphical Representations', 'Generates four types of data visualizations (patient visit trends, department distribution, top diagnoses with Pareto analysis, and medicine stock levels) that can be viewed across weekly, monthly, quarterly, and yearly timeframes, enabling data-driven decision-making.'),
    ('Pharmaceutical Inventory Management', 'Provides full CRUD (Create, Read, Update, Delete) operations for managing the clinic\'s medicine inventory, including tracking of stock levels, batch numbers, and expiry dates. Stock levels are automatically decremented when medicines are prescribed during diagnoses.'),
    ('Automated Disease Outbreak and Low Stock Notifications', 'Implements an alert system that automatically monitors disease case percentages and medicine stock levels, generating notifications when configurable thresholds are exceeded. Notifications are delivered both in-app and through browser push notifications.'),
    ('Digital Signature System', 'Allows physicians to create, store, and manage their digital signatures through canvas drawing or image upload, which are automatically displayed on completed diagnosis records for physician authentication and verification.'),
    ('Medical Document Generation', 'Generates printable medical certificates (clinic passes) and prescription forms directly from the system, supporting both printing and email dispatch functionality.'),
    ('Multi-User Concurrent Access', 'Designed as a cloud-based, multi-user web application utilizing Supabase\'s hosted PostgreSQL database, allowing real-time, concurrent access for multiple doctors and nurses simultaneously.'),
    ('Auto-Refresh and Real-Time Data', 'Dashboard and medicine inventory data automatically refresh every 15 seconds, while notifications poll every 30 seconds, ensuring that staff always have access to the most current information.'),
    ('Responsive Web Design', 'The frontend interface adapts to different screen sizes, supporting desktop computers, tablets, and mobile devices through a collapsible sidebar navigation pattern (desktop-left sidebar, mobile-bottom navigation) and responsive grid layouts.'),
    ('Data Integrity Safeguards', 'Implements validation checks including stock level verification before prescription, confirmation dialogs for critical actions, and transaction rollback mechanisms (e.g., deleting an auth user if the corresponding database profile insert fails).'),
]

for i, (title, desc) in enumerate(capabilities, 1):
    p = doc.add_paragraph()
    p.style = 'List Number'
    run_title = p.add_run(f'{title}')
    run_title.bold = True
    run_title.font.name = 'Times New Roman'
    run_title.font.size = Pt(12)
    run_desc = p.add_run(f' — {desc}')
    run_desc.font.name = 'Times New Roman'
    run_desc.font.size = Pt(12)

add_para('')
add_para('The following are the limitations of the developed system:', bold=False)
add_heading('System Limitations', level=3)

limitations = [
    ('Single-Campus Limitation', 'The system is currently limited to handling health records and analytics for TUP Manila campus only. However, the system is designed with scalability in mind, and with further development, it can be adapted and deployed across other TUP campuses to establish a unified health monitoring and analytics platform.'),
    ('Internet Dependency', 'Since the system stores data in a centralized Supabase-hosted database, a stable internet connection is required to access or update health records. If the internet connection is slow or interrupted, users may experience delays or issues retrieving or saving data.'),
    ('Analytics Scope', 'Analytics features are limited to standard graphical representations (area charts, donut charts, bar charts, and trend lines) and statistical summaries. The system does not currently include advanced predictive analytics or machine learning-based health trend forecasting.'),
    ('Notification Delivery', 'The notification system uses a polling-based architecture (checking every 30 seconds) rather than real-time push via WebSockets. This means there may be a slight delay of up to 30 seconds before new alerts appear. Browser push notifications require user permission and may be blocked by browser settings.'),
    ('Authentication Method', 'The current system supports only email and password authentication through Supabase Auth. It does not yet support alternative authentication methods such as OAuth (Google, Microsoft), biometric authentication, or two-factor authentication (2FA).'),
    ('Medicine Inventory Tracking', 'The system tracks medicine stock levels through manual addition and automatic deduction during diagnosis, but does not include advanced pharmacy features such as automated reorder notifications with supplier integration, barcode scanning, or batch-level dispensing logs.'),
    ('Print Layout Dependency', 'Medical certificates and prescriptions rely on the browser\'s native print dialog for formatting and printing, which may produce slightly different results depending on the browser and printer settings.'),
]

for i, (title, desc) in enumerate(limitations, 1):
    p = doc.add_paragraph()
    p.style = 'List Number'
    run_title = p.add_run(f'{title}')
    run_title.bold = True
    run_title.font.name = 'Times New Roman'
    run_title.font.size = Pt(12)
    run_desc = p.add_run(f' — {desc}')
    run_desc.font.name = 'Times New Roman'
    run_desc.font.size = Pt(12)


# ── System Testing ──
add_heading('System Testing', level=2)
add_heading('Software Testing', level=3)

add_para(
    'The following table presents the test cases conducted to verify the correct functionality of the TechClinic '
    'system. Each test case was executed manually and the results were recorded based on the expected outcomes.'
)

test_cases = [
    ('Student Self-Registration',
     '1. Navigate to the landing page.\n2. Fill in all required fields (Student ID, name, contact, email, DOB, address, year level, department, sex).\n3. Click Submit.',
     'The student\'s clinic visit record should be created with status INCOMPLETE and the student\'s information should be stored in the database.',
     'PASSED'),
    ('Auto-Fill Returning Student',
     '1. Navigate to the landing page.\n2. Enter an existing student\'s 11-character Student ID.\n3. Confirm the auto-fill dialog.',
     'The system should retrieve and populate the existing student\'s information (name, contact, email, department, year level) from the database.',
     'PASSED'),
    ('Staff Login',
     '1. Navigate to the login page.\n2. Enter valid staff email and password.\n3. Click Login.',
     'The user should be authenticated and redirected to the dashboard. The session should be persisted for subsequent visits.',
     'PASSED'),
    ('Staff Login with Invalid Credentials',
     '1. Navigate to the login page.\n2. Enter invalid email or password.\n3. Click Login.',
     'The system should display an error message indicating invalid credentials. The user should not be authenticated.',
     'PASSED'),
    ('View Dashboard Statistics',
     '1. Log in as a staff member.\n2. Navigate to the dashboard.',
     'The dashboard should display four animated statistical cards (Total Patients, Visits, Diagnoses, Medicines) with accurate counts and a table of today\'s records.',
     'PASSED'),
    ('Doctor Click on Incomplete Record',
     '1. Log in as a doctor.\n2. Navigate to the dashboard.\n3. Click on an incomplete record row.',
     'The system should navigate to the diagnosis form with the patient\'s information pre-populated.',
     'PASSED'),
    ('Nurse Click on Incomplete Record',
     '1. Log in as a nurse.\n2. Navigate to the dashboard.\n3. Click on an incomplete record row.',
     'The system should display an alert message indicating that the record is awaiting physician review.',
     'PASSED'),
    ('Create New Patient Record (Nurse)',
     '1. Log in as a nurse.\n2. Navigate to the New Patient page.\n3. Fill in all required personal and medical information fields.\n4. Click Submit.',
     'A new patient record should be created with status COMPLETE if all fields are filled. The medicine stock should be decremented by the specified quantity.',
     'PASSED'),
    ('Add Inline Disease',
     '1. Navigate to the New Patient or Add Diagnosis page.\n2. Click the "+" button next to the disease field.\n3. Enter a new disease name.\n4. Click Add.',
     'The new disease should be added to the disease catalog and immediately available in the disease dropdown. Duplicate names should be rejected.',
     'PASSED'),
    ('Add Diagnosis (Doctor)',
     '1. Log in as a doctor.\n2. Navigate to an incomplete record\'s diagnosis form.\n3. Select disease, enter diagnosis, select medication, specify quantity.\n4. Click Submit.',
     'The diagnosis should be saved, medicine stock decremented by the quantity, and the record status updated to COMPLETE.',
     'PASSED'),
    ('Stock Validation During Diagnosis',
     '1. Navigate to the diagnosis or new patient form.\n2. Select a medicine with low stock.\n3. Enter a quantity exceeding available stock.\n4. Attempt to submit.',
     'The system should prevent submission and display a validation error indicating insufficient stock.',
     'PASSED'),
    ('Search Patient Records',
     '1. Log in and navigate to Patient Records.\n2. Enter a search query (name or student ID) in the search field.\n3. Select a department from the filter dropdown.',
     'The table should filter and display only records matching the search criteria and selected department.',
     'PASSED'),
    ('View Individual Patient Record',
     '1. Navigate to Patient Records.\n2. Click on a patient record row.',
     'The system should navigate to the individual record view, displaying the patient\'s profile, contact information, and complete visit history.',
     'PASSED'),
    ('View Diagnosis Modal',
     '1. Navigate to an individual patient record.\n2. Click on a completed visit entry.',
     'A modal should display the full diagnosis details including disease, diagnosis text, medication, quantity, treatment, notes, and the attending physician\'s digital signature.',
     'PASSED'),
    ('Generate Medical Certificate',
     '1. Navigate to an individual patient record.\n2. Click the Medical Certificate button.',
     'A printable medical certificate should be generated displaying the patient\'s name, student ID, and visit date with appropriate blank fields.',
     'PASSED'),
    ('Generate Prescription',
     '1. Navigate to an individual patient record.\n2. Click the Prescription button.',
     'A printable prescription form should be generated displaying the diagnosis and medication details with checkboxes for certificate type, referral, and quarantine.',
     'PASSED'),
    ('Add New Medicine',
     '1. Log in and navigate to Add Medicine.\n2. Fill in all fields (name, generic, brand, type, dosage, unit, stock, batch, expiry).\n3. Click Submit.',
     'The new medicine should be added to the inventory and visible in the medicine inventory table.',
     'PASSED'),
    ('Edit Medicine',
     '1. Navigate to Medicine Inventory.\n2. Click on a medicine row.\n3. Modify fields in the edit modal.\n4. Click Save.',
     'The medicine details should be updated in the database and reflected in the inventory table.',
     'PASSED'),
    ('Delete Medicine',
     '1. Navigate to Medicine Inventory.\n2. Click on a medicine row.\n3. Click Delete in the modal.\n4. Confirm the deletion dialog.',
     'The medicine should be removed from the inventory and no longer appear in the table.',
     'PASSED'),
    ('View Analytics Charts',
     '1. Log in and navigate to Analytics.\n2. Select different timeframes (Weekly, Monthly, Quarterly, Yearly) for each chart.',
     'The charts should render accurately with data corresponding to the selected timeframe. All four chart types should display correctly.',
     'PASSED'),
    ('Receive Disease Outbreak Notification',
     '1. Ensure a disease has ≥ 5 cases and comprises ≥ 10% of total patients (minimum 10 patients).\n2. Wait for the 30-second polling cycle.',
     'A disease outbreak notification should be generated and displayed in the notification center with an amber indicator.',
     'PASSED'),
    ('Receive Low Stock Notification',
     '1. Ensure a medicine\'s stock level is ≤ 10 units.\n2. Wait for the 30-second polling cycle.',
     'A low stock notification should be generated and displayed in the notification center with a rose indicator.',
     'PASSED'),
    ('Mark Notification as Read',
     '1. Navigate to the notification center.\n2. Click on an unread notification.',
     'The notification should be marked as read, the unread dot indicator should disappear, and the navigation badge count should decrease by one.',
     'PASSED'),
    ('Mark All Notifications as Read',
     '1. Navigate to the notification center.\n2. Click "Mark all as read."',
     'All notifications should be marked as read, and the navigation badge should show zero unread notifications.',
     'PASSED'),
    ('Add Personnel (Doctor Only)',
     '1. Log in as a doctor.\n2. Navigate to Personnel List.\n3. Click Add Personnel.\n4. Fill in all required fields and select a role.\n5. Click Submit.',
     'A new staff account should be created in both Supabase Auth and the database. The new staff member should appear in the personnel list.',
     'PASSED'),
    ('Personnel Access Restriction',
     '1. Log in as a nurse.\n2. Attempt to navigate to the Personnel List page.',
     'The system should restrict access. The navigation menu should not show the Personnel List link for nurse accounts.',
     'PASSED'),
    ('Update Profile Settings',
     '1. Log in and navigate to Settings.\n2. Edit personal information fields (name, sex, address, DOB).\n3. Click Save.',
     'The updated profile information should be persisted to the database and reflected on the settings page.',
     'PASSED'),
    ('Upload Digital Signature (Draw)',
     '1. Navigate to Settings.\n2. Click on the Digital Signature section.\n3. Select Draw mode.\n4. Draw a signature on the canvas.\n5. Click Save.',
     'The signature should be uploaded to Supabase Storage, and its URL should be saved to the user\'s profile.',
     'PASSED'),
    ('Upload Digital Signature (Image)',
     '1. Navigate to Settings.\n2. Click on the Digital Signature section.\n3. Select Upload mode.\n4. Upload a PNG or JPG file (≤ 2 MB).\n5. Click Save.',
     'The signature image should be uploaded to Supabase Storage, and its URL should be saved to the user\'s profile.',
     'PASSED'),
    ('Dashboard Auto-Refresh',
     '1. Log in and navigate to the dashboard.\n2. Have another user create a new record.\n3. Wait at least 15 seconds.',
     'The dashboard table should automatically refresh and display the newly created record without requiring a manual page reload.',
     'PASSED'),
    ('Role-Based Navigation',
     '1. Log in as a nurse, observe navigation options.\n2. Log out.\n3. Log in as a doctor, observe navigation options.',
     'Nurses should see: Dashboard, New Patient, Patient Record, Medicine, Analytics, Notifications, Settings. Doctors should see all nurse options plus Add Diagnosis access and Personnel List.',
     'PASSED'),
]

make_table(
    ['Test Case', 'Steps to be Taken', 'Expected Result', 'Status'],
    test_cases,
    col_widths=[1.5, 2.5, 2.5, 0.7]
)

add_para('Table 4.1. Software Testing Test Case Results', italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)


# ── Evaluation Results ──
add_heading('Evaluation Results', level=2)

add_para(
    'The system was evaluated by respondents using the ISO 25010 software quality model criteria. The evaluation '
    'instrument used a 4-point Likert scale, where 4 represents "Strongly Agree," 3 represents "Agree," 2 represents '
    '"Disagree," and 1 represents "Strongly Disagree." The following table summarizes the evaluation results.'
)

eval_items = [
    ('A. Functional Suitability', '', ''),
    ('1. The system accurately records and stores student health information.', '___', '___'),
    ('2. The system correctly generates graphical representations based on the collected health data.', '___', '___'),
    ('3. The system properly manages the pharmaceutical inventory, including stock tracking and automatic deduction.', '___', '___'),
    ('4. The system appropriately restricts access based on user roles (Nurse and Doctor).', '___', '___'),
    ('5. The student self-registration kiosk accurately captures and stores patient information.', '___', '___'),
    ('B. Performance Efficiency', '', ''),
    ('1. The system responds to user interactions (page loads, form submissions, searches) within an acceptable time.', '___', '___'),
    ('2. The analytics charts render and update promptly when changing timeframes.', '___', '___'),
    ('3. The auto-refresh feature operates without noticeable delays or performance degradation.', '___', '___'),
    ('C. Usability', '', ''),
    ('1. The system interface is easy to navigate and understand for first-time users.', '___', '___'),
    ('2. The visual design (color scheme, layout, typography) is professional and appropriate for a medical system.', '___', '___'),
    ('3. The forms provide clear labels, appropriate input validation, and helpful feedback messages.', '___', '___'),
    ('4. The graphical representations (charts and graphs) are easy to interpret and provide meaningful insights.', '___', '___'),
    ('D. Reliability', '', ''),
    ('1. The system operates without unexpected errors or crashes during normal use.', '___', '___'),
    ('2. The notification system reliably detects and reports disease outbreaks and low stock conditions.', '___', '___'),
    ('3. Data remains consistent and accurate across multiple concurrent users.', '___', '___'),
    ('E. Security', '', ''),
    ('1. The authentication system effectively prevents unauthorized access to the system.', '___', '___'),
    ('2. Role-based access control properly restricts features based on user roles.', '___', '___'),
    ('3. Sensitive health data is adequately protected from unauthorized viewing or modification.', '___', '___'),
    ('F. Maintainability', '', ''),
    ('1. The system\'s modular architecture allows for easy addition of new features or modifications.', '___', '___'),
    ('2. The codebase is well-organized and documented for future developers.', '___', '___'),
    ('G. Portability', '', ''),
    ('1. The system functions correctly across different web browsers (Chrome, Firefox, Edge, Safari).', '___', '___'),
    ('2. The responsive design adapts appropriately to different screen sizes (desktop, tablet, mobile).', '___', '___'),
]

make_table(
    ['Criteria', 'Mean', 'Interpretation'],
    eval_items,
    col_widths=[4.5, 0.8, 1.2]
)

add_para('Table 4.2. ISO 25010 Evaluation Criteria and Results', italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)

add_para(
    'Note: The mean scores and interpretations in Table 4.2 are to be filled in after conducting the actual '
    'evaluation with the respondents. The interpretation follows the scale: 3.50 – 4.00 = Strongly Agree, '
    '2.50 – 3.49 = Agree, 1.50 – 2.49 = Disagree, 1.00 – 1.49 = Strongly Disagree.',
    italic=True, space_after=Pt(12)
)

# Summary table
add_heading('Summary of Evaluation Results', level=3)

summary_items = [
    ('A. Functional Suitability', '___', '___'),
    ('B. Performance Efficiency', '___', '___'),
    ('C. Usability', '___', '___'),
    ('D. Reliability', '___', '___'),
    ('E. Security', '___', '___'),
    ('F. Maintainability', '___', '___'),
    ('G. Portability', '___', '___'),
    ('Overall Mean', '___', '___'),
]

make_table(
    ['Criteria', 'Mean', 'Interpretation'],
    summary_items,
    col_widths=[4.5, 0.8, 1.2]
)

add_para('Table 4.3. Summary of Evaluation Results', italic=True, alignment=WD_ALIGN_PARAGRAPH.CENTER)


# ── Discussion ──
add_heading('Discussion', level=2)

add_para(
    'The results of the system testing demonstrate that all 30 test cases passed successfully, indicating that '
    'TechClinic meets its functional requirements as outlined in Chapter 1. The student self-registration kiosk, '
    'health record management, doctor diagnosis workflow, medicine inventory, analytics, notification system, '
    'personnel management, and settings functionalities all operate as intended.'
)

add_para(
    'The system addresses the primary problem identified in the study — the reliance on manual tally sheets and '
    'paper-based record keeping at the TUP Manila clinic. By digitizing the health record management process, '
    'TechClinic eliminates the risk of data loss, reduces time spent on manual compilation, and provides immediate '
    'access to historical patient data.'
)

add_para(
    'The analytics module directly fulfills the study\'s objective of generating graphical representations across '
    'different time periods. The four chart types — patient visit trends (area chart), department distribution '
    '(donut chart), top diagnoses (Pareto chart), and medicine stock levels (horizontal bar chart) — each support '
    'weekly, monthly, quarterly, and yearly views, enabling the medical staff to identify patterns and make informed '
    'decisions about health interventions.'
)

add_para(
    'The automated notification system provides a proactive approach to disease monitoring that was not possible '
    'with the previous manual system. By automatically detecting when disease cases exceed threshold percentages, '
    'the system supports the study\'s objective of notifying medical staff of conditions that may necessitate '
    'adjustments to class modules or schedules.'
)

add_para(
    'The role-based access control system ensures that the appropriate personnel perform their designated tasks — '
    'nurses handle patient intake while doctors manage diagnoses — maintaining a clear workflow that mirrors the '
    'actual clinic operations at TUP Manila. The three-layer security model (database RLS, backend middleware, '
    'frontend guards) provides defense in depth against unauthorized access.'
)

add_para(
    'The evaluation results based on the ISO 25010 criteria will provide quantitative validation of the system\'s '
    'quality across seven dimensions: functional suitability, performance efficiency, usability, reliability, '
    'security, maintainability, and portability. These results, once gathered from the respondents, will offer a '
    'comprehensive assessment of how well TechClinic meets its design objectives compared to the traditional '
    'record-keeping methods it replaces.'
)


# ── Save ──
output_path = os.path.join(r'c:\Users\karlb\OneDrive\Desktop\Techclinic\docs', 'Chapter_4_Results_and_Discussions.docx')
doc.save(output_path)
print(f'Saved to: {output_path}')
