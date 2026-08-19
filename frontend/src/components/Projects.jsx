import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";

import CodeIcon from "@mui/icons-material/Code";
import FolderIcon from "@mui/icons-material/Folder";
import GitHubIcon from "@mui/icons-material/GitHub";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";


/* =========================================================
   HELPERS
========================================================= */

function getText(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return String(value).trim();
}


function normalizeList(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (
          item &&
          typeof item === "object"
        ) {
          return [
            item.name ||
              item.title ||
              item.skill ||
              item.label ||
              "",
          ];
        }

        return [item];
      })
      .map(getText)
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,|•\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}


function getProjectTitle(project, index) {
  if (!project || typeof project !== "object") {
    return `Project ${index + 1}`;
  }

  // Prefer the actual project title returned by the resume parser.
  // Do not use description text as a fallback title.
  return (
    getText(project.title) ||
    getText(project.project_title) ||
    getText(project.project_name) ||
    getText(project.projectName) ||
    getText(project.name) ||
    getText(project.project) ||
    `Project ${index + 1}`
  );
}


function getProjectDescription(
  project
) {
  const description =
    project?.description ||
    project?.details ||
    project?.summary ||
    project?.objective ||
    project?.content ||
    "";

  /*
   * Keep bullet descriptions as separate
   * points, but don't create a bullet when
   * the parser already supplied one.
   */
  return normalizeList(description);
}


function getProjectTechnologies(
  project
) {
  return normalizeList(
    project?.technologies ||
      project?.technology ||
      project?.tech_stack ||
      project?.techStack ||
      project?.skills ||
      project?.tools
  );
}


function getGithubUrl(project) {
  return (
    getText(project?.github) ||
    getText(project?.github_url) ||
    getText(project?.githubUrl) ||
    getText(project?.repository) ||
    getText(project?.repository_url) ||
    ""
  );
}


function getDemoUrl(project) {
  return (
    getText(project?.demo) ||
    getText(project?.demo_url) ||
    getText(project?.demoUrl) ||
    getText(project?.live_url) ||
    getText(project?.liveUrl) ||
    getText(project?.live_demo) ||
    ""
  );
}


/*
 * Sometimes the resume parser returns a
 * project as a string instead of an object.
 * Convert it into a safe project object.
 */
function normalizeProject(project, index) {
  if (project === null || project === undefined) {
    return null;
  }

  // Backend should return structured objects. If a string is returned,
  // treat it only as a project title.
  if (typeof project === "string") {
    const title = getText(project);

    if (!title) {
      return null;
    }

    return {
      id: `project-${index}`,
      title,
      project_name: "",
      description: [],
      technologies: [],
      github: "",
      demo: "",
    };
  }

  if (typeof project !== "object") {
    return null;
  }

  const title =
    getText(project.title) ||
    getText(project.project_title) ||
    getText(project.projectTitle) ||
    getText(project.name);

  // Do not silently turn project_name into the title. In the resume
  // parser, project_name can be an alias such as "AgriGuard".
  if (!title) {
    return null;
  }

  const normalizedTitle = title.toLowerCase();

  // A description fragment is not a project.
  const descriptionFragment =
    normalizedTitle.startsWith("with ") ||
    normalizedTitle.startsWith("and ") ||
    normalizedTitle.startsWith("via ") ||
    normalizedTitle.startsWith("using ") ||
    normalizedTitle.startsWith("built ") ||
    normalizedTitle.startsWith("developed ") ||
    normalizedTitle.startsWith("implemented ") ||
    normalizedTitle.startsWith("detection,") ||
    normalizedTitle.startsWith("automated ");

  if (descriptionFragment) {
    return null;
  }

  return {
    ...project,
    id:
      project.id ||
      project.project_id ||
      `project-${index}`,

    title,

    project_name:
      getText(project.project_name) ||
      getText(project.projectName),

    description: getProjectDescription(project),

    technologies: getProjectTechnologies(project),

    github: getGithubUrl(project),

    demo: getDemoUrl(project),
  };
}


/* =========================================================
   COMPONENT
========================================================= */

