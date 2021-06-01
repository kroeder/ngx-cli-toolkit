import { noop, Rule, SchematicContext, SchematicsException, Tree } from "@angular-devkit/schematics";
import {
    addPackageJsonDependency,
    getPackageJsonDependency,
    NodeDependencyType
} from "@schematics/angular/utility/dependencies";
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

export function ngAdd(_options: any): Rule {
    return (host: Tree, context: SchematicContext) => {
        addDependencies(host);
        context.addTask(new NodePackageInstallTask());
        return noop();
    };
}

// const getCurrentInstalledAngularVersion = (host: Tree) => {
//     const angularCore = getPackageJsonDependency(host, '@angular/core');
//     if (!angularCore) {
//         throw new SchematicsException(`Could not find @angular/core in package.json dependencies`);
//     }
//     return angularCore.version;
// }

const addDependencies = (host: Tree) => {
    const devDependencies: { [key: string]: string } = {
        '@angular-devkit/architect': '~0.1102.0',
        '@angular-devkit/core': '~11.2.11',
        '@angular-devkit/schematics': '~11.2.11',
        '@schematics/angular': '~11.2.11',
    };

    for (const devDependenciesKey in devDependencies) {
        addPackageJsonDependency(host, {
            type: NodeDependencyType.Dev,
            name: devDependenciesKey,
            version: devDependencies[devDependenciesKey],
        });
    }
};
