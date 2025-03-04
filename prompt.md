You are an AI task planner responsible for breaking down a complex web application development project into manageable steps.

Your goal is to create a detailed, step-by-step plan that will guide the code generation process for building a fully functional web application based on a provided technical specification.

First, carefully review the following inputs:

<project_request>
Develop the initial phase of a multi-platform (web and mobile) note-taking and task management application named HyperScribe. This phase focuses on core functionalities, including AI-assisted note creation, task management, shareable notes, templates, database and authentication setup, and file storage. The application should be built using Next.js 15+ with TypeScript and React 19, PostgreSQL with Drizzle ORM, Next-Auth v5, Supabase, and the Vercel AI SDK. The design should be modern and minimalistic, with a chat-like interface for interacting with the LLM. The application should be responsive for both web and mobile. 

Specifically, implement the following features:

1.  **AI-Assisted Note Creation:**
    *   Integrate the Vercel AI SDK to enable users to select an LLM (initially Groq or other providers) for each note. Implement the ability to summarize and expand existing notes using the selected LLM.
    *   Create an initial chat interface that prompts the user for a note category (brain dump, journal, to-do, mood tracking) upon login. Automatically generate a note based on the chosen category using a corresponding template.
    *   Implement audio note functionality, allowing users to record audio and transcribe it using Deepgram. Store the transcription within the relevant note template.

2.  **Task & To-Do Management:**
    *   Create a daily to-do list with the ability to roll over incomplete tasks to the next day.
    *   Implement the ability to auto-generate tasks from conversation context.

3.  **Shareable Notes:**
    *   Allow single-user editing only (no live multi-user editing in this phase).
    *   Enable users to share notes via a link or invite others to view them.

4.  **Templates:**
    *   Provide pre-made templates for various note categories (brain dump, journal, to-do, mood tracking, etc.).
    *   Allow users to easily customize or create new templates.

5.  **Database & Authentication:**
    *   Use PostgreSQL with Drizzle ORM as the primary database with Supabase for additional functionality.
    *   Implement Next-Auth v5 for authentication, supporting email-based sign-ups and secure session management.
    *   After user signs up, save details in the database.

6.  **File Storage:**
    *   Implement an optimal approach for storing audio, video, and images using Supabase storage, considering security, encryption, and efficient retrieval.

7.  **Cross-Platform Support:**
    *   Ensure a responsive design for both web and mobile platforms using Tailwind CSS and Radix UI components.

8.  **Design Requests:**
    *   Create a modern, minimalistic interface with a chat-like conversation flow with the LLM.
    *   Design clean templates for different note categories.
    *   Implement straightforward user onboarding with clear prompts guiding users through the note creation process.
    *   Include loader/progress indicators for OCR processing and file uploads.

Consider the following technical challenges and decisions:

*   Manage multiple LLM integrations with the Vercel AI SDK, considering API usage, performance, and cost.
*   Determine the exact approach for storing large files (audio/video/images) in Supabase or an alternative solution.
*   Address the fine-tuning of a chunk-based approach for streaming transcriptions versus batch updates for audio notes.

Ensure the application is user-friendly, efficient, and scalable, laying a solid foundation for future feature additions. Do not include Google Meet integration or expense tracking in this phase.</project_request>

<project_rules>
- Use Vercel AI SDK for all AI-powered features, including streaming responses
- The user interaction with the app should primarily be in chat mode with a conversational interface
- All text from AI models should always stream for better user experience
- Implement responsive design patterns to ensure mobile and web compatibility
- Prioritize modern, minimalistic UI with appropriate loading states
- Ensure all generated components follow accessibility best practices
</project_rules>

<technical_specification>
- Next.js 15+ with TypeScript and React 19
- PostgreSQL with Drizzle ORM for database operations
- Next-Auth v5 for authentication
- Supabase for storage and additional database functionality
- Vercel AI SDK for LLM integration
- Tailwind CSS for styling with Radix UI primitives
- Support for multimedia content (audio, video, images)
- Deepgram API integration for audio transcription
</technical_specification>

