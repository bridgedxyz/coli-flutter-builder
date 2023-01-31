import * as vscode from "vscode";
import path from "path";
import { Analyzer } from "./analyzer";
import { FlutterDaemon } from "./daemon";
import {
  appurl,
  HotRestartAction,
  WebLaunchUrlAction,
} from "@flutter-preview/webview";
import { locatePubspec } from "pub";

const langs = ["dart"] as const;

const APP_HOST = "https://flutter-preview.webview.vscode.grida.co"; // "http://localhost:6632";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable_dart_preview = vscode.commands.registerCommand(
    "grida-flutter.showPreview",
    cmd_dart_preview_handler
  );

  vscode.languages.registerCodeLensProvider(langs, {
    provideCodeLenses: async (document: vscode.TextDocument) => {
      const analyzer = new Analyzer(document);

      const components = await analyzer.widgets();
      return components.map((c) => {
        const start = document.positionAt(c.start + 2);
        const lens = new vscode.CodeLens(new vscode.Range(start, start), {
          command: "grida-flutter.showPreview",
          arguments: [document, c.id],
          title: `⚡️ Preview ${c.name}`,
        });
        return lens;
      });
    },
  });

  context.subscriptions.push(disposable_dart_preview);
}

async function cmd_dart_preview_handler(
  document: vscode.TextDocument,
  componentId: string
) {
  const panel_title = `Preview: ${componentId}`;

  const panel = vscode.window.createWebviewPanel(
    "flutter-preview", // Identifies the type of the webview. Used internally
    panel_title, // Title of the panel displayed to the user
    vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
    {
      // allow scripts
      enableScripts: true,
    }
  );

  // run flutter daemon
  const daemon = FlutterDaemon.instance;

  // find nearest pubspec.yaml
  const filedir = path.dirname(document.fileName);
  const pubspec = locatePubspec(filedir);
  if (pubspec) {
    const { base_dir } = pubspec;

    const project = daemon.init(base_dir, {
      path: document.fileName,
      identifier: componentId,
    });

    await project.run();
    project.on("app.log", (e: any) => {
      console.log("app.log", e);
    });
  } else {
    vscode.window.showErrorMessage("Cannot find pubspec.yaml");
    return;
  }

  const webviewctrl = {
    restart: async () => {
      // force reload
      panel.webview.postMessage({ type: "hot-restart" } as HotRestartAction);
    },
    webLaunchUrl: async (url: string) => {
      panel.webview.postMessage({
        type: "web-launch-url",
        url: url,
      } as WebLaunchUrlAction);
    },
  };

  // if save, trigger immediate save
  // if edit, use debounce
  const subscription__on_save = vscode.workspace.onDidSaveTextDocument(
    async (e) => {
      // const text = await document?.getText();
      // TODO: sync the content
      await daemon.restart();
      webviewctrl.restart();
    }
  );

  daemon.webLaunchUrl().then((url) => {
    // update webview when daemon url is ready
    webviewctrl.webLaunchUrl(url);
  });

  panel.webview.html = getWebviewContent({
    name: panel_title,
    iframe: appurl(),
  });

  panel.webview.onDidReceiveMessage((e) => {
    //
  });

  // listen to panel close
  panel.onDidDispose(() => {
    subscription__on_save.dispose();
  });
}

function getWebviewContent({ name, iframe }: { iframe: string; name: string }) {
  return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>${name}</title>
    <script>
      // Proxy the message event to the inner iframe
      window.addEventListener('message', event => {
        const message = event.data; // The JSON data our extension sent
        // get app
        const app = document.getElementById('app');
        // send message to app
        app.contentWindow.postMessage(message, '*');
      });
    </script>
	</head>
	<body style="margin: 0; padding: 0; width: 100%; height: 100vh; overflow: hidden;">
    <p
      style=
      "
        z-index: -1;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.5rem;
        font-weight: bold;
        color: #ccc;
      "
    >
      Loading App...
    </p>
    <iframe
      id="app"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      src="${iframe}"
      style="width: 100%; height: 100%; border: none;">
    </iframe>
	</body>
	</html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}