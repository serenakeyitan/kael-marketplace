## **📄 PRD / Project Brief**

### **Project: Kael Skill Marketplace**

### **1. Background / Context**

I’m working on **Kael.im**, a chat-based AI agent product.



Kael is similar in spirit to tools like Claude / Minus-style agents:



- Users chat with Kael
- Kael can run **Skills** (mini tools, workflows, or capabilities)
- Skills extend what Kael can do (e.g. flashcards, mind maps, citation checking, quizzes, etc.)

Right now, Skills exist but **there is no proper discovery, management, or creation flow**.

This creates friction:



- Users don’t know what Skills exist
- Users can’t easily try or reuse Skills
- Creators can’t publish Skills in a structured way



The goal of this project is to build a **Skill Marketplace UI** for Kael.



This Marketplace allows users to:



- Browse and search Skills
- Instantly use a Skill inside Kael (“Use in Kael”)
- Manage installed Skills
- Upload and manage their own Skills





------





### **2. Motivation / Why this matters**





Kael is most powerful when users **don’t need to leave the chat**.



The Skill Marketplace exists to:



- Reduce discovery friction
- Turn Skills into first-class reusable objects
- Encourage a creator ecosystem
- Make “Use this skill” a **one-click mental model**





The UX goal is:



> Browse → Understand → Click “Use in Kael” → Immediately apply in chat



------





### **3. Reference Product (Strong Inspiration)**





You should heavily reference and borrow patterns from:



**https://skillsmp.com/**



This site already demonstrates:



- Skill discovery patterns
- Category navigation
- Skill cards
- Detail pages
- Marketplace mental model





You are encouraged to **copy structure and UX patterns**, then adapt to Kael’s context.



------





### **4. Core Concept: What is a Skill?**





A **Skill** is:



- A reusable capability Kael can run
- Activated from chat
- Configurable per use
- Can be created by users or the Kael team





Examples:



- Flashcard Skill
- Quiz Skill
- Mind Map Skill
- Citation Checker Skill





------





### **5. User Personas**





1. **Skill User**

   

   - Wants to solve a problem quickly
   - Doesn’t want setup
   - Cares about “what does this do?”

   

2. **Skill Creator**

   

   - Wants to publish a Skill
   - Wants others to use it
   - Needs basic analytics / visibility

   





------





### **6. Functional Requirements**







#### **6.1 Marketplace Home (Discovery)**



Purpose: Let users discover Skills.



Features:



- Search bar (keyword-based)
- Category / tag filtering
- Sorting (e.g. Popular, New, Recently Updated)
- Skill card grid or list





Each Skill card shows:



- Skill name
- One-line description
- Tags / category
- Usage indicator (e.g. installs or usage count)
- Primary CTA: **“Use in Kael”**
- Secondary CTA: “View details”





------





#### **6.2 Skill Detail Page**



Purpose: Let users understand a Skill and decide to use it.



Page sections:



- Skill name + short description
- Author (user or official)
- Use case explanation
- Example / demo (textual or visual)
- Metadata (tags, last updated, version)





Primary CTA:



- **“Use in Kael”** (very prominent)





Secondary actions:



- Install / Save (optional)
- View related skills





Clicking “Use in Kael” should:



- Redirect user into Kael chat
- Pre-load the Skill
- Allow immediate execution in chat





------





#### **6.3 Skill Usage Flow (Critical)**



This is the core UX promise.



Flow:



1. User browses marketplace
2. Clicks “Use in Kael”
3. Lands inside Kael chat
4. Skill is attached / activated
5. User can immediately interact with the Skill via chat





No configuration screens before chat unless absolutely required.



------





#### **6.4 Installed Skills / My Skills**



Purpose: Let users manage Skills they use.



Tabs:



- Installed Skills
- Uploaded Skills (if creator)





Installed Skills:



- List of Skills user has used or saved
- Enable / Disable
- Remove





Uploaded Skills:



- Skills user has published
- Edit metadata
- View usage stats (simple)





------





#### **6.5 Create / Upload Skill**



Purpose: Enable creators.



Flow:



- Upload Skill

- Fill in:

  

  - Name
  - Description
  - Tags
  - Example usage

  

- Publish to Marketplace





Assume:



- Validation is basic
- All backend APIs can be placeholders
- Claude Code can invent internal APIs as needed





------





### **7. Non-Goals (Out of Scope)**





- Monetization
- Reviews / ratings
- Complex permissions
- Advanced analytics





------





### **8. Technical Assumptions**





- APIs can be mocked or placeholder
- Claude Code can design internal data models freely
- Focus is UI + UX flow, not backend correctness





------





### **9. Design Principles**





- Chat-first UX
- Minimal steps to usage
- Marketplace feels lightweight, not an app store monster
- Strong CTA clarity (“Use in Kael”)





------





### **10. Success Criteria**





This project is successful if:



- A new user can find a Skill in < 10 seconds
- A user can activate a Skill with one click
- Users understand what a Skill does without documentation
- Marketplace feels like an extension of chat, not a separate product





------





### **11. Your Task (Claude Code)**





Your job:



- Design the UI structure
- Propose page layouts
- Define components
- Assume APIs exist
- Optimize for clarity and speed