<starter_template>
This is a Next.js-based AI chatbot application with TypeScript. It's a sophisticated chat application that allows users to interact with AI models, create documents, and manage artifacts.

### Project Structure

1. **Framework**: Next.js 15 with TypeScript and React 19
2. **Database**: PostgreSQL with Drizzle ORM for database operations
3. **Authentication**: Next-Auth v5 for user authentication
4. **Styling**: Tailwind CSS for styling
5. **UI Components**: Uses Radix UI primitives and custom components

### Main Components

1. **Auth System**:
   - Login and registration flows in `app/(auth)` directory
   - Authentication managed by Next-Auth

2. **Chat Interface**:
   - Main chat functionality in `app/(chat)` directory
   - Components for messages, chat history, and interactions

3. **Database Schema**:
   - User management
   - Chat and message storage
   - Document management
   - Voting system
   - Suggestions system

4. **UI Components**:
   - Rich set of components in the `components` directory for various features:
     - Message display and editing
     - Code editor
     - Text editor
     - Document previews and management
     - Artifacts management
     - Weather widget

5. **AI Integration**:
   - Uses AI SDK with support for multiple AI models
   - Handles streaming responses and multimodal inputs

### Key Features

1. **Chat Management**:
   - Public and private chat visibility
   - Message history
   - Model selection

2. **Document Management**:
   - Code editing with syntax highlighting
   - Text editing with markdown support
   - Image editing
   - Spreadsheet support

3. **Collaborative Features**:
   - Suggestions system
   - Voting on messages
   - Document sharing

4. **Code-related Features**:
   - Code editor with syntax highlighting
   - Console for code execution feedback
   - Diff view for code comparison
</starter_template>

After reviewing these inputs, your task is to create a comprehensive, detailed plan for implementing the web application.

Before creating the final plan, analyze the inputs and plan your approach. Wrap your thought process in <brainstorming> tags.

Break down the development process into small, manageable steps that can be executed sequentially by a code generation AI.

Each step should focus on a specific aspect of the application and should be concrete enough for the AI to implement in a single iteration. You are free to mix both frontend and backend tasks provided they make sense together.

When creating your plan, follow these guidelines:

1. Start with the core project structure and essential configurations.
2. Progress through database schema, server actions, and API routes.
3. Move on to shared components and layouts.
4. Break down the implementation of individual pages and features into smaller, focused steps.
5. Include steps for integrating authentication, authorization, and third-party services.
6. Incorporate steps for implementing client-side interactivity and state management.
7. Include steps for writing tests and implementing the specified testing strategy.
8. Ensure that each step builds upon the previous ones in a logical manner.

Present your plan using the following markdown-based format. This format is specifically designed to integrate with the subsequent code generation phase, where an AI will systematically implement each step and mark it as complete. Each step must be atomic and self-contained enough to be implemented in a single code generation iteration, and should modify no more than 20 files at once (ideally less) to ensure manageable changes. Make sure to include any instructions the user should follow for things you can't do like installing libraries, updating configurations on services, etc (Ex: Running a SQL script for storage bucket RLS policies in the Supabase editor).

```md
# Implementation Plan

## [Section Name]
- [ ] Step 1: [Brief title]
  - **Task**: [Detailed explanation of what needs to be implemented]
  - **Files**: [Maximum of 20 files, ideally less]
    - `path/to/file1.ts`: [Description of changes]
  - **Step Dependencies**: [Step Dependencies]
  - **User Instructions**: [Instructions for User]

[Additional steps...]
```

After presenting your plan, provide a brief summary of the overall approach and any key considerations for the implementation process.

Remember to:
- Ensure that your plan covers all aspects of the technical specification.
- Break down complex features into smaller, manageable tasks.
- Consider the logical order of implementation, ensuring that dependencies are addressed in the correct sequence.
- Include steps for error handling, data validation, and edge case management.

Begin your response with your brainstorming, then proceed to the creation your detailed implementation plan for the web application based on the provided specification.

Once you are done, we will pass this specification to the AI code generation system. 