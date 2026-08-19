import random


# =========================================================
# TECHNICAL QUESTIONS
# =========================================================

TECHNICAL_QUESTIONS = {

    "Python": [
        (
            "Explain Python decorators.",
            "Medium",
            "A decorator is a function that modifies or extends the behavior of another function without changing its original code. It is commonly used for logging, authentication, validation, and timing."
        ),
        (
            "What are Python generators?",
            "Medium",
            "Generators are functions that produce values one at a time using the yield keyword. They are memory efficient because they do not store the entire sequence in memory."
        ),
        (
            "Difference between list and tuple.",
            "Easy",
            "A list is mutable, meaning its elements can be changed after creation. A tuple is immutable. Lists are generally used for collections that may change, while tuples are useful for fixed collections of values."
        ),
        (
            "Explain multithreading in Python.",
            "Hard",
            "Multithreading allows multiple threads to execute tasks within a process. In CPython, the Global Interpreter Lock limits parallel execution of Python bytecode, so threads are more useful for I/O-bound tasks than CPU-bound tasks."
        ),
    ],

    "Java": [
        (
            "Explain JVM, JDK and JRE.",
            "Easy",
            "JVM executes Java bytecode. JRE provides the JVM and libraries required to run Java applications. JDK contains the JRE along with development tools such as the Java compiler."
        ),
        (
            "What is polymorphism?",
            "Easy",
            "Polymorphism allows the same interface or method name to represent different implementations. In Java, it can be achieved through method overloading and method overriding."
        ),
        (
            "Explain garbage collection.",
            "Medium",
            "Garbage collection automatically identifies objects that are no longer reachable and releases their memory. This reduces the need for manual memory management."
        ),
    ],

    "C++": [
        (
            "Explain pointers.",
            "Easy",
            "A pointer is a variable that stores the memory address of another variable. Pointers are useful for dynamic memory management, arrays, functions and data structures."
        ),
        (
            "Difference between stack and heap.",
            "Medium",
            "Stack memory is typically used for local variables and function calls and is automatically managed. Heap memory is used for dynamically allocated objects and generally requires explicit allocation and deallocation."
        ),
        (
            "Explain virtual functions.",
            "Hard",
            "A virtual function allows a derived class to override a method from a base class. When accessed through a base-class pointer or reference, the appropriate derived implementation can be selected at runtime."
        ),
    ],

    "Machine Learning": [
        (
            "Explain supervised vs unsupervised learning.",
            "Easy",
            "Supervised learning uses labeled data to learn a mapping between inputs and outputs. Unsupervised learning works with unlabeled data and attempts to discover patterns or structures such as clusters."
        ),
        (
            "How do you avoid overfitting?",
            "Medium",
            "Overfitting can be reduced using techniques such as cross-validation, regularization, dropout for neural networks, early stopping, data augmentation and by reducing unnecessary model complexity."
        ),
        (
            "Explain bias-variance tradeoff.",
            "Hard",
            "Bias represents error caused by overly simplistic assumptions, while variance represents sensitivity to changes in the training data. A good model balances both to achieve strong generalization."
        ),
    ],

    "Deep Learning": [
        (
            "What is backpropagation?",
            "Medium",
            "Backpropagation calculates gradients of the loss with respect to the model parameters by propagating the error backward through the network. These gradients are then used by an optimizer to update the weights."
        ),
        (
            "Explain CNN architecture.",
            "Medium",
            "A CNN typically uses convolution layers to extract spatial features, activation functions such as ReLU to introduce non-linearity, pooling layers to reduce dimensions, and fully connected layers for final prediction."
        ),
        (
            "Difference between CNN and RNN.",
            "Hard",
            "CNNs are primarily designed to learn spatial patterns and are commonly used for images. RNNs are designed for sequential data and are commonly used for sequences such as text or time-series data."
        ),
    ],

    "TensorFlow": [
        (
            "How do you save and load a TensorFlow model?",
            "Easy",
            "A TensorFlow/Keras model can be saved using model.save() and loaded using tf.keras.models.load_model(). This allows the trained model to be reused without retraining."
        ),
        (
            "Explain TensorFlow Sequential API.",
            "Medium",
            "The Sequential API allows layers to be added one after another to create a neural network. It is useful when the model has a simple linear stack of layers."
        ),
    ],

    "Scikit-learn": [
        (
            "Difference between fit() and transform().",
            "Easy",
            "fit() learns parameters from the training data, while transform() applies the learned transformation to data. fit_transform() performs both operations together."
        ),
        (
            "How do you perform feature scaling?",
            "Medium",
            "Feature scaling can be performed using techniques such as StandardScaler or MinMaxScaler. Scaling is especially useful for algorithms that are sensitive to feature magnitude."
        ),
    ],

    "Flask": [
        (
            "Explain Flask routing.",
            "Easy",
            "Flask routing maps URLs to Python functions. For example, a GET request to /health can be mapped to a health() function that returns the application's health status."
        ),
        (
            "How do you connect Flask with MySQL?",
            "Medium",
            "Flask can connect to MySQL using libraries such as mysql-connector-python, PyMySQL or SQLAlchemy. Database configuration should preferably be stored using environment variables rather than hardcoded credentials."
        ),
    ],

    "Django": [
        (
            "Explain Django MVT architecture.",
            "Easy",
            "Django follows the Model-View-Template architecture. Models manage data, Views contain application logic and Templates handle presentation."
        ),
        (
            "Difference between Django and Flask.",
            "Medium",
            "Django is a full-featured framework with built-in functionality such as ORM, authentication and an admin interface. Flask is lightweight and provides more flexibility by allowing developers to add the required components."
        ),
    ],

    "FastAPI": [
        (
            "Why is FastAPI faster than Flask?",
            "Medium",
            "FastAPI is built on ASGI and supports asynchronous request handling. It also uses Pydantic for validation and provides efficient API development. However, actual performance depends on the workload and implementation."
        ),
        (
            "Explain dependency injection in FastAPI.",
            "Hard",
            "FastAPI dependency injection allows reusable functions to provide common functionality such as authentication, database sessions and configuration to route handlers."
        ),
    ],

    "React": [
        (
            "Difference between props and state.",
            "Easy",
            "Props are inputs passed from a parent component to a child component and should be treated as read-only. State represents data managed by a component that can change over time."
        ),
        (
            "Explain React Hooks.",
            "Medium",
            "React Hooks allow functional components to use features such as state and lifecycle-related behavior. Common hooks include useState, useEffect and useContext."
        ),
    ],

    "SQL": [
        (
            "Difference between DELETE, DROP and TRUNCATE.",
            "Easy",
            "DELETE removes selected rows and can use a WHERE clause. TRUNCATE removes all rows from a table more directly. DROP removes the table itself, including its structure."
        ),
        (
            "Explain SQL JOINs.",
            "Easy",
            "SQL JOINs combine rows from multiple tables using related columns. Common types include INNER JOIN, LEFT JOIN, RIGHT JOIN and FULL OUTER JOIN."
        ),
        (
            "What are indexes?",
            "Hard",
            "Indexes are database structures that can improve the speed of data retrieval. However, they consume storage and can increase the cost of INSERT, UPDATE and DELETE operations."
        ),
    ],

    "Git": [
        (
            "Difference between merge and rebase.",
            "Medium",
            "Merge combines branches while preserving their existing history and may create a merge commit. Rebase moves commits onto another base and creates a more linear history but rewrites commit history."
        ),
        (
            "Explain Git branching strategy.",
            "Medium",
            "A branching strategy separates development work into branches such as feature, development and main. Developers can implement and test features independently before merging reviewed changes."
        ),
    ],

    "Docker": [
        (
            "What is Docker?",
            "Easy",
            "Docker is a containerization platform used to package an application and its dependencies into a portable container. This helps maintain consistency across development and deployment environments."
        ),
        (
            "Difference between Docker Image and Container.",
            "Easy",
            "A Docker image is a read-only template containing the application and its dependencies. A container is a running instance of that image."
        ),
    ],

    "AWS": [
        (
            "What is EC2?",
            "Easy",
            "Amazon EC2 provides scalable virtual computing capacity in the AWS cloud. It allows users to run applications on virtual servers with configurable resources."
        ),
        (
            "Explain S3 storage.",
            "Easy",
            "Amazon S3 is an object storage service used to store and retrieve files and other objects. It is commonly used for documents, images, backups and application assets."
        ),
    ],
}


