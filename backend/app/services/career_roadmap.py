from typing import List, Dict, Union


def generate_career_roadmap(
    skills: List[str],
    experience: List[Union[str, Dict]],
    recommended_jobs: Dict,
):
    """
    Generate a personalized career roadmap.
    Supports dictionary and string experience formats.
    """

    # -----------------------------------------
    # Target Role
    # -----------------------------------------

    jobs = recommended_jobs.get("recommended_jobs", [])

    if jobs:

        if isinstance(jobs[0], dict):
            target_role = jobs[0].get(
                "job_role",
                "Software Engineer",
            )
        else:
            target_role = str(jobs[0])

    else:
        target_role = "Software Engineer"

    # -----------------------------------------
    # Experience Level
    # -----------------------------------------

    internship_count = 0

    for item in experience:

        if isinstance(item, dict):

            text = (
                item.get("job_title", "")
                + " "
                + item.get("company", "")
            ).lower()

        else:

            text = str(item).lower()

        if any(
            word in text
            for word in [
                "intern",
                "developer",
                "engineer",
                "analyst",
                "scientist",
            ]
        ):
            internship_count += 1

    if internship_count <= 1:
        level = "Beginner"

    elif internship_count <= 3:
        level = "Intermediate"

    else:
        level = "Advanced"

    # -----------------------------------------
    # Base Roadmap
    # -----------------------------------------

    roadmap = [

        {
            "phase": "Week 1-2",
            "title": "Programming Fundamentals",
            "tasks": [
                "Practice Python programming",
                "Revise OOP concepts",
                "Solve 30 LeetCode problems",
                "Practice SQL queries",
                "Git & GitHub basics",
            ],
        },

        {
            "phase": "Week 3-4",
            "title": "Core Development",
            "tasks": [
                "Build REST APIs",
                "Database Design",
                "Debug applications",
                "Authentication & Authorization",
                "Unit Testing",
            ],
        },

        {
            "phase": "Week 5-6",
            "title": "Projects",
            "tasks": [
                "Build one production-ready project",
                "Deploy using Render/Vercel",
                "Write proper README",
                "Optimize GitHub repositories",
                "Create portfolio website",
            ],
        },

        {
            "phase": "Week 7-8",
            "title": "Interview Preparation",
            "tasks": [
                "Practice DSA",
                "Mock interviews",
                "HR interview questions",
                "System Design basics",
                "Resume optimization",
            ],
        },

    ]

    # -----------------------------------------
    # Role Specific Roadmap
    # -----------------------------------------

    role = target_role.lower()

    if (
        "machine learning" in role
        or "ai" in role
    ):

        roadmap.insert(
            2,
            {
                "phase": "Week 5",
                "title": "Machine Learning",
                "tasks": [
                    "Scikit-learn",
                    "Feature Engineering",
                    "Model Evaluation",
                    "TensorFlow",
                    "PyTorch Basics",
                    "NLP",
                    "OpenCV",
                ],
            },
        )

    elif "data scientist" in role:

        roadmap.insert(
            2,
            {
                "phase": "Week 5",
                "title": "Data Science",
                "tasks": [
                    "Pandas",
                    "NumPy",
                    "Statistics",
                    "EDA",
                    "Visualization",
                    "Power BI",
                ],
            },
        )

    elif "full stack" in role:

        roadmap.insert(
            2,
            {
                "phase": "Week 5",
                "title": "Full Stack Development",
                "tasks": [
                    "React.js",
                    "Node.js",
                    "Express.js",
                    "JWT Authentication",
                    "REST APIs",
                    "MongoDB",
                ],
            },
        )

    elif "backend" in role:

        roadmap.insert(
            2,
            {
                "phase": "Week 5",
                "title": "Backend Development",
                "tasks": [
                    "FastAPI",
                    "Flask",
                    "Django",
                    "PostgreSQL",
                    "Docker",
                ],
            },
        )

    elif "cloud" in role:

        roadmap.insert(
            2,
            {
                "phase": "Week 5",
                "title": "Cloud Computing",
                "tasks": [
                    "AWS",
                    "Azure",
                    "Docker",
                    "Kubernetes",
                    "Cloud Deployment",
                ],
            },
        )

    elif "devops" in role:

        roadmap.insert(
            2,
            {
                "phase": "Week 5",
                "title": "DevOps",
                "tasks": [
                    "Linux",
                    "Docker",
                    "Kubernetes",
                    "CI/CD",
                    "GitHub Actions",
                    "AWS",
                ],
            },
        )

    # -----------------------------------------
    # Recommended Learning
    # -----------------------------------------

    learning_path = recommended_jobs.get(
        "learning_path",
        [],
    )

    if not learning_path:

        learning_path = [
            "Data Structures & Algorithms",
            "System Design",
            "SQL",
            "Git & GitHub",
            "Docker",
            "Cloud Fundamentals",
        ]

    # -----------------------------------------
    # Recommended Certifications
    # -----------------------------------------

    certifications = [
        "AWS Cloud Practitioner",
        "Microsoft Azure AI Fundamentals",
        "TensorFlow Developer Certificate",
        "Google Data Analytics",
        "Oracle SQL",
    ]

    # -----------------------------------------
    # Learning Resources
    # -----------------------------------------

    resources = [
        "LeetCode",
        "HackerRank",
        "GeeksforGeeks",
        "Coursera",
        "Udemy",
        "freeCodeCamp",
        "Kaggle",
        "GitHub",
    ]

    # -----------------------------------------
    # Return
    # -----------------------------------------

    return {

        "target_role": target_role,

        "current_level": level,

        "current_skills": skills,

        "recommended_learning": learning_path,

        "recommended_certifications": certifications,

        "learning_resources": resources,

        "roadmap": roadmap,

        "tips": [

            "Build at least 5 production-ready projects.",

            "Contribute to open-source repositories.",

            "Keep your GitHub profile active.",

            "Optimize your LinkedIn profile.",

            "Solve coding problems every day.",

            "Participate in hackathons.",

            "Practice mock interviews weekly.",

            "Customize your resume for every job application.",

            "Write technical blogs on your projects.",

            "Keep learning new technologies consistently.",

        ],

    }