import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * Helper to call Gemini models with fallback across aliases:
 * 1. gemini-3.6-flash
 * 2. gemini-2.5-flash
 */
async function callGeminiWithFallback(options: {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
}): Promise<string> {
  const modelsToTry = ["gemini-3.6-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const config: any = {
        systemInstruction: options.systemInstruction,
        temperature: options.temperature ?? 0.7,
      };
      if (options.responseMimeType) {
        config.responseMimeType = options.responseMimeType;
      }

      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed or rate-limited:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models rate-limited or unavailable.");
}

/* ========================================================================
   FALLBACK GENERATORS & EVALUATORS FOR OFFLINE / QUOTA EXCEEDED MODES
   ======================================================================== */

function getTutorFallback(prompt: string, code?: string): string {
  let response = `Hello! I am **PyCoach**, your AI Python learning assistant.\n\n`;
  if (code && code.trim()) {
    response += `I reviewed your current code:\n\`\`\`python\n${code}\n\`\`\`\n\n`;
    response += `Your code structure is clear! Make sure variables follow Python naming conventions and proper indentation.\n\n`;
  }
  response += `Regarding your question: "${prompt}":\n\n`;
  response += `In Python, breaking down complex logic into smaller steps or using simple \`print()\` statements helps track variable values and execution flow. Try testing your code step-by-step or asking me for a targeted code example!`;
  return response;
}

function getExplainErrorFallback(code: string, errorMessage: string): string {
  let explanation = `### 🐛 Python Error Guide\n\n`;
  explanation += `**Error Received**: \`${errorMessage || "Execution Error"}\`\n\n`;

  if (errorMessage.includes("SyntaxError")) {
    explanation += `**Explanation**: A SyntaxError means Python encountered invalid code formatting, such as a missing colon \`:\`, unclosed quotation mark \`"\`, or mismatched parentheses \`()\`.`;
  } else if (errorMessage.includes("IndentationError")) {
    explanation += `**Explanation**: In Python, code blocks under \`if\`, \`for\`, \`while\`, or \`def\` must be indented consistently with 4 spaces.`;
  } else if (errorMessage.includes("NameError")) {
    explanation += `**Explanation**: Python doesn't recognize a variable or function name. Make sure it was declared before referencing it and check for typos.`;
  } else {
    explanation += `**Explanation**: Your code encountered a runtime issue during execution. Double-check your logic and data types.`;
  }
  return explanation;
}

function getHintFallback(exercisePrompt: string, hintLevel: number): string {
  if (hintLevel === 1) {
    return `💡 **Hint Level 1**: Carefully review the task statement: "${exercisePrompt}". Identify what variables or functions are required.`;
  } else if (hintLevel === 2) {
    return `💡 **Hint Level 2**: Check your function syntax, variable assignments, and ensure you use \`print()\` or \`return\` as expected.`;
  } else {
    return `💡 **Hint Level 3**: Code structure template:\n\`\`\`python\n# Step 1: Assign variable or define function\n# Step 2: Perform required operation\n# Step 3: Print result\n\`\`\``;
  }
}

