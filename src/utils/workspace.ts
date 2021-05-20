import { ProjectDefinition, WorkspaceDefinition } from '@angular-devkit/core/src/workspace';
import { SchematicsException } from '@angular-devkit/schematics';

export async function getProject(workspace: WorkspaceDefinition, projectName: string) {
    if (workspace.projects.has(projectName)) {
        return workspace.projects.get(projectName) as ProjectDefinition;
    } else {
        throw new SchematicsException(`A project with the name '${projectName}' does not exists`);
    }
}
