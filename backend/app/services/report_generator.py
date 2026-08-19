from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle,
)
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def safe_text(value, default=""):
    """
    Safely convert any value into text suitable for ReportLab.
    """

    if value is None:
        return default

    if isinstance(value, (list, tuple)):
        return ", ".join(
            str(item)
            for item in value
            if item is not None
        )

    if isinstance(value, dict):
        return str(value)

    return str(value)


def safe_paragraph_text(value):
    """
    Escape special XML/HTML characters before passing
    text into ReportLab Paragraph.
    """

    text = safe_text(value)

    return escape(text)


def get_dict(value):
    """
    Return a dictionary or an empty dictionary.
    """

    if isinstance(value, dict):
        return value

    return {}


def get_list(value):
    """
    Return a list or an empty list.
    """

    if isinstance(value, list):
        return value

    if value is None:
        return []

    return [value]


def get_score(data, possible_keys):
    """
    Safely extract a score from a dictionary.
    """

    if isinstance(data, (int, float)):
        return data

    if not isinstance(data, dict):
        return 0

    for key in possible_keys:

        value = data.get(key)

        if value is not None:

            try:
                return float(value)
            except (TypeError, ValueError):
                pass

    return 0


# =========================================================
# PAGE FOOTER
# =========================================================

def add_page_number(canvas, doc):
    """
    Add page number to every PDF page.
    """

    canvas.saveState()

    canvas.setFont("Helvetica", 8)

    canvas.setFillColor(colors.grey)

    canvas.drawCentredString(
        A4[0] / 2,
        10 * mm,
        f"AI Resume Analyzer • Page {doc.page}",
    )

    canvas.restoreState()


# =========================================================
# MAIN PDF GENERATOR
# =========================================================