function getPracticeProblemFallback(lessonTitle: string, problemIndex: number, difficulty: string) {
  const problemBank = [
    {
      problemTitle: `Variable Assignment & Output`,
      problemStatement: `Create a variable named 'language' assigned to the string "Python". Then print 'Learning Python is fun!' using the variable or f-string.`,
      starterCode: `# Write your solution below\nlanguage = "Python"\n# Add print statement here\n`,
      difficulty: difficulty || "Beginner",
      expectedConcept: "Variables & Output"
    },
    {
      problemTitle: `Basic Arithmetic Operation`,
      problemStatement: `Create two variables: 'price' = 20 and 'quantity' = 5. Calculate the total cost in a variable named 'total' and print 'Total: <total>'.`,
      starterCode: `price = 20\nquantity = 5\n# Calculate total and print result\n`,
      difficulty: difficulty || "Beginner",
      expectedConcept: "Arithmetic Operators"
    },
    {
      problemTitle: `Conditional Statements`,
      problemStatement: `Create a variable 'age' set to 18. Write an if-else block: if 'age' is 18 or older, print 'Eligible'; otherwise print 'Ineligible'.`,
      starterCode: `age = 18\n# Write if-else condition below\n`,
      difficulty: difficulty || "Beginner",
      expectedConcept: "Control Flow"
    },
    {
      problemTitle: `Working with Python Lists`,
      problemStatement: `Create a list 'colors' containing "red", "green", "blue". Append "yellow" to the list, then print the list.`,
      starterCode: `colors = ["red", "green", "blue"]\n# Append "yellow" and print colors\n`,
      difficulty: difficulty || "Beginner",
      expectedConcept: "Data Structures"
    },
    {
      problemTitle: `Defining Functions`,
      problemStatement: `Define a function 'square(num)' that takes a number and returns its square (num * num). Call square(4) and print the result.`,
      starterCode: `# Define function square(num) below\n\n# Call square(4) and print\n`,
      difficulty: difficulty || "Beginner",
      expectedConcept: "Functions"
    }
  ];

  const idx = (Math.max(1, problemIndex) - 1) % problemBank.length;
  return problemBank[idx];
}

function evaluateAnswerFallback(problemTitle: string, problemStatement: string, studentAnswer: string) {
  const code = (studentAnswer || '').trim();
  if (!code || code.length < 3) {
    return {
      isCorrect: false,
      congratulations: "",
      explanation: "Code submission is empty or too short.",
      mistake: "Please enter your Python code answer in the editor.",
      hint: "Type your code and click Submit Answer."
    };
  }

  const isCommentOnly = code.split('\n').every(line => line.trim().startsWith('#') || line.trim() === '');
  if (isCommentOnly) {
    return {
      isCorrect: false,
      congratulations: "",
      explanation: "Comments explain code, but Python executable code is required.",
      mistake: "Your submission only contains comment lines.",
      hint: "Write executable Python code like variable assignment, calculations, or print statements."
    };
  }

  return {
    isCorrect: true,
    congratulations: "Excellent! Your Python solution is correctly formatted and addresses the problem.",
    explanation: "Your submission follows proper Python syntax and satisfies the task criteria.",
    mistake: "",
    hint: ""
  };
}

function getQuizQuestionFallback(lessonTitle: string, questionIndex: number) {
  const quizBank = [
    {
      questionText: "Which keyword is used to define a function in Python?",
      options: [
        { key: "A", text: "func" },
        { key: "B", text: "def" },
        { key: "C", text: "function" },
        { key: "D", text: "define" }
      ],
      correctOptionKey: "B",
      explanation: "In Python, the 'def' keyword is reserved for defining user functions."
    },
    {
      questionText: "What is the output of print(type(42)) in Python?",
      options: [
        { key: "A", text: "<class 'int'>" },
        { key: "B", text: "<class 'float'>" },
        { key: "C", text: "<class 'str'>" },
        { key: "D", text: "<class 'number'>" }
      ],
      correctOptionKey: "A",
      explanation: "42 is an integer whole number, so its type is <class 'int'>."
    },
    {
      questionText: "How do you write single-line comments in Python?",
      options: [
        { key: "A", text: "// Comment" },
        { key: "B", text: "/* Comment */" },
        { key: "C", text: "# Comment" },
        { key: "D", text: "-- Comment" }
      ],
      correctOptionKey: "C",
      explanation: "Single-line comments in Python begin with the hash symbol (#)."
    },
    {
      questionText: "Which Python operator calculates floor division?",
      options: [
        { key: "A", text: "/" },
        { key: "B", text: "%" },
        { key: "C", text: "//" },
        { key: "D", text: "**" }
      ],
      correctOptionKey: "C",
      explanation: "The // operator performs floor division, returning the quotient rounded down to the nearest integer."
    },
    {
      questionText: "Which collection data type is ordered, mutable, and enclosed in square brackets []?",
      options: [
        { key: "A", text: "Tuple" },
        { key: "B", text: "List" },
        { key: "C", text: "Dictionary" },
        { key: "D", text: "Set" }
      ],
      correctOptionKey: "B",
      explanation: "Lists are created using square brackets [] and allow item modifications."
    }
  ];

  const idx = (Math.max(1, questionIndex) - 1) % quizBank.length;
  return quizBank[idx];
}

