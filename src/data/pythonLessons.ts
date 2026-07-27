import { LessonModule } from '../types';

export const PYTHON_MODULES: LessonModule[] = [
  {
    id: 'module-1',
    title: '1. Python Foundations (Beginner)',
    description: 'Learn Python basics: outputting text, variables, math, and strings.',
    lessons: [
      {
        id: 'py-101',
        moduleId: 'module-1',
        moduleTitle: '1. Python Foundations',
        title: 'Hello Python & Print()',
        description: 'Learn how to display messages on the screen using the print() function.',
        duration: '10 min',
        difficulty: 'Beginner',
        theoryMarkdown: `Welcome to Python! 🐍

Python is one of the most popular and beginner-friendly programming languages in the world.

### The print() Function
To display text in Python, we use the \`print()\` function. Whatever you put inside double quotes \`"..."\` or single quotes \`'...'\` will be printed to the output console.

\`\`\`python
# Example:
print("Hello, World!")
print("Welcome to Python programming!")
\`\`\`

### Key Rules:
- Text values in Python are called **Strings**.
- Strings must be enclosed in quotes \`"..."\` or \`'...\`.
- Python is **case-sensitive**: \`print\` works, but \`Print\` or \`PRINT\` will cause a SyntaxError!`,
        exercise: {
          id: 'ex-101',
          title: 'Exercise: Your First Python Output',
          instructions: 'Write a program that prints "Hello Python Learner!" to the console on the first line, and "I am ready to code!" on the second line.',
          initialCode: `# Write your print statements below:\nprint("Hello Python Learner!")\n# Print the second line here:\n`,
          solutionCode: 'print("Hello Python Learner!")\nprint("I am ready to code!")',
          expectedOutput: 'Hello Python Learner!\nI am ready to code!',
          hints: [
            'Use two separate print() function calls.',
            'Make sure your second line is print("I am ready to code!")'
          ]
        }
      },
      {
        id: 'py-102',
        moduleId: 'module-1',
        moduleTitle: '1. Python Foundations',
        title: 'Variables & Data Types',
        description: 'Understand how to store information using variables, integers, floats, and strings.',
        duration: '15 min',
        difficulty: 'Beginner',
        theoryMarkdown: `Storing Data with Variables 📦

A variable is a named container that holds a value in memory. In Python, you create a variable by choosing a name and assigning a value using the \`=\` operator.

\`\`\`python
# Examples of Python data types:
name = "Alex"      # String (text)
age = 20           # Integer (whole number)
height = 5.9       # Float (decimal number)
is_student = True  # Boolean (True or False)

print(name)
print(age)
\`\`\`

### Python Core Data Types:
- \`str\`: Text like \`"Python"\`
- \`int\`: Whole numbers like \`42\`, \`-5\`
- \`float\`: Decimals like \`3.14\`
- \`bool\`: Logical values (\`True\` or \`False\`)`,
        exercise: {
          id: 'ex-102',
          title: 'Exercise: Create Your Profile Variables',
          instructions: 'Create a variable named score set to 100, a variable named player set to "Maya", and print them using print(player) and print(score).',
          initialCode: `# Create player variable:\nplayer = "Maya"\n\n# Create score variable:\nscore = 100\n\n# Print player first, then score:\n`,
          solutionCode: 'player = "Maya"\nscore = 100\nprint(player)\nprint(score)',
          expectedOutput: 'Maya\n100',
          hints: [
            'Assign player = "Maya" and score = 100.',
            'Call print(player) and then print(score).'
          ]
        }
      },
      {
        id: 'py-103',
        moduleId: 'module-1',
        moduleTitle: '1. Python Foundations',
        title: 'Basic Math & Arithmetic',
        description: 'Perform calculations using +, -, *, /, //, %, and ** in Python.',
        duration: '15 min',
        difficulty: 'Beginner',
        theoryMarkdown: `Python as a Calculator 🧮

Python supports all standard arithmetic operations:

\`\`\`python
a = 10
b = 3

print(a + b)   # Addition -> 13
print(a - b)   # Subtraction -> 7
print(a * b)   # Multiplication -> 30
print(a / b)   # Division -> 3.3333...
print(a // b)  # Floor Division -> 3
print(a % b)   # Modulo Remainder -> 1
print(a ** b)  # Exponent Power (10^3) -> 1000
\`\`\``,
        exercise: {
          id: 'ex-103',
          title: 'Exercise: Calculate Total Bill',
          instructions: 'Calculate total bill where item_price is 25 and quantity is 4. Multiply them to get total, then print total.',
          initialCode: `item_price = 25\nquantity = 4\n\n# Calculate total:\ntotal = item_price * quantity\n\n# Print the total:\nprint(total)`,
          solutionCode: 'item_price = 25\nquantity = 4\ntotal = item_price * quantity\nprint(total)',
          expectedOutput: '100',
          hints: [
            'Use print(total) at the bottom of your code.'
          ]
        }
      },
      {
        id: 'py-104',
        moduleId: 'module-1',
        moduleTitle: '1. Python Foundations',
        title: 'String Manipulation & F-Strings',
        description: 'Format text dynamically using f-strings and string methods.',
        duration: '15 min',
        difficulty: 'Beginner',
        theoryMarkdown: `Formatting Strings with f-strings ✨

F-strings (formatted string literals) allow you to embed variables directly inside strings using \`f"..."\` and curly braces \`{}\`.

\`\`\`python
user = "Jordan"
points = 250

# Using F-string formatting:
message = f"User {user} has earned {points} points!"
print(message)

# String Methods:
print(user.upper())   # "JORDAN"
print(user.lower())   # "jordan"
print(len(user))       # 6
\`\`\``,
        exercise: {
          id: 'ex-104',
          title: 'Exercise: Formatted Welcome Banner',
          instructions: 'Create course = "Python 101", student = "Sam", and print f"Welcome {student} to {course}!".',
          initialCode: `course = "Python 101"\nstudent = "Sam"\n\n# Print the formatted welcome message:\nprint(f"Welcome {student} to {course}!")`,
          solutionCode: 'course = "Python 101"\nstudent = "Sam"\nprint(f"Welcome {student} to {course}!")',
          expectedOutput: 'Welcome Sam to Python 101!',
          hints: [
            'Combine variables inside an f-string.'
          ]
        }
      }
    ]
  },
  {
    id: 'module-2',
    title: '2. Control Flow & Logic (Beginner)',
    description: 'Master if, elif, else statements and conditional logical operators.',
    lessons: [
      {
        id: 'py-201',
        moduleId: 'module-2',
        moduleTitle: '2. Control Flow & Logic',
        title: 'If, Elif, and Else Statements',
        description: 'Make decisions in code based on true or false conditions.',
        duration: '20 min',
        difficulty: 'Beginner',
        theoryMarkdown: `Making Decisions in Python 🚦

Conditional statements allow your program to execute different blocks of code based on conditions.

\`\`\`python
temperature = 28

if temperature > 30:
    print("It is hot outside!")
elif temperature > 20:
    print("Nice and pleasant weather.")
else:
    print("Brrr, it is chilly!")
\`\`\`

### Indentation Rule:
Python uses **4 spaces** of indentation to define code blocks inside conditional statements.`,
        exercise: {
          id: 'ex-201',
          title: 'Exercise: Grade Classifier',
          instructions: 'Given score = 85, write an if-else statement: if score >= 80, print "Pass", otherwise print "Fail".',
          initialCode: `score = 85\n\nif score >= 80:\n    print("Pass")\nelse:\n    print("Fail")\n`,
          solutionCode: 'score = 85\n\nif score >= 80:\n    print("Pass")\nelse:\n    print("Fail")',
          expectedOutput: 'Pass',
          hints: [
            'Verify score is set to 85.',
            'Ensure print("Pass") is indented inside the if block.'
          ]
        }
      },
      {
        id: 'py-202',
        moduleId: 'module-2',
        moduleTitle: '2. Control Flow & Logic',
        title: 'Logical Operators (and, or, not)',
        description: 'Combine multiple logical conditions to build complex rule sets.',
        duration: '15 min',
        difficulty: 'Beginner',
        theoryMarkdown: `Combining Logic Operators 🧠

Use logical operators to evaluate multiple Boolean expressions:

- \`and\`: True if **both** conditions are True.
- \`or\`: True if **at least one** condition is True.
- \`not\`: Inverts the Boolean value.

\`\`\`python
has_ticket = True
age = 22

if has_ticket and age >= 18:
    print("Access Granted")
else:
    print("Access Denied")
\`\`\``,
        exercise: {
          id: 'ex-202',
          title: 'Exercise: Security Check',
          instructions: 'Set is_verified = True and is_admin = False. If is_verified and not is_admin, print "Standard Verified User".',
          initialCode: `is_verified = True\nis_admin = False\n\nif is_verified and not is_admin:\n    print("Standard Verified User")`,
          solutionCode: 'is_verified = True\nis_admin = False\nif is_verified and not is_admin:\n    print("Standard Verified User")',
          expectedOutput: 'Standard Verified User',
          hints: [
            'Combine conditions with "and not".'
          ]
        }
      }
    ]
  },
  {
    id: 'module-3',
    title: '3. Loops & Iteration (Beginner)',
    description: 'Automate repetitive tasks with for loops and while loops.',
    lessons: [
      {
        id: 'py-301',
        moduleId: 'module-3',
        moduleTitle: '3. Loops & Iteration',
        title: 'For Loops & range()',
        description: 'Iterate over sequences and numbers using Python for loops.',
        duration: '20 min',
        difficulty: 'Beginner',
        theoryMarkdown: `Repeat Actions with For Loops 🔄

A \`for\` loop runs a block of code repeatedly for each item in a range or sequence.

\`\`\`python
for i in range(5):
    print("Loop count:", i)
\`\`\`

\`range(start, stop)\` generates numbers from \`start\` up to (but not including) \`stop\`.`,
        exercise: {
          id: 'ex-301',
          title: 'Exercise: Print Numbers 1 to 5',
          instructions: 'Use a for loop with range(1, 6) to print numbers 1 through 5.',
          initialCode: `for num in range(1, 6):\n    print(num)\n`,
          solutionCode: 'for num in range(1, 6):\n    print(num)',
          expectedOutput: '1\n2\n3\n4\n5',
          hints: [
            'range(1, 6) starts at 1 and stops before 6.'
          ]
        }
      },
      {
        id: 'py-302',
        moduleId: 'module-3',
        moduleTitle: '3. Loops & Iteration',
        title: 'While Loops & Infinite Loop Safety',
        description: 'Run code as long as a specified condition remains true.',
        duration: '20 min',
        difficulty: 'Beginner',
        theoryMarkdown: `Conditional Repetition with While ⏳

A \`while\` loop repeatedly executes statements as long as its condition remains \`True\`.

\`\`\`python
countdown = 3

while countdown > 0:
    print(f"T-minus {countdown}")
    countdown -= 1

print("Blastoff!")
\`\`\``,
        exercise: {
          id: 'ex-302',
          title: 'Exercise: Simple Counter',
          instructions: 'Initialize count = 1. Write a while loop printing count while count <= 3, incrementing count by 1 each iteration.',
          initialCode: `count = 1\nwhile count <= 3:\n    print(count)\n    count += 1`,
          solutionCode: 'count = 1\nwhile count <= 3:\n    print(count)\n    count += 1',
          expectedOutput: '1\n2\n3',
          hints: [
            'Make sure count is incremented with count += 1 inside the loop.'
          ]
        }
      }
    ]
  },
  {
    id: 'module-4',
    title: '4. Functions & Scope (Intermediate)',
    description: 'Write modular, reusable functions with parameters, return statements, and scope.',
    lessons: [
      {
        id: 'py-401',
        moduleId: 'module-4',
        moduleTitle: '4. Functions & Scope',
        title: 'Defining Functions with def',
        description: 'Learn how to create reusable blocks of Python code.',
        duration: '20 min',
        difficulty: 'Intermediate',
        theoryMarkdown: `Creating Functions 🛠️

Functions let you group code into a named, reusable unit.

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

msg = greet("Amina")
print(msg)
\`\`\`

### Key Concepts:
- Use \`def\` to define a function.
- Parameters go inside parentheses \`()\`.
- Use \`return\` to pass a result back to the caller.`,
        exercise: {
          id: 'ex-401',
          title: 'Exercise: Write a Square Function',
          instructions: 'Define a function square(x) that returns x * x. Call square(4) and print the result.',
          initialCode: `def square(x):\n    return x * x\n\nresult = square(4)\nprint(result)\n`,
          solutionCode: 'def square(x):\n    return x * x\n\nresult = square(4)\nprint(result)',
          expectedOutput: '16',
          hints: [
            'Use def square(x): return x * x',
            'Call square(4) and print the result.'
          ]
        }
      },
      {
        id: 'py-402',
        moduleId: 'module-4',
        moduleTitle: '4. Functions & Scope',
        title: 'Lambda & Anonymous Functions',
        description: 'Write compact single-line functions using the lambda keyword.',
        duration: '15 min',
        difficulty: 'Intermediate',
        theoryMarkdown: `Compact Functions with Lambda ⚡

A \`lambda\` function is a small anonymous function defined on a single line.

\`\`\`python
# Standard function:
def add(a, b):
    return a + b

# Equivalent lambda function:
add_lambda = lambda a, b: a + b

print(add_lambda(5, 10))  # 15
\`\`\``,
        exercise: {
          id: 'ex-402',
          title: 'Exercise: Lambda Multiplier',
          instructions: 'Create a lambda function named double that takes x and returns x * 2. Print double(7).',
          initialCode: `double = lambda x: x * 2\nprint(double(7))`,
          solutionCode: 'double = lambda x: x * 2\nprint(double(7))',
          expectedOutput: '14',
          hints: [
            'Use double = lambda x: x * 2'
          ]
        }
      }
    ]
  },
  {
    id: 'module-5',
    title: '5. Data Structures (Intermediate)',
    description: 'Organize data using Lists, Dictionaries, Sets, and List Comprehensions.',
    lessons: [
      {
        id: 'py-501',
        moduleId: 'module-5',
        moduleTitle: '5. Data Structures',
        title: 'Lists & Methods',
        description: 'Store ordered collections of elements and perform mutations.',
        duration: '25 min',
        difficulty: 'Intermediate',
        theoryMarkdown: `Python Lists 📋

Lists store multiple ordered items in a single variable using square brackets \`[]\`.

\`\`\`python
fruits = ["apple", "banana", "cherry"]

# Accessing by zero-based index:
print(fruits[0]) # "apple"

# List operations:
fruits.append("orange")
print(len(fruits)) # 4
\`\`\``,
        exercise: {
          id: 'ex-501',
          title: 'Exercise: List Operations',
          instructions: 'Create colors = ["red", "green"]. Append "blue" to colors, then print colors[2].',
          initialCode: `colors = ["red", "green"]\ncolors.append("blue")\nprint(colors[2])`,
          solutionCode: 'colors = ["red", "green"]\ncolors.append("blue")\nprint(colors[2])',
          expectedOutput: 'blue',
          hints: [
            'colors[2] gets the 3rd element.'
          ]
        }
      },
      {
        id: 'py-502',
        moduleId: 'module-5',
        moduleTitle: '5. Data Structures',
        title: 'Dictionaries & Key-Value Mapping',
        description: 'Map unique keys to values for fast lookups.',
        duration: '25 min',
        difficulty: 'Intermediate',
        theoryMarkdown: `Dictionaries 📖

Dictionaries store key-value pairs inside curly braces \`{}\`.

\`\`\`python
student = {
    "name": "Sarah",
    "score": 95,
    "course": "Python"
}

print(student["name"])  # "Sarah"
student["grade"] = "A"
\`\`\``,
        exercise: {
          id: 'ex-502',
          title: 'Exercise: Dictionary Lookup',
          instructions: 'Create user = {"username": "coder123", "role": "admin"}. Print user["role"].',
          initialCode: `user = {"username": "coder123", "role": "admin"}\nprint(user["role"])`,
          solutionCode: 'user = {"username": "coder123", "role": "admin"}\nprint(user["role"])',
          expectedOutput: 'admin',
          hints: [
            'Access dictionary value using square brackets with key name.'
          ]
        }
      }
    ]
  },
  {
    id: 'module-6',
    title: '6. Object-Oriented Programming (Advanced)',
    description: 'Design software architectures using Classes, Objects, Inheritance, and Encapsulation.',
    lessons: [
      {
        id: 'py-601',
        moduleId: 'module-6',
        moduleTitle: '6. Object-Oriented Programming',
        title: 'Classes & Objects',
        description: 'Build custom object blueprints using class, __init__, and self.',
        duration: '30 min',
        difficulty: 'Advanced',
        theoryMarkdown: `Object-Oriented Programming 🏗️

Classes are blueprints for creating objects with state (attributes) and behavior (methods).

\`\`\`python
class Car:
    def __init__(self, brand, model):
        self.brand = brand
        self.model = model

    def info(self):
        return f"{self.brand} {self.model}"

my_car = Car("Tesla", "Model 3")
print(my_car.info())  # "Tesla Model 3"
\`\`\``,
        exercise: {
          id: 'ex-601',
          title: 'Exercise: Create a Dog Class',
          instructions: 'Create a Dog class with __init__(self, name). Instanciate dog = Dog("Rover") and print dog.name.',
          initialCode: `class Dog:\n    def __init__(self, name):\n        self.name = name\n\ndog = Dog("Rover")\nprint(dog.name)`,
          solutionCode: 'class Dog:\n    def __init__(self, name):\n        self.name = name\n\ndog = Dog("Rover")\nprint(dog.name)',
          expectedOutput: 'Rover',
          hints: [
            'Use self.name = name inside __init__.'
          ]
        }
      },
      {
        id: 'py-602',
        moduleId: 'module-6',
        moduleTitle: '6. Object-Oriented Programming',
        title: 'Class Inheritance',
        description: 'Inherit features from parent classes to reuse code cleanly.',
        duration: '25 min',
        difficulty: 'Advanced',
        theoryMarkdown: `Inheritance 🧬

Subclasses inherit properties and methods from parent classes.

\`\`\`python
class Animal:
    def speak(self):
        return "Generic sound"

class Cat(Animal):
    def speak(self):
        return "Meow"

c = Cat()
print(c.speak())  # "Meow"
\`\`\``,
        exercise: {
          id: 'ex-602',
          title: 'Exercise: Vehicle Inheritance',
          instructions: 'Define Vehicle class with method drive() returning "Vroom". Create ElectricCar(Vehicle). Print ElectricCar().drive().',
          initialCode: `class Vehicle:\n    def drive(self):\n        return "Vroom"\n\nclass ElectricCar(Vehicle):\n    pass\n\ncar = ElectricCar()\nprint(car.drive())`,
          solutionCode: 'class Vehicle:\n    def drive(self):\n        return "Vroom"\n\nclass ElectricCar(Vehicle):\n    pass\n\ncar = ElectricCar()\nprint(car.drive())',
          expectedOutput: 'Vroom',
          hints: [
            'ElectricCar inherits drive() from Vehicle.'
          ]
        }
      }
    ]
  },
  {
    id: 'module-7',
    title: '7. File I/O & Exception Handling (Advanced)',
    description: 'Handle runtime errors gracefully and interact with file streams.',
    lessons: [
      {
        id: 'py-701',
        moduleId: 'module-7',
        moduleTitle: '7. File I/O & Exceptions',
        title: 'Try, Except & Error Handling',
        description: 'Prevent program crashes by handling potential runtime errors.',
        duration: '20 min',
        difficulty: 'Advanced',
        theoryMarkdown: `Graceful Error Handling 🛡️

Use \`try\` and \`except\` blocks to catch and handle exceptions without halting execution.

\`\`\`python
try:
    number = int("abc")  # Invalid integer conversion
except ValueError:
    print("Caught invalid number format!")
\`\`\``,
        exercise: {
          id: 'ex-701',
          title: 'Exercise: Catch Division by Zero',
          instructions: 'Write a try-except block: divide 10 / 0 inside try, catch ZeroDivisionError, and print "Cannot divide by zero".',
          initialCode: `try:\n    res = 10 / 0\nexcept ZeroDivisionError:\n    print("Cannot divide by zero")`,
          solutionCode: 'try:\n    res = 10 / 0\nexcept ZeroDivisionError:\n    print("Cannot divide by zero")',
          expectedOutput: 'Cannot divide by zero',
          hints: [
            'Catch ZeroDivisionError and print the message.'
          ]
        }
      }
    ]
  },
  {
    id: 'module-8',
    title: '8. Advanced Python Utilities (Advanced)',
    description: 'Master Decorators, Generators, and Advanced Meta-Programming.',
    lessons: [
      {
        id: 'py-801',
        moduleId: 'module-8',
        moduleTitle: '8. Advanced Utilities',
        title: 'Generators & yield Keyword',
        description: 'Stream large datasets efficiently with lazy memory generator iterators.',
        duration: '25 min',
        difficulty: 'Advanced',
        theoryMarkdown: `Lazy Evaluation with Generators ⚡

Generators use \`yield\` instead of \`return\` to produce a sequence of results lazily without keeping the entire series in memory.

\`\`\`python
def count_up(max_num):
    count = 1
    while count <= max_num:
        yield count
        count += 1

gen = count_up(3)
for val in gen:
    print(val)
\`\`\``,
        exercise: {
          id: 'ex-801',
          title: 'Exercise: Simple Generator',
          instructions: 'Write a generator function simple_gen() that yields 10, then yields 20. Iterate over simple_gen() and print values.',
          initialCode: `def simple_gen():\n    yield 10\n    yield 20\n\nfor num in simple_gen():\n    print(num)`,
          solutionCode: 'def simple_gen():\n    yield 10\n    yield 20\n\nfor num in simple_gen():\n    print(num)',
          expectedOutput: '10\n20',
          hints: [
            'Use yield twice inside simple_gen().'
          ]
        }
      }
    ]
  }
];
