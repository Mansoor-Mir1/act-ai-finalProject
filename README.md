# 🐍 AI Python Learning Platform

**AI Python Learning Platform** is a complete AI-powered educational web application designed to help students and beginners learn Python programming through a structured, interactive, and guided learning environment.

Instead of requiring learners to use separate websites for lessons, coding practice, quizzes, AI assistance, progress tracking, and learning resources, the platform brings these features together into one application.

The project includes a complete student learning portal, an integrated AI Python tutor called **PyCoach AI**, an in-browser Python coding environment, progress tracking, quizzes, practice problems, authentication, and a protected administration system.

---

## 🌐 Live Application

The application is publicly deployed on Vercel.

**Live Demo:**  
https://act-ai-final-project-nine.vercel.app

---

## 🎯 Problem the Project Solves

Beginner Python learners often have to switch between multiple platforms to learn effectively.

For example, a student may use one website for Python notes, another for coding practice, another for quizzes, an AI chatbot for explanations, and another source for learning resources.

This makes the learning process fragmented and can be confusing for students who are just beginning programming.

**AI Python Learning Platform solves this problem by providing a single structured environment where students can:**

- Follow a structured Python curriculum
- Read programming lessons
- Write and execute Python code
- Solve practice problems
- Take quizzes
- Ask an AI Python tutor for help
- Track lesson completion and overall progress
- Access curated programming resources

The goal is to make learning Python more structured, interactive, and accessible for beginners.

---

## 👥 Target Users

The platform is primarily designed for:

- Beginners learning Python programming
- Students starting their programming journey
- Learners who need a structured Python roadmap
- Students who want hands-on coding practice
- Learners who want AI assistance while studying
- Students who want to track their learning progress in one place

---

# ✨ Features

## 👨‍🎓 Student Features

### 🔐 Authentication

- Student account registration
- Secure email/password login
- Logout functionality
- Persistent authentication
- Protected student routes
- Separate student and administrator roles

### 🗺️ Structured Python Curriculum

Students can follow a structured Python learning roadmap containing lessons organised by topic and difficulty.

The curriculum covers learning stages from beginner concepts toward more advanced Python topics.

Each lesson can display its current status, including:

- Not Started
- In Progress
- Completed

### 📖 Interactive Lessons

Each lesson provides structured educational content including:

- Python theory
- Programming explanations
- Syntax and concepts
- Code examples
- Lesson difficulty
- Estimated learning time

Students can move through the curriculum lesson by lesson.

### 💻 Built-in Python Code Editor

The platform contains an interactive Python coding environment.

Students can:

- Write Python code
- Edit example code
- Run Python directly inside the application
- View console output
- Reset code
- Copy code
- View test results

Python execution is supported in the browser using **Pyodide/WebAssembly**.

### 🎯 Practice Problems

Students can access practice problems connected to their Python learning.

These activities allow learners to apply concepts rather than only reading theory.

### 📝 AI Quiz

The platform includes quiz functionality to test student understanding of Python concepts.

Students can use quizzes as part of the learning process to check whether they understand the current topic.

### 📊 Progress Tracking

The application tracks student learning progress.

Students can:

- See their overall progress percentage
- View completed lessons
- Identify lessons that are in progress
- Identify lessons that have not been started
- Manually mark lessons as complete
- Continue learning from their current position

### ▶️ Continue Learning

The **Continue** feature helps students quickly return to the appropriate lesson instead of manually searching through the curriculum.

### 🔖 Lesson Interaction

The learning interface also provides lesson-level controls designed to make navigation and studying easier.

---

# 🤖 PyCoach AI — AI-Powered Python Tutor

A major feature of the project is **PyCoach AI**, an integrated AI Python programming tutor.

PyCoach AI is available directly inside the student learning workspace so students do not have to leave the platform when they need help.

The AI functionality is powered by **Google Gemini**.

## What PyCoach AI Can Do

PyCoach AI can assist students with:

- Explaining Python concepts
- Providing step-by-step learning assistance
- Giving hints for exercises
- Providing relevant code examples
- Helping with practice problems
- Supporting AI-generated quizzes
- Debugging Python code
- Reviewing student code
- Explaining programming errors
- Helping students understand programming logic

The goal of PyCoach AI is not simply to provide answers, but to act as an educational assistant while the student learns Python.

---

## 🧠 AI Instructions / System Behaviour

PyCoach AI is instructed to behave as a Python-focused educational assistant.

Its instruction design follows these principles:

> You are PyCoach, an AI Python programming tutor integrated into a Python learning platform. Your purpose is to help students learn and understand Python programming clearly and accurately.
>
> Explain Python concepts using clear, beginner-friendly language and provide step-by-step guidance when appropriate.
>
> Help students understand the reasoning behind code instead of only giving final answers.
>
> When students encounter errors, help them identify, understand, and debug the problem.
>
> Provide useful hints, examples, practice assistance, and explanations that support the student's current Python learning context.
>
> Keep responses focused on Python programming and educational learning. Responses should be clear, helpful, concise, and appropriate for beginner programmers.

The Gemini API is accessed through the application's AI integration. Sensitive Gemini credentials are configured through environment variables rather than being committed directly to the public repository.

---

# 🛡️ Admin Dashboard

The application contains a separate protected administration system.

A permanent administrator can access an admin dashboard containing system information and content-management functionality.

## 📊 System Overview

The administrator can view platform information including:

- Total students
- Total lessons
- Total learning resources
- Firestore/database status

## 🌐 Resource Management

The administrator can manage programming learning resources.

Available functionality includes:

- Add resources
- Edit resources
- Delete resources
- Search resources
- Filter resources by topic
- Manage resource titles
- Manage resource descriptions
- Manage external learning links

These curated resources are then available to students through the learning platform.

## 📚 Curriculum Management

The administrator can manage the Python curriculum.

Available curriculum-management functionality includes:

- Add lessons
- Edit lessons
- Delete lessons
- Search lessons
- Filter lessons
- Publish lessons
- Unpublish/manage draft lessons
- Organise lessons by module
- Manage lesson difficulty and ordering

## 🔒 Admin Privacy Restrictions

The administrator role is intentionally separated from private student learning activity.

The admin interface restricts access to private student functionality such as:

- Student AI conversations
- Private student notes
- Direct modification of student progress
- Student account mutation through the learning dashboard

This separation helps maintain student privacy while allowing the administrator to manage platform content.

---

# 🔐 Authentication and Role-Based Access

The application uses **Firebase Authentication** for user authentication.

The system separates users into:

- Students
- Permanent Administrator

Students are directed to the student learning environment, while administrator functionality is protected by role-based access.

Authentication sessions can persist in the browser until the user signs out.

---

# ☁️ Database

The application uses **Cloud Firestore** for cloud-based application data.

Firestore is used to support application functionality such as student information, learning progress, content, and resources.

Firestore Security Rules are included in the project to control database access.

---

# 🛠️ Technologies, Tools and Services

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Markdown rendering
- Syntax-highlighted programming content

## Python Execution

- Pyodide
- WebAssembly

## Backend

- Node.js
- Express
- REST API functionality

## Authentication & Database

- Firebase Authentication
- Cloud Firestore
- Firebase Security Rules

## Artificial Intelligence

- Google Gemini
- Gemini API
- Custom AI instructions for PyCoach AI

## Development Tools

- Google AI Studio
- Visual Studio Code
- Git
- GitHub

## Deployment

- Vercel

---

# 🏗️ Application Architecture

```text
                       AI Python Learning Platform
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                 Student                     Admin
                    │                           │
                    ▼                           ▼
             Student Portal              Admin Dashboard
                    │                           │
       ┌────────────┼────────────┐      ┌───────┴────────┐
       │            │            │      │                │
    Lessons      Code Editor   Progress Resources     Curriculum
       │            │            │      Management    Management
       │            │            │
       ▼            ▼            ▼
   PyCoach AI    Pyodide      Firestore
       │
       ▼
   Gemini API

Authentication
     │
     ▼
Firebase Authentication
```

---

# 📸 Screenshots

The following screenshots demonstrate the major parts of the application.

## 1. Account Sign In

The authentication interface allows registered users to securely access the platform.

![Account Sign In](screenshots/login.png)

---

## 2. Student Learning Workspace

The main learning workspace combines the curriculum roadmap, Python lesson content, interactive code editor, progress tracking, practice functionality, and PyCoach AI.

![Student Learning Workspace](screenshots/student-workspace.png)

---

## 3. Admin Dashboard

The administrator dashboard provides system information together with resource and curriculum management functionality.

![Admin Dashboard](screenshots/admin-dashboard.png)

---



---

# 🔄 Student Learning Workflow

A typical student uses the application through the following process:

