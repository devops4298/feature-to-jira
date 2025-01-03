import * as vscode from "vscode";
import { sendToJira } from "./utils/jira";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "gherkin-xray" is now active!');

  const disposable = vscode.commands.registerCommand(
    "gherkin-xray.sendScenarioToJira",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
      }

      const document = editor.document;
      const text = document.getText();

      // Updated regex to extract each Scenario or Scenario Outline block
      const regex = /(Scenario Outline|Scenario):[\s\S]*?(?=(?:\r?\n\s*(?:@|Scenario Outline|Scenario)|$))/g;

      let match;
      const scenarios = [];

      while ((match = regex.exec(text)) !== null) {
        // Extracting each scenario and adding its content along with an index for positioning in the file
        scenarios.push({
          content: match[0].trim(),
          index: match.index,
          name: match[0].split("\n")[0].trim(), // Get the name of the scenario (first line)
        });
      }

      if (scenarios.length === 0) {
        vscode.window.showWarningMessage("No Scenario or Scenario Outline found.");
        return;
      }

      // Create the list for the user to choose scenarios (allowing multiple selections)
      const scenarioNames = scenarios.map(scenario => scenario.name);
      const selectedScenarioNames = await vscode.window.showQuickPick(scenarioNames, {
        placeHolder: "Select Scenarios to send to Jira",
        canPickMany: true,  // Allow selecting multiple scenarios
      });

      if (!selectedScenarioNames || selectedScenarioNames.length === 0) {
        vscode.window.showErrorMessage("No scenarios selected.");
        return;
      }

      // Find the selected scenarios based on the name
      const selectedScenarios = scenarios.filter(scenario =>
        selectedScenarioNames.includes(scenario.name)
      );
      if (!selectedScenarios.length) {
        vscode.window.showErrorMessage("Selected scenarios not found.");
        return;
      }

      let cumulativeLength = 0; // Initialize cumulativeLength here

      // Process each selected scenario
      for (const selectedScenario of selectedScenarios) {
        const { content, index } = selectedScenario;

        try {
          // Simulating sending to Jira (replace with real API call)
          //const jiraId = await sendToJira(content); // Replace with actual call
		  const jiraId ="Test-12345"; // Replace with actual call
          if (jiraId) {
            // Insert Jira ID into the document at the selected scenario's position
            const position = document.positionAt(index + cumulativeLength); // Adjust for previous edits
            const edit = new vscode.WorkspaceEdit();
            const jiraComment = `# JIRA ID: ${jiraId}\n`;
            edit.insert(document.uri, position, jiraComment);
            await vscode.workspace.applyEdit(edit);

            // Update cumulative length with the length of the inserted text (Jira comment)
            cumulativeLength += jiraComment.length;

            // Notify user that the Jira ID was added
            vscode.window.showInformationMessage(`Scenario sent to Jira: ${jiraId}`);
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Error sending to Jira: ${(error as Error).message}`);
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
