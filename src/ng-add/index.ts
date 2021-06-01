import { noop, Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import {
    addPackageJsonDependency,
    getPackageJsonDependency,
    NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

export function ngAdd(_options: any): Rule {
    return (host: Tree, context: SchematicContext) => {
        addDependencies(host);
        context.addTask(new NodePackageInstallTask());
        return noop();
    };
}

const getCurrentInstalledAngularVersion = (host: Tree) => {
    const angularCore = getPackageJsonDependency(host, '@angular/core');
    if (!angularCore) {
        throw new SchematicsException(`Could not find @angular/core in package.json dependencies`);
    }
    return angularCore.version;
};

const addDependencies = (host: Tree) => {
    const angularVersion = getCurrentInstalledAngularVersion(host);
    const getDevBranchVersion = (version: string) => {
        const versionSegments = version.split('.');
        versionSegments[0] = versionSegments[0].replace('~', '').replace('^', '');
        return `~0.${versionSegments[0]}0${versionSegments[1]}.${versionSegments[2]}`;
    };

    const devDependencies: { [key: string]: string } = {
        '@angular-devkit/architect': getDevBranchVersion(angularVersion),
        '@angular-devkit/core': angularVersion,
        '@angular-devkit/schematics': angularVersion,
        '@schematics/angular': angularVersion,
    };

    for (const devDependenciesKey in devDependencies) {
        addPackageJsonDependency(host, {
            type: NodeDependencyType.Dev,
            name: devDependenciesKey,
            version: devDependencies[devDependenciesKey],
        });
    }
};
