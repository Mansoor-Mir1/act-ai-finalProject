# 🐍 AI Python Learning Platform

**AI Python Learning Platform** is a complete AI-powered educational web application designed to help beginners learn Python programming through a structured, interactive, and guided learning environment.

Instead of requiring learners to use separate websites for lessons, coding practice, quizzes, AI assistance, progress tracking, and learning resources, the platform brings these features together into one application.

The project includes a student learning portal, an integrated AI Python tutor called **PyCoach AI**, an in-browser Python coding environment, progress tracking, quizzes, practice problems, authentication, and a protected administration system.

---

## 🌐 Live Application

The application is publicly deployed on Vercel.

**Live Demo:**  
https://act-ai-final-project-nine.vercel.app

---

## 🎯 Problem the Project Solves

Beginner Python learners often have to switch between multiple platforms to learn effectively.

A student may use one website for Python notes, another for coding practice, another for quizzes, an AI chatbot for explanations, and other websites for learning resources. This can make the learning process fragmented and confusing, especially for beginners.

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

Lessons can display their current learning status:

- Not Started
- In Progress
- Completed

### 📖 Interactive Lessons

Lessons provide educational content including:

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
- Run Python inside the application
- View console output
- Reset code
- Copy code
- View test results

Python execution is supported in the browser using **Pyodide/WebAssembly**.

### 🎯 Practice Problems

Students can access practice problems connected to their Python lessons, allowing them to apply concepts instead of only reading theory.

### 📝 AI Quiz

The platform includes quiz functionality for testing students' understanding of Python concepts.

### 📊 Progress Tracking

Students can:

- See their overall progress
- View completed lessons
- Identify lessons in progress
- Identify lessons not yet started
- Manually mark lessons as complete
- Continue learning from their current position

### ▶️ Continue Learning

The **Continue** functionality allows students to quickly return to their learning path and continue their Python studies.

### 🌐 Learning Resources

Students can access curated learning resources added and managed through the administration system.

---

# 🤖 PyCoach AI — AI-Powered Python Tutor

One of the core features of the project is **PyCoach AI**, an integrated AI Python programming tutor powered by **Google Gemini**.

PyCoach AI is available directly inside the student learning workspace, allowing students to receive programming assistance without leaving the platform.

## What PyCoach AI Does

PyCoach AI can assist students with:

- Explaining Python concepts
- Providing step-by-step learning assistance
- Giving hints
- Providing relevant code examples
- Helping with practice problems
- Supporting quizzes
- Debugging Python code
- Reviewing student code
- Explaining programming errors
- Helping students understand programming logic

The purpose of PyCoach AI is not simply to provide answers, but to support students while they learn Python.

---

## 🧠 AI Instructions / System Prompt

PyCoach AI is guided by custom instructions designed specifically for Python education.

The AI follows the following educational behaviour:

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

The Gemini API is integrated into the application while sensitive Gemini credentials are stored using environment variables rather than being committed to the public repository.

---

# 🛡️ Admin Dashboard

The application includes a separate protected administration system.

The permanent administrator can access an administration dashboard for monitoring and managing learning content.

## 📊 System Overview

The administrator can view platform information including:

- Total students
- Total lessons
- Total learning resources
- Firestore/database status

## 🌐 Resource Management

The administrator can manage learning resources.

Available functionality includes:

- Add resources
- Edit resources
- Delete resources
- Search resources
- Filter resources
- Manage resource titles
- Manage descriptions
- Manage external learning links

## 📚 Curriculum Management

The administrator can manage the Python curriculum.

Available functionality includes:

- Add lessons
- Edit lessons
- Delete lessons
- Search lessons
- Filter lessons
- Publish lessons
- Manage draft/unpublished lessons
- Organise lessons by module
- Manage lesson difficulty and ordering

## 🔒 Admin Privacy Restrictions

The administrator role is separated from private student learning activity.

The admin system does not provide access to private student functionality such as:

- Student AI conversations
- Private student notes
- Direct modification of individual student progress

This separation allows the administrator to manage platform content while maintaining separation between administrative and student functionality.

---

# 🔐 Authentication and Role-Based Access

The application uses **Firebase Authentication** for user authentication.

The system separates users into:

- Students
- Permanent Administrator

Students are directed to the student learning environment, while administrator functionality is protected through role-based access.

Authentication sessions persist in the browser until the user signs out or the session is otherwise cleared.

---

# ☁️ Database

The application uses **Cloud Firestore** for cloud-based application data.

Firestore supports application functionality such as:

- User information
- Learning progress
- Lesson completion
- Curriculum content
- Learning resources

Firestore Security Rules are used to control access to application data.

---

# 🛠️ Technologies, Tools and Services

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Markdown rendering
- Syntax highlighting

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
- Custom PyCoach AI instructions

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
     ┌──────────┼──────────┐       ┌────────┴────────┐
     │          │          │       │                 │
  Lessons   Code Editor  Progress Resources      Curriculum
     │          │          │     Management      Management
     │          │          │
     ▼          ▼          ▼
 PyCoach AI   Pyodide   Firestore
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

