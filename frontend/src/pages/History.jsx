import { useEffect, useState } from "react";

import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
} from "@mui/material";

function History() {

  const [history, setHistory] = useState([]);

  useEffect(() => {

    const data =
      JSON.parse(localStorage.getItem("resumeHistory")) || [];

    setHistory(data);

  }, []);

  const clearHistory = () => {
    localStorage.removeItem("resumeHistory");
    setHistory([]);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>

      <Typography
        variant="h3"
        align="center"
        gutterBottom
        fontWeight="bold"
      >
        Analysis History
      </Typography>

      <Button
        variant="contained"
        color="error"
        onClick={clearHistory}
        sx={{ mb: 3 }}
      >
        Clear History
      </Button>

      {history.length === 0 ? (

        <Typography
          color="text.secondary"
          align="center"
        >
          No resume history available.
        </Typography>

      ) : (

        history.map((item, index) => (

          <Card
            key={index}
            elevation={3}
            sx={{ mb: 3 }}
          >
            <CardContent>

              <Typography variant="h5">
                {item.candidate?.name || "Candidate"}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography>
                ATS Score :
                {" "}
                {item.ats_score?.ats_score ?? "N/A"}
              </Typography>

              <Typography>
                Resume Score :
                {" "}
                {item.resume_score?.score ?? "N/A"}
              </Typography>

              <Typography>
                Job Match :
                {" "}
                {item.job_match?.match_score ?? "N/A"}%
              </Typography>

              <Typography sx={{ mt: 2 }}>
                Skills :
              </Typography>

              <Typography color="text.secondary">
                {item.skills?.join(", ")}
              </Typography>

            </CardContent>
          </Card>

        ))

      )}

    </Container>
  );
}

export default History;