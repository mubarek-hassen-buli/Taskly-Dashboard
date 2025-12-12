

##  1) What we are building (in one sentence)

We are building Smart Task Creation, a feature where a user types natural language and your system automatically creates structured tasks using AI, safely and predictably.

Example from user view:

“Finish auth UI tomorrow, review PR Friday, plan sprint next week”

✅ Tasks appear in the dashboard instantly.

## 2) What the user will see (UX flow)

From the user’s perspective, the app works like this:

User opens dashboard

User sees a textbox called something like “Create tasks with AI”

User types natural language

User clicks Create

Tasks appear in the task list

User can edit or delete them normally

No forms. No dates picker. No complexity.

It feels automatic ✨

## 3) What YOU are actually building (real architecture)

Behind the scenes, we are building three controlled layers.

React (UI)
   ↓
Convex Action (AI logic)
   ↓
Convex Mutation (DB writes)


Each layer has one responsibility only.

## 4) Layer 1: React + Vite (Frontend)
Role

Collect text from user

Trigger task creation

Show results immediately

What React does NOT do

No AI calls

No prompt logic

No API keys

No task parsing

React is just the messenger 📬

## 5) Layer 2: Convex Action (Brain)

This is the core of the feature.

Responsibilities

Receive raw user text

Attach the system prompt

Call Gemini 2.5 Flash

Receive AI response

Parse JSON

Validate structure

Return clean task objects

What it does NOT do

No UI

No styling

No guessing business rules

No uncontrolled DB writes

Think of it as a translator + gatekeeper.

## 6) Layer 3: Convex Mutation (Database)
Responsibilities

Take validated task objects

Insert them into the tasks table

Assign ownership to the user

Set default status like todo

What it does NOT do

No AI calls

No text parsing

No user input handling

It only writes trusted data.

## 7) What AI is actually responsible for

This is critical.

AI does ONLY this:

Human language → Structured JSON


It does NOT:

Decide app behavior

Control database

Control permissions

Run business logic

AI is a helper, not a boss.

## 8) Data flow in one clear timeline

Here is the exact timeline of one request:

User types text

React calls parseTasksWithAI

Convex Action adds system prompt

Gemini returns JSON

Convex validates data

Convex calls createTasks mutation

Tasks are saved

Convex reactivity updates UI

Every step is deterministic ✅

## 9) What makes this “automatic” but safe

Automatic because:

One input

One click

Tasks appear instantly

Safe because:

AI output is validated

User ownership is enforced

No frontend keys

No direct AI-to-DB writes

This is production-safe AI, not a demo hack.

## 10) What we will NOT build (on purpose)

We are NOT building:

General-purpose chatbot

AI that modifies tasks randomly

AI that runs in the browser

AI that guesses user permissions

Avoiding these keeps your app clean and scalable.

## 11) Final mental model you should remember

You are NOT adding “AI features”.

You are adding:

A smarter input method

That is why this feature fits perfectly in a task dashboard.