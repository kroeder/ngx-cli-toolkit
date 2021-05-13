import { SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { ProjectDefinition } from '@angular-devkit/core/src/workspace';
import { LoggerApi } from '@angular-devkit/core/src/logger';
import * as path from 'path';

export interface InitSchematicsProjectOptions {
    project: string;
}

export function initSchematicsProject(options: InitSchematicsProjectOptions) {
    return async (host: Tree, { logger }: SchematicContext) => {
        const project = await getProject(host, logger, options.project);
        createSchematicsFiles(host, logger, project);

        /**
         * - Create schematics directory in project path
         * - Create necessary json files (collection.json, migrations.json)
         * - Create builder entry in angular.json
         * - Create entry in package.json
         */

        return host;
    };
}

async function getProject(host: Tree, _logger: LoggerApi, projectName: string) {
    const workspace = await getWorkspace(host);
    if (workspace.projects.has(projectName)) {
        return workspace.projects.get(projectName) as ProjectDefinition;
    } else {
        throw new SchematicsException(
            `A project with the name '${projectName}' does not exists`
        );
    }
}

function createSchematicsFiles(
    host: Tree,
    _logger: LoggerApi,
    project: ProjectDefinition
) {
    const schematicsDir = path.join(project.root, 'schematics');
    host.create(path.join(schematicsDir, 'collection.json'), '{}');
    host.create(path.join(schematicsDir, 'migrations.json'), '{}');
}