![Account Sign In](Screenshot%202026-07-27%20212415.png)

---

## 2. Student Learning Workspace

The main learning workspace combines the curriculum roadmap, Python lesson content, interactive code editor, progress tracking, practice functionality, and PyCoach AI.

![Student Learning Workspace](Screenshot%202026-07-27%20212350.png)

---

## 3. Admin Dashboard

The administrator dashboard provides system information together with resource and curriculum management functionality.

![Admin Dashboard](Screenshot%202026-07-27%20213024.png)

---

# 🔄 Student Learning Workflow

A typical student uses the application through the following workflow:

```text
Register / Sign In
        ↓
Student Learning Portal
        ↓
Select Python Lesson
        ↓
Read Theory & Code Examples
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

This creates a structured learning cycle instead of requiring students to use several disconnected learning platforms.

---

# 📂 Project Structure

```text
act-ai-final-project/
│
├── src/                         # Main application source code
├── .env.example                 # Environment variable template
├── .gitignore                   # Files excluded from Git
├── firebase-applet-config.json  # Firebase web configuration
├── firebase-blueprint.json      # Firebase configuration
├── firestore.rules              # Firestore Security Rules
├── index.html                   # Application HTML entry point
├── metadata.json                # Application metadata
├── package.json                 # Dependencies and scripts
├── server.ts                    # Server/API functionality
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration
└── README.md                    # Project documentation
```

---

# 🚀 How to Run the Project Locally

## Prerequisites

Before running the project, make sure you have:

- Node.js
- npm
- Git
- A Firebase project
- A Gemini API key

---

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

---

## 2. Open the Project Directory

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

Use the included `.env.example` file as a template.

Create your local environment file and provide the required values:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="YOUR_APP_URL"
ADMIN_SECURITY_KEY="YOUR_ADMIN_SECURITY_KEY"
```

Never commit real API keys, passwords, or security credentials to the public repository.

The project's `.gitignore` excludes local `.env` files while allowing `.env.example` to remain available as a configuration template.

---

## 5. Configure Firebase

A Firebase project is required for authentication and database functionality.

Make sure:

- Firebase Authentication is configured
- Email/Password authentication is enabled
- Cloud Firestore is configured
- Appropriate Firestore Security Rules are deployed

---

## 6. Start the Development Server

Run:

```bash
npm run dev
```

Then open the local address displayed by the development server in your browser.

---

# 🔒 Security

The application uses several security measures:

- Firebase Authentication
- Role-based student/admin access
- Protected application routes
- Firestore Security Rules
- Environment variables for sensitive server-side credentials
- `.gitignore` protection for environment files
- Server-side verification for sensitive administrator functionality

Real Gemini API credentials and other sensitive environment variables are not intended to be committed to the repository.

## Firebase Web Configuration

The repository contains Firebase web configuration required by the frontend application.

Firebase web configuration identifies the Firebase project and allows the frontend to communicate with Firebase services. Access to protected application data is controlled through authentication and Firestore Security Rules.

---

# 💡 Original Project Idea

This project addresses a problem commonly faced by beginner programmers: learning resources are often spread across multiple platforms.

A learner may need:

- A tutorial website for theory
- An online IDE for coding
- A separate quiz website
- An AI assistant for questions
- Different websites for learning resources
- Another method for tracking progress

The idea behind AI Python Learning Platform was to bring these activities together into one structured learning environment.

The core learning workflow is:

**Learn → Code → Practise → Ask AI → Test → Track Progress**

---

# 🎯 Project Objectives

The main objectives of this project were to:

- Solve a real learning problem for beginner programmers
- Create a structured Python learning environment
- Build a complete working application from authentication to deployment
- Integrate AI into the learning workflow
- Allow students to practise Python directly inside the application
- Provide AI-powered assistance through PyCoach AI
- Track student learning progress
- Implement separate student and administrator functionality
- Provide curriculum and resource management
- Store application data using a cloud database
- Deploy the finished application publicly

---


# 👨‍💻 Project Information

**Project Name:** AI Python Learning Platform  
**AI Tutor:** PyCoach AI  
**Project Type:** AI-Powered Educational Web Application  
**Primary Programming Language Taught:** Python  
**Deployment Platform:** Vercel  
**Source Code:** GitHub  
**Development:** Individual Final Project

---

# 🔗 Important Links

## 🌐 Live Application

https://act-ai-final-project-nine.vercel.app

## 💻 Public GitHub Repository

[YOUR_GITHUB_REPOSITORY_URL](https://github.com/Mansoor-Mir1/act-ai-finalProject/tree/main)

---

## 📄 Final Project

AI Python Learning Platform was designed, built, tested, and deployed as an individual final project with the goal of creating a complete AI-powered solution to a real learning problem.