# =========================================================
# HR QUESTIONS
# =========================================================

HR_QUESTIONS = [
    (
        "Tell me about yourself.",
        "I am a Computer Science graduate specializing in Artificial Intelligence and Machine Learning. I have practical experience with Python, machine learning, web development, APIs and databases. I have worked on projects involving AI, IoT and full-stack development, and I enjoy solving practical problems through technology."
    ),

    (
        "Why should we hire you?",
        "I bring a combination of programming fundamentals, machine learning knowledge and practical project experience. I am comfortable learning new technologies, debugging problems and working across different parts of an application. I am also motivated to continuously improve and contribute to the team."
    ),

    (
        "What are your strengths?",
        "My strengths are problem-solving, adaptability and continuous learning. I like breaking complex problems into smaller components and solving them systematically. I also enjoy learning new technologies through hands-on projects."
    ),

    (
        "What are your weaknesses?",
        "One area I am improving is prioritization. Sometimes I spend additional time refining individual features. I am addressing this by setting milestones, completing core functionality first and then working on improvements."
    ),

    (
        "Where do you see yourself in 5 years?",
        "In five years, I want to be a strong software or AI/ML engineer capable of designing reliable production systems. I also want to take ownership of projects, contribute to technical decisions and continue developing my expertise."
    ),

    (
        "Describe a difficult situation and how you handled it.",
        "When I encounter a difficult technical problem, I first isolate the issue, reproduce it and identify the root cause. I then test possible solutions one at a time and verify the result before integrating the fix."
    ),

    (
        "Why do you want to join our company?",
        "I want to join a company where I can work on real-world engineering problems, learn from experienced developers and contribute to meaningful products. I am particularly interested in opportunities where I can apply my programming and AI/ML skills."
    ),

    (
        "Tell me about a project you are proud of.",
        "One project I am proud of is AgriGuard, an AI and IoT-based crop monitoring and smart irrigation system. It combines sensor data, machine learning and backend technologies to support crop monitoring and intelligent irrigation decisions."
    ),

    (
        "How do you handle deadlines?",
        "I divide the work into smaller tasks, prioritize the most important functionality and track progress against milestones. If I identify a blocker, I address it early rather than waiting until the deadline."
    ),

    (
        "Describe your teamwork experience.",
        "I believe effective teamwork requires clear communication, responsibility and respect for other team members. I make sure my work is organized, communicate blockers early and test my changes before integrating them with the team's work."
    ),
]


