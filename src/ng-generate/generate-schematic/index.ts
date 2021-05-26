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
import { ProjectDefinition } from '@angular-devkit/core/src/workspace';
import * as path from 'path';
import { camelize, dasherize } from '@angular-devkit/core/src/utils/strings';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { strings } from '@angular-devkit/core';
import { getCollectionPath, getParsedPath, getProject } from '../../utils/utils';

export interface GenerateSchematicOptions {
    name: string;
    path: string;
    project: string;
    description: string;
}

export function createGenerateSchematic(options: GenerateSchematicOptions) {
    return async (host: Tree) => {
        const workspace = await getWorkspace(host);
        const project = await getProject(workspace, options.project);
        const parsedPath = getParsedPath(project, options.path, options.name);

        const generatedSchematicDir = path.join(__dirname, parsedPath.path, dasherize(options.name));
        const collectionJsonPath = path.join(__dirname, getCollectionPath(host, project));
        const relativePathToCollectionJson = path.relative(generatedSchematicDir, collectionJsonPath);

        const templateSource = apply(url('./files'), [
            applyTemplates({
                name: options.name,
                collectionJsonPath: relativePathToCollectionJson.replace(/\\/g, '/'),
                camelize: strings.camelize,
                classify: strings.classify,
                dasherize: strings.dasherize,
            }),
            move(parsedPath.path),
        ]);

        return chain([mergeWith(templateSource), updateCollectionJson(host, project, parsedPath.path, options)]);
    };
}

function updateCollectionJson(
    host: Tree,
    project: ProjectDefinition,
    schematicPath: string,
    options: GenerateSchematicOptions
) {
    const collectionPath = getCollectionPath(host, project);
    const collectionJsonBuffer = host.read(collectionPath);
    const schematicName = options.name;
    if (!collectionJsonBuffer) {
        throw new SchematicsException(`Could not read file '${collectionPath}'`);
    }

    const collectionJson = JSON.parse(collectionJsonBuffer.toString('utf8'));
    const relativePathToSchematic = path
        .relative(
            path.join(process.cwd(), path.dirname(collectionPath)),
            path.join(process.cwd(), schematicPath, schematicName, 'index')
        )
        .replace(/\\/g, '/');

    const updatedCollectionJson = {
        ...collectionJson,
        schematics: {
            ...collectionJson.schematics,
            [dasherize(schematicName)]: {
                description: options.description,
                factory: `${relativePathToSchematic}#${camelize(options.name)}`,
                schema: `${relativePathToSchematic.replace('index', 'schema.json')}`,
            },
        },
    };
    host.overwrite(collectionPath, JSON.stringify(updatedCollectionJson, null, 2));

    return noop();
}
