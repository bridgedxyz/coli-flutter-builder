export interface File {
  path: string;
  content: string;
}

export type Request =
  | CreateNewProjectRequest
  | WriteFileRequest
  | RestartRequet
  | StopRequest;

/**
 * request for creating new flutter project. if no initials are provided, it uses the default `flutter create` command.
 * 
 * @example
 * ```json
{
  "type": "create-new-project",
  "id": "tmp",
  "name": "tmp"
}
  ```
 */
export interface CreateNewProjectRequest {
  type: "create-new-project";
  id: string;
  name: string;
  /**
   * @deprecated - not ready
   */
  initials?: File[];
}

interface IProjectRequest {
  projectId: string;
}

/**
 * request for writing file to a existing project.
 *
 * @example
 * ```json
{
  "type": "write-file",
  "projectId": "tmp",
  "path": "lib/main.dart",
  "content": "import 'package:flutter/material.dart';\n\nvoid main() {\n  runApp(const MyApp());\n}\n\nclass MyApp extends StatelessWidget {\n  const MyApp({Key? key}) : super(key: key);\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      title: 'Flutter Demo',\n      theme: ThemeData(\n        primarySwatch: Colors.blue,\n      ),\n      home: const MyHomePage(title: 'Flutter Demo Home Page'),\n    );\n  }\n}\n\nclass MyHomePage extends StatefulWidget {\n  const MyHomePage({Key? key, required this.title}) : super(key: key);\n  final String title;\n\n  @override\n  State<MyHomePage> createState() => _MyHomePageState();\n}\n\nclass _MyHomePageState extends State<MyHomePage> {\n  @override\n  Widget build(BuildContext context) {\n    return Scaffold(\n      appBar: AppBar(\n        title: Text(widget.title),\n      ),\n      body: Center(\n        child: Column(\n          mainAxisAlignment: MainAxisAlignment.center,\n          children: <Widget>[\n            const Text(\n              'You have pushed the button this many times:',\n            ),\n            Text(\n              'static',\n              style: Theme.of(context).textTheme.headline4,\n            ),\n          ],\n        ),\n      ),\n      floatingActionButton: FloatingActionButton(\n        onPressed: () {},\n        tooltip: 'Increment',\n        child: const Icon(Icons.add),\n      ),\n    );\n  }\n}\n",
  "save": true
 }
 * ```
 */
export interface WriteFileRequest extends IProjectRequest {
  type: "write-file";
  projectId: string;
  path: string;
  content: string;
  save?: boolean;
}

export interface RestartRequet extends IProjectRequest {
  type: "restart";
  projectId: string;
}

export interface StopRequest extends IProjectRequest {
  type: "stop";
}