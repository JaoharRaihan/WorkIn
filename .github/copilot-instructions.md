WorkIn is a professional skills + verified hiring platform where users can switch between Candidate Mode and HR Mode.
It eliminates job postings and applying (a waste of time/money) by replacing them with verified skills, projects, tests, and progress tracking.
👉 Candidates learn + prove themselves.
👉 HRs search + hire instantly.
No spam. No endless applications. Just trusted matches.

🎯 Core Concept

Candidate Mode → roadmaps, verified tests, progress heatmap, projects, fun-with-learning feed.

HR Mode → search/filter verified candidates, view profiles with badges, request interviews.

Social Feed → not forced networking → fun, addictive, learning-first social experience.

⚡ Unique Differentiation

No Job Posts / No Applying → saves time, builds trust.

Fun-with-Learning Feed → TikTok-like addictive scroll, but every swipe = smarter.

Roadmaps + Verified Tests → transparent progress + credibility.

Mode Switch Button → one app, two roles.

Trust-first → badges, proof-of-work, visible learning, not empty resumes.

This makes WorkIn stand out from LinkedIn (spammy) and OpenAI Jobs (AI-only matching) → because WorkIn is community + gamification + proof.

🛠️ Copilot Development Guidelines
1. Feed (Replace Existing Feed)

Implement Fun-with-Learning Feed with these content types:

Milestone Posts (badges, streaks, roadmap steps).

Project Posts (repo, media).

Mentor Tip Posts (short tips/videos).

Challenge Posts (micro-quizzes, puzzles).

AI Insight Posts (personalized recommendations).

Interactions

Double-tap = Clap + endorse skill (with XP animation).

Long-press = Save to roadmap or challenge.

Swipe right = endorse skill.

Swipe left = save/share.

UI Layout

Top bar: search, notifications, HR toggle.

Horizontal story rail: “Skill Moments” (streaks, milestones).

Vertical infinite feed (FlashList/RecyclerListView).

Floating quick bar: post, challenge, friends, messages.

Edge drawers: left = friends, right = messages.

Gamification

XP + badges for reactions, solving challenges, streaks.

Animations: confetti 🎉 for milestones, flame 🔥 for streaks.

2. Candidate Mode

Profile setup + skills.

Roadmaps with heatmap + step tracking.

Verified tests (MCQ, coding, project upload).

Auto-generated posts into feed (badges, milestones).

3. HR Mode

HR Dashboard with filters + quick candidate search.

Candidate profile viewer (roadmap progress, verified tests, projects).

Save candidate / send interview request.

Switch back via navbar toggle.

4. Database Schema (Key Tables)

Users (id, name, role, profile, mode).

Roadmaps (id, title, steps).

UserRoadmapProgress (userId, roadmapId, step, status).

Tests (id, type, skill, questions).

UserTestResults (userId, testId, score, proof).

FeedPosts (id, userId, type, content, metadata).

HR_SavedCandidates (hrId, candidateId).

InterviewRequests (hrId, candidateId, status).

MentorReviews (mentorId, candidateId, review, rating).

5. API Endpoints

Auth/Shared → signup, login, toggleMode, get/update profile.

Candidate → roadmaps, progress, tests, submit test, feed.

HR → candidate search/filter, save, interview requests.

Mentor → submit review.

6. Tech Guidelines

Use functional components + hooks in React Native.

Keep modular components: FeedCard, StoryRail, QuickSocialBar, ChallengeCard.

Use FlashList/RecyclerListView for efficient feed.

Backend modular with controllers, models, routes.

Auth + Mode Switch must sync across app.

Focus first on MVP (feed + roadmaps + tests + HR dashboard).

Advanced features (mentor marketplace, affiliate courses, corporate labs) come later.

👉 Copilot: Always code in line with this vision.
Our goal = replace job postings + applying with verified learning, fun social engagement, and trust-first hiring.