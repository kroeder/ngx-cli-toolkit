import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/workspace';
import { ProjectDefinition, WorkspaceDefinition } from '@angular-devkit/core/src/workspace';
import * as path from 'path';

export interface InitSchematicsProjectOptions {
    project: string;
}

export function initSchematicsProject(options: InitSchematicsProjectOptions) {
    // @ts-ignore
    return async (host: Tree) => {
        const workspace = await getWorkspace(host);
        const project = await getProject(workspace, options.project);
        const schematicsDir = path.join(project.root, 'schematics');
        createSchematicsFiles(host, schematicsDir);

        return addBuilderToAngularJson(workspace, options.project);

        /**
         * - OK Create schematics directory in project path
         * - OK Create necessary json files (collection.json, migrations.json)
         * - Create builder entry in angular.json
         * - Create entry in package.json
         */
    };
}

async function getProject(workspace: WorkspaceDefinition, projectName: string) {
    if (workspace.projects.has(projectName)) {
        return workspace.projects.get(projectName) as ProjectDefinition;
    } else {
        throw new SchematicsException(
            `A project with the name '${projectName}' does not exists`
        );
    }
}

function createSchematicsFiles(host: Tree, targetDir: string) {
    host.create(path.join(targetDir, 'collection.json'), '{}');
    host.create(path.join(targetDir, 'migrations.json'), '{}');
}

function addBuilderToAngularJson(
    workspace: WorkspaceDefinition,
    projectName: string
) {
    workspace.projects.get(projectName)?.targets.set('build-schematics', {
        builder: 'ng-schematics-toolkit:build-schematics'
    });
    return updateWorkspace(workspace);
}
