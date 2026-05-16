# Class Doubt Solver (Student Doubt Solver)

An AI-powered web application built to help school students (Classes 6-12) solve their doubts with detailed, step-by-step explanations. Acting as a patient tutor, it leverages OpenAI's GPT-4o models to break down complex questions in mathematics, science, and more, including the ability to read images.

## 🚀 Features

- **Class & Subject Selection:** Tailor the AI's explanation specifically to the student's grade level (Class 6 - 12) and subject.
- **Image Upload Support:** Users can type their doubt or upload an image of the question. The app utilizes `gpt-4o` with vision capabilities for image reading.
- **Step-by-Step Explanations:** The AI is prompted to provide 5-7 clear, numbered steps, ensuring students understand the underlying concepts and not just the final answer.
- **LaTeX Math Support:** Seamlessly renders complex math formulas and equations using KaTeX.
  - **What is KaTeX?** KaTeX is a fast JavaScript library that renders LaTeX math equations in web applications.
  - **So:**
    - **LaTeX** = the syntax/language for writing equations
    - **KaTeX** = the tool/library that displays those equations nicely on websites
- **Copy to Clipboard:** One-click copy function to easily share or save the explanation and final answer.
- **Graceful Fallback:** If the API key is not configured, the app returns a beautifully formatted placeholder step-by-step response to demonstrate functionality.

## 🛠 Tech Stack

- **Frontend:**
  - React 18
  - Vite
  - Tailwind CSS (with Typography plugin)
  - React Markdown (with `remark-math` and `rehype-katex` for rendering LaTeX)
- **Backend / Serverless:**
  - Node.js (via Serverless API route handling)
  - OpenAI API (`gpt-4o` for images, `gpt-4o-mini` for text)

## 🏗 Approach to Building

The project is structured as a modern decoupled SPA with serverless backend processing.
- **What is a Decoupled SPA?**
  - **SPA (Single Page Application):** Frontend works as a single web app without full page reloads.
  - **Decoupled:** Frontend and backend are separated and communicate through APIs.

1. **User Interface (UI):** Built using React and styled with Tailwind CSS. We focused on a clean, "paper-like" interface that feels welcoming and minimizes distraction for students.
2. **State Management:** Handled natively in React using `useState` and `useMemo` hooks to capture the form inputs (Class, Subject, Question, and Image selection).
3. **Image Handling:** Utilizing the native browser `FileReader` API to convert user-uploaded images into Base64 strings on the client side, which are then attached to the API request.
4. **Backend Processing:** A single API route (`/api/solve.js`) receives the student's context. 
   - It intelligently builds a system prompt instructing the model to act as a patient teacher.
   - It branches its model choice: using `gpt-4o` if an image is provided, and `gpt-4o-mini` if only text is provided (for cost-efficiency).
5. **Output Parsing:** The backend utilizes regex matching (`parseModelText`) to cleanly separate the detailed explanation from the final concise answer.
6. **Rendering Content:** The frontend consumes the structured JSON response and heavily relies on `react-markdown` and `katex` to render the markdown formatting and math expressions safely.

## 🗂 Project Structure

```text
/
├── api/
│   └── solve.js              # Serverless API endpoint managing OpenAI requests
├── src/
│   ├── App.jsx               # Main application component and frontend logic
│   ├── index.css             # Global styles, variables, and animations
│   └── main.jsx              # Application entry point
├── .env.example              # Example environment variables
├── index.html                # Main HTML document
├── package.json              # Project dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
└── vite.config.js            # Vite configuration
```

## ⚙️ Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- An OpenAI API Key

## 💻 Installation & Setup

1. **Clone the repository (or navigate to the folder):**
   ```bash
   cd task_classes
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   - Copy `.env.example` to a new file named `.env`
   - Add your OpenAI API key to the `.env` file:
     ```env
     OPENAI_API_KEY=your_actual_api_key_here
     ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   ```

## 📝 Usage

1. Select your Class (e.g., Class 8) and Board/Medium.
2. Choose a Subject (e.g., Math, Science).
3. Type your question directly into the text box OR click the image icon to upload a photo of your question.
4. Click **Get Answer**.
5. Wait for the AI to process and return a step-by-step breakdown alongside the final answer.