```text
Register / Sign In
        ↓
Student Learning Portal
        ↓
Select a Python Lesson
        ↓
Read Theory & Examples
        ↓
Write and Run Python Code
        ↓
Use PyCoach AI When Help Is Needed
        ↓
Solve Practice Problems
        ↓
Take Quiz
        ↓
Mark Lesson as Complete
        ↓
Progress Updates
        ↓
Continue to Next Lesson
```

This creates a structured learning cycle instead of requiring the student to use several disconnected learning platforms.

---

# 📂 Project Structure

```text
act-ai-final-project/
│
├── src/                         # Main application source code
├── screenshots/                 # README application screenshots
├── .env.example                 # Environment variable template
├── .gitignore                   # Files excluded from Git
├── firebase-applet-config.json  # Firebase web configuration
├── firebase-blueprint.json      # Firebase configuration
├── firestore.rules              # Firestore Security Rules
├── index.html                   # Application HTML entry point
├── metadata.json                # Application metadata
├── package.json                 # Dependencies and npm scripts
├── server.ts                    # Server/API functionality
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration
└── README.md                    # Complete project documentation
```

---

# 🚀 How to Run the Project Locally

## Prerequisites

Make sure the following are installed or available:

- Node.js
- npm
- Git
- Firebase project
- Gemini API key

---

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

---

## 2. Enter the Project Directory

```bash
cd act-ai-final-project
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Configure Environment Variables

Use the provided `.env.example` file as a template.

Create your local environment configuration and provide the required values.

Example:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="YOUR_APP_URL"
ADMIN_SECURITY_KEY="YOUR_ADMIN_SECURITY_KEY"
```

**Never commit real API keys, passwords, or security keys to the public repository.**

The `.gitignore` file excludes local `.env` files while allowing `.env.example` to remain available as a configuration template.

---

## 5. Configure Firebase

A Firebase project is required for authentication and database functionality.

Ensure that:

- Firebase Authentication is configured
- Email/Password authentication is enabled
- Cloud Firestore is available
- Firestore Security Rules are configured appropriately

---

## 6. Start the Development Server

```bash
npm run dev
```

Open the local address displayed by the development server in your browser.

---

# 🔒 Security

Security was considered during the development and deployment of the application.

The project uses:

- Firebase Authentication
- Role-based access control
- Protected student/admin routes
- Firestore Security Rules
- Server-side handling for sensitive AI functionality
- Environment variables for sensitive credentials
- `.gitignore` protection for local environment files

Real Gemini API credentials and other sensitive environment variables should never be committed to the repository.

### Firebase Web Configuration

The repository contains Firebase web configuration required by the frontend application. Firebase web API configuration identifies the Firebase project, while access to protected application data is controlled through authentication, API restrictions, and Firestore Security Rules.

---

# 🎯 Project Objectives

The main objectives of this project were to:

- Solve a real learning problem faced by beginner programmers
- Create a structured Python learning environment
- Build a complete working application from authentication to deployment
- Integrate AI into the actual learning workflow
- Allow students to practise Python directly inside the application
- Provide AI-powered assistance through PyCoach AI
- Track student learning progress
- Implement separate student and administrator functionality
- Provide curriculum and learning-resource management
- Store application data using a cloud database
- Deploy the finished application publicly

---

# 💡 Original Project Idea

This project was created to address a problem I observed while learning and working with programming resources: learners frequently need to switch between tutorials, coding environments, AI assistants, quizzes, and resource websites.

Rather than creating another static Python tutorial website, the idea was to combine these learning activities into a single guided platform.

The resulting application combines:

**Learn → Code → Practise → Ask AI → Test → Track Progress**

into one learning workflow.

---

# 🔮 Future Improvements

The current version focuses specifically on Python learning.

Possible future improvements include:

- Additional programming languages
- More Python lessons
- More practice challenges
- Advanced progress analytics
- Additional AI tutoring capabilities
- Expanded administrator content tools
- More curated learning resources
- Additional student personalisation

These are future possibilities and are not claimed as functionality of the current version.

---

# 👨‍💻 Project Information

**Project Name:** AI Python Learning Platform  
**AI Tutor:** PyCoach AI  
**Project Type:** AI-Powered Educational Web Application  
**Primary Language Taught:** Python  
**Deployment:** Vercel  
**Repository:** GitHub  
**Project Type:** Individual Final Project

---

# 🔗 Important Links

### 🌐 Live Application

https://act-ai-final-project-nine.vercel.app

### 💻 Public GitHub Repository

YOUR_GITHUB_REPOSITORY_URL

---

## 📄 Final Project

This application was designed, built, tested, and deployed as an individual final project with the goal of creating a complete AI-powered solution to a real learning problem.