function Projects({
  projects = [],
}) {
  const normalizedProjects = Array.isArray(projects)
    ? projects
        .map(normalizeProject)
        .filter(Boolean)
        .filter((project, index, all) => {
          const key = getText(project.title).toLowerCase();
          return (
            all.findIndex(
              (item) =>
                getText(item.title).toLowerCase() === key
            ) === index
          );
        })
    : [];


  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (
    normalizedProjects.length === 0
  ) {
    return (
      <Card
        elevation={0}
        sx={{
          width: "100%",
          height: "100%",
          borderRadius: 4,
          border:
            "1px solid #E2E8F0",
          background: "#FFFFFF",
        }}
      >
        <CardContent
          sx={{ p: { xs: 2.5, md: 3.5 } }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <FolderIcon
              sx={{
                color: "#7C3AED",
                fontSize: 30,
              }}
            />

            <Typography
              variant="h5"
              fontWeight={800}
              color="#0F172A"
            >
              Projects
            </Typography>
          </Stack>

          <Divider
            sx={{ my: 2 }}
          />

          <Typography
            color="text.secondary"
            sx={{ lineHeight: 1.7 }}
          >
            No projects were detected in
            the latest analyzed resume.
            Add project names,
            descriptions and technologies
            to your resume and analyze it
            again.
          </Typography>
        </CardContent>
      </Card>
    );
  }


  /* =======================================================
     PROJECTS
  ======================================================= */

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: 4,
        border:
          "1px solid #E2E8F0",
        background: "#FFFFFF",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2.5, md: 3.5 },
          "&:last-child": {
            pb: { xs: 2.5, md: 3.5 },
          },
        }}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ mb: 1 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
          >
            <FolderIcon
              sx={{
                color: "#7C3AED",
                fontSize: 30,
              }}
            />

            <Box>
              <Typography
                variant="h5"
                fontWeight={800}
                color="#0F172A"
              >
                Projects
              </Typography>

              <Typography
                variant="body2"
                color="#64748B"
              >
                {normalizedProjects.length}{" "}
                project
                {normalizedProjects.length ===
                1
                  ? ""
                  : "s"}{" "}
                detected
              </Typography>
            </Box>
          </Stack>
        </Stack>


        <Divider
          sx={{ my: 2.5 }}
        />


        {/* =================================================
            PROJECT CARDS
        ================================================= */}

        <Stack spacing={2.5}>
          {normalizedProjects.map(
            (project, index) => {
              const title =
                project.title;

              const description =
                project.description;

              const technologies =
                project.technologies;

              const github =
                project.github;

              const demo =
                project.demo;

              return (
                <Box
                  key={
                    project.id ||
                    `${title}-${index}`
                  }
                  sx={{
                    p: {
                      xs: 2,
                      md: 2.5,
                    },

                    border:
                      "1px solid #E2E8F0",

                    borderRadius: 3,

                    background:
                      "#F8FAFC",

                    transition:
                      "all 0.25s ease",

                    "&:hover": {
                      transform:
                        "translateY(-3px)",

                      borderColor:
                        "#C4B5FD",

                      boxShadow:
                        "0 10px 25px rgba(15,23,42,0.08)",
                    },
                  }}
                >

                  {/* ---------------------------------------
                      TITLE
                  --------------------------------------- */}

                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                  >
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: 38,
                        height: 38,
                        borderRadius: 2,
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        background:
                          "linear-gradient(135deg,#7C3AED,#2563EB)",
                        color: "#FFFFFF",
                        fontWeight: 800,
                      }}
                    >
                      {index + 1}
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color="#1E3A8A"
                        sx={{
                          lineHeight: 1.45,
                          pt: 0.3,
                        }}
                      >
                        {title}
                      </Typography>

                      {project.project_name && (
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 0.4,
                            color: "#64748B",
                            fontWeight: 600,
                          }}
                        >
                          Project: {project.project_name}
                        </Typography>
                      )}
                    </Box>
                  </Stack>


                  {/* ---------------------------------------
                      DESCRIPTION
                  --------------------------------------- */}

                  {description.length >
                    0 && (
                    <List
                      dense
                      disablePadding
                      sx={{
                        mt: 1.5,
                      }}
                    >
                      {description.map(
                        (
                          item,
                          descriptionIndex
                        ) => (
                          <ListItem
                            key={
                              descriptionIndex
                            }
                            disableGutters
                            sx={{
                              alignItems:
                                "flex-start",
                              py: 0.35,
                            }}
                          >
                            <Typography
                              sx={{
                                mr: 1,
                                color:
                                  "#7C3AED",
                                fontWeight: 800,
                              }}
                            >
                              •
                            </Typography>

                            <ListItemText
                              primary={
                                getText(
                                  item
                                )
                              }
                              primaryTypographyProps={{
                                color:
                                  "#475569",
                                lineHeight: 1.7,
                                fontSize:
                                  "0.92rem",
                              }}
                            />
                          </ListItem>
                        )
                      )}
                    </List>
                  )}


                  {/* ---------------------------------------
                      TECHNOLOGIES
                  --------------------------------------- */}

                  {technologies.length >
                    0 && (
                    <Box
                      sx={{ mt: 2 }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={800}
                        color="#475569"
                        sx={{
                          display:
                            "block",
                          mb: 1,
                        }}
                      >
                        TECHNOLOGIES
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        {technologies.map(
                          (
                            technology,
                            techIndex
                          ) => (
                            <Chip
                              key={`${technology}-${techIndex}`}
                              icon={
                                <CodeIcon />
                              }
                              label={
                                technology
                              }
                              size="small"
                              sx={{
                                background:
                                  "#EEF2FF",
                                color:
                                  "#4338CA",
                                border:
                                  "1px solid #C7D2FE",
                                fontWeight:
                                  600,
                              }}
                            />
                          )
                        )}
                      </Stack>
                    </Box>
                  )}


                  {/* ---------------------------------------
                      PROJECT LINKS
                  --------------------------------------- */}

                  {(github || demo) && (
                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={1.5}
                      sx={{
                        mt: 2.5,
                      }}
                    >
                      {github && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={
                            <GitHubIcon />
                          }
                          href={
                            github
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            textTransform:
                              "none",
                            fontWeight:
                              700,
                            borderRadius:
                              2,
                          }}
                        >
                          GitHub
                        </Button>
                      )}

                      {demo && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={
                            <OpenInNewIcon />
                          }
                          href={demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            textTransform:
                              "none",
                            fontWeight:
                              700,
                            borderRadius:
                              2,
                          }}
                        >
                          Live Demo
                        </Button>
                      )}
                    </Stack>
                  )}

                </Box>
              );
            }
          )}
        </Stack>

      </CardContent>
    </Card>
  );
}

export default Projects;