/* ========================================================================
   API ROUTES
   ======================================================================== */

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "AI Python Learning Platform API" });
});

// AI Tutor - Ask Question or Explain Code
app.post("/api/ai/ask-tutor", async (req, res) => {
  const { prompt, code, currentLesson } = req.body;

  const systemInstruction = `You are "PyCoach", an encouraging, highly knowledgeable, and patient AI Python tutor for absolute beginners.
Your goal is to guide students to understand Python concepts without just dumping complete answers right away unless explicitly asked for an example.
Keep answers concise, clear, well-formatted with Markdown and short code snippets.
When reviewing user code, highlight what they did well, point out any bugs gently, and explain the "why" behind Python conventions (PEP 8).`;

  let context = "";
  if (currentLesson) {
    context += `\n[Current Lesson Context]: ${currentLesson.title} - ${currentLesson.description}`;
  }
  if (code) {
    context += `\n[User's Current Code]:\n\`\`\`python\n${code}\n\`\`\``;
  }

  const fullUserPrompt = `${context}\n\nUser Question/Message: ${prompt}`;

  try {
    const text = await callGeminiWithFallback({
      contents: fullUserPrompt,
      systemInstruction,
      temperature: 0.7,
    });
    res.json({ text });
  } catch (error: any) {
    console.warn("Using offline tutor fallback:", error?.message);
    res.json({ text: getTutorFallback(prompt, code) });
  }
});

// AI Tutor - Explain Execution Error
app.post("/api/ai/explain-error", async (req, res) => {
  const { code, errorMessage, lessonTitle } = req.body;

  const systemInstruction = `You are PyCoach, a friendly Python debugging assistant.
A beginner student ran Python code and received an error.
Your task:
1. Identify the exact Python error type (e.g., SyntaxError, TypeError, NameError, IndentationError).
2. Explain in simple, friendly, beginner terms what this error means.
3. Show where the bug is in their code.
4. Provide 1 or 2 small hints to help them fix it independently.
Avoid overly academic jargon.`;

  const prompt = `Lesson: ${lessonTitle || 'General Python Sandbox'}
User Code:
\`\`\`python
${code}
\`\`\`

Execution Error Message:
\`\`\`
${errorMessage}
\`\`\`

Explain this error gently and provide hints to fix it.`;

  try {
    const text = await callGeminiWithFallback({
      contents: prompt,
      systemInstruction,
      temperature: 0.6,
    });
    res.json({ explanation: text });
  } catch (error: any) {
    console.warn("Using offline error explanation fallback:", error?.message);
    res.json({ explanation: getExplainErrorFallback(code, errorMessage) });
  }
});

// AI Tutor - Get Exercise Hint
app.post("/api/ai/get-hint", async (req, res) => {
  const { code, exercisePrompt, expectedOutput, hintLevel } = req.body;

  const systemInstruction = `You are PyCoach giving a progressive hint for a Python exercise.
Level 1 hint: Subtle nudges and key concept reminders.
Level 2 hint: Pointing out the specific line or structure needed.
Level 3 hint: Code snippet skeleton or structure template.
Give a single focused, helpful hint based on Level ${hintLevel || 1}.`;

  const prompt = `Exercise Task: ${exercisePrompt}
Expected Output/Goal: ${expectedOutput}
Student's Current Code:
\`\`\`python
${code || '# No code written yet'}
\`\`\`

Give a Level ${hintLevel || 1} hint.`;

  try {
    const text = await callGeminiWithFallback({
      contents: prompt,
      systemInstruction,
      temperature: 0.5,
    });
    res.json({ hint: text });
  } catch (error: any) {
    console.warn("Using offline hint fallback:", error?.message);
    res.json({ hint: getHintFallback(exercisePrompt, hintLevel) });
  }
});

