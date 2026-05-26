import { Project } from "ts-morph";

const project = new Project({
    tsConfigFilePath: "./tsconfig.app.json",
});

const sourceFile = project.getSourceFileOrThrow("src/App.tsx");

const unusedDeclarations = [
    "LoginViewProps", "LoginView",
    "OTPViewProps", "OTPView",
    "PartnerRegistrationView",
    "DriverRegistrationView",
    "TechnicianRegistrationView",
    "CustomerSupportCenterView",
    "PartnerMobileMiniDashboard",
    "TechnicianMobileMiniDashboard",
    "DriverMobileDashboard",
    "AdminMobileMiniDashboard",
    "PartnerOrdersMobileView",
    "TechnicianOrdersMobileView"
];

for (const name of unusedDeclarations) {
    const decls = [
        sourceFile.getVariableStatement(name),
        sourceFile.getFunction(name),
        sourceFile.getInterface(name),
        sourceFile.getTypeAlias(name)
    ];
    
    decls.forEach(d => {
        if (d) {
            console.log("Removing", name);
            d.remove();
        }
    });
}

// Remove unused state variables manually if they are inside App component, but ts-morph can't easily find them if they are local unless we navigate. We will just remove the top level components.

// Remove 'Heart' from import from 'lucide-react'
const importDecl = sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === 'lucide-react');
if (importDecl) {
    const namedImports = importDecl.getNamedImports();
    const heartImport = namedImports.find(n => n.getName() === 'Heart');
    if (heartImport) {
        console.log("Removing Heart import");
        heartImport.remove();
    }
}

sourceFile.saveSync();
console.log("Done");
