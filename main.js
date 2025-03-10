// For help writing plugins, visit the documentation to get started:
//   https://docs.insomnia.rest/insomnia/introduction-to-plugins
const fs = require("fs");
const homedir = require("os").homedir();
const execSync = require("child_process").execSync;

// Search for common Python interpreters
const pythonInterpreters = [];

// Common locations for Python 3
const commonPyPaths = ["/usr/bin/python3", "/usr/local/bin/python3"];

commonPyPaths.forEach((path) => {
  if (fs.existsSync(path)) pythonInterpreters.push(path);
});

// Search for pyenv Python interpreters
const pyenvRoot = process.env.PYENV_ROOT || `${homedir}/.pyenv`;
if (fs.existsSync(pyenvRoot)) {
  const pyenvVersions = fs.readdirSync(`${pyenvRoot}/versions`);

  pyenvVersions.forEach((version) => {
    const path = `${pyenvRoot}/versions/${version}/bin/python3`;
    if (fs.existsSync(path)) pythonInterpreters.push(path);
  });
}

const pythonInterpreterOptions = pythonInterpreters.map((path) => ({
  displayName: path,
  value: path,
}));

module.exports.templateTags = [
  {
    name: "bpython",
    displayName: "Better Python",
    description: "Run a python3 script to generate some data",
    args: [
      {
        type: "enum",
        options: pythonInterpreterOptions,
        displayName: "Python Interpreter",
        placeholder: "~/.pyenv/versions/3.13.0/bin/python3",
        description: "Python interpreters found by better-python",
      },
      {
        type: "string",
        displayName: "Custom Python Interpreter Path",
        placeholder: "Will be used if provided instead of the selected interpreter above",
        description: "Will be used if provided instead of the selected interpreter above",
      },
      {
        type: "string",
        displayName: "File path",
        placeholder: "~/file.py",
      },
      {
        type: "string",
        displayName: "args",
        placeholder: "-B -d input.txt",
      },
      {
        type: "string",
        displayName: "PYTHONPATH",
        placeholder: "~/Desktop/project",
      },
    ],
    async run(context, interpreter, custom_interpreter, path, args, python_path) {
      
      let pythonpath = python_path ? `PYTHONPATH=${python_path} ` : '';
      let pyinterpreter = custom_interpreter ? custom_interpreter : interpreter;

      try {
        return execSync(pythonpath + `${pyinterpreter} ${path} ${args}`, {
          encoding: "utf-8",
        }).trim();
      } catch (failed) {
        console.log("Command execution failed with " + failed);
        return failed.stderr;
      }
    },
  },
];