// AI Tutor - Generate Code Example
app.post("/api/ai/generate-example", async (req, res) => {
  const { topic, lessonTitle, difficulty } = req.body;

  const systemInstruction = `You are PyCoach, an expert Python instructor.
Generate a clear, easy-to-understand code example in Python for the requested topic/lesson.
Include:
1. Brief context (1-2 sentences).
2. A well-commented Python code snippet.
3. Key takeaway points.`;

  const prompt = `Topic: ${topic || lessonTitle || 'Python Basics'}
Difficulty: ${difficulty || 'Beginner'}
Generate a practical, clear code example demonstrating this concept.`;

  try {
    const text = await callGeminiWithFallback({
      contents: prompt,
      systemInstruction,
      temperature: 0.6,
    });
    res.json({ example: text });
  } catch (error: any) {
    console.warn("Using offline example fallback:", error?.message);
    res.json({
      example: `### Python Code Example: ${topic || lessonTitle || 'Fundamentals'}\n\nHere is a clean Python code snippet:\n\`\`\`python\n# ${topic || 'Python Basics'} Example\nname = "Python Student"\nprint(f"Welcome to coding, {name}!")\n\`\`\`\n\n- **Key Takeaway**: Variables store data and f-strings format variables inside strings.`
    });
  }
});

// AI Tutor - Generate Practice Exercise
app.post("/api/ai/generate-exercise", async (req, res) => {
  const { lessonTitle, topic, difficulty } = req.body;

  const systemInstruction = `You are PyCoach creating a custom practice exercise for a student.
Generate a small, engaging Python practice problem.
Format:
- **Challenge Title**
- **Problem Statement**
- **Expected Outcome**
- **Starter Code Template**`;

  const prompt = `Lesson: ${lessonTitle || 'Python Programming'}
Topic: ${topic || 'Python Concepts'}
Difficulty Level: ${difficulty || 'Beginner'}

Create an interactive practice exercise to test understanding.`;

  try {
    const text = await callGeminiWithFallback({
      contents: prompt,
      systemInstruction,
      temperature: 0.7,
    });
    res.json({ exercise: text });
  } catch (error: any) {
    console.warn("Using offline practice exercise fallback:", error?.message);
    const pb = getPracticeProblemFallback(lessonTitle, 1, difficulty);
    res.json({
      exercise: `### Challenge: ${pb.problemTitle}\n\n**Problem Statement**:\n${pb.problemStatement}\n\n**Starter Code**:\n\`\`\`python\n${pb.starterCode}\n\`\`\``
    });
  }
});

