import {
    apply,
    applyTemplates,
    chain,
    mergeWith,
    move,
    noop,
    SchematicsException,
    Tree,
    url,
} from '@angular-devkit/schematics';
import { buildDefaultPath, getWorkspace } from '@schematics/angular/utility/workspace';
import { getProject } from '../../utils/workspace';
import { parseName } from '@schematics/angular/utility/parse-name';
import { ProjectDefinition } from '@angular-devkit/core/src/workspace';
import * as path from 'path';

export interface InitSchematicsProjectOptions {
    path: string;
    project: string;
    saveAs: 'dependencies' | 'devDependencies' | '';
}

export function createAddSchematic(options: InitSchematicsProjectOptions) {
    return async (host: Tree) => {
        const workspace = await getWorkspace(host);
        const project = await getProject(workspace, options.project);

        if (options.path === undefined && project) {
            options.path = buildDefaultPath(project);
        }
        const parsedPath = parseName(options.path as string, 'ng-add');
        const templateSource = apply(url('./files'), [applyTemplates({}), move(parsedPath.path)]);

        return chain([mergeWith(templateSource), updateCollectionJson(host, project, parsedPath.path, options)]);
    };
}

function getCollectionPath(host: Tree, project: ProjectDefinition) {
    const packageJsonPath = path.join(project.root, 'package.json');
    const packageJsonBuffer = host.read(packageJsonPath);
    if (!packageJsonBuffer) {
        throw new SchematicsException(`Could not read file '${packageJsonPath}'`);
    }
    const packageJson = JSON.parse(packageJsonBuffer.toString('utf8'));
    return path.join(project.root, packageJson.schematics);
}

function updateCollectionJson(
    host: Tree,
    project: ProjectDefinition,
    pathToSchematic: string,
    options: InitSchematicsProjectOptions
) {
    const collectionPath = getCollectionPath(host, project);
    const collectionJsonBuffer = host.read(collectionPath);
    if (!collectionJsonBuffer) {
        throw new SchematicsException(`Could not read file '${collectionPath}'`);
    }

    const collectionJson = JSON.parse(collectionJsonBuffer.toString('utf8'));
    const relativePathToSchematic = path
        .relative(
            path.join(process.cwd(), path.dirname(collectionPath)),
            path.join(process.cwd(), pathToSchematic, 'ng-add', 'index')
        )
        .replace(/\\/g, '/');

    const updatedCollectionJson = {
        ...collectionJson,
        schematics: {
            'ng-add': {
                save: options.saveAs,
                description: 'Bootstrap package',
                factory: `${relativePathToSchematic}#ngAdd`,
            },
            ...collectionJson.schematics,
        },
    };
    host.overwrite(collectionPath, JSON.stringify(updatedCollectionJson, null, 2));

    return noop();
}
