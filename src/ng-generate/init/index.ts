import { chain, noop, SchematicsException, Tree } from '@angular-devkit/schematics';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/workspace';
import { WorkspaceDefinition } from '@angular-devkit/core/src/workspace';
import * as path from 'path';
import { findPackageJson, getParsedPath, getProject, removeLastSegmentOfPath } from "../../utils/utils";
import { Location } from '@schematics/angular/utility/parse-name';

export interface InitSchematicsProjectOptions {
    path: string;
    project?: string;
}

export function initSchematicsProject(options: InitSchematicsProjectOptions) {
    return async (host: Tree) => {
        if(options.project) {
            const workspace = await getWorkspace(host);
            options.path = (await getProject(workspace, options.project)).root;
        }
        const parsedPath = getParsedPath(options.path, 'schematics');
        const projectRoot = removeLastSegmentOfPath(findPackageJson(host, parsedPath));
        const schematicsDir = path.join(projectRoot, parsedPath.name);
        const relativePathToNodeModules = path.relative(path.join(process.cwd(), projectRoot, 'schematics'), path.join(process.cwd(), 'node_modules'));

        return chain([
            createSchematicsConfigurationFiles(host, schematicsDir, relativePathToNodeModules),
            // addBuilderToAngularJson(workspace, options.project),
            addSchematicsFieldsToPackageJson(host, parsedPath),
        ]);
    };
}

function createSchematicsConfigurationFiles(host: Tree, targetDir: string, nodeModulesPath: string) {
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

// todo: builder not yet implemented
// @ts-ignore
function addBuilderToAngularJson(workspace: WorkspaceDefinition, projectName: string) {
    workspace.projects.get(projectName)?.targets.set('build-schematics', {
        builder: 'ngx-cli-toolkit:build-schematics',
    });
    return updateWorkspace(workspace);
}

function addSchematicsFieldsToPackageJson(host: Tree, parsedPath: Location) {
    const packageJsonPath = findPackageJson(host, parsedPath);
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