def generate_pdf_report(output_path, analysis):
    """
    Generate a complete AI Resume Analyzer PDF report.

    Parameters
    ----------
    output_path : str
        Location where the PDF should be created.

    analysis : dict
        Complete resume analysis response.

    Returns
    -------
    str
        Generated PDF path.
    """

    print("\n" + "=" * 70)
    print("PDF REPORT GENERATOR")
    print("=" * 70)

    # -----------------------------------------------------
    # Validate analysis
    # -----------------------------------------------------

    if not isinstance(analysis, dict):

        raise ValueError(
            "PDF generator received invalid analysis data."
        )

    # -----------------------------------------------------
    # Prepare output directory
    # -----------------------------------------------------

    output_path = Path(output_path)

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    print("Output path:")
    print(output_path)

    # -----------------------------------------------------
    # Styles
    # -----------------------------------------------------

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1E3A8A"),
        spaceAfter=12,
    )

    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#64748B"),
        spaceAfter=20,
    )

    heading_style = ParagraphStyle(
        "ReportHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=19,
        textColor=colors.HexColor("#1E3A8A"),
        spaceBefore=12,
        spaceAfter=9,
    )

    subheading_style = ParagraphStyle(
        "ReportSubHeading",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#334155"),
        spaceBefore=6,
        spaceAfter=4,
    )

    normal_style = ParagraphStyle(
        "ReportNormal",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=5,
    )

    small_style = ParagraphStyle(
        "ReportSmall",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#64748B"),
    )

    score_style = ParagraphStyle(
        "ScoreStyle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1E3A8A"),
    )

    # -----------------------------------------------------
    # Interview styles
    # -----------------------------------------------------

    interview_question_style = ParagraphStyle(
        "InterviewQuestion",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=15,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=5,
        spaceAfter=4,
    )

    interview_meta_style = ParagraphStyle(
        "InterviewMeta",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#2563EB"),
        spaceAfter=5,
    )

    interview_answer_style = ParagraphStyle(
        "InterviewAnswer",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.2,
        leading=14,
        leftIndent=8,
        rightIndent=4,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6,
    )

    interview_label_style = ParagraphStyle(
        "InterviewLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1E3A8A"),
        spaceBefore=3,
        spaceAfter=3,
    )

    interview_code_style = ParagraphStyle(
        "InterviewCode",
        parent=styles["Code"],
        fontName="Courier",
        fontSize=7.8,
        leading=10.5,
        leftIndent=8,
        rightIndent=8,
        spaceBefore=3,
        spaceAfter=7,
        backColor=colors.HexColor("#F1F5F9"),
        borderColor=colors.HexColor("#CBD5E1"),
        borderWidth=0.5,
        borderPadding=7,
    )

    roadmap_task_style = ParagraphStyle(
        "RoadmapTask",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.2,
        leading=13,
        leftIndent=10,
        textColor=colors.HexColor("#334155"),
        spaceAfter=3,
    )

    # -----------------------------------------------------
    # Document
    # -----------------------------------------------------

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="AI Resume Analyzer Report",
        author="AI Resume Analyzer",
    )

    story = []

    # =====================================================
    # TITLE
    # =====================================================

    story.append(
        Paragraph(
            "AI Resume Analyzer Report",
            title_style,
        )
    )

    story.append(
        Paragraph(
            "Resume Analysis • ATS Evaluation • Job Match",
            subtitle_style,
        )
    )

    # =====================================================
    # CANDIDATE INFORMATION
    # =====================================================

    story.append(
        Paragraph(
            "Candidate Information",
            heading_style,
        )
    )

    candidate = get_dict(
        analysis.get("candidate")
    )

    name = safe_text(
        candidate.get("name"),
        "Not available",
    )

    email = safe_text(
        candidate.get("email"),
        "Not available",
    )

    phone = safe_text(
        candidate.get("phone"),
        "Not available",
    )

    linkedin = safe_text(
        candidate.get("linkedin"),
        "",
    )

    github = safe_text(
        candidate.get("github"),
        "",
    )

    candidate_rows = [
        [
            Paragraph("<b>Name</b>", normal_style),
            Paragraph(
                safe_paragraph_text(name),
                normal_style,
            ),
        ],
        [
            Paragraph("<b>Email</b>", normal_style),
            Paragraph(
                safe_paragraph_text(email),
                normal_style,
            ),
        ],
        [
            Paragraph("<b>Phone</b>", normal_style),
            Paragraph(
                safe_paragraph_text(phone),
                normal_style,
            ),
        ],
    ]

    if linkedin:
        candidate_rows.append(
            [
                Paragraph(
                    "<b>LinkedIn</b>",
                    normal_style,
                ),
                Paragraph(
                    safe_paragraph_text(linkedin),
                    normal_style,
                ),
            ]
        )

    if github:
        candidate_rows.append(
            [
                Paragraph(
                    "<b>GitHub</b>",
                    normal_style,
                ),
                Paragraph(
                    safe_paragraph_text(github),
                    normal_style,
                ),
            ]
        )

    candidate_table = Table(
        candidate_rows,
        colWidths=[
            35 * mm,
            130 * mm,
        ],
    )

    candidate_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#EFF6FF"),
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#CBD5E1"),
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP",
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    story.append(candidate_table)

    story.append(Spacer(1, 14))

    # =====================================================
    # SUMMARY
    # =====================================================

    summary = safe_text(
        analysis.get("summary"),
        "",
    )

    if summary:

        story.append(
            Paragraph(
                "Professional Summary",
                heading_style,
            )
        )

        story.append(
            Paragraph(
                safe_paragraph_text(summary),
                normal_style,
            )
        )

    # =====================================================
    # SCORES
    # =====================================================

    story.append(
        Paragraph(
            "Resume Scores",
            heading_style,
        )
    )

    ats_score = get_score(
        analysis.get("ats_score"),
        [
            "ats_score",
            "score",
            "overall_score",
        ],
    )

    resume_score = get_score(
        analysis.get("resume_score"),
        [
            "score",
            "resume_score",
            "overall_score",
        ],
    )

    job_match = get_score(
        analysis.get("job_match"),
        [
            "match_score",
            "job_match",
            "score",
        ],
    )

    scores = [
        [
            Paragraph(
                "<b>Metric</b>",
                normal_style,
            ),
            Paragraph(
                "<b>Score</b>",
                normal_style,
            ),
        ],
        [
            Paragraph(
                "ATS Score",
                normal_style,
            ),
            Paragraph(
                f"{ats_score:.0f}/100",
                score_style,
            ),
        ],
        [
            Paragraph(
                "Resume Score",
                normal_style,
            ),
            Paragraph(
                f"{resume_score:.0f}/100",
                score_style,
            ),
        ],
        [
            Paragraph(
                "Job Match",
                normal_style,
            ),
            Paragraph(
                f"{job_match:.0f}%",
                score_style,
            ),
        ],
    ]

    score_table = Table(
        scores,
        colWidths=[
            100 * mm,
            65 * mm,
        ],
    )

    score_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#1E3A8A"),
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#CBD5E1"),
                ),
                (
                    "BACKGROUND",
                    (0, 1),
                    (-1, -1),
                    colors.HexColor("#F8FAFC"),
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
            ]
        )
    )

    story.append(score_table)

    # =====================================================
    # SKILLS
    # =====================================================

    skills = get_list(
        analysis.get("skills")
    )

    if skills:

        story.append(
            Paragraph(
                "Skills",
                heading_style,
            )
        )

        skill_text = " • ".join(
            safe_text(skill)
            for skill in skills
        )

        story.append(
            Paragraph(
                safe_paragraph_text(skill_text),
                normal_style,
            )
        )

    # =====================================================
    # EXPERIENCE
    # =====================================================

    experience = get_list(
        analysis.get("experience")
    )

    if experience:

        story.append(
            Paragraph(
                "Experience",
                heading_style,
            )
        )

        for exp in experience:

            if not isinstance(exp, dict):
                continue

            job_title = safe_text(
                exp.get("job_title")
                or exp.get("role")
                or exp.get("position")
                or exp.get("title"),
                "Professional Experience",
            )

            company = safe_text(
                exp.get("company")
                or exp.get("organization")
                or exp.get("employer"),
                "",
            )

            duration = safe_text(
                exp.get("duration")
                or exp.get("period")
                or exp.get("dates"),
                "",
            )

            story.append(
                Paragraph(
                    safe_paragraph_text(job_title),
                    subheading_style,
                )
            )

            if company:

                story.append(
                    Paragraph(
                        safe_paragraph_text(company),
                        normal_style,
                    )
                )

            if duration:

                story.append(
                    Paragraph(
                        safe_paragraph_text(duration),
                        small_style,
                    )
                )

            descriptions = get_list(
                exp.get("description")
                or exp.get("responsibilities")
                or exp.get("details")
            )

            for desc in descriptions:

                if not safe_text(desc).strip():
                    continue

                story.append(
                    Paragraph(
                        " - "
                        + safe_paragraph_text(desc),
                        normal_style,
                    )
                )

            story.append(
                Spacer(1, 8)
            )

    # =====================================================
    # EDUCATION
    # =====================================================

    education = get_list(
        analysis.get("education")
    )

    if education:

        story.append(
            Paragraph(
                "Education",
                heading_style,
            )
        )

        for edu in education:

            if not isinstance(edu, dict):
                story.append(
                    Paragraph(
                        safe_paragraph_text(edu),
                        normal_style,
                    )
                )
                continue

            degree = safe_text(
                edu.get("degree")
                or edu.get("course")
                or edu.get("qualification")
                or edu.get("title"),
                "",
            )

            institution = safe_text(
                edu.get("institution")
                or edu.get("university")
                or edu.get("college")
                or edu.get("school"),
                "",
            )

            duration = safe_text(
                edu.get("duration")
                or edu.get("year")
                or edu.get("dates"),
                "",
            )

            if degree:

                story.append(
                    Paragraph(
                        safe_paragraph_text(degree),
                        subheading_style,
                    )
                )

            if institution:

                story.append(
                    Paragraph(
                        safe_paragraph_text(institution),
                        normal_style,
                    )
                )

            if duration:

                story.append(
                    Paragraph(
                        safe_paragraph_text(duration),
                        small_style,
                    )
                )

            story.append(
                Spacer(1, 6)
            )

    # =====================================================
    # PROJECTS
    # =====================================================

    projects = get_list(
        analysis.get("projects")
    )

    if projects:

        story.append(
            Paragraph(
                "Projects",
                heading_style,
            )
        )

        for project in projects:

            if not isinstance(project, dict):
                continue

            title = safe_text(
                project.get("title")
                or project.get("project_title")
                or project.get("name"),
                "Project",
            )

            story.append(
                Paragraph(
                    safe_paragraph_text(title),
                    subheading_style,
                )
            )

            technologies = project.get(
                "technologies",
                [],
            )

            if isinstance(technologies, list):

                tech_text = ", ".join(
                    safe_text(tech)
                    for tech in technologies
                )

            else:

                tech_text = safe_text(
                    technologies
                )

            if tech_text:

                story.append(
                    Paragraph(
                        "<i>"
                        + safe_paragraph_text(
                            tech_text
                        )
                        + "</i>",
                        small_style,
                    )
                )

            descriptions = get_list(
                project.get("description")
                or project.get("details")
            )

            for desc in descriptions:

                if not safe_text(desc).strip():
                    continue

                story.append(
                    Paragraph(
                        " - "
                        + safe_paragraph_text(desc),
                        normal_style,
                    )
                )

            story.append(
                Spacer(1, 7)
            )

    # =====================================================
    # CERTIFICATIONS
    # =====================================================

    certifications = get_list(
        analysis.get("certifications")
    )

    if certifications:

        story.append(
            Paragraph(
                "Certifications",
                heading_style,
            )
        )

        for certification in certifications:

            if isinstance(
                certification,
                dict,
            ):

                name = safe_text(
                    certification.get("name")
                    or certification.get("title")
                    or certification.get("certificate"),
                    "",
                )

                issuer = safe_text(
                    certification.get("issuer")
                    or certification.get("organization")
                    or certification.get("provider"),
                    "",
                )

                text = name

                if issuer:
                    text += f" - {issuer}"

            else:

                text = safe_text(
                    certification
                )

            if text:

                story.append(
                    Paragraph(
                        " - "
                        + safe_paragraph_text(text),
                        normal_style,
                    )
                )

    # =====================================================
    # RESUME IMPROVEMENTS
    # =====================================================

    improvements = analysis.get(
        "resume_improvements"
    )

    if improvements:

        story.append(
            Paragraph(
                "Resume Improvement Suggestions",
                heading_style,
            )
        )

        improvement_items = []

        if isinstance(
            improvements,
            dict,
        ):

            overall = improvements.get(
                "overall",
                {},
            )

            if isinstance(
                overall,
                dict,
            ):

                improvement_items.extend(
                    get_list(
                        overall.get(
                            "feedback"
                        )
                    )
                )

                improvement_items.extend(
                    get_list(
                        overall.get(
                            "suggestions"
                        )
                    )
                )

            improvement_items.extend(
                get_list(
                    improvements.get(
                        "feedback"
                    )
                )
            )

            improvement_items.extend(
                get_list(
                    improvements.get(
                        "suggestions"
                    )
                )

            )

        else:

            improvement_items = get_list(
                improvements
            )

        # Remove duplicates

        seen = set()

        for item in improvement_items:

            text = safe_text(item).strip()

            if not text:
                continue

            normalized = text.lower()

            if normalized in seen:
                continue

            seen.add(normalized)

            story.append(
                Paragraph(
                    " - "
                    + safe_paragraph_text(text),
                    normal_style,
                )
            )

    # =====================================================
    # RESUME FEEDBACK
    # =====================================================

    feedback = analysis.get(
        "resume_feedback"
    )

    if feedback:

        story.append(
            Paragraph(
                "Resume Feedback",
                heading_style,
            )
        )

        feedback_items = []

        if isinstance(
            feedback,
            dict,
        ):

            for key in [
                "feedback",
                "suggestions",
                "strengths",
                "weaknesses",
                "recommendations",
            ]:

                feedback_items.extend(
                    get_list(
                        feedback.get(key)
                    )
                )

        else:

            feedback_items = get_list(
                feedback
            )

        for item in feedback_items:

            text = safe_text(item).strip()

            if text:

                story.append(
                    Paragraph(
                        " - "
                        + safe_paragraph_text(text),
                        normal_style,
                    )
                )

    # =====================================================
    # CAREER ROADMAP
    # =====================================================

    roadmap = analysis.get("career_roadmap")

    if roadmap:

        story.append(
            Paragraph(
                "Career Roadmap",
                heading_style,
            )
        )

        if isinstance(roadmap, dict):

            # Candidate profile
            target_role = roadmap.get("target_role")
            current_level = roadmap.get("current_level")

            profile_rows = []

            if target_role:
                profile_rows.append([
                    Paragraph("<b>Target Role</b>", normal_style),
                    Paragraph(safe_paragraph_text(target_role), normal_style),
                ])

            if current_level:
                profile_rows.append([
                    Paragraph("<b>Current Level</b>", normal_style),
                    Paragraph(safe_paragraph_text(current_level), normal_style),
                ])

            if profile_rows:
                profile_table = Table(
                    profile_rows,
                    colWidths=[42 * mm, 123 * mm],
                )

                profile_table.setStyle(
                    TableStyle(
                        [
                            (
                                "BACKGROUND",
                                (0, 0),
                                (0, -1),
                                colors.HexColor("#EFF6FF"),
                            ),
                            (
                                "GRID",
                                (0, 0),
                                (-1, -1),
                                0.5,
                                colors.HexColor("#CBD5E1"),
                            ),
                            (
                                "VALIGN",
                                (0, 0),
                                (-1, -1),
                                "TOP",
                            ),
                            (
                                "LEFTPADDING",
                                (0, 0),
                                (-1, -1),
                                7,
                            ),
                            (
                                "RIGHTPADDING",
                                (0, 0),
                                (-1, -1),
                                7,
                            ),
                            (
                                "TOPPADDING",
                                (0, 0),
                                (-1, -1),
                                5,
                            ),
                            (
                                "BOTTOMPADDING",
                                (0, 0),
                                (-1, -1),
                                5,
                            ),
                        ]
                    )
                )

                story.append(profile_table)
                story.append(Spacer(1, 10))

            # Skills and recommendations
            for key in [
                "current_skills",
                "recommended_learning",
                "recommended_certifications",
                "learning_resources",
            ]:

                value = roadmap.get(key)

                if not value:
                    continue

                display_name = key.replace("_", " ").title()

                story.append(
                    Paragraph(
                        safe_paragraph_text(display_name),
                        subheading_style,
                    )
                )

                for item in get_list(value):

                    if isinstance(item, dict):
                        # Avoid printing a raw dictionary.
                        label = (
                            item.get("title")
                            or item.get("name")
                            or item.get("phase")
                            or ""
                        )
                        details = item.get("tasks") or item.get("description") or []

                        if label:
                            story.append(
                                Paragraph(
                                    safe_paragraph_text(label),
                                    interview_label_style,
                                )
                            )

                        for detail in get_list(details):
                            story.append(
                                Paragraph(
                                    "• " + safe_paragraph_text(detail),
                                    roadmap_task_style,
                                )
                            )

                    else:
                        story.append(
                            Paragraph(
                                "• " + safe_paragraph_text(item),
                                roadmap_task_style,
                            )
                        )

            # Weekly / phase roadmap
            phases = roadmap.get("roadmap")

            if phases:
                story.append(
                    Paragraph(
                        "Learning Phases",
                        subheading_style,
                    )
                )

                for phase in get_list(phases):

                    if not isinstance(phase, dict):
                        story.append(
                            Paragraph(
                                "• " + safe_paragraph_text(phase),
                                roadmap_task_style,
                            )
                        )
                        continue

                    phase_title = safe_text(
                        phase.get("title")
                        or phase.get("phase")
                        or "Learning Phase"
                    )

                    story.append(
                        Paragraph(
                            safe_paragraph_text(phase_title),
                            interview_label_style,
                        )
                    )

                    tasks = get_list(phase.get("tasks"))

                    for task in tasks:
                        story.append(
                            Paragraph(
                                "• " + safe_paragraph_text(task),
                                roadmap_task_style,
                            )
                        )

            tips = roadmap.get("tips")

            if tips:
                story.append(
                    Paragraph(
                        "Career Tips",
                        subheading_style,
                    )
                )

                for tip in get_list(tips):
                    story.append(
                        Paragraph(
                            "• " + safe_paragraph_text(tip),
                            roadmap_task_style,
                        )
                    )

        else:
            story.append(
                Paragraph(
                    safe_paragraph_text(roadmap),
                    normal_style,
                )
            )

    # =====================================================
    # INTERVIEW QUESTIONS
    # =====================================================

    interview_data = analysis.get("interview_questions")

    if interview_data:

        story.append(
            Paragraph(
                "Interview Preparation",
                heading_style,
            )
        )

        # The analyzer may return:
        # [
        #   {
        #       "technical_questions": [...],
        #       "coding_questions": [...],
        #       "project_questions": [...],
        #       "hr_questions": [...]
        #   }
        # ]
        #
        # It may also return the category dictionary directly.

        if isinstance(interview_data, list) and len(interview_data) == 1:
            if isinstance(interview_data[0], dict):
                interview_data = interview_data[0]

        if isinstance(interview_data, dict):

            categories = [
                ("technical_questions", "Technical Questions"),
                ("coding_questions", "Coding Questions"),
                ("project_questions", "Project Questions"),
                ("hr_questions", "HR Questions"),
            ]

            for category_key, category_title in categories:

                questions = interview_data.get(category_key)

                if not questions:
                    continue

                story.append(
                    Paragraph(
                        safe_paragraph_text(category_title),
                        subheading_style,
                    )
                )

                for index, item in enumerate(
                    get_list(questions),
                    start=1,
                ):

                    if not isinstance(item, dict):
                        question_text = safe_text(item)
                        difficulty = ""
                        answer = ""
                        approach = ""
                        solution = ""
                        complexity = ""

                    else:
                        question_text = safe_text(
                            item.get("question")
                            or item.get("text")
                            or item.get("query"),
                            "Interview Question",
                        )

                        difficulty = safe_text(
                            item.get("difficulty")
                            or item.get("level"),
                            "",
                        )

                        answer = safe_text(
                            item.get("answer")
                            or item.get("sample_answer")
                            or item.get("explanation"),
                            "",
                        )

                        approach = safe_text(
                            item.get("approach")
                            or item.get("solution_approach"),
                            "",
                        )

                        solution = safe_text(
                            item.get("solution")
                            or item.get("code")
                            or item.get("python_solution"),
                            "",
                        )

                        complexity = safe_text(
                            item.get("complexity")
                            or item.get("time_complexity"),
                            "",
                        )

                    # Question
                    story.append(
                        Paragraph(
                            f"<b>{index}.</b> "
                            + safe_paragraph_text(question_text),
                            interview_question_style,
                        )
                    )

                    # Difficulty
                    if difficulty:
                        story.append(
                            Paragraph(
                                "<b>Difficulty:</b> "
                                + safe_paragraph_text(difficulty),
                                interview_meta_style,
                            )
                        )

                    # Answer
                    if answer:
                        story.append(
                            Paragraph(
                                "<b>Answer</b>",
                                interview_label_style,
                            )
                        )

                        # Preserve simple line breaks in answers.
                        answer_html = safe_paragraph_text(answer).replace(
                            "\n",
                            "<br/>",
                        )

                        story.append(
                            Paragraph(
                                answer_html,
                                interview_answer_style,
                            )
                        )

                    # Approach
                    if approach:
                        story.append(
                            Paragraph(
                                "<b>Approach</b>",
                                interview_label_style,
                            )
                        )

                        story.append(
                            Paragraph(
                                safe_paragraph_text(approach).replace(
                                    "\n",
                                    "<br/>",
                                ),
                                interview_answer_style,
                            )
                        )

                    # Code / solution
                    if solution:
                        story.append(
                            Paragraph(
                                "<b>Solution</b>",
                                interview_label_style,
                            )
                        )

                        code_text = safe_paragraph_text(solution).replace(
                            "\n",
                            "<br/>",
                        )

                        story.append(
                            Paragraph(
                                code_text,
                                interview_code_style,
                            )
                        )

                    # Complexity
                    if complexity:
                        story.append(
                            Paragraph(
                                "<b>Complexity:</b> "
                                + safe_paragraph_text(complexity),
                                interview_answer_style,
                            )
                        )

                    story.append(
                        Spacer(1, 6)
                    )

        else:
            # Fallback for a simple list of questions.
            for index, question in enumerate(
                get_list(interview_data),
                start=1,
            ):

                story.append(
                    Paragraph(
                        f"<b>{index}.</b> "
                        + safe_paragraph_text(question),
                        interview_question_style,
                    )
                )

    # =====================================================
    # AI-GENERATED COVER LETTER
    # =====================================================

    cover_letter_data = analysis.get("cover_letter")

    if cover_letter_data:

        # -----------------------------------------------------
        # Extract the actual cover letter
        # -----------------------------------------------------

        if isinstance(cover_letter_data, dict):

            cover_letter_text = cover_letter_data.get(
                "cover_letter",
                ""
            )

            job_title = cover_letter_data.get(
                "job_title",
                ""
            )

            company = cover_letter_data.get(
                "company",
                ""
            )

        else:

            # Backward compatibility if cover_letter
            # is already a plain string.
            cover_letter_text = str(
                cover_letter_data
            )

            job_title = ""
            company = ""

        cover_letter_text = str(
            cover_letter_text or ""
        ).strip()

        # -----------------------------------------------------
        # Only create the section when actual text exists
        # -----------------------------------------------------

        if cover_letter_text:

            story.append(PageBreak())

            story.append(
                Paragraph(
                    "AI-Generated Cover Letter",
                    heading_style,
                )
            )

            story.append(
                Spacer(1, 6)
            )

            # -------------------------------------------------
            # Job Information
            # -------------------------------------------------

            if job_title:

                story.append(
                    Paragraph(
                        f"<b>Position:</b> "
                        + safe_paragraph_text(job_title),
                        normal_style,
                    )
                )

            if company:

                story.append(
                    Paragraph(
                        f"<b>Company:</b> "
                        + safe_paragraph_text(company),
                        normal_style,
                    )
                )

            if job_title or company:

                story.append(
                    Spacer(1, 12)
                )

            # -------------------------------------------------
            # Cover Letter Body
            # -------------------------------------------------

            # Normalize Windows/Mac line endings.
            cover_letter_text = (
                cover_letter_text
                .replace("\r\n", "\n")
                .replace("\r", "\n")
            )

            # Split into paragraphs.
            paragraphs = cover_letter_text.split(
                "\n\n"
            )

            for paragraph in paragraphs:

                paragraph = paragraph.strip()

                if not paragraph:
                    continue

                # Preserve single line breaks inside a paragraph.
                paragraph_html = (
                    safe_paragraph_text(
                        paragraph
                    )
                    .replace("\n", "<br/>")
                )

                story.append(
                    Paragraph(
                        paragraph_html,
                        normal_style,
                    )
                )

                story.append(
                    Spacer(1, 8)
                )
    # =====================================================
    # BUILD PDF
    # =====================================================

    print("Building PDF...")

    doc.build(
        story,
        onFirstPage=add_page_number,
        onLaterPages=add_page_number,
    )

    # =====================================================
    # VERIFY
    # =====================================================

    if not output_path.exists():

        raise RuntimeError(
            "PDF generation finished but the PDF file was not created."
        )

    file_size = output_path.stat().st_size

    if file_size <= 0:

        raise RuntimeError(
            "PDF was created but the file is empty."
        )

    print(
        f"PDF GENERATED SUCCESSFULLY: "
        f"{output_path}"
    )

    print(
        f"PDF SIZE: {file_size} bytes"
    )

    print("=" * 70 + "\n")

    return str(output_path)