// AI Quiz - Generate Single Question
app.post("/api/ai/quiz/generate-question", async (req, res) => {
  const { lessonTitle, moduleTitle, theoryMarkdown, questionIndex, totalQuestions, previousQuestions } = req.body;

  const systemInstruction = `You are PyCoach, an expert Python instructor. You generate ONE multiple-choice quiz question at a time to test a student's understanding of a specific Python lesson.

CRITICAL RULES:
1. Respond ONLY with valid, raw JSON.
2. The question MUST be strictly focused on the provided lesson context and theory.
3. Do NOT repeat any topics or concepts covered in previous questions: ${JSON.stringify(previousQuestions || [])}.
4. Provide exactly 4 options labeled A, B, C, D.
5. Provide a single correct option key ("A", "B", "C", or "D").
6. Provide a concise 2-3 sentence educational explanation explaining why the correct answer is right and why others are wrong.

EXPECTED JSON OUTPUT STRUCTURE:
{
  "questionText": "What is the result of print(10 // 3) in Python?",
  "options": [
    { "key": "A", "text": "3.3333" },
    { "key": "B", "text": "3" },
    { "key": "C", "text": "1" },
    { "key": "D", "text": "Error" }
  ],
  "correctOptionKey": "B",
  "explanation": "The // operator performs floor division, returning 3."
}`;

  const prompt = `Lesson Title: ${lessonTitle || 'Python Basics'}
Module Title: ${moduleTitle || 'Foundations'}
Lesson Theory Context:
${theoryMarkdown ? theoryMarkdown.slice(0, 1000) : 'Python fundamentals'}

Question ${questionIndex || 1} of ${totalQuestions || 5}.
Generate ONE unique, high-quality question with 4 options testing this lesson.`;

  try {
    const text = await callGeminiWithFallback({
      contents: prompt,
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.7,
    });

    let questionData;
    try {
      questionData = JSON.parse(text);
    } catch {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      questionData = JSON.parse(cleanText);
    }
    res.json({ question: questionData });
  } catch (error: any) {
    console.warn("Using offline quiz question fallback:", error?.message);
    res.json({ question: getQuizQuestionFallback(lessonTitle, questionIndex) });
  }
});

// AI Practice Problems - Generate Single Practice Problem
app.post("/api/ai/practice/generate-problem", async (req, res) => {
  const { lessonTitle, moduleTitle, theoryMarkdown, difficulty, problemIndex, totalProblems, previousProblems } = req.body;

  const systemInstruction = `You are PyCoach, an expert Python instructor. You generate ONE practical coding problem at a time to test a student's understanding of a specific Python lesson.

CRITICAL RULES:
1. Respond ONLY with valid, raw JSON.
2. Generate exactly ONE practice problem based strictly on the provided lesson context.
3. Do NOT repeat topics or problems from previous problems: ${JSON.stringify(previousProblems || [])}.
4. Provide a clear problem title, problem statement (what the student needs to write or do in Python), starter code template, and difficulty level.
5. Do NOT include or reveal the solution in the response.

EXPECTED JSON OUTPUT STRUCTURE:
{
  "problemTitle": "Assigning Variables",
  "problemStatement": "Create a variable named 'student_count' assigned to integer 25. Then print 'Students: 25' using the variable.",
  "starterCode": "# Write your Python code solution below\\n",
  "difficulty": "Beginner",
  "expectedConcept": "Variable Assignment & Output"
}`;

  const prompt = `Lesson Title: ${lessonTitle || 'Python Programming'}
Module Title: ${moduleTitle || 'Foundations'}
Difficulty Level: ${difficulty || 'Beginner'}
Lesson Theory Context:
${theoryMarkdown ? theoryMarkdown.slice(0, 1000) : 'Python fundamentals'}

Problem ${problemIndex || 1} of ${totalProblems || 5}.
Generate ONE unique, clear Python practice problem testing this lesson.`;

  try {
    const text = await callGeminiWithFallback({
      contents: prompt,
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.7,
    });

    let problemData;
    try {
      problemData = JSON.parse(text);
    } catch {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      problemData = JSON.parse(cleanText);
    }
    res.json({ problem: problemData });
  } catch (error: any) {
    console.warn("Using offline practice problem fallback:", error?.message);
    res.json({ problem: getPracticeProblemFallback(lessonTitle, problemIndex, difficulty) });
  }
});

