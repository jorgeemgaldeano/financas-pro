const ts = require('typescript');
const fs = require('fs');
const files = [
  '/mnt/data/work_v038_311/src/App.jsx',
  '/mnt/data/work_v038_311/src/components/ui/RequiredFieldModal.jsx',
  '/mnt/data/work_v038_311/src/components/ui/DateInput.jsx',
  '/mnt/data/work_v038_311/src/utils/moneyUtils.js',
  '/mnt/data/work_v038_311/src/utils/dateUtils.js',
  '/mnt/data/work_v038_311/src/constants/storageKeys.js',
  '/mnt/data/work_v038_311/src/hooks/useLocalStorage.js',
];
let hasError=false;
for (const file of files) {
  const source=fs.readFileSync(file,'utf8');
  const out=ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 }, reportDiagnostics: true, fileName: file });
  const diags=(out.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
  if (diags.length) {
    hasError=true;
    console.log('ERRORS in', file);
    for (const d of diags) console.log(ts.flattenDiagnosticMessageText(d.messageText, '\n'));
  } else console.log('OK', file);
}
process.exit(hasError?1:0);
