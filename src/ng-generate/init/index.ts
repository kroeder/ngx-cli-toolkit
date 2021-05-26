import { chain, noop, SchematicsException, Tree } from '@angular-devkit/schematics';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/workspace';
import { WorkspaceDefinition } from '@angular-devkit/core/src/workspace';
import * as path from 'path';
import { getProject } from '../../utils/utils';

export interface InitSchematicsProjectOptions {
    project: string;
}

export function initSchematicsProject(options: InitSchematicsProjectOptions) {
    return async (host: Tree) => {
        const workspace = await getWorkspace(host);
        const project = await getProject(workspace, options.project);
        const schematicsDir = path.join(project.root, 'schematics');
        const relativePathToNodeModules = path.relative(schematicsDir, path.join(process.cwd(), 'node_modules'));

        return chain([
            createSchematicsFiles(host, schematicsDir, relativePathToNodeModules),
            addBuilderToAngularJson(workspace, options.project),
            addSchematicsFieldsToPackageJson(host, project.root),
        ]);
    };
}

function createSchematicsFiles(host: Tree, targetDir: string, nodeModulesPath: string) {
    const schemaPath = path
        .join(nodeModulesPath, '@angular-devkit/schematics/collection-schema.json')
        .replace(/\\/g, '/');
    host.create(
        path.join(targetDir, 'collection.json'),
        JSON.stringify(
            {
                $schema: schemaPath,
                schematics: {},
            },
            null,
            2
        )
    );

    host.create(
        path.join(targetDir, 'migrations.json'),
        JSON.stringify(
            {
                $schema: schemaPath,
                schematics: {},
            },
            null,
            2
        )
    );

    return noop();
}

function addBuilderToAngularJson(workspace: WorkspaceDefinition, projectName: string) {
    workspace.projects.get(projectName)?.targets.set('build-schematics', {
        builder: 'ng-schematics-toolkit:build-schematics',
    });
    return updateWorkspace(workspace);
}

function addSchematicsFieldsToPackageJson(host: Tree, projectRoot: string) {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJsonBuffer = host.read(packageJsonPath);
    if (!packageJsonBuffer) {
        throw new SchematicsException(`Could not find package.json in '${packageJsonPath}'`);
    }

    const packageJson: object = JSON.parse(packageJsonBuffer.toString('utf8'));
    const updatedPackageJson = {
        ...packageJson,
        schematics: './schematics/collection.json',
        'ng-update': {
            migrations: './schematics/migrations.json',
            packageGroup: [],
        },
    };

    host.overwrite(packageJsonPath, JSON.stringify(updatedPackageJson, null, 2));

    return noop();
}
