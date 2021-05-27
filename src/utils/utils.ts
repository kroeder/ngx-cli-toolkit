import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { ProjectDefinition, WorkspaceDefinition } from '@angular-devkit/core/src/workspace';
import * as path from 'path';
import { buildDefaultPath } from '@schematics/angular/utility/workspace';
import { parseName } from '@schematics/angular/utility/parse-name';

export function getParsedPath(project: ProjectDefinition, path: string, dirName: string) {
    if (path === undefined && project) {
        path = buildDefaultPath(project);
    }
    return parseName(path as string, dirName);
}

export function readJson(host: Tree, path: string) {
    const jsonBuffer = host.read(path);
    if (!jsonBuffer) {
        throw new SchematicsException(`Could not read file '${path}'`);
    }
    return JSON.parse(jsonBuffer.toString('utf8'));
}

export function getMigrationsJsonPath(host: Tree, project: ProjectDefinition) {
    const packageJsonPath = path.join(project.root, 'package.json');
    const packageJson = readJson(host, packageJsonPath);
    return path.join(project.root, packageJson['ng-update'].migrations);
}

export function getCollectionJsonPath(host: Tree, project: ProjectDefinition) {
    const packageJsonPath = path.join(project.root, 'package.json');
    const packageJson = readJson(host, packageJsonPath);
    return path.join(project.root, packageJson.schematics);
}

export async function getProject(workspace: WorkspaceDefinition, projectName: string) {
    if (workspace.projects.has(projectName)) {
        return workspace.projects.get(projectName) as ProjectDefinition;
    } else {
        throw new SchematicsException(`A project with the name '${projectName}' does not exists`);
    }
}
