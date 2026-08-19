import {
  Card,
  CardContent,
  Typography,
  Grid,
} from "@mui/material";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";

const COLORS = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
];

export default function Analytics({
  result,
}) {
  if (!result) return null;

  const pieData = [
    {
      name: "ATS",
      value: result?.ats_score?.ats_score || 0,
    },
    {
      name: "Resume",
      value: result?.resume_score?.score || 0,
    },
    {
      name: "Job Match",
      value:
        result?.job_match?.match_score || 0,
    },
  ];

  const barData = [
    {
      name: "ATS",
      score:
        result?.ats_score?.ats_score || 0,
    },
    {
      name: "Resume",
      score:
        result?.resume_score?.score || 0,
    },
    {
      name: "Job Match",
      score:
        result?.job_match?.match_score || 0,
    },
  ];

  return (
    <Grid
      container
      spacing={3}
      sx={{ mt: 1 }}
    >
      <Grid item xs={12} md={6}>
        <Card elevation={6}>
          <CardContent>

            <Typography
              variant="h6"
              gutterBottom
            >
              Score Distribution
            </Typography>

            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <PieChart>

                <Pie
                  data={pieData}
                  dataKey="value"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                            COLORS.length
                        ]
                      }
                    />
                  ))}
                </Pie>

              </PieChart>
            </ResponsiveContainer>

          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card elevation={6}>
          <CardContent>

            <Typography
              variant="h6"
              gutterBottom
            >
              Resume Scores
            </Typography>

            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart
                data={barData}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />

                <Bar
                  dataKey="score"
                  fill="#2563EB"
                />

              </BarChart>
            </ResponsiveContainer>

          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}