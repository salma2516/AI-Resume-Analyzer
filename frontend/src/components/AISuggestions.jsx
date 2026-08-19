import {
  Card,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";

export default function AISuggestions({ suggestions = {} }) {
  let items = [];

  if (Array.isArray(suggestions)) {
    items = suggestions;
  } else if (
    suggestions &&
    typeof suggestions === "object"
  ) {
    if (Array.isArray(suggestions.feedback)) {
      items = suggestions.feedback;
    } else if (Array.isArray(suggestions.suggestions)) {
      items = suggestions.suggestions;
    } else if (Array.isArray(suggestions.improvements)) {
      items = suggestions.improvements;
    } else {
      // Collect all array values inside the object
      Object.values(suggestions).forEach((value) => {
        if (Array.isArray(value)) {
          items.push(...value);
        } else if (
          value &&
          typeof value === "object" &&
          Array.isArray(value.feedback)
        ) {
          items.push(...value.feedback);
        }
      });
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <Card
      elevation={4}
      sx={{
        mt: 3,
        borderRadius: 3,
      }}
    >
      <CardContent>

        <Typography
          variant="h5"
          align="center"
          fontWeight="bold"
          gutterBottom
        >
          🤖 AI Suggestions
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Paper
          elevation={1}
          sx={{
            p: 2,
            bgcolor: "#f8fafc",
          }}
        >
          <List dense>
            {items.map((item, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`💡 ${item}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

      </CardContent>
    </Card>
  );
}