# =========================================================
# CODING QUESTIONS
# =========================================================

CODING_QUESTIONS = [
    (
        "Reverse a string.",
        "Easy",
        "Use slicing or iterate through the string from the end to the beginning.",
        "def reverse_string(s):\n    return s[::-1]",
        "Time: O(n), Space: O(n)"
    ),

    (
        "Reverse a linked list.",
        "Easy",
        "Use three pointers: previous, current and next_node.",
        "def reverse_linked_list(head):\n    previous = None\n    current = head\n\n    while current:\n        next_node = current.next\n        current.next = previous\n        previous = current\n        current = next_node\n\n    return previous",
        "Time: O(n), Space: O(1)"
    ),

    (
        "Find duplicate elements in an array.",
        "Easy",
        "Use a set to keep track of values that have already been seen.",
        "def find_duplicates(nums):\n    seen = set()\n    duplicates = set()\n\n    for num in nums:\n        if num in seen:\n            duplicates.add(num)\n        else:\n            seen.add(num)\n\n    return list(duplicates)",
        "Time: O(n), Space: O(n)"
    ),

    (
        "Longest substring without repeating characters.",
        "Medium",
        "Use a sliding window with a set to maintain characters currently inside the window.",
        "def longest_substring(s):\n    seen = set()\n    left = 0\n    maximum = 0\n\n    for right in range(len(s)):\n        while s[right] in seen:\n            seen.remove(s[left])\n            left += 1\n\n        seen.add(s[right])\n        maximum = max(maximum, right - left + 1)\n\n    return maximum",
        "Time: O(n), Space: O(n)"
    ),

    (
        "Merge two sorted arrays.",
        "Medium",
        "Use two pointers to compare elements from both sorted arrays and append the smaller value.",
        "def merge_sorted(a, b):\n    i = 0\n    j = 0\n    result = []\n\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            result.append(a[i])\n            i += 1\n        else:\n            result.append(b[j])\n            j += 1\n\n    result.extend(a[i:])\n    result.extend(b[j:])\n    return result",
        "Time: O(n + m), Space: O(n + m)"
    ),

    (
        "Implement LRU Cache.",
        "Hard",
        "Use a hash map for O(1) lookup and a doubly linked list to maintain the order of recently used items.",
        "Use a dictionary combined with a doubly linked list. Move accessed items to the most-recent position and remove the least-recent item when capacity is exceeded.",
        "get(): O(1), put(): O(1)"
    ),

    (
        "Detect cycle in linked list.",
        "Medium",
        "Use Floyd's Cycle Detection Algorithm. Move slow by one node and fast by two nodes. If they meet, a cycle exists.",
        "def has_cycle(head):\n    slow = head\n    fast = head\n\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n\n        if slow == fast:\n            return True\n\n    return False",
        "Time: O(n), Space: O(1)"
    ),

    (
        "Binary Search implementation.",
        "Easy",
        "Maintain left and right boundaries and repeatedly check the middle element.",
        "def binary_search(nums, target):\n    left = 0\n    right = len(nums) - 1\n\n    while left <= right:\n        mid = (left + right) // 2\n\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n\n    return -1",
        "Time: O(log n), Space: O(1)"
    ),

    (
        "Implement BFS and DFS.",
        "Medium",
        "BFS explores a graph level by level using a queue. DFS explores as deeply as possible before backtracking and can be implemented using recursion or a stack.",
        "BFS: use a queue.\nDFS: use recursion or a stack.",
        "Time: O(V + E)"
    ),

    (
        "Solve Two Sum problem.",
        "Easy",
        "Use a hash map to store previously visited numbers and check whether the required complement already exists.",
        "def two_sum(nums, target):\n    seen = {}\n\n    for i, num in enumerate(nums):\n        complement = target - num\n\n        if complement in seen:\n            return [seen[complement], i]\n\n        seen[num] = i\n\n    return []",
        "Time: O(n), Space: O(n)"
    ),
]


