import axios from "axios";

const JIRA_API_BASE = "https://your-jira-instance.atlassian.net/rest/api/3";
const XRAY_API_BASE = "https://xray.cloud.xpand-it.com/api/v2";
const JIRA_AUTH_TOKEN = "your-jira-auth-token"; // Replace with your token
const XRAY_AUTH_TOKEN = "your-xray-auth-token"; // Replace with your token

export async function sendToJira(scenario: string): Promise<string | null> {
  try {
    // Step 1: Create Jira Issue
    const jiraResponse = await axios.post(
      `${JIRA_API_BASE}/issue`,
      {
        fields: {
          project: { key: "YOUR_PROJECT_KEY" },
          summary: `Test: ${scenario.split("\n")[0]}`,
          description: scenario,
          issuetype: { name: "Test" },
        },
      },
      {
        headers: {
          Authorization: `Basic ${JIRA_AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const jiraId = jiraResponse.data.key;

    // Step 2: Link to Xray (optional)
    await axios.post(
      `${XRAY_API_BASE}/test`,
      {
        fields: {
          summary: `Test for scenario`,
          description: scenario,
          testType: "Manual",
          jira: jiraId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${XRAY_AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return jiraId;
  } catch (error) {
    console.error("Error sending to Jira:", error);
    throw new Error("Failed to send scenario to Jira.");
  }
}