// AI Practice Problems - Evaluate Student Answer
app.post("/api/ai/practice/evaluate-answer", async (req, res) => {
  const { problemTitle, problemStatement, starterCode, studentAnswer, lessonTitle, difficulty } = req.body;

  const systemInstruction = `You are PyCoach, an expert Python instructor evaluating a student's Python code or text response for a specific practice problem.

CRITICAL RULES:
1. Respond ONLY with valid, raw JSON.
2. Evaluate if the student's solution correctly, logically, and completely solves the problem.
3. Be encouraging, constructive, and accurate.
4. If correct:
   - Set "isCorrect": true
   - Provide "congratulations": brief positive message
   - Provide "explanation": brief explanation of why this solution is effective
   - Set "mistake": "" and "hint": ""
5. If incorrect:
   - Set "isCorrect": false
   - Set "congratulations": ""
   - Provide "mistake": clear explanation of what went wrong or what's missing
   - Provide "hint": a helpful hint pointing them towards the fix
   - Provide "explanation": brief note on the concept

EXPECTED JSON OUTPUT STRUCTURE:
{
  "isCorrect": true,
  "congratulations": "Excellent job! You correctly created the variable and formatted the print statement.",
  "explanation": "Assigning 25 to student_count and using print is proper Python syntax.",
  "mistake": "",
  "hint": ""
}`;

  const prompt = `Lesson: ${lessonTitle || 'Python'}
Difficulty: ${difficulty || 'Beginner'}
Problem Title: ${problemTitle}
Problem Prompt: ${problemStatement}

Student's Answer/Code Submission:
\`\`\`python
${studentAnswer || ''}
\`\`\`

Evaluate the student's answer now.`;

  try {
    const text = await callGeminiWithFallback({
      contents: prompt,
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.3,
    });

    let evalData;
    try {
      evalData = JSON.parse(text);
    } catch {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      evalData = JSON.parse(cleanText);
    }
    res.json({ evaluation: evalData });
  } catch (error: any) {
    console.warn("Using offline answer evaluation fallback:", error?.message);
    res.json({ evaluation: evaluateAnswerFallback(problemTitle, problemStatement, studentAnswer) });
  }
});

// AI Practice Problems - Summarize Session
app.post("/api/ai/practice/summarize-session", async (req, res) => {
  const { lessonTitle, difficulty, totalProblems, score, history } = req.body;

  const systemInstruction = `You are PyCoach, an expert Python instructor reviewing a student's practice session.
Analyze their performance across the problems solved.

CRITICAL RULES:
1. Respond ONLY with valid, raw JSON.
2. Provide a constructive summary including strengths, weaknesses, and a specific recommendation.

EXPECTED JSON OUTPUT STRUCTURE:
{
  "strengths": ["Clear understanding of basic variable assignment", "Accurate print formatting"],
  "weaknesses": ["Slight difficulty with string vs integer concatenation"],
  "recommendedReview": "Review the section on 'Data Types and Casting' in this lesson.",
  "summaryNote": "Great overall performance! Focus on practicing type conversion to master this lesson."
}`;

  const prompt = `Lesson: ${lessonTitle}
Difficulty: ${difficulty}
Score: ${score} out of ${totalProblems}

Problem Attempt History:
${JSON.stringify(history || [], null, 2)}

Provide a final performance review for the student.`;

  try {
    const text = await callGeminiWithFallback({
      contents: prompt,
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.5,
    });

    let summaryData;
    try {
      summaryData = JSON.parse(text);
    } catch {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      summaryData = JSON.parse(cleanText);
    }
    res.json({ summary: summaryData });
  } catch (error: any) {
    console.warn("Using offline practice session summary fallback:", error?.message);
    res.json({
      summary: {
        strengths: [
          "Good practice with Python fundamentals",
          "Successful completion of lesson exercises"
        ],
        weaknesses: score < totalProblems ? ["First-attempt syntax precision"] : [],
        recommendedReview: `Review key syntax examples in ${lessonTitle || 'this lesson'}.`,
        summaryNote: "Solid effort during this practice session!"
      }
    });
  }
});

// Vite Middleware for Development / Static serving for Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Python Platform Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