# =========================================================
# GENERATE INTERVIEW QUESTIONS
# =========================================================

def generate_interview_questions(skills, projects):
    """
    Generate structured interview questions and answers
    based on resume skills and projects.

    Returns:
        {
            "technical_questions": [...],
            "coding_questions": [...],
            "project_questions": [...],
            "hr_questions": [...]
        }
    """

    if not isinstance(skills, list):
        skills = []

    if not isinstance(projects, list):
        projects = []

    # =====================================================
    # TECHNICAL QUESTIONS
    # =====================================================

    technical = []

    for skill in skills:

        # Match skill names safely.
        matched_skill = None

        for available_skill in TECHNICAL_QUESTIONS:

            if str(skill).strip().lower() == available_skill.lower():
                matched_skill = available_skill
                break

        if not matched_skill:
            continue

        for question, difficulty, answer in TECHNICAL_QUESTIONS[
            matched_skill
        ]:

            technical.append({
                "skill": matched_skill,
                "question": question,
                "difficulty": difficulty,
                "answer": answer,
            })

    # Remove duplicate technical questions.
    unique = []
    seen = set()

    for item in technical:

        question_key = item["question"].strip().lower()

        if question_key not in seen:

            seen.add(question_key)
            unique.append(item)

    technical = unique[:10]

    # =====================================================
    # CODING QUESTIONS
    # =====================================================

    selected_coding = random.sample(
        CODING_QUESTIONS,
        min(5, len(CODING_QUESTIONS))
    )

    coding = []

    for (
        question,
        difficulty,
        approach,
        solution,
        complexity,
    ) in selected_coding:

        coding.append({
            "question": question,
            "difficulty": difficulty,
            "approach": approach,
            "solution": solution,
            "complexity": complexity,
        })

    # =====================================================
    # HR QUESTIONS
    # =====================================================

    selected_hr = random.sample(
        HR_QUESTIONS,
        min(5, len(HR_QUESTIONS))
    )

    hr = []

    for question, answer in selected_hr:

        hr.append({
            "question": question,
            "answer": answer,
        })

    # =====================================================
    # PROJECT QUESTIONS
    # =====================================================

    project_questions = []

    for project in projects:

        if isinstance(project, dict):

            title = (
                project.get("title")
                or project.get("project_title")
                or project.get("name")
                or "Project"
            )

            technologies = project.get(
                "technologies",
                []
            )

            description = project.get(
                "description",
                []
            )

        else:

            title = str(project)
            technologies = []
            description = []

        # Normalize technologies.
        if not isinstance(technologies, list):
            technologies = [technologies]

        technology_text = ", ".join(
            str(technology)
            for technology in technologies
            if technology
        )

        # Normalize description.
        if not isinstance(description, list):
            description = [description]

        # -------------------------------------------------
        # Architecture
        # -------------------------------------------------

        project_questions.append({
            "question":
                f"Explain the architecture of '{title}'.",

            "difficulty":
                "Medium",

            "answer":
                f"Explain the project as an end-to-end system. "
                f"Start with the user interface or input, then "
                f"describe the backend, APIs, database and any "
                f"AI/ML or hardware components. For '{title}', "
                f"focus on how the individual components "
                f"communicate and how data flows through the system."
        })

        # -------------------------------------------------
        # Challenges
        # -------------------------------------------------

        project_questions.append({
            "question":
                f"What challenges did you face while developing '{title}'?",

            "difficulty":
                "Medium",

            "answer":
                "A strong answer should describe one concrete "
                "technical challenge, how you investigated the "
                "root cause, the solution you implemented and "
                "the result. Mention debugging, testing and "
                "integration decisions rather than only saying "
                "that the project was difficult."
        })

        # -------------------------------------------------
        # Technologies
        # -------------------------------------------------

        if technology_text:

            project_questions.append({
                "question":
                    f"Why did you choose "
                    f"{technology_text} for '{title}'?",

                "difficulty":
                    "Medium",

                "answer":
                    f"I selected the technologies based on the "
                    f"requirements of the project. "
                    f"{technology_text} each served a specific "
                    f"role such as application development, "
                    f"database management, API development, "
                    f"machine learning or hardware integration."
            })

        # -------------------------------------------------
        # Objective
        # -------------------------------------------------

        if description:

            project_questions.append({
                "question":
                    f"What was the main objective of '{title}'?",

                "difficulty":
                    "Easy",

                "answer":
                    "The objective was to solve a practical problem "
                    "using the technologies implemented in the "
                    "project. Explain the problem, the target users, "
                    "the solution and the measurable or practical "
                    "benefit provided by the application."
            })

    # Remove duplicate project questions.
    unique_projects = []
    seen = set()

    for item in project_questions:

        question_key = item["question"].strip().lower()

        if question_key not in seen:

            seen.add(question_key)
            unique_projects.append(item)

    project_questions = unique_projects[:10]

    # =====================================================
    # FINAL RESULT
    # =====================================================

    return {
        "technical_questions": technical,
        "coding_questions": coding,
        "project_questions": project_questions,
        "hr_questions": hr,
    }