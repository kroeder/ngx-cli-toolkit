import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { ProjectDefinition, WorkspaceDefinition } from '@angular-devkit/core/src/workspace';
import * as path from 'path';
import { Location, parseName } from '@schematics/angular/utility/parse-name';

export function getParsedPath(path: string, dirName: string) {
    return parseName(path as string, dirName);
}

export function findPackageJson(host: Tree, parsedPath: Location) {
    const pathSegments = parsedPath.path.split('/');
    let pathToPackageJson: string;
    for (let i = 0; i < pathSegments.length; i++) {
        pathToPackageJson = `${pathSegments.join('/')}/package.json`;
        if (host.exists(pathToPackageJson)) {
            return pathToPackageJson;
        } else {
            pathSegments.pop();
        }
    }
    throw new SchematicsException(`Could not locate package.json based on path ${parsedPath.path}`);
}

export function readJson(host: Tree, path: string) {
    const jsonBuffer = host.read(path);
    if (!jsonBuffer) {
        throw new SchematicsException(`Could not read file '${path}'`);
    }
    return JSON.parse(jsonBuffer.toString('utf8'));
}

export function getMigrationsJsonPath(host: Tree, parsedPath: Location) {
    const packageJsonPath = findPackageJson(host, parsedPath);
    const packageJson = readJson(host, packageJsonPath);
    if (!packageJson?.['ng-update']?.migrations) {
        throw new SchematicsException(`Could not read 'ng-update.migrations' field from package.json. Try running 'ng g ngx-cli-toolkit:init'.`);
    }
    return path.join(removeLastSegmentOfPath(packageJsonPath), packageJson['ng-update'].migrations);
}

export function getCollectionJsonPath(host: Tree, parsedPath: Location) {
    const packageJsonPath = findPackageJson(host, parsedPath);
    const packageJson = readJson(host, packageJsonPath);
    if (!packageJson?.schematics) {
        throw new SchematicsException(`Could not read 'schematics' field from package.json. Try running 'ng g ngx-cli-toolkit:init'.`);
    }
    return path.join(removeLastSegmentOfPath(packageJsonPath), packageJson.schematics);
}

export async function getProject(workspace: WorkspaceDefinition, projectName: string) {
    if (workspace.projects.has(projectName)) {
        return workspace.projects.get(projectName) as ProjectDefinition;
    } else {
        throw new SchematicsException(`A project with the name '${projectName}' does not exists`);
    }
}

export function removeLastSegmentOfPath(path: string) {
    return path.substring(0, path.lastIndexOf('/'));
}
